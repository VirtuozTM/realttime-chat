import axios from "axios";
import api from "@/config/api";
import { Conversation, Message, User } from "../types";
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

export const getFriendsData = async (): Promise<User[]> => {
  try {
    const response = await api.get("/auth/friends/");
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<{ error?: string }>(error)) {
      console.log("ERROR :", error);
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
    return [];
  }
};

// Fonction pour obtenir ou créer une conversation avec un ami spécifique
export const getOrCreateConversation = async (
  userId: string
): Promise<Conversation> => {
  try {
    const response = await api.get(`/chat/conversations/with-user/${userId}/`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Erreur lors de la récupération de la conversation :", error);
      ToastService.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de charger la conversation",
      });
    }
    throw error;
  }
};

// Fonction pour récupérer les messages d'une conversation
export const getConversationMessages = async (
  conversationId: string
): Promise<Message[]> => {
  try {
    const response = await api.get(
      `/chat/conversations/${conversationId}/messages/`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Erreur lors de la récupération des messages :", error);
      ToastService.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de charger les messages",
      });
    }
    return [];
  }
};

// Fonction pour envoyer un nouveau message
export const sendMessage = async (
  conversationId: number,
  content: string
): Promise<Message | null> => {
  try {
    const response = await api.post(
      `/chat/conversations/${conversationId}/messages/`,
      {
        content,
      }
    );
    console.log("Message envoyé :", response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Erreur lors de l'envoi du message :", error);
      ToastService.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible d'envoyer le message",
      });
    }
    return null;
  }
};
