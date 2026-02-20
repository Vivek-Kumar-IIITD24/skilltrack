import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Player from './pages/Player';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import Quiz from './pages/Quiz';
import Certificate from './pages/Certificate';
import AdminDashboard from './pages/AdminDashboard';
import AddCourse from './pages/AddCourse';
import Profile from './pages/Profile'; // ✅ Import Profile

// ✅ SMART COMPONENT: Routes to Admin or Student Dashboard based on Role
const HomeRoute = () => {
  const token = localStorage.getItem('studentToken'); 
  const role = localStorage.getItem('studentRole');

  if (token) {
    if (role === 'ADMIN') {
        // 🛡️ Admin Dashboard (No Navbar usually, or custom Admin Navbar)
        return <AdminDashboard />;
    }
    // 🎓 Student Dashboard
    return (
      <>
        <Navbar />
        <Dashboard />
      </>
    );
  }

  // 🌍 Public Home Page
  return (
    <>
      <Navbar />
      <div style={{ padding: '4rem 2rem 2rem 2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: '#0f172a', fontWeight: '800', lineHeight: '1.2' }}>
          Turn learning into <br/><span style={{ color: '#10b981' }}>verified outcomes.</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Master new skills with our scientifically designed courses.
        </p>
      </div>
      <Home />
    </>
  );
};

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          
          <Route path="/" element={<HomeRoute />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ✅ ADMIN ROUTES */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/add-course" element={<AddCourse />} />

          {/* ✅ STUDENT PROTECTED ROUTES */}
          <Route path="/explore" element={
            <ProtectedRoute>
              <Navbar /> 
              <Explore />
            </ProtectedRoute>
          } />

          <Route path="/course/:id" element={
            <ProtectedRoute>
              <Navbar /> 
              <Player />
            </ProtectedRoute>
          } />

          <Route path="/quiz/:lessonId" element={
            <ProtectedRoute>
                <Quiz />
            </ProtectedRoute>
          } />
          
          <Route path="/certificate/:courseId" element={
            <ProtectedRoute>
                <Certificate />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
                <Navbar /> 
                <Profile />
            </ProtectedRoute>
          } />

        </Routes>
      </div>
    </Router>
  );
}

export default App;