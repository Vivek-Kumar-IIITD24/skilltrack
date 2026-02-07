import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses'; 
import { LayoutDashboard, BookOpen, LogOut } from 'lucide-react';

// --- SIDEBAR COMPONENT ---
const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? '#e2e8f0' : 'transparent';

  return (
    <div style={{ 
        width: '250px', 
        background: '#ffffff', 
        height: '100vh', 
        padding: '20px', 
        borderRight: '1px solid #e2e8f0', 
        position: 'fixed',
        boxSizing: 'border-box' // ✅ FIX: Keeps total width at 250px including padding
    }}>
      <h2 style={{ color: '#0f172a', marginBottom: '40px', fontWeight: '800' }}>🚀 Outcomely</h2>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: '#334155', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', background: isActive('/dashboard') }}>
          <LayoutDashboard size={20} /> Dashboard
        </Link>
        
        <Link to="/courses" style={{ textDecoration: 'none', color: '#334155', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', background: isActive('/courses') }}>
          <BookOpen size={20} /> Courses
        </Link>
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
        <button onClick={() => window.location.href='/'} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem' }}>
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  );
};

// --- LAYOUT WRAPPER ---
const AdminLayout = ({ children }) => (
  <div style={{ display: 'flex' }}>
    <Sidebar />
    <div style={{ marginLeft: '250px', width: '100%' }}>
      {children}
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes with Sidebar */}
        <Route path="/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/courses" element={<AdminLayout><Courses /></AdminLayout>} />
      </Routes>
    </Router>
  );
}

export default App;