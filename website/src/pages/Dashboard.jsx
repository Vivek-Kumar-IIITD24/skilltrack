import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, PlayCircle, Search, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const userName = localStorage.getItem('studentName') || 'Student';

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user-skills'); 
      setMyCourses(response.data || []); 
    } catch (error) {
      console.error("Error loading enrollments:", error);
      setMyCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const handleDropCourse = async (skillId, courseName) => {
    if (window.confirm(`Are you sure you want to drop "${courseName}"? All progress will be lost.`)) {
      try {
        await api.delete(`/user-skills/${skillId}`); 
        // Ideally should check backend endpoint for enrollments deletion. 
        // Based on analysis, let's assume standard REST: DELETE /user-skills/{id}
        
        // Refresh list
        fetchMyCourses();
      } catch (error) {
        alert("Failed to drop course. It might already be removed.");
      }
    }
  };


  // Handle case where user has NO courses yet
  const renderEmptyState = () => (
    <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
       <BookOpen size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
       <h3 style={{ fontSize: '1.5rem', color: '#0f172a', margin: '0 0 10px 0' }}>No courses yet</h3>
       <p style={{ color: '#64748b', marginBottom: '2rem' }}>You haven't enrolled in any courses. Start learning today!</p>
       
       {/* ✅ FIXED BUTTON: Navigates to Explore Page */}
       <button 
         onClick={() => navigate('/explore')}
         style={{ 
            background: '#10b981', color: 'white', border: 'none', padding: '12px 24px', 
            borderRadius: '50px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '8px'
         }}
       >
         <Search size={18} /> Browse Course Catalog
       </button>
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      
      {/* Dashboard Header */}
      <div style={{ marginBottom: '3rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#0f172a', marginBottom: '0.5rem' }}>
          Welcome back, <span style={{ color: '#10b981' }}>{userName !== 'undefined' ? userName : 'Student'}</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
          You have {myCourses.length} active course{myCourses.length !== 1 ? 's' : ''}.
        </p>
      </div>

      {/* My Courses Grid */}
      <div>
        <h2 style={{ color: '#334155', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BookOpen size={24} color="#10b981" /> My Enrolled Courses
        </h2>

        {loading ? (
          <p>Loading your progress...</p>
        ) : myCourses.length === 0 ? (
          renderEmptyState()
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {myCourses.map(item => {
              // ✅ Handle Data Structure from /user-skills ({ skill: {...}, progress: 0 })
              // OR from /student/enrollments ({ id, name, ... })
              const course = item.skill || item;
              const progress = item.progress || 0;

              return (
              <div key={course.id} style={{ 
                background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', 
                overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' 
              }}>
                
                {/* Card Body */}
                <div style={{ padding: '1.5rem', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                     <span style={{ background: '#ecfdf5', color: '#065f46', fontSize: '0.75rem', fontWeight: '700', padding: '4px 8px', borderRadius: '4px' }}>
                       {course.level || 'COURSE'}
                     </span>
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#0f172a' }}>{course.name}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    {course.description ? course.description.substring(0, 60) + "..." : "Continue your learning journey."}
                  </p>
                </div>

                {/* Progress Bar */}
                <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px' }}>
                     <span>Progress</span>
                     <span style={{ color: '#10b981', fontWeight: 'bold' }}>{Math.round(progress)}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem' }}>
                     <div style={{ width: `${progress}%`, height: '100%', background: '#10b981', borderRadius: '10px' }}></div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to={`/course/${course.id}`} style={{ 
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      padding: '10px', background: '#0f172a', color: 'white', 
                      border: 'none', borderRadius: '8px', cursor: 'pointer', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem'
                    }}>
                      <PlayCircle size={16} /> Continue
                    </Link>
                    
                    <button 
                      onClick={() => handleDropCourse(course.id, course.name)}
                      style={{
                        padding: '10px', background: '#fff', border: '1px solid #ef4444', 
                        borderRadius: '8px', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center'
                      }}
                      title="Drop Course"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;