import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { colors } from "@/constants/theme";
import { useSession } from "@/context/AuthContext";
const MessageContainer = ({ item, index }: { item: any; index: number }) => {
  const { user } = useSession();

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View
      style={[
        styles.messageContainer,
        item.sender.id === user?.id ? styles.myMessage : styles.friendMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.content}</Text>
      <View style={styles.messageFooter}>
        <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
        {item.sender.id === user?.id && (
          <View style={styles.readStatusContainer}>
            <Text style={styles.readStatusText}>
              {item.is_read ? "Lu" : "Envoyé"}
            </Text>
            <View
              style={[
                styles.readStatusDot,
                item.is_read
                  ? styles.readStatusDotRead
                  : styles.readStatusDotUnread,
              ]}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default MessageContainer;

const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 18,
    marginBottom: 8,
  },
  myMessage: {
    backgroundColor: colors.primaryLight,
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  friendMessage: {
    backgroundColor: colors.neutral100,
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: colors.neutral800,
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 4,
  },
  messageTime: {
    fontSize: 12,
    color: colors.neutral600,
  },

  readStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  readStatusText: {
    fontSize: 12,
    color: colors.neutral600,
    marginRight: 4,
  },
  readStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  readStatusDotRead: {
    backgroundColor: colors.green,
  },
  readStatusDotUnread: {
    backgroundColor: colors.neutral500,
  },
});
