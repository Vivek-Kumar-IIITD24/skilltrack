import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { PlusCircle, Users, BookOpen, BarChart3, LogOut } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ students: 0, courses: 0, completions: 0 });
  const userName = localStorage.getItem('studentName') || 'Manager';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const skillsRes = await api.get('/skills');
        setStats(prev => ({ ...prev, courses: skillsRes.data.length }));
      } catch (e) { console.error(e); }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    // ✅ Security Check: Pop-up Confirmation
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.clear(); // Wipes all stored tokens/names/roles
      navigate('/login');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex' }}>
      
      {/* Sidebar */}
      <div style={{ width: '250px', background: 'white', borderRight: '1px solid #e2e8f0', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ color: '#0f172a', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
           <div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%' }}></div>
           Admin
        </h2>
        
        <nav style={{ flex: 1 }}>
          <div style={{ padding: '10px', background: '#ecfdf5', color: '#10b981', borderRadius: '8px', fontWeight: 'bold', marginBottom: '10px', cursor: 'pointer' }}>Dashboard</div>
          <div style={{ padding: '10px', color: '#64748b', cursor: 'pointer' }}>Students</div>
          <div style={{ padding: '10px', color: '#64748b', cursor: 'pointer' }}>Settings</div>
        </nav>

        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
            <LogOut size={20} /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '3rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
            <div>
                <h1 style={{ margin: 0, color: '#0f172a' }}>Hello, {userName} 👋</h1>
                <p style={{ color: '#64748b' }}>Here is what's happening in your academy.</p>
            </div>
            <Link to="/add-course">
                <button style={{ 
                    background: '#10b981', color: 'white', border: 'none', padding: '12px 24px', 
                    borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' 
                }}>
                    <PlusCircle size={20} /> Add New Course
                </button>
            </Link>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
            <StatCard icon={<BookOpen size={24} color="white"/>} color="#3b82f6" label="Total Courses" value={stats.courses} />
            <StatCard icon={<Users size={24} color="white"/>} color="#f59e0b" label="Active Students" value="120+" />
            <StatCard icon={<BarChart3 size={24} color="white"/>} color="#10b981" label="Completions" value="85" />
        </div>

        {/* Recent Activity */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ marginTop: 0 }}>Recent System Activity</h3>
            <p style={{ color: '#94a3b8' }}>No recent alerts.</p>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ icon, color, label, value }) => (
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a' }}>{value}</div>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{label}</div>
        </div>
    </div>
);

export default AdminDashboard;