import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Linking, Alert } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';

interface Skill {
  skillId: number;
  skillName: string;
  description: string;
  progress: number;
  status: string;
  videoUrl?: string;
  docsUrl?: string;
}

export default function DashboardScreen() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  useFocusEffect(useCallback(() => { fetchSkills(); }, []));
  const onRefresh = () => { setRefreshing(true); fetchSkills(); };

  const openLink = async (url?: string) => {
    if (url && await Linking.canOpenURL(url)) await Linking.openURL(url);
  };

  // ✅ Pass skillId to the lesson
  const handleWatch = (videoUrl: string, skillName: string, skillId: number) => {
    router.push({
      pathname: '/lesson' as any,
      params: { videoUrl, title: skillName, skillId }
    });
  };

  // ✅ Open Certificate
  const handleCertificate = (skillId: number) => {
    router.push({
      pathname: '/certificate' as any,
      params: { skillId }
    });
  };

  const renderSkillCard = ({ item }: { item: Skill }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.skillName}>{item.skillName}</Text>
        <View style={[styles.badge, { backgroundColor: item.progress >= 100 ? '#dcfce7' : '#dbeafe' }]}>
          <Text style={[styles.badgeText, { color: item.progress >= 100 ? '#166534' : '#1e40af' }]}>
            {item.progress >= 100 ? 'COMPLETED' : 'IN PROGRESS'}
          </Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${item.progress}%`, backgroundColor: item.progress >= 100 ? '#16a34a' : '#2563eb' }]} />
        </View>
        <Text style={styles.progressText}>{item.progress}%</Text>
      </View>

      <View style={styles.actionRow}>
        {/* ✅ IF COMPLETED: Show Certificate Button */}
        {item.progress >= 100 ? (
          <TouchableOpacity 
            style={[styles.actionButton, styles.certButton]} 
            onPress={() => handleCertificate(item.skillId)}
          >
            <Ionicons name="ribbon" size={20} color="#fff" />
            <Text style={styles.actionText}>View Certificate</Text>
          </TouchableOpacity>
        ) : (
          // ✅ IF NOT COMPLETED: Show Watch Button
          item.videoUrl ? (
            <TouchableOpacity 
              style={[styles.actionButton, styles.videoButton]} 
              onPress={() => handleWatch(item.videoUrl!, item.skillName, item.skillId)}
            >
              <Ionicons name="play-circle" size={20} color="#fff" />
              <Text style={styles.actionText}>Watch Class</Text>
            </TouchableOpacity>
          ) : null
        )}

        {item.docsUrl && (
          <TouchableOpacity style={[styles.actionButton, styles.docsButton]} onPress={() => openLink(item.docsUrl)}>
            <Ionicons name="document-text" size={20} color="#fff" />
            <Text style={styles.actionText}>Read Notes</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>My Learning Path</Text>
      {loading ? <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 50 }} /> : 
        <FlatList
          data={skills}
          keyExtractor={(item) => item.skillId.toString()}
          renderItem={renderSkillCard}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa', paddingTop: 60, paddingHorizontal: 20 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#1e293b', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  skillName: { fontSize: 18, fontWeight: 'bold', color: '#334155' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  description: { fontSize: 14, color: '#64748b', marginBottom: 16 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  progressBarBackground: { flex: 1, height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
  actionRow: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 15 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 8 },
  videoButton: { backgroundColor: '#ef4444' },
  docsButton: { backgroundColor: '#3b82f6' },
  certButton: { backgroundColor: '#eab308' }, // Gold color for certificate
  actionText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});