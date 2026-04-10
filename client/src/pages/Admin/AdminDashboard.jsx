import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import Sidebar from '../../components/Sidebar';
import { getAdminStats } from '../../services/api';
import AdminStudents from './AdminStudents';
import AdminFaculty from './AdminFaculty';
import AdminSubjects from './AdminSubjects';
import AdminFeedback from './AdminFeedback';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// ── Overview Cards ─────────────────────────────────────────────────────
const Overview = () => {
  const [stats, setStats] = useState(null);
  useEffect(() => { getAdminStats().then(r => setStats(r.data.data)); }, []);

  const cards = stats ? [
    { label: 'Total Students',  value: stats.students,      icon: '🎓', cls: 'purple' },
    { label: 'Total Faculty',   value: stats.faculty,       icon: '👨‍🏫', cls: 'blue' },
    { label: 'Subjects',        value: stats.subjects,      icon: '📚', cls: 'green' },
    { label: 'Feedback Given',  value: stats.feedbackCount, icon: '💬', cls: 'amber' },
    { label: 'Avg Rating',      value: `${stats.avgRating}⭐`, icon: '⭐', cls: 'red' },
  ] : [];

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <h1>Admin Dashboard</h1>
          <p>System overview and management</p>
        </div>
      </div>
      {!stats ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : (
        <>
          <div className="stats-grid">
            {cards.map((c, i) => (
              <div className="stat-card" key={i} style={{ animationDelay: `${i * 0.07}s` }}>
                <div className={`stat-icon ${c.cls}`}>{c.icon}</div>
                <div className="stat-info">
                  <h3>{c.value}</h3>
                  <p>{c.label}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-header"><h2 className="card-title">Quick Actions</h2></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 12 }}>
              {[
                { label: '➕ Add Student',  to: '/admin/students' },
                { label: '➕ Add Faculty',  to: '/admin/faculty'  },
                { label: '📚 Add Subject',  to: '/admin/subjects' },
                { label: '💬 View Feedback',to: '/admin/feedback' },
              ].map(({ label, to }) => (
                <a key={to} href={to} className="btn btn-secondary" style={{ textAlign: 'center' }}>{label}</a>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};

// ── Admin Dashboard Shell ──────────────────────────────────────────────
const AdminDashboard = () => (
  <div className="dashboard-layout">
    <Sidebar />
    <main className="main-content">
      <Routes>
        <Route index    element={<Overview />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="faculty"  element={<AdminFaculty />} />
        <Route path="subjects" element={<AdminSubjects />} />
        <Route path="feedback" element={<AdminFeedback />} />
      </Routes>
    </main>
  </div>
);

export default AdminDashboard;
