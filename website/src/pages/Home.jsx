import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import CourseCard from '../components/CourseCard';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Real Data
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/skills');
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Section Header */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '0.5rem' }}>Explore Courses</h2>
        <p style={{ color: '#64748b' }}>Discover new skills and advance your career.</p>
      </div>

      {/* Grid Layout */}
      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading courses...</p>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '2rem' 
        }}>
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;