import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { MagnifyingGlass, ChatCircle, Plus } from "phosphor-react-native";
import { colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import { getFriendsData } from "@/services/fetchData";
import { User } from "@/types";
const FriendsScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState<User[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const fetchFriends = async () => {
    await getFriendsData()
      .then((data) => setFriends(data))
      .catch((err) =>
        console.error("Erreur lors du chargement des amis :", err)
      );
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchFriends();
    setIsRefreshing(false);
  };

  const handleChatPress = (friend: User) => {
    router.push({
      pathname: "/chat",
      params: {
        id: friend.id,
        first_name: friend.first_name,
        last_name: friend.last_name,
        avatar_url: friend.avatar_url,
        status: friend.status ? "true" : "false",
      },
    });
  };

  const renderFriendItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.friendCard}
      onPress={() => handleChatPress(item)}
    >
      <View style={styles.friendInfo}>
        <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
        <View style={styles.statusIndicator}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: item.status ? colors.green : colors.neutral400,
              },
            ]}
          />
        </View>
        <View style={styles.friendDetails}>
          <Text style={styles.friendName}>
            {item.first_name} {item.last_name}
          </Text>
          <Text style={styles.friendEmail}>{item.email}</Text>
          <Text style={styles.statusText}>
            {item.status ? "En ligne" : "Hors ligne"}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.actionButton,
          {
            backgroundColor: colors.neutral200,
          },
        ]}
        onPress={() => {
          handleChatPress(item);
        }}
      >
        <ChatCircle size={20} color={colors.neutral800} weight="fill" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: colors.white }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.contentContainer}>
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

        <FlatList
          data={friends}
          renderItem={renderFriendItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.neutral800]}
              tintColor={colors.neutral800}
            />
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default FriendsScreen;

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
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
    bottom: 5,
    left: 35,
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
  friendEmail: {
    fontSize: 14,
    color: colors.neutral400,
  },
  statusText: {
    fontSize: 14,
    color: colors.neutral400,
    marginTop: 4,
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
