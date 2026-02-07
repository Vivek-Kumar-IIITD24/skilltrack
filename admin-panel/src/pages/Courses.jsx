import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import './Courses.css';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import AddCourseModal from '../components/AddCourseModal'; // ✅ Import Modal

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // ✅ State for Modal

  // 1. Fetch Courses on Load
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/skills'); 
      setCourses(response.data);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 2. Handle Delete Logic
  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
        try {
            await api.delete(`/skills/${id}`);
            // If successful, remove from list immediately (optimistic update)
            setCourses(courses.filter(course => course.id !== id));
            alert("Course deleted successfully.");
        } catch (err) {
            console.error(err);
            // Handle the 409 Conflict (Students Enrolled) specifically
            if (err.response && err.response.status === 409) {
                alert("⚠️ Cannot delete: Students are currently enrolled in this course.");
            } else {
                alert("Delete failed. Check console for details.");
            }
        }
    }
  };

  return (
    <div className="courses-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Course Management</h1>
        
        {/* ✅ Button opens the Modal */}
        <button className="add-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Add New Course
        </button>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="course-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Course Name</th>
              <th>Category</th>
              <th>Level</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>Loading courses...</td></tr>
            ) : courses.map((course) => (
              <tr key={course.id}>
                <td>#{course.id}</td>
                <td style={{ fontWeight: '500' }}>{course.name}</td>
                <td>{course.category}</td>
                <td>
                  {/* Clean up level display */}
                  <span className={`badge badge-${course.level ? course.level.toLowerCase().replace(' ', '') : 'beginner'}`}>
                    {course.level}
                  </span>
                </td>
                <td>
                  <button className="action-btn"><Edit2 size={18} /></button>
                  <button className="action-btn" onClick={() => handleDelete(course.id)}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ RENDER MODAL */}
      <AddCourseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCourseAdded={fetchCourses} 
      />
    </div>
  );
};

export default Courses;