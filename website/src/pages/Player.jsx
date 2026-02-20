import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import YouTube from 'react-youtube';
import { ArrowLeft, PlayCircle, CheckCircle, Edit3, Award, HelpCircle } from 'lucide-react';

const Player = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Course State
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [activeTab, setActiveTab] = useState('playlist'); 
  
  // Video Tracking State
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchTime, setWatchTime] = useState(0); // Tracks ACTUAL effort (User Watch Time)
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0); // Tracks SEEK BAR position
  const [totalDuration, setTotalDuration] = useState(0); 
  const [savedProgressTime, setSavedProgressTime] = useState(0); // Store fetched progress to seek when player is ready

  // Notes State
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  // 1. Fetch Course Details
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`/skills/${id}`);
      
      // Sort lessons by lessonOrder
      const sortedLessons = (response.data.lessons || []).sort((a, b) => a.lessonOrder - b.lessonOrder);
      const sortedCourse = { ...response.data, lessons: sortedLessons };

      setCourse(sortedCourse);
      // Ensure ID is passed as number if needed, but safe comparison
      if (sortedLessons.length > 0) {
          // Force string comparison to avoid type issues (e.g. "1" vs 1)
          setActiveLessonId(String(sortedLessons[0].id));
      }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  // 2. Fetch Notes when tab changes
  useEffect(() => {
    if (activeTab === 'notes' && activeLessonId) {
        api.get(`/notes/${activeLessonId}`)
           .then(res => setNotes(res.data))
           .catch(err => console.log("Notes error", err));
    }
  }, [activeTab, activeLessonId]);

  // 3. Reset State on Lesson Change & Fetch Saved Progress
  useEffect(() => {
      if(activeLessonId) {
          setWatchTime(0);
          setCurrentPlaybackTime(0);
          setIsPlaying(false);
          setSavedProgressTime(0); // Reset saved time

          // Fetch existing progress from backend
          api.get(`/progress/${activeLessonId}`)
             .then(res => {
                const savedTime = res.data || 0;
                console.log(`>>> Backend says resume at: ${savedTime}s (This is also your initial effort)`);
                setSavedProgressTime(savedTime); // Store it for onReady
                setWatchTime(savedTime); // Initialize effort counter from saved progress
                
                // If the player is already active (switching lessons), seek immediately
                if(playerRef.current && typeof playerRef.current.seekTo === 'function') {
                    playerRef.current.seekTo(savedTime);
                }
             })
             .catch(() => {});
      }
  }, [activeLessonId]);

  // 4. Track EFFORT Interval (Every 1s) - ONLY increments, NEVER jumps
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setWatchTime((prev) => prev + 1); // 🟢 Anti-Cheat: Linear increment only!
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // 5. Track SEEK BAR for debugging/display only (Optional)
  useEffect(() => {
      let interval;
      if (isPlaying) {
        interval = setInterval(async () => {
             if(playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                 const t = await playerRef.current.getCurrentTime();
                 setCurrentPlaybackTime(t);
                 const d = await playerRef.current.getDuration();
                 if(d > 0) setTotalDuration(d);
             }
        }, 1000);
      }
      return () => clearInterval(interval);
  }, [isPlaying]);


  // 6. Sync & Save Progress (Every 10s)
  useEffect(() => {
    let interval;
    if (isPlaying && activeLessonId) {
      interval = setInterval(() => {
        saveProgress();
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeLessonId, saveProgress]);

  const saveProgress = React.useCallback(async () => {
      if(!playerRef.current || typeof playerRef.current.getCurrentTime !== 'function') return;
      
      const currentTime = await playerRef.current.getCurrentTime();
      if(currentTime > 0) {
          const position = Math.floor(currentTime); // Position is where you are in video (for resume)
          try {
             // Sync both position (for resume) and effort (amount=10 for anti-cheat backend logic if needed)
             await api.post(`/progress/${activeLessonId}?position=${position}&amount=10`);
             console.log(`Synced progress: ${position}s`);
          } catch(e) {
             console.error("Sync failed", e);
          }
      }
  }, [activeLessonId]);

  const handleVideoEnd = async () => {
      setIsPlaying(false);
      // setVideoProgress(100); <-- REMOVED: Don't force 100% just because played ended
      try {
          await api.post(`/progress/${activeLessonId}/complete/${id}`);
          alert("Lesson Completed! Progress Saved.");
      } catch(e) {}
  };


  const onPlayerReady = (event) => {
      playerRef.current = event.target;
      setTotalDuration(event.target.getDuration());
      
      // Resume playback if we have a saved time
      if (savedProgressTime > 0) {
          event.target.seekTo(savedProgressTime);
      }
  };

  const onPlayerStateChange = (event) => {
     // -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued).
     if(event.data === 1) setIsPlaying(true);
     if(event.data === 2) {
         setIsPlaying(false);
         saveProgress();
     }
     if(event.data === 0) handleVideoEnd();
  };

  const handleAddNote = async () => {
      if(!newNote.trim()) return;
      let timestamp = Math.floor(watchTime);
      try {
          const res = await api.post(`/notes/${activeLessonId}?content=${newNote}&timestamp=${timestamp}`);
          setNotes([...notes, res.data]);
          setNewNote('');
      } catch(e) { alert("Failed to save note"); }
  };

  // Helper to extract ID
  const getVideoId = (url) => {
    if (!url) return null;
    const cleanUrl = url.trim(); // Trim spaces

    // 1. If it acts like an ID (11 chars Alphanumeric)
    if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) return cleanUrl;

    // 2. Handle YouTube URLs
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = cleanUrl.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null; 
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Classroom...</div>;
  if (!course) return <div style={{ padding: '50px', textAlign: 'center' }}>Course not found.</div>;

  const activeLesson = course.lessons.find((l) => String(l.id) === String(activeLessonId)) || course.lessons[0] || {};
  const videoId = getVideoId(activeLesson.videoId || course.videoUrl);

  // Anti-Cheat: Calculated based on Accumulated Watch TIME, NOT seek position
  const videoProgress = totalDuration > 0 ? Math.min((watchTime / totalDuration) * 100, 100) : 0;
  const isQuizUnlocked = videoProgress >= 90;

  return (
    <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ padding: '1rem 2rem', borderBottom: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/" style={{ color: '#64748b' }}><ArrowLeft size={24} /></Link>
        <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>{course.name}</h2>
        <div style={{ marginLeft: 'auto', fontSize: '0.9rem', color: '#64748b' }}>
            {/* Show Current Position AND Effort Progress */}
            Position: <span style={{ fontWeight: 'bold'}}>{Math.floor(currentPlaybackTime/60)}:{('0' + Math.floor(currentPlaybackTime%60)).slice(-2)}</span> 
            <span style={{margin: '0 10px'}}>|</span>
            Effort: <span style={{ fontWeight: 'bold', color: isQuizUnlocked ? '#10b981' : '#f59e0b' }}>{Math.round(videoProgress)}%</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', background: '#f8fafc', overflow: 'hidden' }}>
        
        {/* LEFT: Video Player */}
        <div style={{ flex: 3, background: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
           {videoId ? (
               <div style={{ width: '100%', height: '100%' }}>
                  <YouTube 
                      videoId={videoId} 
                      className="youtube-player"
                      iframeClassName="youtube-iframe"
                      style={{ width: '100%', height: '100%' }}
                      opts={{
                          width: '100%',
                          height: '100%',
                          playerVars: { autoplay: 1 }
                      }}
                      onReady={onPlayerReady}
                      onStateChange={onPlayerStateChange}
                  />
                  <style>{`.youtube-iframe { width: 100%; height: 100%; border: none; }`}</style>
               </div>
           ) : (
                <div style={{color:'white', textAlign: 'center'}}>
                    <p>Video Unavailable</p>
                    <p style={{fontSize: '0.8rem', color: '#666'}}>
                        Debug: ID={activeLesson?.id}, 
                        VideoID={activeLesson?.videoId ? activeLesson.videoId : 'null'},
                        URL={activeLesson?.videoUrl ? activeLesson.videoUrl : 'null'}
                    </p>
                </div>
           )}
        </div>

        {/* RIGHT: Tabbed Sidebar */}
        <div style={{ flex: 1, background: 'white', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
          
          {/* TAB HEADERS */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
             {['playlist', 'notes', 'quiz', 'certificate'].map(tab => (
                 <div 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{ 
                        flex: 1, textAlign: 'center', padding: '15px 0', cursor: 'pointer', 
                        borderBottom: activeTab === tab ? '3px solid #10b981' : '3px solid transparent',
                        color: activeTab === tab ? '#10b981' : '#64748b', fontWeight: '600', textTransform: 'capitalize', fontSize: '0.9rem'
                    }}
                 >
                    {tab}
                 </div>
             ))}
          </div>

          {/* TAB CONTENT */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
            
            {/* 1. PLAYLIST TAB */}
            {activeTab === 'playlist' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {course.lessons.map((lesson, idx) => (
                        <div key={lesson.id} onClick={() => setActiveLessonId(lesson.id)} 
                             style={{ 
                                 padding: '12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                                 background: activeLessonId === lesson.id ? '#ecfdf5' : 'white', 
                                 border: activeLessonId === lesson.id ? '1px solid #10b981' : '1px solid #e2e8f0' 
                             }}>
                            <div style={{ width: '24px', height: '24px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>{idx+1}</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '500', flex: 1 }}>{lesson.title}</div>
                            {activeLessonId === lesson.id ? <PlayCircle size={16} color="#10b981"/> : <CheckCircle size={16} color="#cbd5e1"/>}
                        </div>
                    ))}
                </div>
            )}

            {/* 2. NOTES TAB */}
            {activeTab === 'notes' && (
                <div>
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '1rem' }}>
                        <input 
                            value={newNote} onChange={(e) => setNewNote(e.target.value)} 
                            placeholder="Type a note (timestamped automatically)..." 
                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        />
                        <button onClick={handleAddNote} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '0 15px' }}><Edit3 size={18}/></button>
                    </div>
                    {notes.map(note => (
                        <div key={note.id} style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', marginBottom: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                            <strong>{Math.floor(note.timestamp / 60)}:{('0' + Math.floor(note.timestamp % 60)).slice(-2)}</strong> - {note.content}
                        </div>
                    ))}
                    {notes.length === 0 && <p style={{textAlign:'center', color:'#94a3b8'}}>No notes yet.</p>}
                </div>
            )}

            {/* 3. QUIZ TAB - LOCKED LOGIC */}
            {activeTab === 'quiz' && (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <HelpCircle size={60} color={isQuizUnlocked ? "#10b981" : "#cbd5e1"} style={{ marginBottom: '1rem' }} />
                    <h3>{isQuizUnlocked ? "Ready to verify your knowledge?" : "Keep watching to unlock!"}</h3>
                    
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
                        {isQuizUnlocked 
                           ? "Take the AI-generated quiz to prove you watched this lesson." 
                           : `You must watch at least 90% of the video to unlock the quiz. Current Effort: ${Math.round(videoProgress)}%`
                        }
                    </p>

                    {isQuizUnlocked ? (
                        <button 
                            onClick={() => navigate(`/quiz/${activeLessonId}`, { state: { lessonTitle: activeLesson.title } })}
                            style={{ background: '#10b981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            Start AI Quiz
                        </button>
                    ) : (
                        <button disabled style={{ background: '#e2e8f0', color: '#94a3b8', border: 'none', padding: '12px 24px', borderRadius: '50px', fontWeight: 'bold', cursor: 'not-allowed' }}>
                            Locked 🔒
                        </button>
                    )}
                </div>
            )}

            {/* 4. CERTIFICATE TAB */}
            {activeTab === 'certificate' && (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <Award size={60} color="#F59E0B" style={{ marginBottom: '1rem' }} />
                    <h3>Course Certificate</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>Complete all lessons to unlock your certificate.</p>
                    <button 
                        onClick={() => navigate(`/certificate/${course.id}`)}
                        style={{ background: '#0f172a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        View Certificate
                    </button>
                </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;