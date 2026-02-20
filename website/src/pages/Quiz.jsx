import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { CheckCircle, XCircle, Trophy, AlertCircle, Loader2 } from 'lucide-react';

const Quiz = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const lessonTitle = location.state?.lessonTitle || "Lesson Quiz";

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  // 1. Fetch & Normalize Data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/quiz/${lessonId}`);

        // 🛡️ Data Normalization (Matches Mobile Logic)
        const normalizedQuestions = response.data.map((q) => ({
             id: q.id,
             question: q.question,
             // Handle different casing/naming from backend AI generation
             optionA: q.optionA || q.optiona || q.A || "Option A",
             optionB: q.optionB || q.optionb || q.B || "Option B",
             optionC: q.optionC || q.optionc || q.C || "Option C",
             optionD: q.optionD || q.optiond || q.D || "Option D",
             correctAnswer: q.correctAnswer || q.correct_answer || q.answer || "A" 
        }));

        setQuestions(normalizedQuestions);
      } catch (error) {
        console.error("Failed to load quiz", error);
        alert("Failed to load quiz. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [lessonId]);

  // 2. Auto-Verify on Complete
  useEffect(() => {
    if (isQuizComplete) {
      const percentage = (score / questions.length) * 100;
      if (percentage >= 80) {
        verifyLesson();
      }
    }
  }, [isQuizComplete, questions.length, score, verifyLesson]);

  const verifyLesson = React.useCallback(async () => {
    try {
      await api.post(`/progress/${lessonId}/complete`);
      console.log("Lesson verified!");
    } catch (error) {
      console.error("Verification failed", error);
    }
  }, [lessonId]);

  const handleAnswer = (option) => {
    setSelectedOption(option);
    const currentQ = questions[currentQIndex];
    const isCorrect = option === currentQ.correctAnswer;

    if (isCorrect) setScore((prev) => prev + 1);

    // Delay to show feedback before moving next
    setTimeout(() => {
      if (currentQIndex < questions.length - 1) {
        setCurrentQIndex((prev) => prev + 1);
        setSelectedOption(null);
      } else {
        setIsQuizComplete(true);
      }
    }, 1000);
  };

  // --- RENDERING HELPERS ---

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', color: '#64748b' }}>
        <Loader2 className="animate-spin" size={48} color="#10b981" />
        <p style={{ marginTop: '1rem', fontSize: '1.2rem' }}>Generating Quiz...</p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h3>No questions available.</h3>
        <button onClick={() => navigate(-1)} style={styles.secondaryButton}>Go Back</button>
      </div>
    );
  }

  // RESULT SCREEN
  if (isQuizComplete) {
    const percentage = (score / questions.length) * 100;
    const passed = percentage >= 80;

    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ marginBottom: '1.5rem', display: 'inline-block', padding: '20px', background: passed ? '#ecfdf5' : '#fef2f2', borderRadius: '50%' }}>
            {passed ? <Trophy size={64} color="#059669" /> : <AlertCircle size={64} color="#dc2626" />}
        </div>
        
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
            {passed ? "Quiz Passed!" : "Try Again"}
        </h1>
        
        <p style={{ fontSize: '1.5rem', color: '#64748b', marginBottom: '0.5rem' }}>
            You scored <span style={{ color: passed ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{Math.round(percentage)}%</span>
        </p>
        
        <p style={{ color: '#94a3b8', marginBottom: '3rem' }}>
            {passed ? "Lesson Verified! You can now move to the next lesson." : "You need 80% to verify this lesson."}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            {!passed && (
                <button 
                    onClick={() => window.location.reload()} 
                    style={styles.secondaryButton}
                >
                    Retake Quiz
                </button>
            )}
            <button 
                onClick={() => navigate(-1)} 
                style={{ ...styles.primaryButton, background: passed ? '#10b981' : '#0f172a' }}
            >
                {passed ? "Continue Learning" : "Back to Lesson"}
            </button>
        </div>
      </div>
    );
  }

  // QUIZ CARD
  const currentQ = questions[currentQIndex];

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                TOPIC: {lessonTitle}
            </span>
        </div>
        <div style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', color: '#0f172a', fontSize: '0.9rem' }}>
            Q {currentQIndex + 1} <span style={{ color: '#94a3b8' }}>/ {questions.length}</span>
        </div>
      </div>

      {/* Question Card */}
      <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', lineHeight: '1.4', color: '#1e293b', margin: 0 }}>
            {currentQ?.question}
        </h2>
      </div>

      {/* Options */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {['A', 'B', 'C', 'D'].map((opt) => {
           // Dynamic key access for optionA, optionB etc
           const optionKey = `option${opt}`; 
           const isSelected = selectedOption === opt;
           const isCorrect = opt === currentQ.correctAnswer;
           
           // Determine styles based on state
           let baseStyle = { ...styles.optionCard };
           if (isSelected) {
               if (isCorrect) {
                   baseStyle = { ...styles.optionCorrect };
               } else {
                   baseStyle = { ...styles.optionWrong };
               }
           }

           return (
             <div 
                key={opt} 
                onClick={() => !selectedOption && handleAnswer(opt)}
                style={baseStyle}
             >
                <div style={styles.optionLetter}>{opt}</div>
                <span style={{ flex: 1, fontWeight: '500' }}>{currentQ[optionKey]}</span>
                
                {isSelected && (
                    isCorrect 
                        ? <CheckCircle color="#10b981" size={24} /> 
                        : <XCircle color="#ef4444" size={24} />
                )}
             </div>
           );
        })}
      </div>
    </div>
  );
};

// --- STYLES ---
const styles = {
    primaryButton: {
        padding: '12px 32px', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', transition: 'transform 0.1s'
    },
    secondaryButton: {
        padding: '12px 32px', background: 'white', border: '2px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer'
    },
    optionCard: {
        background: 'white', padding: '1.25rem', borderRadius: '16px', border: '2px solid #f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.1rem', color: '#334155', transition: 'all 0.2s'
    },
    optionCorrect: {
        background: '#ecfdf5', padding: '1.25rem', borderRadius: '16px', border: '2px solid #10b981', cursor: 'default', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.1rem', color: '#064e3b'
    },
    optionWrong: {
        background: '#fef2f2', padding: '1.25rem', borderRadius: '16px', border: '2px solid #ef4444', cursor: 'default', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.1rem', color: '#7f1d1d'
    },
    optionLetter: {
        minWidth: '40px', height: '40px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748b'
    }
};

export default Quiz;