import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HomeScreen from "../screens/HomeScreen";
import TutorListScreen from "../screens/TutorListScreen";
import MyBookingsScreen from "../screens/MyBookingsScreen";
import TutorDashboardStack from "./TutorDashboardStack";

const Tab = createBottomTabNavigator();

const TabBarIcon = ({ routeName, focused, color, size } : any) => {
  const iconMap = {
    Home: focused ? "home-sharp" : "home-outline",
    TutorList: focused ? "search-sharp" : "search-outline",
    MyBookings: focused ? "calendar-sharp" : "calendar-outline",
    TutorDashboard: focused ? "person-sharp" : "person-outline",
  };

  return (
    <View className="items-center justify-center">
      <Ionicons name={iconMap[routeName]} size={size} color={color} />
    </View>
  );
};

export default function Tabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => (
          <TabBarIcon
            routeName={route.name}
            focused={focused}
            color={color}
            size={size}
          />
        ),

        headerShown: true,
        headerStyle: { backgroundColor: "#008080" },
        headerTintColor: "#fff",

        tabBarActiveTintColor: "#008080",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#e0e0e0",
          borderTopWidth: 1,

          height: 60 + insets.bottom,
          paddingBottom: (insets.bottom) + 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 2,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "TutorMe", tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="TutorList"
        component={TutorListScreen}
        options={{ title: "Find Tutors", tabBarLabel: "Tutors" }}
      />
      <Tab.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{ title: "My Bookings", tabBarLabel: "Bookings" }}
      />
      <Tab.Screen
        name="TutorDashboard"
        component={TutorDashboardStack}
        options={{
          title: "Tutor Dashboard",
          tabBarLabel: "Teach",
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}
