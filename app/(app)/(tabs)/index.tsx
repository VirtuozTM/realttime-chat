import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useState } from "react";
import { router } from "expo-router";
import { MagnifyingGlass, User, ChatCircle, Plus } from "phosphor-react-native";
import { colors } from "@/constants/theme";

// Types pour nos données
type FriendStatus = "connected" | "pending";

interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "offline";
  connectionStatus: FriendStatus;
}

const FriendsScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Données fictives pour l'exemple
  const [friends, setFriends] = useState<Friend[]>([
    {
      id: "1",
      name: "Sophie Martin",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      status: "online",
      connectionStatus: "connected",
    },
    {
      id: "2",
      name: "Thomas Dubois",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      status: "offline",
      connectionStatus: "connected",
    },
    {
      id: "3",
      name: "Julie Bernard",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      status: "online",
      connectionStatus: "connected",
    },
    {
      id: "4",
      name: "Marc Petit",
      avatar: "https://randomuser.me/api/portraits/men/75.jpg",
      status: "offline",
      connectionStatus: "pending",
    },
    {
      id: "5",
      name: "Laura Roux",
      avatar: "https://randomuser.me/api/portraits/women/17.jpg",
      status: "online",
      connectionStatus: "pending",
    },
  ]);

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const connectedFriends = filteredFriends.filter(
    (friend) => friend.connectionStatus === "connected"
  );
  const pendingFriends = filteredFriends.filter(
    (friend) => friend.connectionStatus === "pending"
  );

  const handleFriendAction = (friend: Friend) => {
    if (friend.connectionStatus === "connected") {
      // Naviguer vers le chat
      router.push({
        pathname: "/chat",
        params: { friendId: friend.id, friendName: friend.name },
      });
    } else {
      // Envoyer une demande de connexion
      // Logique à implémenter plus tard
      alert(`Demande de connexion envoyée à ${friend.name}`);

      // Mise à jour de l'UI pour refléter l'envoi de la demande
      const updatedFriends = friends.map((f) =>
        f.id === friend.id
          ? { ...f, connectionStatus: "pending" as FriendStatus }
          : f
      );
      setFriends(updatedFriends);
    }
  };

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <TouchableOpacity
      style={styles.friendCard}
      onPress={() => handleFriendAction(item)}
    >
      <View style={styles.friendInfo}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.statusIndicator}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  item.status === "online" ? colors.green : colors.neutral400,
              },
            ]}
          />
        </View>
        <View style={styles.friendDetails}>
          <Text style={styles.friendName}>{item.name}</Text>
          <Text style={styles.statusText}>
            {item.status === "online" ? "En ligne" : "Hors ligne"}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.actionButton,
          {
            backgroundColor:
              item.connectionStatus === "connected"
                ? colors.neutral100
                : colors.neutral200,
          },
        ]}
        onPress={() => handleFriendAction(item)}
      >
        {item.connectionStatus === "connected" ? (
          <ChatCircle size={20} color={colors.neutral800} weight="fill" />
        ) : (
          <Plus size={20} color={colors.neutral800} weight="bold" />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <MagnifyingGlass
          size={20}
          color={colors.neutral400}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un ami..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Section amis connectés */}
      <Text style={styles.sectionTitle}>Mes amis</Text>
      {connectedFriends.length > 0 ? (
        <FlatList
          data={connectedFriends}
          renderItem={renderFriendItem}
          keyExtractor={(item) => item.id}
          style={styles.friendsList}
        />
      ) : (
        <Text style={styles.emptyListText}>
          Aucun ami connecté pour le moment
        </Text>
      )}

      {/* Section suggestions */}
      <Text style={styles.sectionTitle}>Suggestions</Text>
      {pendingFriends.length > 0 ? (
        <FlatList
          data={pendingFriends}
          renderItem={renderFriendItem}
          keyExtractor={(item) => item.id}
          style={styles.friendsList}
        />
      ) : (
        <Text style={styles.emptyListText}>
          Aucune suggestion pour le moment
        </Text>
      )}
    </View>
  );
};

export default FriendsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral100,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 20,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: colors.neutral800,
  },
  friendsList: {
    marginBottom: 20,
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 2.5,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  friendInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  statusIndicator: {
    position: "absolute",
    bottom: 0,
    left: 36,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  friendDetails: {
    marginLeft: 16,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.neutral800,
  },
  statusText: {
    fontSize: 14,
    color: colors.neutral400,
    marginTop: 2,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyListText: {
    color: colors.neutral400,
    textAlign: "center",
    marginVertical: 20,
    fontStyle: "italic",
  },
});
