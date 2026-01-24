import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import api from '@/services/api';
import { router } from 'expo-router';

interface Skill {
  id: number;
  name: string;
  description: string;
  level: string;
  category: string;
}

export default function CatalogScreen() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch All Available Skills
  const fetchCatalog = async () => {
    try {
      const response = await api.get('/skills');
      setSkills(response.data);
    } catch (error) {
      console.error("Failed to fetch catalog", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  // 2. Handle Enrollment (Debug Version)
  const handleEnroll = async (skillId: number) => {
    try {
      console.log(`Attempting to enroll in skill ID: ${skillId}`);
      await api.post('/user-skills', { skillId });
      
      Alert.alert("Success", "You have enrolled! Go to your Dashboard to start learning.", [
        { text: "Go to Dashboard", onPress: () => router.replace('/explore') }
      ]);
    } catch (error: any) {
      console.error("Enrollment Error Details:", error.response?.data || error.message);
      
      // Handle "Already Enrolled" gracefully
      if (error.response?.status === 409 || error.response?.data?.message?.includes("already")) {
         Alert.alert("Notice", "You are already enrolled in this skill.");
      } else {
         Alert.alert("Error", `Failed to enroll. Status: ${error.response?.status}`);
      }
    }
  };

  const renderSkillCard = ({ item }: { item: Skill }) => (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.skillName}>{item.name}</Text>
          <Text style={styles.category}>{item.category} • {item.level}</Text>
        </View>
        <TouchableOpacity 
          style={styles.enrollButton} 
          onPress={() => handleEnroll(item.id)}
        >
          <Text style={styles.enrollText}>Enroll</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Course Catalog</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : (
        <FlatList
          data={skills}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSkillCard}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 20,
  },
  list: { paddingBottom: 100 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  skillName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
  },
  category: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  enrollButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  enrollText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  description: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
});