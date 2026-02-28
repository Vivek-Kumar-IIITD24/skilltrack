import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { PlusCircle, Users, BookOpen, BarChart3, LogOut, RefreshCw } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ 
    activeStudents: 0, 
    totalCourses: 0, 
    completions: 0,
    recentActivity: [] 
  });
  const userName = localStorage.getItem('studentName') || 'Manager';

  // Helper to format time (e.g., "2 hours ago")
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'No timestamp';
    
    // Handle Spring Boot's default array serialization for LocalDateTime [yyyy, MM, dd, HH, mm, ss]
    let date;
    if (Array.isArray(timestamp)) {
       date = new Date(timestamp[0], timestamp[1] - 1, timestamp[2], timestamp[3], timestamp[4], timestamp[5] || 0);
    } else {
       date = new Date(timestamp);
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 0) return 'Just now (new)';
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };
  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (e) { 
      console.error("Failed to fetch admin stats:", e); 
    }
  };

  useEffect(() => {
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
    <div style={{ height: '100vh', background: '#f8fafc', display: 'flex', overflow: 'hidden' }}>
      
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
      <div style={{ flex: 1, padding: '3rem', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexShrink: 0 }}>
            <div>
                <h1 style={{ margin: 0, color: '#0f172a' }}>Hello, {userName} 👋</h1>
                <p style={{ color: '#64748b' }}>Here is what's happening in your academy.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={fetchStats} style={{ 
                    background: 'white', color: '#64748b', border: '1px solid #e2e8f0', padding: '12px', 
                    borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} title="Refresh Data">
                    <RefreshCw size={20} />
                </button>
                <Link to="/add-course">
                    <button style={{ 
                        background: '#10b981', color: 'white', border: 'none', padding: '12px 24px', 
                        borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' 
                    }}>
                        <PlusCircle size={20} /> Add New Course
                    </button>
                </Link>
            </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '3rem', flexShrink: 0 }}>
            <StatCard icon={<BookOpen size={24} color="white"/>} color="#3b82f6" label="Total Courses" value={stats.totalCourses} />
            <StatCard icon={<Users size={24} color="white"/>} color="#f59e0b" label="Active Students" value={stats.activeStudents} />
            <StatCard icon={<BarChart3 size={24} color="white"/>} color="#10b981" label="Completions" value={stats.completions} />
        </div>

        {/* Recent Activity */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#0f172a' }}>Recent System Activity</h3>
            
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
                {stats.recentActivity && stats.recentActivity.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {stats.recentActivity.map((activity, index) => (
                            <div key={index} style={{ 
                                display: 'flex', alignItems: 'center', gap: '1rem', 
                                padding: '1rem', background: '#f8fafc', borderRadius: '12px'
                            }}>
                                <div style={{ 
                                    width: '40px', height: '40px', borderRadius: '50%', 
                                    background: activity.status === 'COMPLETED' ? '#dcfce7' : '#dbeafe', 
                                    color: activity.status === 'COMPLETED' ? '#16a34a' : '#2563eb',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold',
                                    flexShrink: 0
                                }}>
                                    {activity.status === 'COMPLETED' ? '✓' : 'Run'}
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.95rem', color: '#334155' }}>
                                        <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{activity.userName}</span> 
                                        {' '} has {activity.status === 'COMPLETED' ? 'completed' : 'started'} {' '}
                                        <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{activity.courseTitle}</span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{formatTimeAgo(activity.timestamp)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: '#94a3b8' }}>No recent activity found.</p>
                )}
            </div>
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