import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function AddCourseScreen() {
  const router = useRouter();
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    if (!courseTitle) {
      Alert.alert("Required", "Please enter a Course Title to identify this content.");
      return;
    }

    if (!playlistUrl) {
      Alert.alert("Required", "Please enter a YouTube Playlist URL.");
      return;
    }

    setLoading(true);
    try {
      console.log("Sending request to /skills/import-secure...");
      
      const response = await api.post(
        `/skills/import-secure?title=${encodeURIComponent(courseTitle)}&category=${encodeURIComponent(category)}&playlistUrl=${encodeURIComponent(playlistUrl)}`
      );
      
      console.log("Import Success:", response.data);

      // ✅ AUTO-CLEAR FORM (Reset state for next entry)
      setCourseTitle('');
      setCategory('General'); // Reset to default or empty if you prefer
      setPlaylistUrl('');

      Alert.alert(
        "Import Successful", 
        "This course is now live in the Student Catalog.", 
        [
            { text: "Add Another", onPress: () => {} }, // Stay on screen
            { text: "Return to Dashboard", onPress: () => router.replace('/(tabs)/explore' as any) }
        ]
      );
      
    } catch (error: any) {
      console.error("Import Error:", error);
      const message = error.response?.data || "Could not connect to the server.";
      Alert.alert("Import Failed", typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Content</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="cloud-upload-outline" size={40} color="#10B981" />
          </View>
          <Text style={styles.pageDescription}>
            Import playlists to expand the course catalog for your students.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Course Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Full Stack Web Development"
              placeholderTextColor="#94A3B8"
              value={courseTitle}
              onChangeText={setCourseTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Engineering, Design, Business"
              placeholderTextColor="#94A3B8"
              value={category}
              onChangeText={setCategory}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>YouTube Playlist URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://youtube.com/playlist?list=..."
              placeholderTextColor="#94A3B8"
              value={playlistUrl}
              onChangeText={setPlaylistUrl}
            />
            <Text style={styles.helperText}>
              We will automatically fetch all video metadata.
            </Text>
          </View>

          <TouchableOpacity style={styles.importButton} onPress={handleImport} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Import to Catalog</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECFDF5', // Light Green background
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  pageDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#0F172A',
  },
  helperText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 6,
    marginLeft: 4,
  },
  importButton: {
    backgroundColor: '#10B981', // Outcomely Green
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});