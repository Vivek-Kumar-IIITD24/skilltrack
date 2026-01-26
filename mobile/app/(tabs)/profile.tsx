import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export default function ProfileScreen() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({ name: 'Loading...', email: '', role: '' });
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const fetchProfile = async () => {
    try {
      const storedRole = await SecureStore.getItemAsync('role');
      const response = await api.get('/user-skills/stats'); 
      
      setUserInfo({
        name: response.data.userName,
        email: response.data.email,
        role: storedRole || 'STUDENT'
      });
    } catch (error) {
      const storedRole = await SecureStore.getItemAsync('role');
      setUserInfo(prev => ({ ...prev, role: storedRole || 'Guest' }));
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('role');
    router.replace('/');
  };

  const isManager = userInfo.role === 'ADMIN';

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProfile(); }} tintColor="#10B981" />}
    >
      <View style={styles.header}>
        {/* ✅ UNIFIED AVATAR: Always Brand Green */}
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        
        <Text style={styles.name}>{userInfo.name}</Text>
        <Text style={styles.email}>{userInfo.email}</Text>
        
        {/* Role Badge: Distinguish via Label/Subtle Color */}
        <View style={[styles.badge, isManager ? styles.adminBadge : styles.studentBadge]}>
          <Text style={[styles.badgeText, isManager ? styles.adminBadgeText : styles.studentBadgeText]}>
            {isManager ? "Manager Account" : "Student"}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Ionicons name="person-outline" size={20} color="#64748B" />
          </View>
          <Text style={styles.menuText}>Personal Details</Text>
          <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Ionicons name="notifications-outline" size={20} color="#64748B" />
          </View>
          <Text style={styles.menuText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Ionicons name="help-circle-outline" size={20} color="#64748B" />
          </View>
          <Text style={styles.menuText}>Help Center</Text>
          <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Outcomely v1.0 • Phase 2</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  // ✅ Fixed Avatar: Uses Brand Green (#10B981)
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981', 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  // Badge Styles
  studentBadge: { backgroundColor: '#ECFDF5' }, // Light Green
  adminBadge: { backgroundColor: '#F1F5F9' },   // Light Grey (Neutral Professional)
  
  badgeText: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  studentBadgeText: { color: '#10B981' },
  adminBadgeText: { color: '#64748B' },
  
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
  },
  logoutButton: {
    marginHorizontal: 24,
    marginTop: 40,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: 16,
  },
  version: {
    textAlign: 'center',
    color: '#CBD5E1',
    marginTop: 24,
    marginBottom: 40,
    fontSize: 12,
  },
});