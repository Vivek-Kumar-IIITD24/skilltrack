import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Dimensions, TextInput, FlatList, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router'; 
import YoutubePlayer, { YoutubeIframeRef } from "react-native-youtube-iframe";
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as SecureStore from 'expo-secure-store';

// ✅ FIXED IMPORT: Use 'legacy' to keep using downloadAsync and cacheDirectory
import * as FileSystem from 'expo-file-system/legacy'; 
import * as Sharing from 'expo-sharing'; 
import api from '../services/api';

const { width } = Dimensions.get('window');

export default function LessonScreen() {
  const { skillId, title } = useLocalSearchParams();
  const router = useRouter();
  const playerRef = useRef<YoutubeIframeRef>(null);
  
  const [lessons, setLessons] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]); 
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  
  const [userId, setUserId] = useState<string | null>(null);
  const [initialStartTime, setInitialStartTime] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<'playlist' | 'notes' | 'quiz' | 'certificate'>('playlist');
  const [newNote, setNewNote] = useState('');
  
  const [courseProgress, setCourseProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);

  const [watchTime, setWatchTime] = useState(0); 
  const [totalDuration, setTotalDuration] = useState(1); 

  // --- USER ISOLATION LOGIC ---
  useFocusEffect(
    useCallback(() => {
      const checkUser = async () => {
        const storedId = await SecureStore.getItemAsync('userId');
        if (storedId && storedId !== userId) {
            console.log(`>>> 👤 USER CHANGED from ${userId} to ${storedId}. Resetting.`);
            setUserId(storedId); 
        }
      };
      checkUser();
    }, [userId])
  );

  useEffect(() => {
    if (userId) { 
        console.log(`>>> 🔄 REFRESHING for User: ${userId} | Skill: ${skillId}`);
        setLessons([]);
        setLoading(true);
        setPlaying(false);
        setInitialStartTime(null); 
        setWatchTime(0);
        fetchSkillDetails();
        fetchCourseProgress(); 
    }
  }, [skillId, userId]); 

  const fetchCourseProgress = async () => {
      try {
          const res = await api.get(`/progress/course/${skillId}`);
          console.log(">>> 📊 Overall Course Progress:", res.data + "%");
          setCourseProgress(res.data || 0);
      } catch (e) {}
  };

  useEffect(() => {
    if (currentLesson) {
        fetchNotes(currentLesson.id);
    }
  }, [currentLesson]);

  // --- SYNC & TIMER LOGIC ---
  const saveProgress = async (lessonId: number) => {
    if(playerRef.current) {
        try {
            const currentTime = await playerRef.current.getCurrentTime();
            if(currentTime > 0) {
                const position = Math.floor(currentTime);
                console.log(`>>> ☁️ Syncing: Pos ${position}s (+10s effort)`);
                await api.post(`/progress/${lessonId}?position=${position}&amount=10`);
            }
        } catch (error) {}
    }
  };

  // Mark Complete when video ends
  const handleVideoComplete = async () => {
      if(!currentLesson) return;
      try {
          console.log(">>> ✅ Video Finished! Updating Course Progress...");
          const res = await api.post(`/progress/${currentLesson.id}/complete/${skillId}`);
          setCourseProgress(res.data); 
      } catch(e) { console.log("Error marking complete"); }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (playing) {
      interval = setInterval(() => {
        setWatchTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [playing]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (playing && currentLesson) {
      interval = setInterval(() => {
        saveProgress(currentLesson.id);
      }, 10000); 
    }
    return () => clearInterval(interval);
  }, [playing, currentLesson]);

  const fetchSkillDetails = async () => {
    try {
      const response = await api.get(`/skills/${skillId}`);
      const currentSkill = response.data;
      
      if (currentSkill && currentSkill.lessons && currentSkill.lessons.length > 0) {
        const sortedLessons = currentSkill.lessons.sort((a: any, b: any) => a.lessonOrder - b.lessonOrder);
        setLessons(sortedLessons);
        loadLesson(sortedLessons[0]);
      } else {
          Alert.alert("Empty Course", "This course has no videos yet.");
          setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const loadLesson = async (lesson: any) => {
    console.log(`>>> 🎬 LOADING LESSON: ${lesson.title}`);
    setPlaying(false);
    setInitialStartTime(null); 
    setWatchTime(0);
    
    setCurrentLesson(lesson);
    setTotalDuration(lesson.duration > 0 ? lesson.duration : 600);
    setLoading(true);

    try {
      const progressRes = await api.get(`/progress/${lesson.id}`);
      const savedTime = progressRes.data || 0;
      
      console.log(">>> 📥 Backend says start at:", savedTime);
      setWatchTime(savedTime); 

      setTimeout(() => {
          setInitialStartTime(savedTime); 
          setLoading(false);
      }, 100); 
      
    } catch (e) {
      setWatchTime(0);
      setTimeout(() => {
          setInitialStartTime(0);
          setLoading(false);
      }, 100);
    }
  };

  const onStateChange = useCallback((state: string) => {
    if (state === "playing") {
      setPlaying(true);
    } else if (state === "paused") {
      setPlaying(false);
      if(currentLesson) saveProgress(currentLesson.id); 
    } else if (state === "ended") { 
      setPlaying(false);
      handleVideoComplete(); 
    }
  }, [currentLesson]);

  const onReady = useCallback(() => {
  }, []);

  // --- NOTES LOGIC ---
  const fetchNotes = async (lessonId: number) => {
      try {
          const response = await api.get(`/notes/${lessonId}`);
          setNotes(response.data);
      } catch (error) {}
  };

  const handleAddNote = async () => {
      if (!newNote.trim() || !currentLesson) return;
      let timestamp = 0;
      if (playerRef.current) {
          const t = await playerRef.current.getCurrentTime();
          timestamp = Math.floor(t);
      }
      try {
          const response = await api.post(`/notes/${currentLesson.id}?content=${encodeURIComponent(newNote)}&timestamp=${timestamp}`);
          setNotes([...notes, response.data]);
          setNewNote('');
          Alert.alert("Note Saved", `Saved at ${formatTime(timestamp)}`);
      } catch (error) { Alert.alert("Error", "Could not save note."); }
  };

  const handleFileUpload = async () => {
    if (!currentLesson) return;
    try {
        const result = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
        if (result.canceled) return;
        const asset = result.assets[0];
        const formData = new FormData();
        formData.append('file', { uri: asset.uri, name: asset.name, type: asset.mimeType || 'application/octet-stream' } as any);
        setLoading(true);
        const response = await api.post(`/notes/${currentLesson.id}/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setNotes([...notes, response.data]);
        Alert.alert("Success", "Note uploaded successfully!");
    } catch (error) { Alert.alert("Error", "Failed to upload note."); } finally { setLoading(false); }
  };

  // ✅ CERTIFICATE DOWNLOAD LOGIC (Updated to work with new FileSystem)
  const handleDownloadCertificate = async () => {
      setDownloading(true);
      try {
          const token = await SecureStore.getItemAsync('token');
          
          // 1. Determine the best directory
          // Using legacy import guarantees this exists
          let dir = FileSystem.cacheDirectory;
          
          if (!dir) {
              console.log("⚠️ Cache directory is null, trying Document directory...");
              dir = FileSystem.documentDirectory;
          }

          // ⚠️ Absolute Fallback for Android (Expo Go)
          if (!dir && Platform.OS === 'android') {
             dir = "file:///data/user/0/host.exp.exponent/cache/";
          }

          if (!dir) {
            throw new Error("Could not determine a writable storage path.");
          }

          // 2. Define file path
          const cleanTitle = title?.toString().replace(/\s/g, '_').replace(/[^a-zA-Z0-9_]/g, '') || 'Course';
          const fileUri = `${dir}Certificate_${cleanTitle}.pdf`;

          console.log(">>> 📂 Saving to:", fileUri); 

          // 3. Download from Backend
          const downloadRes = await FileSystem.downloadAsync(
              `${api.defaults.baseURL}/certificate/download/${skillId}`,
              fileUri,
              {
                  headers: { Authorization: `Bearer ${token}` }
              }
          );

          if (downloadRes.status === 200) {
              // 4. Share/Open PDF
              if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(downloadRes.uri, {
                      mimeType: 'application/pdf',
                      dialogTitle: 'Download Certificate',
                      UTI: 'com.adobe.pdf' 
                  });
              } else {
                  Alert.alert("Saved", "Certificate saved to Cache!");
              }
          } else {
              Alert.alert("Locked", "Complete 100% of the course to unlock this certificate.");
          }
      } catch (error: any) {
          console.error("Download Error:", error);
          Alert.alert("Download Error", error.message || "Could not save file.");
      } finally {
          setDownloading(false);
      }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const lessonProgress = Math.min((watchTime / totalDuration) * 100, 100);

  return (
    <View style={styles.container}>
      <View style={styles.videoWrapper}>
        <View style={styles.videoContainer}>
          {currentLesson && initialStartTime !== null && userId ? (
            <YoutubePlayer
              key={`${userId}-${currentLesson.id}-${initialStartTime}`} 
              ref={playerRef}
              height={220}
              width={width}
              play={playing}
              videoId={currentLesson.videoId}
              onChangeState={onStateChange}
              onReady={onReady}
              initialPlayerParams={{ 
                  modestbranding: true, 
                  rel: false,
                  start: initialStartTime, 
                  preventFullScreen: false
              }}
            />
          ) : (
            <View style={styles.videoPlaceholder}>
               {loading ? <ActivityIndicator size="large" color="#10B981" /> : <Text style={{color:'white'}}>Loading Video...</Text>}
            </View>
          )}
        </View>
        <View style={styles.progressContainer}>
           <View style={[styles.progressBar, { width: `${lessonProgress}%` }]} />
        </View>
      </View>

      <View style={styles.header}>
          <Text style={styles.courseTitle}>{title}</Text>
          <Text style={styles.lessonTitle}>{currentLesson ? currentLesson.title : 'Loading...'}</Text>
          <View style={styles.metaRow}>
             <Ionicons name="time-outline" size={14} color="#64748B" />
             <Text style={styles.metaText}>
               {formatTime(watchTime)} / {formatTime(totalDuration)}
             </Text>
             <View style={styles.badge}>
                <Text style={styles.badgeText}>
                   {lessonProgress.toFixed(0)}% VIDEO
                </Text>
             </View>
          </View>
      </View>

      <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tab, activeTab === 'playlist' && styles.activeTab]} onPress={() => setActiveTab('playlist')}>
              <Text style={[styles.tabText, activeTab === 'playlist' && styles.activeTabText]}>Playlist</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'notes' && styles.activeTab]} onPress={() => setActiveTab('notes')}>
              <Text style={[styles.tabText, activeTab === 'notes' && styles.activeTabText]}>Notes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'quiz' && styles.activeTab]} onPress={() => setActiveTab('quiz')}>
              <Text style={[styles.tabText, activeTab === 'quiz' && styles.activeTabText]}>Quiz</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'certificate' && styles.activeTab]} onPress={() => setActiveTab('certificate')}>
              <Text style={[styles.tabText, activeTab === 'certificate' && styles.activeTabText]}>Certificate</Text>
          </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'playlist' && (
            <ScrollView style={{ paddingTop: 16 }}>
                <View style={{paddingHorizontal: 20, marginBottom: 10}}>
                    <Text style={{fontSize: 12, color: '#64748B', fontWeight: 'bold', marginBottom: 4}}>TOTAL COURSE PROGRESS</Text>
                    <View style={{height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden'}}>
                        <View style={{width: `${courseProgress}%`, height: '100%', backgroundColor: '#10B981'}} />
                    </View>
                    <Text style={{textAlign: 'right', fontSize: 12, color: '#10B981', marginTop: 2}}>{courseProgress}% Completed</Text>
                </View>

                <Text style={styles.sectionHeader}>Course Content</Text>
                {lessons.map((lesson, index) => (
                    <TouchableOpacity 
                    key={lesson.id} 
                    style={[styles.lessonItem, currentLesson?.id === lesson.id && styles.activeLessonItem]}
                    onPress={() => loadLesson(lesson)}
                    >
                    <View style={[styles.lessonNumber, currentLesson?.id === lesson.id && styles.activeNumberBg]}>
                        <Text style={[styles.numberText, currentLesson?.id === lesson.id && styles.activeNumberText]}>{index + 1}</Text>
                    </View>
                    <View style={styles.lessonInfo}>
                        <Text numberOfLines={2} style={[styles.lessonListTitle, currentLesson?.id === lesson.id && styles.activeListTitle]}>{lesson.title}</Text>
                        <Text style={styles.lessonDuration}>{formatTime(lesson.duration || 0)}</Text>
                    </View>
                    {currentLesson?.id === lesson.id ? (
                        <Ionicons name="stats-chart" size={20} color="#10B981" />
                    ) : (
                        <Ionicons name="play-circle-outline" size={24} color="#CBD5E1" />
                    )}
                    </TouchableOpacity>
                ))}
                <View style={{height: 50}}/>
            </ScrollView>
        )}

        {activeTab === 'notes' && (
            <View style={styles.notesContainer}>
                <View style={styles.addNoteBox}>
                    <TouchableOpacity style={styles.attachBtn} onPress={handleFileUpload}>
                        <Ionicons name="attach" size={24} color="#64748B" />
                    </TouchableOpacity>

                    <TextInput 
                        style={styles.noteInput} 
                        placeholder="Type a note..." 
                        placeholderTextColor="#94A3B8"
                        value={newNote}
                        onChangeText={setNewNote}
                    />
                    <TouchableOpacity style={styles.saveNoteBtn} onPress={handleAddNote}>
                        <Ionicons name="send" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={notes}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.noteItem}
                            onPress={() => {
                                if (item.fileUrl) {
                                    Alert.alert("Attachment", `This is an uploaded file: ${item.content}\n\n(PDF Viewing coming in next update!)`);
                                } else if (playerRef.current) {
                                    playerRef.current.seekTo(item.timestampSeconds, true);
                                    setPlaying(true);
                                }
                            }}
                        >
                            <View style={styles.noteHeader}>
                                {item.fileUrl ? (
                                    <View style={styles.fileBadge}>
                                        <Ionicons name="document-text" size={12} color="#fff" />
                                        <Text style={styles.fileBadgeText}>FILE</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.noteTime}>{formatTime(item.timestampSeconds)}</Text>
                                )}
                            </View>
                            <Text style={styles.noteContent}>{item.content}</Text>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text style={styles.emptyNotes}>No notes yet. Tap the paperclip to upload!</Text>}
                />
            </View>
        )}

        {activeTab === 'quiz' && (
            <View style={styles.quizTabContainer}>
                <Ionicons name="school-outline" size={64} color={lessonProgress >= 90 ? "#10B981" : "#94A3B8"} />
                <Text style={styles.quizTitle}>
                    {lessonProgress >= 90 ? "Ready to verify your knowledge?" : "Finish the video first!"}
                </Text>
                <Text style={styles.quizSub}>
                    {lessonProgress >= 90 
                        ? "Take a quick AI-generated quiz to prove you watched this lesson." 
                        : `You have watched ${lessonProgress.toFixed(0)}% of this video. You need 90% to unlock the quiz.`}
                </Text>
                
                <TouchableOpacity 
                    style={[
                        styles.startQuizBtn, 
                        { backgroundColor: lessonProgress >= 90 ? '#10B981' : '#CBD5E1' } 
                    ]}
                    disabled={lessonProgress < 90} 
                    onPress={() => {
                        if (currentLesson) {
                            router.push({ 
                                pathname: '/quiz', 
                                params: { lessonId: currentLesson.id, lessonTitle: currentLesson.title } 
                            });
                        }
                    }}
                >
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        {lessonProgress < 90 && <Ionicons name="lock-closed" size={16} color="#64748B" style={{marginRight: 8}} />}
                        <Text style={[styles.startQuizText, { color: lessonProgress >= 90 ? '#fff' : '#64748B' }]}>
                            {lessonProgress >= 90 ? "Start AI Quiz" : "Locked"}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        )}

        {/* ✅ CERTIFICATE TAB */}
        {activeTab === 'certificate' && (
            <View style={styles.quizTabContainer}>
                <Ionicons name="trophy-outline" size={80} color={courseProgress >= 99 ? "#F59E0B" : "#CBD5E1"} />
                
                <Text style={styles.quizTitle}>
                    {courseProgress >= 99 ? "Course Completed!" : "Keep Going!"}
                </Text>
                
                <Text style={styles.quizSub}>
                    {courseProgress >= 99 
                        ? "You have mastered this skill. Claim your official certificate now." 
                        : `You have completed ${courseProgress}% of the entire course. Finish all videos to unlock your certificate.`}
                </Text>
                
                <TouchableOpacity 
                    style={[styles.startQuizBtn, { backgroundColor: courseProgress >= 99 ? '#10B981' : '#E2E8F0' }]}
                    disabled={courseProgress < 99 || downloading} 
                    onPress={handleDownloadCertificate}
                >
                    {downloading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            {courseProgress < 99 && <Ionicons name="lock-closed" size={16} color="#94A3B8" style={{marginRight: 8}} />}
                            <Text style={[styles.startQuizText, { color: courseProgress >= 99 ? '#fff' : '#94A3B8' }]}>
                                {courseProgress >= 99 ? "Download Certificate" : "Locked"}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        )}
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  videoWrapper: { backgroundColor: '#000', paddingTop: 40 },
  videoContainer: { height: 220, justifyContent: 'center' },
  videoPlaceholder: { alignItems: 'center', height: 220, justifyContent: 'center' },
  progressContainer: { height: 4, backgroundColor: '#334155', width: '100%' },
  progressBar: { height: '100%', backgroundColor: '#10B981' },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  courseTitle: { fontSize: 12, color: '#10B981', fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  lessonTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', lineHeight: 24, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 14, color: '#64748B', marginLeft: 6, marginRight: 16 },
  badge: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 12, color: '#10B981', fontWeight: '600' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#10B981' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  activeTabText: { color: '#10B981' },
  content: { flex: 1 },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: '#334155', marginHorizontal: 20, marginBottom: 12 },
  lessonItem: { flexDirection: 'row', alignItems: 'center', padding: 16, marginHorizontal: 20, marginBottom: 12, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  activeLessonItem: { borderColor: '#10B981', backgroundColor: '#ECFDF5' },
  lessonNumber: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  activeNumberBg: { backgroundColor: '#10B981' },
  numberText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  activeNumberText: { color: '#fff' },
  lessonInfo: { flex: 1, marginRight: 10 },
  lessonListTitle: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 4 },
  activeListTitle: { color: '#10B981', fontWeight: 'bold' },
  lessonDuration: { fontSize: 12, color: '#94A3B8' },
  notesContainer: { flex: 1, padding: 16 },
  addNoteBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  attachBtn: { padding: 10, marginRight: 4 },
  noteInput: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, marginRight: 8, color: '#0F172A' },
  saveNoteBtn: { backgroundColor: '#10B981', padding: 12, borderRadius: 8 },
  noteItem: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  noteHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  fileBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3B82F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 4 },
  fileBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginLeft: 4 },
  noteTime: { fontSize: 12, color: '#10B981', fontWeight: 'bold', marginBottom: 4 },
  noteContent: { fontSize: 14, color: '#334155' },
  emptyNotes: { textAlign: 'center', color: '#94A3B8', marginTop: 20 },
  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 20 },
  quizTabContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  quizTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginTop: 16, textAlign: 'center' },
  quizSub: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 8, marginBottom: 32 },
  startQuizBtn: { backgroundColor: '#10B981', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, width: '100%', alignItems: 'center' },
  startQuizText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});