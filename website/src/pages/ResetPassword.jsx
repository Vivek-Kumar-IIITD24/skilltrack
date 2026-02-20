import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import logo from '../assets/logo.png'; 
import { Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Get token from URL
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if(password !== confirmPassword) {
        setError("Passwords do not match");
        return;
    }

    setLoading(true);
    try {
      // API call to reset
      await api.post('/auth/reset-password', { token, newPassword: password });
      alert("Password Reset Successful! Please Login.");
      navigate('/login');
    } catch (err) {
      setError('Invalid or expired token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px' }}>
      
      <img src={logo} alt="Outcomely" style={{ height: '50px', marginBottom: '2rem' }} />

      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem', fontWeight: '800' }}>Reset Password</h2>
          <p style={{ color: '#64748b', marginTop: '8px' }}>Create a new password for your account.</p>
        </div>

        {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleReset}>
          {/* New Password */}
          <div style={{ marginBottom: '1rem', position: 'relative' }}>
            <input 
              type={showPass ? "text" : "password"} 
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.85rem', paddingRight: '40px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
              required 
            />
            <div onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#94a3b8' }}>
               {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
            <input 
              type={showPass ? "text" : "password"} 
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '0.85rem', paddingRight: '40px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
              required 
            />
          </div>

          <button type="submit" style={{ width: '100%', padding: '0.85rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default ResetPassword;