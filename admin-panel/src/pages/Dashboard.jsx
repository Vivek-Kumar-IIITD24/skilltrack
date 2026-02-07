import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import './Dashboard.css';
import { Users, BookOpen, DollarSign } from 'lucide-react'; // Icons

const Dashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalCourses: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Real Data on Load
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Overview</h1>
        <p>Welcome back, Admin. Here is what's happening today.</p>
      </header>

      {/* STATS GRID */}
      <div className="stats-grid">
        
        {/* CARD 1: USERS */}
        <div className="stat-card users-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-title">Total Students</span>
            <Users color="#3b82f6" size={24} />
          </div>
          <div className="stat-value">{loading ? "..." : stats.totalUsers}</div>
        </div>

        {/* CARD 2: COURSES */}
        <div className="stat-card courses-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-title">Active Courses</span>
            <BookOpen color="#10b981" size={24} />
          </div>
          <div className="stat-value">{loading ? "..." : stats.totalCourses}</div>
        </div>

        {/* CARD 3: REVENUE (Future) */}
        <div className="stat-card revenue-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-title">Total Revenue</span>
            <DollarSign color="#f59e0b" size={24} />
          </div>
          <div className="stat-value">${loading ? "..." : stats.revenue}</div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;