import axios, { AxiosError, AxiosResponse } from "axios";
import ToastService from "@/utils/toast/toastService";
import api from "@/config/api";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface Session {
  access: string;
  refresh: string;
}

interface SignInResult {
  session?: Session;
  error?: string;
}

export const signIn = async (
  email: string,
  password: string
): Promise<SignInResult> => {
  try {
    console.log("API_URL :", API_URL);
    const response = await axios.post(`${API_URL}/auth/token/`, {
      email,
      password,
    });
    console.log("RESPONSE FROM SIGN IN :", response);
    const { access, refresh } = response.data;
    const session: Session = { access, refresh };
    return { session };
  } catch (error) {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const errorPassword = error.response?.data.password;
      const errorEmail = error.response?.data.email;
      // Vérification de type
      if (error.status === 400) {
        console.log(errorEmail, errorPassword);
        if (errorEmail && errorPassword) {
          ToastService.show({
            type: "error",
            text1: "Champs vides",
            text2: "Les champs doivent être complétés.",
          });
        } else {
          if (errorEmail) {
            ToastService.show({
              type: "error",
              text1: "Email manquant",
              text2: "Veuillez renseigner un email.",
            });
          }
          if (errorPassword) {
            ToastService.show({
              type: "error",
              text1: "Mot de passe manquant",
              text2: "Veuillez renseigner un mot de passe.",
            });
          }
        }
      }
      if (status === 401) {
        ToastService.show({
          type: "error",
          text1: "Champs invalides",
          text2: "Identifiants invalides.",
        });
      }
      console.log(status);
      if (status === 403) {
        ToastService.show({
          type: "error",
          text1: "Compte inactif",
          text2: "Veuillez contactez le support.",
        });
      }
    } else {
      console.log("Une erreur inconnue s'est produite");
    }
    throw error;
  }
};
