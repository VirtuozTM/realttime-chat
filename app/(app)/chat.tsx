import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TextInput,
} from "react-native";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { ArrowLeft } from "phosphor-react-native";
import { colors } from "@/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import WebSocketService from "@/services/websocket";
import { Message, Conversation, User } from "@/types";
import {
  getConversationMessages,
  getOrCreateConversation,
} from "@/services/fetchData";
import { useSession } from "@/context/AuthContext";
import MessageTypingAnimation from "@/components/MessageTypingAnimation";
import { FlashList } from "@shopify/flash-list";
import * as ImagePicker from "expo-image-picker";
import MessageInput from "@/components/MessageInput";
import MessageContainer from "@/components/MessageContainer";
import MessageVocal from "@/components/MessageVocal";

const ChatScreen = () => {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const first_name = params.first_name as string;
  const last_name = params.last_name as string;
  const avatar_url = params.avatar_url as string;
  const status = params.status === "true";
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const messageInputRef = useRef<TextInput>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocketService | null>(null);
  const flatListRef = useRef<FlashList<any>>(null);
  const [loading, setLoading] = useState(true);
  const { session } = useSession();
  const [authError, setAuthError] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [peerIsTyping, setPeerIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [cameraPermission, requestCameraPermission] =
    ImagePicker.useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] =
    ImagePicker.useMediaLibraryPermissions();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [messageText, setMessageText] = useState("");

  const fetchPreviousMessages = async () => {
    setLoading(true);
    try {
      // Obtenir ou créer la conversation
      const conv = await getOrCreateConversation(id as string);
      setConversation(conv);

      // Charger les messages
      if (conv && conv.id) {
        const msgs = await getConversationMessages(conv.id);
        setMessages(msgs);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la conversation :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreviousMessages();
  }, [id]);

  useEffect(() => {
    if (!session?.access) {
      console.error("Pas de token d'authentification disponible");
      return;
    }

    if (conversation?.id) {
      const wsUrl = `ws://192.168.1.77:8000/ws/chat/${conversation.id}/?token=${session.access}`;
      console.log("Connexion WebSocket avec URL:", wsUrl);

      wsRef.current = new WebSocketService(wsUrl);
      wsRef.current.setOnOpenCallback(() => {
        setIsConnected(true);
        console.log("WebSocket connecté");
      });

      wsRef.current.setOnCloseCallback(() => {
        setIsConnected(false);
        console.log("WebSocket déconnecté");
      });

      wsRef.current.setOnMessageCallback((data) => {
        const parsedData = JSON.parse(data);

        // Gérer les différents types de messages
        if (parsedData.type === "typing_status") {
          setPeerIsTyping(parsedData.is_typing);

          return;
        }

        // Gérer les messages normaux (code existant)
        const newMessage: Message = {
          id: Date.now().toString(),
          conversation: conversation.id,
          sender: conversation.participants.find(
            (p) => p.id === parsedData.sender_id
          ) as User,
          content: parsedData.message,
          timestamp: parsedData.timestamp,
          is_read: false,
        };

        setMessages((prev) => [...prev, newMessage]);
      });

      wsRef.current.connect();

      return () => {
        wsRef.current?.disconnect();
      };
    }
  }, [conversation, session?.access]);

  // Fonction pour envoyer l'état de saisie, maintenant statique
  const sendTypingStatus = useCallback(
    (typing: boolean) => {
      if (isConnected && wsRef.current) {
        wsRef.current.sendMessage(
          JSON.stringify({
            type: "typing_status",
            is_typing: typing,
          })
        );
      }
    },
    [isConnected] // Dépend uniquement de isConnected
  );

  // Gérer le changement du texte de message
  const handleMessageChange = useCallback(
    (text: string) => {
      // Stocker le texte dans l'état
      setMessageText(text);

      const shouldDisable = text.trim() === "";
      if (shouldDisable !== isButtonDisabled) {
        setIsButtonDisabled(shouldDisable);
      }

      if (!isTyping) {
        setIsTyping(true);
        sendTypingStatus(true);
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        sendTypingStatus(false);
      }, 2000);
    },
    [isTyping, isButtonDisabled, sendTypingStatus]
  );

  const sendMessage = useCallback(() => {
    const trimmedMessage = messageText.trim();
    if (trimmedMessage === "") return;

    setIsTyping(false);
    sendTypingStatus(false);

    wsRef.current?.sendMessage(
      JSON.stringify({
        message: trimmedMessage,
      })
    );

    // Réinitialiser le texte
    setMessageText("");
    setIsButtonDisabled(true);
  }, [messageText, sendTypingStatus]);

  console.log("RENDU");

  // Fonction pour prendre une photo avec la caméra
  const takePicture = async () => {
    // Vérifier les permissions
    if (!cameraPermission?.granted) {
      const permissionResult = await requestCameraPermission();
      if (!permissionResult.granted) {
        alert(
          "Vous devez autoriser l'accès à la caméra pour prendre des photos"
        );
        return;
      }
    }

    // Lancer la caméra
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Ici vous pouvez traiter l'image sélectionnée
      console.log("Photo prise:", result.assets[0].uri);

      // Par exemple, vous pourriez vouloir envoyer l'image via WebSocket
      if (isConnected && wsRef.current) {
        // Implémentez ici la logique pour envoyer l'image
        // Cela dépendra de votre backend
        // Par exemple:
        // wsRef.current.sendMessage(JSON.stringify({
        //   type: "image",
        //   image_uri: result.assets[0].uri
        // }));
      }
    }
  };

  // Fonction pour sélectionner une image depuis la galerie
  const pickImage = async () => {
    // Vérifier les permissions
    if (!mediaLibraryPermission?.granted) {
      const permissionResult = await requestMediaLibraryPermission();
      if (!permissionResult.granted) {
        alert(
          "Vous devez autoriser l'accès à la galerie pour sélectionner des médias"
        );
        return;
      }
    }

    // Lancer la galerie
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images", // Permet de sélectionner des images et des vidéos
      allowsEditing: false,
      allowsMultipleSelection: true, // Pour permettre la sélection multiple
      selectionLimit: 5, // Limite à 5 médias maximum
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Afficher les médias sélectionnés dans la console
      console.log("Médias sélectionnés:", result.assets);

      // Ici vous pourriez implémenter la logique pour afficher un aperçu
      // ou pour préparer l'envoi des médias
    }
  };

  // Gérer la fin de l'enregistrement
  const handleStopRecording = useCallback(
    (uri: string | null) => {
      setIsRecording(false);

      if (uri) {
        console.log("URI de l'enregistrement:", uri);
        // Ici vous pouvez traiter l'audio (l'envoyer via WebSocket, etc.)

        // Si vous voulez envoyer l'audio via WebSocket:
        // if (isConnected && wsRef.current) {
        //   wsRef.current.sendMessage(
        //     JSON.stringify({
        //       type: "audio",
        //       audio_uri: uri
        //     })
        //   );
        // }
      }
    },
    [isConnected]
  );

  // Toggle enregistrement - version simplifiée
  const handleRecordingPress = useCallback(() => {
    if (isRecording) {
      // Ne fait rien ici, car l'arrêt est géré par le composant MessageVocal
    } else {
      setIsRecording(true);
    }
  }, [isRecording]);

  return (
    <SafeAreaView style={styles.container}>
      {/* En-tête du chat */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.neutral800} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Image
            source={{
              uri: avatar_url,
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.headerName}>
              {first_name} {last_name}
            </Text>
          </View>
          <View style={styles.statusIndicator}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: status ? colors.green : colors.neutral400,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Zone des messages avec indicateur de chargement */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.neutral800} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlashList
            ref={flatListRef}
            data={[...messages].reverse()}
            inverted={true}
            renderItem={({ item, index }) => (
              <MessageContainer
                item={item}
                index={messages.length - 1 - index}
              />
            )}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messagesContainer}
            estimatedItemSize={200}
            automaticallyAdjustKeyboardInsets={true}
            onEndReached={() => {
              console.log("Charger des messages plus anciens");
            }}
            onEndReachedThreshold={0.1}
          />
          {peerIsTyping && (
            <MessageTypingAnimation
              dotColor={colors.neutral500}
              backgroundColor={colors.neutral200}
            />
          )}
        </View>
      )}

      {/* Zone de saisie */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 70}
      >
        {isRecording ? (
          <MessageVocal onStopRecording={handleStopRecording} />
        ) : (
          <MessageInput
            messageInputRef={messageInputRef}
            onChangeText={handleMessageChange}
            isButtonDisabled={isButtonDisabled}
            onSendMessage={sendMessage}
            onTakePicture={takePicture}
            onPickImage={pickImage}
            onRecordPress={handleRecordingPress}
            value={messageText}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  backButton: {
    marginRight: 16,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral800,
  },
  headerStatus: {
    fontSize: 14,
    color: colors.neutral500,
  },
  statusIndicator: {
    position: "absolute",
    bottom: 0,
    left: 30,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  messagesContainer: {
    padding: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    color: colors.neutral600,
    fontSize: 16,
    textAlign: "center",
  },
  authErrorContainer: {
    backgroundColor: colors.rose,
    padding: 10,
    alignItems: "center",
  },
  authErrorText: {
    color: colors.white,
    fontWeight: "500",
  },
  recordingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
    backgroundColor: colors.white,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.rose,
    marginRight: 8,
  },
  recordingText: {
    flex: 1,
    color: colors.neutral800,
    fontSize: 14,
  },
  stopRecordingButton: {
    backgroundColor: colors.neutral200,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  stopRecordingButtonText: {
    color: colors.neutral800,
    fontSize: 12,
    fontWeight: "600",
  },
});
