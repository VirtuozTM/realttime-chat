import React from "react";
import { Tabs } from "expo-router";
import CustomTabs from "@/components/CustomTabs";

const TabsLayout = () => {
  return (
    <Tabs
      tabBar={(props) => <CustomTabs {...props} />}
      screenOptions={{ headerShown: true, tabBarHideOnKeyboard: true }}
    >
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
