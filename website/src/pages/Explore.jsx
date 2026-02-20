import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import CourseCard from '../components/CourseCard';

const Explore = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/skills'); // Fetch ALL courses
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '0.5rem' }}>Explore Courses</h1>
          <p style={{ color: '#64748b' }}>Find your next skill to master.</p>
      </div>

      {/* Course Grid */}
      {loading ? (
        <p>Loading catalog...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;