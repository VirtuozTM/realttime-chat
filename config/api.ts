// api.ts
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import * as SecureStore from "expo-secure-store";
import ToastService from "@/utils/toast/toastService";
import { router } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

interface ApiError extends Error {
  response?: {
    status: number;
    data: any;
  };
  config?: AxiosRequestConfig & { _retry?: boolean };
}

const ERROR_MESSAGES = {
  INACTIVE_ACCOUNT: {
    title: "Compte inactif",
    message: "Veuillez contacter le support.",
  },
  SESSION_EXPIRED: {
    title: "Session expirée",
    message: "Veuillez vous reconnecter.",
  },
} as const;

const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
} as const;

api.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.access) {
      config.headers.Authorization = `Bearer ${session.access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

interface Session {
  access: string;
  refresh: string;
}

// Fonction pour obtenir la session
async function getSession(): Promise<Session | null> {
  try {
    const value = await SecureStore.getItemAsync("session");
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Fonction pour mettre à jour la session
async function updateSession(session: Session | null): Promise<void> {
  try {
    if (session) {
      await SecureStore.setItemAsync("session", JSON.stringify(session));
    } else {
      await SecureStore.deleteItemAsync("session");
    }
  } catch (error) {
    console.error(error);
  }
}

const handleLogout = async (
  errorMessage: (typeof ERROR_MESSAGES)[keyof typeof ERROR_MESSAGES]
) => {
  await updateSession(null);
  router.replace("/(auth)/login");
  ToastService.show({
    type: "error",
    text1: errorMessage.title,
    text2: errorMessage.message,
  });
};

const refreshToken = async (refreshToken: string): Promise<Session | null> => {
  try {
    const response = await api.post("/auth/token/refresh/", {
      refresh: refreshToken,
    });
    const { access } = response.data;
    const session: Session = { access, refresh: refreshToken };
    return session;
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du token:", error);
    return null;
  }
};

interface FailedRequest {
  resolve: (token: string | null) => void;
  reject: (error: any) => void;
}

// Variables pour gérer le rafraîchissement des tokens
let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

// Fonction pour traiter la file d'attente
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const handleQueuedRequest = async (
  originalRequest: AxiosRequestConfig
): Promise<any> => {
  return new Promise<string | null>((resolve, reject) => {
    failedQueue.push({ resolve, reject });
  }).then((token) => {
    if (token) {
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${token}`,
      };
      return api(originalRequest);
    }
    return Promise.reject(new Error("Token refresh failed"));
  });
};

const handleTokenRefresh = async (
  originalRequest: AxiosRequestConfig & { _retry?: boolean },
  error: any
) => {
  originalRequest._retry = true;
  isRefreshing = true;

  try {
    const session = await getSession();
    if (!session?.refresh) {
      await handleLogout(ERROR_MESSAGES.SESSION_EXPIRED);
      return Promise.reject(error);
    }

    const newSession = await refreshToken(session.refresh);
    if (!newSession?.access) {
      await handleLogout(ERROR_MESSAGES.INACTIVE_ACCOUNT);
      return Promise.reject(error);
    }

    await updateSession(newSession);
    api.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${newSession.access}`;
    originalRequest.headers = {
      ...originalRequest.headers,
      Authorization: `Bearer ${newSession.access}`,
    };

    processQueue(null, newSession.access);
    return api(originalRequest);
  } catch (err) {
    processQueue(err, null);
    await handleLogout(ERROR_MESSAGES.INACTIVE_ACCOUNT);
    return Promise.reject(err);
  } finally {
    isRefreshing = false;
  }
};

// Intercepteur de réponse pour gérer les erreurs 401 et 403 et rafraîchir le token
api.interceptors.response.use(
  (response) => response,
  async (error: ApiError) => {
    const originalRequest = error.config;

    if (!originalRequest || !error.response) {
      return Promise.reject(error);
    }

    const isTokenEndpoint = originalRequest.url?.includes("/users/auth/token/");
    const isUnauthorized = error.response.status === HTTP_STATUS.UNAUTHORIZED;
    const isForbidden = error.response.status === HTTP_STATUS.FORBIDDEN;

    // Gestion des erreurs 403
    if (isForbidden && !isTokenEndpoint) {
      await handleLogout(ERROR_MESSAGES.INACTIVE_ACCOUNT);
      return Promise.reject(error);
    }

    // Gestion du rafraîchissement du token
    if (isUnauthorized && !originalRequest._retry && !isTokenEndpoint) {
      if (isRefreshing) {
        return handleQueuedRequest(originalRequest);
      }

      return handleTokenRefresh(originalRequest, error);
    }

    return Promise.reject(error);
  }
);

export default api;
