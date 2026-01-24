import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb', // Active color (Blue)
        tabBarInactiveTintColor: '#94a3b8', // Inactive color (Gray)
        headerShown: false,
      }}>
      
      {/* Tab 1: Login (Hidden) */}
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
          title: 'My Path',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="rocket" color={color} />,
        }}
      />

      {/* Tab 3: Catalog */}
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'Catalog',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="search" color={color} />,
        }}
      />
    </Tabs>
  );
}