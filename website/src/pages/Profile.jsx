import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, LogOut, ChevronRight, Bell, BookOpen } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ name: 'Loading...', email: '', role: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const storedRole = localStorage.getItem('studentRole');
      const response = await api.get('/user-skills/stats');
      
      setUserInfo({
        name: response.data.userName,
        email: response.data.email,
        role: storedRole || 'STUDENT'
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      const storedName = localStorage.getItem('studentName');
      const storedRole = localStorage.getItem('studentRole');
      setUserInfo(prev => ({ 
          ...prev, 
          name: storedName || 'Student',
          role: storedRole || 'Guest' 
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem('studentToken');
      localStorage.removeItem('studentName');
      localStorage.removeItem('studentRole');
      navigate('/login');
    }
  };

  const isManager = userInfo.role === 'ADMIN';

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Profile...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 20px' }}>
      
      {/* HEADER CARD */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ 
            width: '80px', height: '80px', background: '#ecfdf5', borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto',
            color: '#10b981', fontSize: '2rem', fontWeight: 'bold'
        }}>
          {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : '?'}
        </div>
        
        <h2 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>{userInfo.name}</h2>
        <p style={{ margin: 0, color: '#64748b' }}>{userInfo.email}</p>
        
        <div style={{ 
            display: 'inline-block', marginTop: '1rem', padding: '5px 15px', borderRadius: '20px', 
            background: isManager ? '#ede9fe' : '#ecfdf5', 
            color: isManager ? '#7c3aed' : '#10b981', 
            fontWeight: '600', fontSize: '0.85rem'
        }}>
          {isManager ? "Manager Account" : "Student Account"}
        </div>
      </div>

      {/* MENU ITEMS */}
      <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h3 style={{ padding: '1.5rem 1.5rem 0.5rem 1.5rem', margin: 0, fontSize: '1rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Account</h3>
        
        <MenuItem icon={<User size={20} />} text="Personal Details" />
        <MenuItem icon={<Bell size={20} />} text="Notifications" />
        <MenuItem icon={<BookOpen size={20} />} text="My Learning Progress" />
        
        <div style={{ height: '1px', background: '#f1f5f9', margin: '0 1.5rem' }}></div>

        <h3 style={{ padding: '1.5rem 1.5rem 0.5rem 1.5rem', margin: 0, fontSize: '1rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Settings</h3>
        
        <MenuItem icon={<Shield size={20} />} text="Privacy & Security" />
        
        <div style={{ padding: '1rem' }}>
            <button 
                onClick={handleLogout}
                style={{ 
                    width: '100%', padding: '1rem', background: '#fef2f2', color: '#ef4444', border: 'none', 
                    borderRadius: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer'
                }}
            >
                <LogOut size={20} /> Log Out
            </button>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
        Outcomely v1.0 • Web Portal
      </div>

    </div>
  );
};

const MenuItem = ({ icon, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.5rem', cursor: 'pointer', transition: 'background 0.2s' }} className="menu-item">
    <div style={{ color: '#64748b', marginRight: '1rem' }}>{icon}</div>
    <div style={{ flex: 1, color: '#334155', fontWeight: '500' }}>{text}</div>
    <div style={{ color: '#cbd5e1' }}><ChevronRight size={20} /></div>
  </div>
);

export default Profile;
