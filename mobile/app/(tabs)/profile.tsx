import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api from '@/services/api';

interface UserStats {
  userName: string;
  email: string;
  totalEnrolled: number;
  completed: number;
  inProgress: number;
  averageProgress: number;
}

export default function ProfileScreen() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetching the stats endpoint we made earlier
      const response = await api.get('/user-skills/stats');
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch profile", error);
      Alert.alert("Error", "Could not load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // 1. Delete the token from storage
      await SecureStore.deleteItemAsync('token');
      // 2. Reset navigation to the Login screen
      router.replace('/');
    } catch (error) {
      Alert.alert("Error", "Failed to logout");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
           <Ionicons name="person" size={40} color="#fff" />
        </View>
        <Text style={styles.name}>{stats?.userName || "Student"}</Text>
        <Text style={styles.email}>{stats?.email || "student@test.com"}</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats?.totalEnrolled || 0}</Text>
          <Text style={styles.statLabel}>Enrolled</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats?.completed || 0}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats?.averageProgress || 0}%</Text>
          <Text style={styles.statLabel}>Avg Progress</Text>
        </View>
      </View>

      {/* Menu Options */}
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert("Coming Soon", "Edit Profile feature coming in Part B!")}>
          <Ionicons name="settings-outline" size={24} color="#334155" />
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward" size={24} color="#cbd5e1" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert("Help", "Contact support@skilltrack.com")}>
          <Ionicons name="help-circle-outline" size={24} color="#334155" />
          <Text style={styles.menuText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={24} color="#cbd5e1" />
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#2563eb',
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  name: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  email: { fontSize: 14, color: '#dbeafe', marginTop: 4 },
  
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -30, // Pull up to overlap header
  },
  statCard: {
    backgroundColor: '#fff',
    width: '30%',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },

  menu: { marginTop: 30, paddingHorizontal: 20 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuText: { flex: 1, marginLeft: 16, fontSize: 16, color: '#334155' },
  
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    justifyContent: 'center',
  },
  logoutText: { marginLeft: 8, fontSize: 16, fontWeight: 'bold', color: '#ef4444' },
});