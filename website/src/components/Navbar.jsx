import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'; 
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  
  const token = localStorage.getItem('studentToken');
  const userName = localStorage.getItem('studentName') || 'Student';

  const handleLogout = () => {
    // ✅ Security Check: Pop-up Confirmation
    // If user clicks "OK", it returns true. If "Cancel", it returns false.
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem('studentToken');
      localStorage.removeItem('studentName');
      localStorage.removeItem('studentRole'); // Clean up role too
      navigate('/login');
    }
  };

  return (
    <nav style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
      padding: '1rem 2rem', background: '#ffffff', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100
    }}>
      {/* Logo Area */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img src={logo} alt="Outcomely Logo" style={{ height: '40px' }} />
      </Link>

      {/* Right Side Buttons */}
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        
        {token ? (
          // ✅ STATE: LOGGED IN
          <>
            {/* Explore Link for logged-in users */}
            <Link to="/explore" style={{ marginRight: '10px', textDecoration: 'none', color: '#64748b', fontWeight: '600', fontSize: '0.95rem' }}>
              Explore
            </Link>

            <Link to="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginRight: '10px', cursor: 'pointer' }}>
                <div style={{ background: '#ecfdf5', padding: '8px', borderRadius: '50%' }}>
                    <User size={20} color="#10b981" />
                </div>
                <span style={{ fontWeight: '600', color: '#0f172a' }}>Hi, {userName}</span>
            </Link>

            <button 
              onClick={handleLogout}
              style={{ 
                background: '#f1f5f9', border: 'none', color: '#64748b', 
                padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', 
                fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          // ❌ STATE: LOGGED OUT (Public)
          <>
            <button 
              onClick={() => navigate('/login')} 
              style={{ 
                background: 'transparent', border: 'none', color: '#64748b', 
                padding: '8px 16px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem' 
              }}
            >
              Login
            </button>
            <button 
              onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}
              style={{ 
                background: '#10b981', border: 'none', color: 'white', 
                padding: '10px 24px', borderRadius: '50px', cursor: 'pointer', 
                fontWeight: '600', fontSize: '0.95rem', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)'
              }}
            >
              Get Started
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;