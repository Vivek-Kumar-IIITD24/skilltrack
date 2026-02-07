import React, { useState } from 'react';
import api from '../api/axios';
import { X } from 'lucide-react';
import './AddCourseModal.css'; // We will create this next

const AddCourseModal = ({ isOpen, onClose, onCourseAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'General',
    level: 'Beginner',
    description: '',
    videoUrl: '', // Optional: For the main course intro
    docsUrl: ''   // Optional: For PDF resources
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ Call the Backend
      await api.post('/skills', formData);
      
      // ✅ Refresh the table
      onCourseAdded(); 
      onClose(); // Close modal
      setFormData({ name: '', category: 'General', level: 'Beginner', description: '', videoUrl: '', docsUrl: '' }); // Reset form
      alert("Course Added Successfully!");
    } catch (error) {
      console.error("Error adding course:", error);
      alert("Failed to add course. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Course</h2>
          <button onClick={onClose} className="close-btn"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Course Name</label>
            <input name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Advanced Python" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option>General</option>
                <option>Technology</option>
                <option>Business</option>
                <option>Design</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Level</label>
              <select name="level" value={formData.level} onChange={handleChange}>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
                <option>All Levels</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="What will students learn?" />
          </div>

          <div className="form-group">
            <label>Video URL (Demo)</label>
            <input name="videoUrl" value={formData.videoUrl} onChange={handleChange} placeholder="https://youtube.com/..." />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Saving..." : "Create Course"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCourseModal;