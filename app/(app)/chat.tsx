import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { ArrowLeft, PaperPlaneRight, Smiley } from "phosphor-react-native";
import { colors } from "@/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";

interface Message {
  id: string;
  text: string;
  sender: "me" | "friend";
  timestamp: number;
}

const ChatScreen = () => {
  const { friendId, friendName } = useLocalSearchParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const [typingDots, setTypingDots] = useState(".");

  // Simuler des messages existants
  useEffect(() => {
    // Dans une application réelle, vous chargeriez les messages depuis une API
    const mockMessages: Message[] = [
      {
        id: "1",
        text: "Bonjour !",
        sender: "friend",
        timestamp: Date.now() - 3600000,
      },
      {
        id: "2",
        text: "Salut, comment ça va ?",
        sender: "me",
        timestamp: Date.now() - 3540000,
      },
      {
        id: "3",
        text: "Très bien, merci ! Et toi ?",
        sender: "friend",
        timestamp: Date.now() - 3480000,
      },
      {
        id: "4",
        text: "Super bien aussi. Tu fais quoi aujourd'hui ?",
        sender: "me",
        timestamp: Date.now() - 60000,
      },
    ];
    setMessages(mockMessages);
  }, [friendId]);

  // Simuler un effet "est en train d'écrire"
  useEffect(() => {
    const typingTimeout = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        // Simuler une réponse
        const newMessage: Message = {
          id: (messages.length + 1).toString(),
          text: "Oui, je suis disponible cet après-midi !",
          sender: "friend",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    }, 3000);

    return () => clearTimeout(typingTimeout);
  }, [isTyping]);

  // Ajouter cet effet pour animer les points
  useEffect(() => {
    if (!isTyping) return;

    const dotsInterval = setInterval(() => {
      setTypingDots((prev) => {
        if (prev === ".") return "..";
        if (prev === "..") return "...";
        return ".";
      });
    }, 500);

    return () => clearInterval(dotsInterval);
  }, [isTyping]);

  const sendMessage = () => {
    if (message.trim() === "") return;

    // Ajouter notre message
    const newMessage: Message = {
      id: (messages.length + 1).toString(),
      text: message,
      sender: "me",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");

    // Simuler que l'ami est en train d'écrire
    setTimeout(() => setIsTyping(true), 1000);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === "me" ? styles.myMessage : styles.friendMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
    </View>
  );

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
              uri: `https://randomuser.me/api/portraits/${
                Math.random() > 0.5 ? "women" : "men"
              }/${Math.floor(Math.random() * 100)}.jpg`,
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.headerName}>{friendName}</Text>
            <Text style={styles.headerStatus}>
              {isOnline ? "En ligne" : "Hors ligne"}
            </Text>
          </View>
        </View>
      </View>

      {/* Zone des messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Indicateur "est en train d'écrire" - remplacé par trois points */}
      {isTyping && (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>...</Text>
        </View>
      )}

      {/* Zone de saisie */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 70}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.emojiButton}>
            <Smiley size={24} color={colors.neutral600} />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="Écrivez un message..."
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              message.trim() === "" ? styles.sendButtonDisabled : {},
            ]}
            onPress={sendMessage}
            disabled={message.trim() === ""}
          >
            <PaperPlaneRight
              size={24}
              color={message.trim() === "" ? colors.neutral400 : colors.white}
              weight="fill"
            />
          </TouchableOpacity>
        </View>
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
  messagesContainer: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 18,
    marginBottom: 8,
  },
  myMessage: {
    backgroundColor: colors.neutral100,
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  friendMessage: {
    backgroundColor: colors.neutral200,
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: colors.neutral800,
  },
  messageTime: {
    fontSize: 12,
    color: colors.neutral500,
    alignSelf: "flex-end",
    marginTop: 4,
  },
  typingContainer: {
    alignSelf: "flex-start",
    backgroundColor: colors.neutral200,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 16,
    marginBottom: 8,
  },
  typingText: {
    fontSize: 16,
    letterSpacing: 2,
    color: colors.neutral600,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
    backgroundColor: colors.white,
  },
  emojiButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.neutral100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    marginHorizontal: 8,
  },
  sendButton: {
    backgroundColor: colors.neutral800,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: colors.neutral200,
  },
});
