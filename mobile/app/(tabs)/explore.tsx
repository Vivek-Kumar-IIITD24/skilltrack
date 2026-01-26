import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image, RefreshControl, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export default function DashboardScreen() {
  const router = useRouter();
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      checkAdmin();
      fetchMySkills();
    }, [])
  );

  const checkAdmin = async () => {
    const role = await SecureStore.getItemAsync('role');
    setIsAdmin(role === 'ADMIN');
  };

  const fetchMySkills = async () => {
    try {
      console.log("Fetching dashboard courses...");
      const response = await api.get('/user-skills'); 
      setSkills(response.data);
    } catch (error: any) {
      if (error.response && (error.response.status === 409 || error.response.status === 403)) {
         setSkills([]); 
      } else {
         console.log("Dashboard Fetch Error:", error.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ NEW: Handle Drop Course
  const confirmDropCourse = (skillId: number, skillName: string) => {
    Alert.alert(
      "Drop Course",
      `Are you sure you want to drop "${skillName}"? All progress will be lost.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Drop", 
          style: "destructive", 
          onPress: () => dropCourse(skillId) 
        }
      ]
    );
  };

  const dropCourse = async (skillId: number) => {
    try {
      setLoading(true);
      await api.delete(`/user-skills/${skillId}`);
      Alert.alert("Success", "You have dropped the course.");
      fetchMySkills(); // Refresh list
    } catch (error) {
      Alert.alert("Error", "Could not drop course.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMySkills();
  };

  const renderSkillItem = ({ item }: { item: any }) => (
    <View style={styles.cardContainer}>
      {/* Main Clickable Area -> Lesson */}
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => router.push({ pathname: '/lesson', params: { skillId: item.skill.id, title: item.skill.name } })}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="play" size={20} color="#10B981" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.skillName} numberOfLines={1}>{item.skill.name}</Text>
            <Text style={styles.status}>
              {item.skill.lessonCount || 0} Lessons • {item.progress}%
            </Text>
          </View>
          
          {/* Certificate or Arrow */}
          {item.progress >= 90 ? (
               <TouchableOpacity 
                  style={{backgroundColor: '#FFD700', padding: 6, borderRadius: 20}}
                  onPress={() => router.push({ pathname: '/certificate', params: { skillId: item.skill.id } })}
               >
                   <Ionicons name="trophy" size={20} color="#B45309" />
               </TouchableOpacity>
          ) : (
               <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          )}
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${item.progress}%` }]} />
        </View>
      </TouchableOpacity>

      {/* ✅ DROP BUTTON (Small Trash Icon outside the main touch area) */}
      <TouchableOpacity 
        style={styles.dropButton} 
        onPress={() => confirmDropCourse(item.skill.id, item.skill.name)}
      >
        <Ionicons name="trash-outline" size={18} color="#94A3B8" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../assets/images/logo.png')} style={styles.headerLogo} />
        {isAdmin && (
          <TouchableOpacity onPress={() => router.push('/add-course' as any)} style={styles.adminButton}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.adminButtonText}>Import</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.pageTitle}>My Learning Path</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 50 }} />
      ) : skills.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="book-outline" size={48} color="#10B981" />
          </View>
          <Text style={styles.emptyTitle}>Start Your Journey</Text>
          <Text style={styles.emptyText}>You haven't enrolled in any courses yet.</Text>
          <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/(tabs)/catalog')}>
             <Text style={styles.browseButtonText}>Browse Catalog</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={skills}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSkillItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerLogo: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  adminButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  
  // ✅ NEW: Card Container to hold main card + drop button
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  card: {
    flex: 1, // Take remaining space
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  // ✅ NEW: Drop Button Style
  dropButton: {
    padding: 10,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  skillName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  status: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  browseButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  browseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});