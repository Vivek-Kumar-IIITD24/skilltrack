import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export default function CatalogScreen() {
  const router = useRouter();
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      checkRole();
      fetchSkills();
    }, [])
  );

  const checkRole = async () => {
    const role = await SecureStore.getItemAsync('role');
    setUserRole(role);
  };

  const fetchSkills = async () => {
    try {
      const response = await api.get('/skills');
      setSkills(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ NEW: Delete Functionality
  const handleDeleteConfirm = (id: number, name: string) => {
    Alert.alert(
        "Delete Course",
        `Are you sure you want to permanently delete "${name}"? This cannot be undone.`,
        [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => deleteCourse(id) }
        ]
    );
  };

  const deleteCourse = async (id: number) => {
      try {
          setLoading(true);
          await api.delete(`/skills/${id}`);
          Alert.alert("Success", "Course deleted successfully.");
          fetchSkills(); // Refresh list
      } catch (error: any) {
          Alert.alert("Error", error.response?.data || "Could not delete course.");
      } finally {
          setLoading(false);
      }
  };


  const handleEnroll = async (skillId: number, skillName: string) => {
    if (userRole === 'ADMIN') {
      router.push({ 
        pathname: '/lesson', 
        params: { skillId: skillId.toString(), title: skillName } 
      });
      return;
    }

    try {
      await api.post('/user-skills', { skillId });
      Alert.alert("Enrolled!", "This course has been added to your learning path.", [
        { text: "Go to Dashboard", onPress: () => router.push('/(tabs)/explore' as any) }
      ]);
    } catch (error: any) {
      const message = error.response?.data || "Enrollment failed.";
      if (typeof message === 'string' && message.includes("already enrolled")) {
         router.push('/(tabs)/explore' as any);
      } else {
         Alert.alert("Note", "You are likely already enrolled.");
      }
    }
  };

  const renderSkillItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{flex: 1}}>
          <Text style={styles.skillName}>{item.name}</Text>
          <Text style={styles.skillCategory}>{item.category} • {item.level}</Text>
        </View>
        <View style={styles.iconCircle}>
           <Ionicons name="school-outline" size={20} color="#10B981" />
        </View>
      </View>
      
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      
      <View style={styles.cardFooter}>
        <View style={styles.metaContainer}>
           <Ionicons name="time-outline" size={14} color="#64748B" />
           {/* Show lesson count if available */}
           <Text style={styles.metaText}>{item.lessons ? `${item.lessons.length} Lessons` : 'Self-Paced'}</Text>
        </View>

        <View style={styles.actionsContainer}>
            {/* ✅ DELETE BUTTON (Admin Only) */}
            {userRole === 'ADMIN' && (
                <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={() => handleDeleteConfirm(item.id, item.name)}
                >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
            )}

            <TouchableOpacity 
            style={[
                styles.actionButton, 
                userRole === 'ADMIN' ? styles.adminButton : styles.enrollButton
            ]} 
            onPress={() => handleEnroll(item.id, item.name)}
            >
            <Text style={[
                styles.buttonText,
                userRole === 'ADMIN' ? styles.adminButtonText : styles.enrollButtonText
            ]}>
                {userRole === 'ADMIN' ? "Preview" : "Enroll"}
            </Text>
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Courses</Text>
        <Text style={styles.headerSubtitle}>Manage and browse courses.</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={skills}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSkillItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchSkills(); }} tintColor="#10B981" />}
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
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  skillName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
    maxWidth: 220,
  },
  skillCategory: {
    fontSize: 12,
    color: '#10B981', 
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
  actionsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  deleteButton: {
      padding: 8,
      marginRight: 8,
      backgroundColor: '#FEF2F2',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#FEE2E2'
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  enrollButton: {
    backgroundColor: '#10B981',
  },
  adminButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#94A3B8',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 13,
  },
  enrollButtonText: {
    color: '#FFFFFF',
  },
  adminButtonText: {
    color: '#64748B',
  },
});