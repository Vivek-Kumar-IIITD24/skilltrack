import React, { useState } from 'react';
import api from '../api/axios'; // The file we created earlier
import './Login.css'; // Import the styles
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Call the Backend
      const response = await api.post('/auth/login', { email, password });
      
      const { token, role } = response.data;

      // 2. Security Check: ONLY Admins allowed
      if (role !== 'ADMIN') {
        setError("Access Denied: You are not an Admin.");
        setLoading(false);
        return;
      }

      // 3. Save Token & Redirect
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      
      navigate('/dashboard'); // We will build this page next

    } catch (err) {
      console.error(err);
      setError('Invalid credentials or server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="logo-text">🚀 Outcomely</h2>
        <p className="sub-text">Admin Command Center</p>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '10px' }} />
              <input 
                type="email" 
                className="form-input" 
                style={{ paddingLeft: '35px' }}
                placeholder="admin@outcomely.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '10px' }} />
              <input 
                type="password" 
                className="form-input" 
                style={{ paddingLeft: '35px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;