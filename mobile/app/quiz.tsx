import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function QuizScreen() {
  const { lessonId, lessonTitle } = useLocalSearchParams();
  const router = useRouter();

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, []);

  // ✅ Auto-save progress
  useEffect(() => {
    if (isQuizComplete) {
      const percentage = (score / questions.length) * 100;
      if (percentage >= 80) {
        verifyLesson();
      }
    }
  }, [isQuizComplete]);

  const verifyLesson = async () => {
    try {
      console.log("🏆 Quiz Passed! Marking verified in database...");
      await api.post(`/progress/${lessonId}/complete`);
    } catch (error) {
      console.error("Failed to verify lesson:", error);
    }
  };

  const fetchQuiz = async () => {
      try {
          setLoading(true);
          console.log(`>>> 🚀 [MOBILE] Requesting Quiz for Lesson ${lessonId}...`);
        
          const response = await api.get(`/quiz/${lessonId}`);
          
          // 🛡️ DATA NORMALIZATION: Fixes "undefined" issue
          const normalizedQuestions = response.data.map((q: any) => ({
             id: q.id,
             question: q.question,
             // Check all possible casing (A vs optionA vs optiona)
             optionA: q.optionA || q.optiona || q.A || "Option A",
             optionB: q.optionB || q.optionb || q.B || "Option B",
             optionC: q.optionC || q.optionc || q.C || "Option C",
             optionD: q.optionD || q.optiond || q.D || "Option D",
             correctAnswer: q.correctAnswer || q.correct_answer || q.answer || "A" 
          }));

          // 📝 LOGGING
          console.log("\n===========================================");
          console.log("       📱 MOBILE RECEIVED QUESTIONS       ");
          console.log("===========================================");
        
          if (normalizedQuestions.length > 0) {
              normalizedQuestions.forEach((q: any, index: number) => {
                  console.log(`\n❓ Q${index + 1}: ${q.question}`);
                  console.log(`   🅰️  ${q.optionA}`);
                  console.log(`   🅱️  ${q.optionB}`);
                  console.log(`   ✅ Answer: ${q.correctAnswer}`);
             });
          } else {
              console.log(">>> ⚠️ Received Empty Quiz List");
          }
          console.log("\n===========================================\n");
        
          setQuestions(normalizedQuestions);
      } catch (error) {
          console.error(">>> ❌ [MOBILE] Error fetching quiz:", error);
          Alert.alert("Error", "Failed to load quiz");
      } finally {
          setLoading(false);
      }
  };

  const handleAnswer = (option: string) => {
    setSelectedOption(option);
    const currentQ = questions[currentQIndex];
    const isCorrect = option === currentQ.correctAnswer;
    
    if (isCorrect) setScore(prev => prev + 1);

    setTimeout(() => {
      if (currentQIndex < questions.length - 1) {
        setCurrentQIndex(currentQIndex + 1);
        setSelectedOption(null);
      } else {
        finishQuiz();
      }
    }, 1000);
  };

  const finishQuiz = () => {
    setIsQuizComplete(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Generating Quiz...</Text>
      </View>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No questions available.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{marginTop: 20}}>
            <Text style={{color: '#10B981', fontWeight: 'bold'}}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isQuizComplete) {
    const percentage = (score / questions.length) * 100;
    const passed = percentage >= 80;

    return (
      <View style={styles.resultContainer}>
        <Ionicons 
          name={passed ? "trophy" : "alert-circle"} 
          size={80} 
          color={passed ? "#FBBF24" : "#EF4444"} 
        />
        <Text style={styles.resultTitle}>{passed ? "Quiz Passed!" : "Try Again"}</Text>
        <Text style={styles.resultScore}>You scored {Math.round(percentage)}%</Text>
        <Text style={styles.resultSub}>
          {passed ? "Lesson Verified!" : "You need 80% to verify this lesson."}
        </Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: passed ? '#10B981' : '#334155' }]}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>{passed ? "Continue" : "Retake Quiz"}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQ = questions[currentQIndex];

  return (
    <ScrollView contentContainerStyle={styles.quizContainer}>
      <View style={styles.header}>
        <Text style={styles.lessonTitle}>Topic: {lessonTitle}</Text>
        <Text style={styles.counter}>Q {currentQIndex + 1} / {questions.length}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.questionText}>{currentQ?.question || "Loading..."}</Text>
      </View>

      {['A', 'B', 'C', 'D'].map((opt) => {
        // Maps 'A' to 'optionA' key dynamically
        const optionKey = `option${opt}`; 
        const isSelected = selectedOption === opt;
        const isCorrect = opt === currentQ?.correctAnswer;
        
        let btnStyle = styles.optionButton;
        if (isSelected) {
            btnStyle = isCorrect ? styles.optionCorrect : styles.optionWrong;
        }

        return (
          <TouchableOpacity 
            key={opt} 
            style={btnStyle} 
            onPress={() => !selectedOption && handleAnswer(opt)}
            disabled={!!selectedOption}
          >
            <View style={styles.optionCircle}>
                <Text style={styles.optionLetter}>{opt}</Text>
            </View>
            <Text style={styles.optionText}>{currentQ ? currentQ[optionKey] : "..."}</Text>
            
            {isSelected && (
                <Ionicons 
                    name={isCorrect ? "checkmark-circle" : "close-circle"} 
                    size={24} 
                    color={isCorrect ? "#10B981" : "#EF4444"} 
                    style={{marginLeft: 'auto'}}
                />
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { marginTop: 16, color: '#64748B', fontSize: 16 },
  quizContainer: { flexGrow: 1, padding: 24, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' },
  lessonTitle: { fontSize: 12, fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase', flex: 1 },
  counter: { fontSize: 14, fontWeight: 'bold', color: '#0F172A', backgroundColor: '#E2E8F0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  card: { backgroundColor: '#fff', padding: 24, borderRadius: 16, marginBottom: 24, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05 },
  questionText: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', lineHeight: 28 },
  optionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  optionCorrect: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#10B981' },
  optionWrong: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#EF4444' },
  optionCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  optionLetter: { fontSize: 14, fontWeight: 'bold', color: '#64748B' },
  optionText: { fontSize: 16, color: '#334155', flex: 1 },
  resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: '#fff' },
  resultTitle: { fontSize: 28, fontWeight: 'bold', color: '#0F172A', marginTop: 16 },
  resultScore: { fontSize: 20, color: '#64748B', marginTop: 8 },
  resultSub: { fontSize: 14, color: '#94A3B8', marginTop: 8, textAlign: 'center', marginBottom: 32 },
  button: { paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});