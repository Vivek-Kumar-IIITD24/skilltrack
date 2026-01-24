import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, AppState } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';

export default function LessonScreen() {
  const { videoUrl, title, skillId } = useLocalSearchParams();
  const router = useRouter();
  const playerRef = useRef<YoutubeIframeRef>(null);

  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Helper to extract YouTube ID
  const getYoutubeId = (url: string | string[]) => {
    const urlString = Array.isArray(url) ? url[0] : url;
    if (!urlString) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = urlString.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeId(videoUrl);

  // 1. THE HEARTBEAT: Check progress every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (playing && playerRef.current) {
        const elapsed_sec = await playerRef.current.getCurrentTime();
        const total_sec = await playerRef.current.getDuration();

        setDuration(total_sec);
        setCurrentTime(elapsed_sec);

        // Calculate Percentage (0 to 100)
        const percent = total_sec > 0 ? Math.round((elapsed_sec / total_sec) * 100) : 0;

        // Auto-Save to Backend (Only if changed significantly to save battery/data)
        if (percent > 0 && percent % 5 === 0) { 
           saveProgressSilent(percent);
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [playing]);

  // 2. Silent Save (Doesn't show alerts, just saves in background)
  const saveProgressSilent = async (percent: number) => {
    try {
      // Cap at 100%
      const finalPercent = percent > 95 ? 100 : percent; 
      
      console.log(`Auto-saving progress: ${finalPercent}%`);
      
      await api.put('/user-skills/update', { 
        skillId: Number(skillId), 
        progress: finalPercent 
      });
    } catch (error) {
      console.log("Auto-save failed (internet issue?)");
    }
  };

  // 3. Manual Completion (The Button)
  const handleFinish = async () => {
    await saveProgressSilent(100);
    Alert.alert("🎉 Completed!", "Course marked as 100% finished.");
    router.back();
  };

  const onStateChange = useCallback((state: string) => {
    if (state === 'playing') setPlaying(true);
    if (state === 'paused') {
      setPlaying(false);
      // Save immediately when paused
      playerRef.current?.getCurrentTime().then(time => {
        const percent = duration > 0 ? Math.round((time / duration) * 100) : 0;
        saveProgressSilent(percent);
      });
    }
    if (state === 'ended') {
      setPlaying(false);
      saveProgressSilent(100);
      Alert.alert("Class Finished!", "Great job! You reached 100%.");
    }
  }, [duration]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-down" size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Now Playing</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.videoTitle}>{title || "Course Video"}</Text>
        
        {videoId ? (
          <View style={styles.playerContainer}>
            <YoutubePlayer
              ref={playerRef}
              height={220}
              play={playing}
              videoId={videoId}
              onChangeState={onStateChange}
            />
          </View>
        ) : <Text style={styles.errorText}>Invalid Video Link</Text>}

        {/* Live Progress Bar */}
        <View style={styles.progressSection}>
           <Text style={styles.progressLabel}>
              Live Progress: {Math.round((currentTime / (duration || 1)) * 100)}%
           </Text>
           <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${(currentTime / (duration || 1)) * 100}%` }]} />
           </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Smart Tracking Active</Text>
          <Text style={styles.infoText}>
            • Your progress is saved automatically as you watch.{'\n'}
            • Pause or exit anytime; we'll remember your spot.{'\n'}
            • Reach 100% to unlock your certificate.
          </Text>
          
          <TouchableOpacity style={styles.completeButton} onPress={handleFinish}>
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.completeText}>Mark as 100% Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20, flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  content: { flex: 1, paddingTop: 20 },
  videoTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 20, paddingHorizontal: 20 },
  playerContainer: { width: '100%', backgroundColor: '#000', marginBottom: 20 },
  errorText: { color: '#ef4444', textAlign: 'center' },
  
  progressSection: { paddingHorizontal: 20, marginBottom: 20 },
  progressLabel: { color: '#2563eb', fontWeight: 'bold', marginBottom: 5 },
  progressBarBg: { height: 6, backgroundColor: '#334155', borderRadius: 3 },
  progressBarFill: { height: '100%', backgroundColor: '#2563eb', borderRadius: 3 },

  infoSection: { padding: 20, backgroundColor: '#1e293b', margin: 20, borderRadius: 12 },
  infoTitle: { color: '#94a3b8', fontSize: 14, marginBottom: 8, fontWeight: 'bold' },
  infoText: { color: '#e2e8f0', lineHeight: 24, marginBottom: 20 },
  completeButton: { backgroundColor: '#16a34a', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, borderRadius: 12, gap: 10 },
  completeText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});