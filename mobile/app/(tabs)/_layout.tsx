import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons'; // ✅ Fixed: Imported Ionicons

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb', // Active (Blue)
        tabBarInactiveTintColor: '#94a3b8', // Inactive (Gray)
        headerShown: false,
      }}>
      
      {/* Tab 1: Login (Hidden from menu) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Login',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="log-in" color={color} />,
          href: null, 
          tabBarStyle: { display: 'none' },
        }}
      />

      {/* Tab 2: Dashboard */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Dashboard', 
          tabBarLabel: 'Dashboard', // Explicitly set label
          tabBarIcon: ({ color }) => <Ionicons size={28} name="rocket" color={color} />,
        }}
      />

      {/* Tab 3: Catalog (Restored) */}
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'Explore', 
          tabBarLabel: 'Explore', // Explicitly set label
          tabBarIcon: ({ color }) => <Ionicons size={28} name="search" color={color} />,
        }}
      />

      {/* Tab 4: Leaderboard */}
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="trophy" color={color} />,
        }}
      />

      {/* Tab 5: Profile (New) */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}