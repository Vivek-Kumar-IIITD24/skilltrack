import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png'; 
import { Eye, EyeOff } from 'lucide-react'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // ✅ DEBUG: Check response structure
      console.log("Login Response:", response.data);

      const userName = response.data.name || response.data.username || response.data.fullName || email.split('@')[0];
      const userRole = response.data.role || 'STUDENT'; // Default to STUDENT if undefined

      // ✅ Save Token, Name, AND Role
      localStorage.setItem('studentToken', response.data.token);
      localStorage.setItem('studentName', userName);
      localStorage.setItem('studentRole', userRole); 
      
      // Redirect based on role happens in App.js HomeRoute, so just go home
      navigate('/'); 
    } catch (err) {
      console.error(err);
      if (!err.response) {
        setError('Network Error: creating connection to backend failed.');
      } else if (err.response.status === 401) {
        setError('Invalid email or password');
      } else {
        setError(err.response.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    alert("Google Login: This feature will be enabled in a future update!");
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px' }}>
      
      <img src={logo} alt="Outcomely" style={{ height: '50px', marginBottom: '2rem' }} />

      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem', fontWeight: '800' }}>Welcome back</h2>
          <p style={{ color: '#64748b', marginTop: '8px' }}>Log in to continue your verified learning journey.</p>
        </div>

        <button 
          onClick={handleGoogleLogin}
          style={{ 
            width: '100%', padding: '0.75rem', 
            background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', 
            fontWeight: '600', color: '#0f172a', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            marginBottom: '1.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
           <span style={{fontWeight: 'bold', fontSize: '1.2rem', color: '#EA4335'}}>G</span> Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', color: '#94a3b8' }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
            <span style={{ padding: '0 10px', fontSize: '0.9rem' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
        </div>

        {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <input 
              type="email" 
              placeholder="name@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
              required 
            />
          </div>
          
          <div style={{ marginBottom: '1rem', position: 'relative' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.85rem', paddingRight: '40px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
              required 
            />
            <div 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#94a3b8' }}
            >
               {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
             <Link to="/forgot-password" style={{ color: '#10b981', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>Forgot password?</Link>
          </div>

          <button type="submit" style={{ width: '100%', padding: '0.85rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
          New to Outcomely? <Link to="/register" style={{ color: '#10b981', fontWeight: 'bold', textDecoration: 'none' }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;