import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { router, Tabs } from "expo-router";
import CustomTabs from "@/components/CustomTabs";
import { colors } from "@/constants/theme";
import * as Icons from "phosphor-react-native";

const TabsLayout = () => {
  return (
    <Tabs tabBar={CustomTabs} screenOptions={{ headerShown: true }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Amis",
          title: "Amis",
          headerTitleAlign: "center",
          headerShadowVisible: false,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarLabel: "Notifications",
          title: "Notifications",
          headerTitleAlign: "center",
          headerShadowVisible: false,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Profil",
          title: "Profile",
          headerTitleAlign: "center",
          headerShadowVisible: false,
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;

const styles = StyleSheet.create({
  headerIcon: {
    padding: 10,
    marginHorizontal: 10,
  },
});
