import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, ImageBackground, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';

export default function CertificateScreen() {
  const { skillId } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificate();
  }, []);

  const fetchCertificate = async () => {
    try {
      const response = await api.get(`/user-skills/${skillId}/certificate`);
      setData(response.data);
    } catch (error) {
      console.error("Certificate error", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
        <Ionicons name="close-circle" size={40} color="#fff" />
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.border}>
          <Ionicons name="ribbon" size={60} color="#eab308" style={styles.icon} />
          <Text style={styles.header}>CERTIFICATE</Text>
          <Text style={styles.subHeader}>OF COMPLETION</Text>
          
          <Text style={styles.presentText}>This is to certify that</Text>
          <Text style={styles.name}>{data?.studentName || "Student"}</Text>
          
          <Text style={styles.presentText}>has successfully completed the course</Text>
          <Text style={styles.course}>{data?.skillName || "Course"}</Text>

          <View style={styles.footer}>
            <Text style={styles.date}>Date: {data?.completionDate}</Text>
            <Text style={styles.id}>ID: {data?.certificateId}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  card: { backgroundColor: '#fff', padding: 10, borderRadius: 20 },
  border: { 
    borderWidth: 4, 
    borderColor: '#2563eb', 
    borderStyle: 'dashed', 
    borderRadius: 15, 
    padding: 30, 
    alignItems: 'center' 
  },
  icon: { marginBottom: 20 },
  header: { fontSize: 24, fontWeight: '900', color: '#1e293b', letterSpacing: 2 },
  subHeader: { fontSize: 16, color: '#64748b', marginBottom: 30, letterSpacing: 1 },
  presentText: { fontSize: 14, color: '#94a3b8', marginBottom: 10 },
  name: { fontSize: 28, fontWeight: 'bold', color: '#2563eb', marginBottom: 20, textAlign: 'center' },
  course: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 40, textAlign: 'center' },
  footer: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 20 },
  date: { fontSize: 12, color: '#64748b' },
  id: { fontSize: 12, color: '#64748b' },
});