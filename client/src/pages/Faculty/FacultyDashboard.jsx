import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, RadialLinearScale, ArcElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Doughnut, Radar } from 'react-chartjs-2';
import Sidebar from '../../components/Sidebar';
import { getFacultyStats, getFacultyFeedback, getFacultyAnalytics, getFacultySubjects } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  RadialLinearScale, ArcElement, Title, Tooltip, Legend, Filler);

const chartOpts = {
  responsive: true,
  plugins: { legend: { labels: { color: '#94a3b8' } } },
  scales: {
    x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
    y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' }, beginAtZero: true },
  },
};

// ── Overview ───────────────────────────────────────────────────────────────
const FacultyOverview = () => {
  const { user } = useAuth();
  const [stats, setStats]         = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    Promise.all([getFacultyStats(), getFacultyAnalytics()]).then(([s, a]) => {
      setStats(s.data.data);
      setAnalytics(a.data.data);
    });
  }, []);

  const barData = analytics ? {
    labels: analytics.analytics.map(a => a.subject.name),
    datasets: [{
      label: 'Average Rating',
      data: analytics.analytics.map(a => parseFloat(a.avgRating.toFixed(2))),
      backgroundColor: 'rgba(99,102,241,0.7)',
      borderColor: '#6366f1', borderWidth: 2, borderRadius: 6,
    }],
  } : null;

  const doughnutData = analytics?.distribution?.length ? {
    labels: analytics.distribution.map(d => `${d._id} Star`),
    datasets: [{
      data: analytics.distribution.map(d => d.count),
      backgroundColor: ['#ef4444','#f59e0b','#38bdf8','#22c55e','#6366f1'],
      borderWidth: 0,
    }],
  } : null;

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <h1>Welcome, {user?.name?.split(' ')[0]}</h1>
          <p>Your feedback dashboard</p>
        </div>
      </div>
      {!stats ? <div className="spinner-wrap"><div className="spinner"/></div> : (
        <>
          <div className="stats-grid">
            {[
              { label: 'My Subjects',      value: stats.subjectCount, icon: '', cls: 'purple' },
              { label: 'Total Feedback',   value: stats.feedbackCount, icon: '', cls: 'green' },
              { label: 'Average Rating',   value: `${stats.avgRating}/5`, icon: '', cls: 'amber' },
            ].map((c,i) => (
              <div className="stat-card" key={i} style={{ animationDelay: `${i*0.07}s` }}>
                <div className={`stat-icon ${c.cls}`}>{c.icon}</div>
                <div className="stat-info"><h3>{c.value}</h3><p>{c.label}</p></div>
              </div>
            ))}
          </div>
          <div className="section-grid">
            {barData && (
              <div className="card">
                <div className="card-header"><h2 className="card-title">Rating by Subject</h2></div>
                <div className="card-content">
                  <div className="chart-wrapper">
                    <Bar data={barData} options={{ ...chartOpts, maintainAspectRatio: false, plugins: { ...chartOpts.plugins, legend: { display: false } } }} />
                  </div>
                </div>
              </div>
            )}
            {doughnutData && (
              <div className="card">
                <div className="card-header"><h2 className="card-title">Rating Distribution</h2></div>
                <div className="card-content">
                  <div className="chart-wrapper">
                    <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

// ── My Subjects ────────────────────────────────────────────────────────────
const FacultySubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  useEffect(() => { getFacultySubjects().then(r => { setSubjects(r.data.data); setLoading(false); }); }, []);

  return (
    <>
      <div className="topbar"><div className="topbar-title"><h1>My Subjects</h1><p>Subjects assigned to you</p></div></div>
      {loading ? <div className="spinner-wrap"><div className="spinner"/></div> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:20 }}>
          {subjects.length === 0 ? (
            <div className="empty-state"><div className="empty-icon"></div><h3>No subjects assigned yet</h3></div>
          ) : subjects.map(s => (
            <div className="card" key={s._id} style={{ padding: 20, cursor:'default' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="badge badge-purple">{s.code}</span>
                <span className="badge badge-blue">Sem {s.semester}</span>
              </div>
              <h3 style={{ fontSize:'1.05rem', fontWeight:600, marginBottom:4 }}>{s.name}</h3>
              <p className="text-sm text-muted">{s.department}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

// ── Feedback Viewer ────────────────────────────────────────────────────────
const FacultyFeedbackView = () => {
  const [subjects, setSubjects]   = useState([]);
  const [feedback, setFeedback]   = useState([]);
  const [filter, setFilter]       = useState('');
  const [loading, setLoading]     = useState(false);

  useEffect(() => { getFacultySubjects().then(r => setSubjects(r.data.data)); }, []);

  const load = async (subId) => {
    setFilter(subId); setLoading(true);
    try { const { data } = await getFacultyFeedback(subId || undefined); setFeedback(data.data); }
    catch { toast.error('Error loading feedback'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(''); }, []);

  return (
    <>
      <div className="topbar">
        <div className="topbar-title"><h1>Student Feedback</h1><p>{feedback.length} entries</p></div>
        <select className="form-select" style={{ width: 220 }} value={filter} onChange={e => load(e.target.value)}>
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </div>
      {loading ? <div className="spinner-wrap"><div className="spinner"/></div> : feedback.length === 0 ? (
        <div className="empty-state" style={{ marginTop:60 }}>
          <div className="empty-icon"></div><h3>No feedback yet</h3><p>Feedback will appear here once students submit.</p>
        </div>
      ) : feedback.map(f => (
        <div className="feedback-card" key={f._id}>
          <div className="flex justify-between items-center" style={{ flexWrap:'wrap', gap:8 }}>
            <div>
              <strong>Anonymous Student</strong>
              <span className="text-xs text-muted" style={{ marginLeft:8 }}>ID: {f.student?._id?.slice(-6).toUpperCase()}</span>
            </div>
            <div className="rating-display">
              {[1,2,3,4,5].map(n=><span key={n} className={`star ${n<=f.rating?'filled':''}`}>★</span>)}
              <span className="text-sm text-muted" style={{marginLeft:6}}>{f.rating}/5</span>
            </div>
          </div>
          <p className="text-sm text-muted mt-1">{f.subject?.name} · {new Date(f.createdAt).toLocaleDateString()}</p>
          {f.comment && <p className="text-sm mt-2" style={{ color:'var(--text-secondary)', fontStyle:'italic' }}>"{f.comment}"</p>}
          {(f.teachingQuality||f.subjectClarity||f.availability) && (
            <div className="flex gap-3 mt-2" style={{flexWrap:'wrap'}}>
              {f.teachingQuality && <span className="badge badge-blue">Teaching: {f.teachingQuality}/5</span>}
              {f.subjectClarity  && <span className="badge badge-green">Clarity: {f.subjectClarity}/5</span>}
              {f.availability    && <span className="badge badge-amber">Availability: {f.availability}/5</span>}
            </div>
          )}
        </div>
      ))}
    </>
  );
};

// ── Analytics ──────────────────────────────────────────────────────────────
const FacultyAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  useEffect(() => { getFacultyAnalytics().then(r => setAnalytics(r.data.data)); }, []);

  if (!analytics) return <div className="spinner-wrap"><div className="spinner"/></div>;

  const radarData = analytics.analytics.length ? {
    labels: ['Teaching Quality', 'Subject Clarity', 'Availability', 'Overall Rating'],
    datasets: analytics.analytics.map((a, i) => ({
      label: a.subject.name,
      data: [
        parseFloat((a.avgTeaching || 0).toFixed(2)),
        parseFloat((a.avgClarity  || 0).toFixed(2)),
        parseFloat((a.avgAvailability || 0).toFixed(2)),
        parseFloat(a.avgRating.toFixed(2)),
      ],
      backgroundColor: `rgba(${[99,34,245,56][i%4]},${[102,197,158,189][i%4]},${[241,94,11,248][i%4]},0.2)`,
      borderColor: ['#6366f1','#22c55e','#f59e0b','#38bdf8'][i%4],
      borderWidth: 2, pointBackgroundColor: ['#6366f1','#22c55e','#f59e0b','#38bdf8'][i%4],
    })),
  } : null;

  return (
    <>
      <div className="topbar"><div className="topbar-title"><h1>Analytics</h1><p>Detailed feedback breakdown</p></div></div>
      <div className="section-grid">
        {radarData && (
          <div className="card">
            <div className="card-header"><h2 className="card-title">Skill Radar</h2></div>
            <Radar data={radarData} options={{ responsive:true, scales:{ r:{ ticks:{ color:'#64748b', backdropColor:'transparent' }, grid:{ color:'#334155' }, pointLabels:{ color:'#94a3b8' }, min:0, max:5 } }, plugins:{ legend:{ labels:{ color:'#94a3b8' } } } }} />
          </div>
        )}
        <div className="card">
          <div className="card-header"><h2 className="card-title">Subject Breakdown</h2></div>
          {analytics.analytics.length === 0 ? (
            <div className="empty-state"><div className="empty-icon"></div><h3>No analytics data yet</h3></div>
          ) : analytics.analytics.map(a => (
            <div key={a._id} className="feedback-card" style={{ marginBottom:12 }}>
              <div className="flex justify-between items-center">
                <strong>{a.subject.name}</strong>
                <span className={`badge ${a.avgRating>=4?'badge-green':a.avgRating>=3?'badge-amber':'badge-red'}`}>{a.avgRating.toFixed(1)}/5</span>
              </div>
              <p className="text-sm text-muted mt-1">{a.totalFeedback} responses</p>
              <div className="flex gap-2 mt-2" style={{flexWrap:'wrap'}}>
                {a.avgTeaching    && <span className="badge badge-blue">Teaching: {a.avgTeaching.toFixed(1)}</span>}
                {a.avgClarity     && <span className="badge badge-green">Clarity: {a.avgClarity.toFixed(1)}</span>}
                {a.avgAvailability && <span className="badge badge-amber">Avail: {a.avgAvailability.toFixed(1)}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// ── Faculty Dashboard Shell ────────────────────────────────────────────────
const FacultyDashboard = () => (
  <div className="dashboard-layout">
    <Sidebar />
    <main className="main-content">
      <Routes>
        <Route index          element={<FacultyOverview />} />
        <Route path="subjects"  element={<FacultySubjects />} />
        <Route path="feedback"  element={<FacultyFeedbackView />} />
        <Route path="analytics" element={<FacultyAnalytics />} />
      </Routes>
    </main>
  </div>
);

export default FacultyDashboard;
