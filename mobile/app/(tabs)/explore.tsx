import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useFocusEffect } from 'expo-router';
import api from '@/services/api';

// Define what a Skill looks like
interface Skill {
  skillId: number;
  skillName: string;
  description: string;
  progress: number;
  status: string;
}

export default function DashboardScreen() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch data from Java Backend
  const fetchSkills = async () => {
    try {
      const response = await api.get('/user-skills/me');
      setSkills(response.data);
    } catch (error) {
      console.error("Failed to fetch skills", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Reload data whenever this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchSkills();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchSkills();
  };

  const renderSkillCard = ({ item }: { item: Skill }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.skillName}>{item.skillName}</Text>
        <View style={[
          styles.badge, 
          { backgroundColor: item.progress >= 100 ? '#dcfce7' : '#dbeafe' }
        ]}>
          <Text style={[
            styles.badgeText,
            { color: item.progress >= 100 ? '#166534' : '#1e40af' }
          ]}>
            {item.progress >= 100 ? 'COMPLETED' : 'IN PROGRESS'}
          </Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${item.progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{item.progress}%</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>My Learning Path</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={skills}
          keyExtractor={(item) => item.skillId.toString()}
          renderItem={renderSkillCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>You haven't enrolled in any skills yet.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    paddingTop: 60, // Space for status bar
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  skillName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 50,
  },
});