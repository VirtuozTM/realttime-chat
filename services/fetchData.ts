import axios from "axios";
import api from "@/config/api";
import { User } from "../types";
import ToastService from "@/utils/toast/toastService";

// informations de l'utilisateur
export const getUserData = async (): Promise<User | null> => {
  try {
    const response = await api.get("/auth/user-data/");
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<{ error?: string }>(error)) {
      const openAiError = error.response?.data.error;
      console.log("openAiError", openAiError);
      if (openAiError) {
        ToastService.show({
          type: "error",
          text1: "Erreur",
          text2: openAiError,
        });
      }
    }
    return null;
  }
};
