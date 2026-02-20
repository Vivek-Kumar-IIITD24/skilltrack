import React from 'react';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom'; // ✅ Import Link for navigation

const CourseCard = ({ course }) => {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      padding: '1.5rem',
      transition: 'transform 0.2s, box-shadow 0.2s',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
    }}
    >
      {/* Icon & Category */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '10px' }}>
          <BookOpen size={24} color="#3b82f6" />
        </div>
        <span style={{ 
          fontSize: '0.75rem', 
          fontWeight: '600', 
          color: '#64748b', 
          background: '#f1f5f9', 
          padding: '4px 8px', 
          borderRadius: '4px',
          textTransform: 'uppercase'
        }}>
          {course.level}
        </span>
      </div>

      {/* Title & Description */}
      <div>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.1rem' }}>
          {course.name}
        </h3>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>
          {course.category} • {course.description ? course.description.substring(0, 60) + "..." : "Master this skill now."}
        </p>
      </div>

      {/* Footer / Button */}
      <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
        {/* ✅ WRAPPED IN LINK: Takes user to /course/{id} */}
        <Link to={`/course/${course.id}`} style={{ textDecoration: 'none' }}>
          <button style={{
            width: '100%',
            background: '#3b82f6', /* Mobile App Blue */
            color: 'white',
            border: 'none',
            padding: '10px',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px'
          }}>
            Enroll Now
          </button>
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;