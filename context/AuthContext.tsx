import {
  createContext,
  useContext,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import { useStorageState } from "./useStorage";
import { signIn as signInService } from "@/services/auth";
import { getUserData } from "@/services/fetchData";
import { User } from "@/types";

interface Session {
  access: string;
  refresh: string;
}

interface SignInResult {
  session?: Session;
  error?: string;
}

interface AuthContextType {
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => void;
  session: Session | null;
  isLoading: boolean;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType>({
  signIn: async () => ({ error: "Context not initialized" }),
  signOut: () => {},
  session: null,
  isLoading: true,
  user: null,
  setUser: () => null,
});

export function useSession() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useSession must be wrapped in a <SessionProvider />");
  }
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] =
    useStorageState<Session>("session");
  const [user, setUser] = useState<User | null>(null);

  // Récupérer les données utilisateur lorsque la session change
  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      if (session) {
        try {
          const userData = await getUserData();
          console.log("DONNES UTILISATEUR :", userData);
          if (isMounted) {
            setUser(userData);
          }
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des données utilisateur",
            error
          );
          // Gérez les erreurs, éventuellement en déconnectant l'utilisateur
          setSession(null);
        }
      } else {
        setUser(null);
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        signIn: async (email: string, password: string) => {
          const response = await signInService(email, password);

          if (response.session) {
            setSession(response.session);
            // Récupérer les données utilisateur après la connexion
            try {
              const userData = await getUserData();
              console.log(userData);
              setUser(userData);
            } catch (error) {
              console.error(
                "Erreur lors de la récupération des données utilisateur",
                error
              );
              setSession(null);
            }
          }

          return response;
        },
        signOut: () => {
          setSession(null);
          setUser(null);
        },
        session,
        isLoading,
        user,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
