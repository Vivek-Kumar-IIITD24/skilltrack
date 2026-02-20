import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png'; 
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [role, setRole] = useState('STUDENT'); // ✅ Role State
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ Send Role to Backend
      const response = await api.post('/auth/register', { ...formData, role });
      if(response.status === 200 || response.status === 201) {
          // Ideally save role here too if you want to auto-login
          alert("Account created! Please login.");
          navigate('/login');
      }
    } catch (err) {
      setError('Registration failed. Email might be taken.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    alert("Google Signup: This feature will be enabled in a future update!");
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px' }}>
      <img src={logo} alt="Outcomely" style={{ height: '50px', marginBottom: '2rem' }} />

      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem', fontWeight: '800' }}>Create your account</h2>
          <p style={{ color: '#64748b', marginTop: '8px' }}>Turn learning into verified outcomes.</p>
        </div>

        {/* Google Button */}
        <button 
          onClick={handleGoogleSignup}
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

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: '1rem' }}>
            <input name="name" type="text" placeholder="Full Name" value={formData.name} onChange={handleChange} style={styles.input} required />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} style={styles.input} required />
          </div>
          <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
            <input name="password" type={showPassword ? "text" : "password"} placeholder="Password" value={formData.password} onChange={handleChange} style={styles.input} required />
             <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#94a3b8' }}>
               {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>

          {/* ✅ ROLE SELECTOR */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#64748b' }}>I am a:</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => setRole('STUDENT')} style={role === 'STUDENT' ? styles.activeRole : styles.roleBtn}>Student</button>
              <button type="button" onClick={() => setRole('ADMIN')} style={role === 'ADMIN' ? styles.activeRole : styles.roleBtn}>Manager</button>
            </div>
          </div>

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1.5rem', color: '#64748b', fontSize: '0.85rem', gap: '6px' }}>
           <ShieldCheck size={16} /> Your progress is securely stored.
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: '#10b981', fontWeight: 'bold', textDecoration: 'none' }}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  input: { width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' },
  roleBtn: { flex: 1, padding: '10px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#64748b' },
  activeRole: { flex: 1, padding: '10px', border: '1px solid #10b981', background: '#ecfdf5', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', color: '#10b981' },
  submitBtn: { width: '100%', padding: '0.85rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }
};

export default Register;