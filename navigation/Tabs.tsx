import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import DetailsScreen from "../screens/DetailsScreen";
import TutorListScreen from "../screens/TutorListScreen";
import BecomeATutorScreen from "../screens/BecomeATutorScreen";
import MyBookingsScreen from "../screens/MyBookingsScreen";
import Ionicons from "react-native-vector-icons/Ionicons";
import { View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator();

const TabBarIcon = ({
  routeName,
  focused,
  color,
  size,
}: {
  routeName: string;
  focused: boolean;
  color: string;
  size: number;
}) => {
  const iconMap: Record<string, { ionicon: string; emoji: string }> = {
    Home: {
      ionicon: focused ? "home-sharp" : "home-outline",
      emoji: "🏠",
    },
    TutorList: {
      ionicon: focused ? "search-sharp" : "search-outline",
      emoji: "�",
    },
    MyBookings: {
      ionicon: focused ? "calendar-sharp" : "calendar-outline",
      emoji: "📅",
    },
    BecomeATutor: {
      ionicon: focused ? "person-sharp" : "person-outline",
      emoji: "👨‍🏫",
    },
  };

  const config = iconMap[routeName] || iconMap.Home;

  // Debug: Log what we're trying to render
  console.log(`🔍 Rendering icon: ${config.ionicon} for ${routeName} (focused: ${focused})`);

  return (
    <View className="items-center justify-center">
      <Ionicons 
        name={config.ionicon as any} 
        size={size} 
        color={color}
        suppressHighlighting={true}
      />
    </View>
  );
};

export default function Tabs() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
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
          tabBarActiveTintColor: "#008080",
          tabBarInactiveTintColor: "gray",
          headerShown: true,
          headerStyle: { backgroundColor: "#008080" },
          headerTintColor: "#fff",
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopColor: "#e0e0e0",
            borderTopWidth: 1,
            height: 60 + insets.bottom, // account for safe area
            paddingBottom: insets.bottom || 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            marginBottom: Platform.OS === "android" ? 2 : 0,
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "TutorMe",
            tabBarLabel: "Home",
          }}
        />
        <Tab.Screen
          name="TutorList"
          component={TutorListScreen}
          options={{
            title: "Find Tutors",
            tabBarLabel: "Tutors",
          }}
        />
        <Tab.Screen
          name="MyBookings"
          component={MyBookingsScreen}
          options={{
            title: "My Bookings",
            tabBarLabel: "Bookings",
          }}
        />
        <Tab.Screen
          name="BecomeATutor"
          component={BecomeATutorScreen}
          options={{
            title: "Tutor Dashboard",
            tabBarLabel: "Teach",
          }}
        />
      </Tab.Navigator>
    </View>
  );
}
