import React, { useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'; 
import { Mail, CheckCircle, ShieldCheck } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // API call to your Backend
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true); // Show "Check your email" screen
    } catch (err) {
      setError('User not found or error sending link.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ STATE 2: "Check Your Email" (Matches Confirmation UI)
  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px' }}>
        <img src={logo} alt="Outcomely" style={{ height: '50px', marginBottom: '2rem' }} />
        
        <div style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
           <div style={{ background: '#ecfdf5', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <CheckCircle size={40} color="#10b981" />
           </div>
           
           <h2 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '1.5rem', fontWeight: '800' }}>Check Your Email</h2>
           <p style={{ color: '#64748b', lineHeight: '1.5' }}>
             We've sent a password reset link to <br/>
             <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{email}</span>.
           </p>

           <button onClick={() => window.open('https://gmail.com')} style={{ width: '100%', padding: '0.85rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '1.5rem' }}>
             Open Email App
           </button>
           
           <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
             Didn't receive it? <button onClick={() => setSubmitted(false)} style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: 'bold', cursor: 'pointer' }}>Resend Link</button>
           </p>
        </div>
      </div>
    );
  }

  // ✅ STATE 1: Enter Email Form
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px' }}>
      
      <img src={logo} alt="Outcomely" style={{ height: '50px', marginBottom: '2rem' }} />

      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem', fontWeight: '800' }}>Forgot Password?</h2>
          <p style={{ color: '#64748b', marginTop: '8px' }}>Enter your email to reset your password.</p>
        </div>

        {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
            <input 
              type="email" 
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.85rem', paddingLeft: '40px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
              required 
            />
            <Mail size={20} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <button type="submit" style={{ width: '100%', padding: '0.85rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '1.5rem', color: '#64748b', fontSize: '0.85rem' }}>
            <ShieldCheck size={16} /> Your learning data is secure.
        </div>

        <p style={{ textAlign: 'center', marginTop: '2rem', color: '#64748b', fontSize: '0.9rem' }}>
          Remember your password? <Link to="/login" style={{ color: '#10b981', fontWeight: 'bold', textDecoration: 'none' }}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;