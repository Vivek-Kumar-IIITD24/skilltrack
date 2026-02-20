import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Youtube, Save, Loader2 } from 'lucide-react';

const AddCourse = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', category: '', playlistUrl: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        // Matches your Mobile App API call exactly
        await api.post(`/skills/import-secure?title=${encodeURIComponent(formData.title)}&category=${encodeURIComponent(formData.category)}&playlistUrl=${encodeURIComponent(formData.playlistUrl)}`);
        
        alert("Course Imported Successfully!");
        navigate('/admin'); // Go back to dashboard
    } catch (error) {
        alert("Import Failed. Check the URL.");
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: 'white', padding: '3rem', borderRadius: '20px', width: '100%', maxWidth: '600px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        
        <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', marginBottom: '2rem' }}>
            <ArrowLeft size={20} /> Back to Dashboard
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '60px', height: '60px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <Youtube size={30} color="#ef4444" />
            </div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a' }}>Import Course Content</h1>
            <p style={{ color: '#64748b' }}>Paste a YouTube Playlist URL to auto-generate a course.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#334155' }}>Course Title</label>
                <input required type="text" placeholder="e.g. Master React JS" 
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }} />
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#334155' }}>Category</label>
                <input required type="text" placeholder="e.g. Development" 
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }} />
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#334155' }}>YouTube Playlist URL</label>
                <input required type="url" placeholder="https://youtube.com/playlist?list=..." 
                    value={formData.playlistUrl} onChange={e => setFormData({...formData, playlistUrl: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }} />
            </div>

            <button type="submit" disabled={loading} style={{ 
                background: '#10b981', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', 
                fontSize: '1rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', 
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' 
            }}>
                {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />} 
                {loading ? "Importing Videos..." : "Import Course"}
            </button>
        </form>

      </div>
    </div>
  );
};

export default AddCourse;