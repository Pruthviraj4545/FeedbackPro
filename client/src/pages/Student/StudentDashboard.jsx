import { useState, useEffect } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getStudentSubjects, submitFeedback, getMyFeedback } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// ── Star Picker ────────────────────────────────────────────────────────────
const StarPicker = ({ value, onChange, label }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <div className="star-rating">
      {[1,2,3,4,5].map(n => (
        <span key={n} className={`star ${n <= value ? 'filled' : ''}`} onClick={() => onChange(n)}>★</span>
      ))}
      <span className="text-sm text-muted" style={{ marginLeft: 8 }}>{value ? `${value}/5` : 'Click to rate'}</span>
    </div>
  </div>
);

// ── Overview ───────────────────────────────────────────────────────────────
const StudentOverview = () => {
  const { user } = useAuth();
  const [myFeedback, setMyFeedback] = useState([]);
  const [subjects,   setSubjects]   = useState([]);

  useEffect(() => {
    Promise.all([getMyFeedback(), getStudentSubjects()]).then(([f, s]) => {
      setMyFeedback(f.data.data);
      setSubjects(s.data.data);
    });
  }, []);

  const avgRating = myFeedback.length
    ? (myFeedback.reduce((a, f) => a + f.rating, 0) / myFeedback.length).toFixed(1)
    : '—';

  const availableSubjects = subjects.filter(s => s.faculty);
  const completedCount = myFeedback.length;
  const totalCount = availableSubjects.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <h1>Welcome, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Here's your feedback activity overview</p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="card" style={{ marginBottom: 32 }}>
        <div className="card-header">
          <h2 className="card-title">📊 Feedback Progress</h2>
        </div>
        <div style={{ padding: '20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span className="text-sm font-semibold">Completion Status</span>
            <span className="text-sm text-muted">{completedCount}/{totalCount} subjects</span>
          </div>
          <div style={{
            width: '100%',
            height: '12px',
            background: 'var(--bg-primary)',
            borderRadius: '99px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
              borderRadius: '99px',
              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0, left: '-100%',
                width: '100%', height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                animation: 'shimmer 2s infinite'
              }}></div>
            </div>
          </div>
          <p className="text-sm text-muted" style={{ marginTop: 8, textAlign: 'center' }}>
            {progressPercent === 100 ? '🎉 All feedback completed!' : `${Math.round(progressPercent)}% complete`}
          </p>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Available Subjects', value: availableSubjects.length, icon: '📚', cls: 'purple' },
          { label: 'Feedback Submitted', value: myFeedback.length, icon: '✍️', cls: 'green' },
          { label: 'Pending Subjects',   value: Math.max(0, availableSubjects.length - myFeedback.length), icon: '⏳', cls: 'amber' },
          { label: 'Avg. Rating Given',  value: avgRating, icon: '⭐', cls: 'blue' },
        ].map((c, i) => (
          <div className="stat-card" key={i} style={{ animationDelay: `${i*0.07}s` }}>
            <div className={`stat-icon ${c.cls}`}>{c.icon}</div>
            <div className="stat-info"><h3>{c.value}</h3><p>{c.label}</p></div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><h2 className="card-title">Recent Feedback</h2></div>
        {myFeedback.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h3>No feedback submitted yet</h3>
            <p>Go to "Submit Feedback" to rate your subjects</p>
          </div>
        ) : myFeedback.slice(0,5).map(f => (
          <div className="feedback-card" key={f._id}>
            <div className="flex justify-between items-center">
              <div>
                <strong>{f.subject?.name}</strong>
                <span className="badge badge-purple" style={{ marginLeft: 8 }}>{f.subject?.code}</span>
              </div>
              <div className="rating-display">
                {[1,2,3,4,5].map(n => <span key={n} className={`star ${n<=f.rating?'filled':''}`}>★</span>)}
              </div>
            </div>
            <p className="text-sm text-muted mt-1">{f.faculty?.name} · {new Date(f.createdAt).toLocaleDateString()}</p>
            {f.comment && <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>"{f.comment}"</p>}
          </div>
        ))}
      </div>
    </>
  );
};

// ── Submit Feedback ────────────────────────────────────────────────────────
const SubmitFeedback = () => {
  const [subjects, setSubjects]   = useState([]);
  const [submitted, setSubmitted] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [form, setForm] = useState({
    subject: '', rating: 0, comment: '',
    teachingQuality: 0, subjectClarity: 0, availability: 0,
  });

  useEffect(() => {
    Promise.all([getStudentSubjects(), getMyFeedback()]).then(([s, f]) => {
      setSubjects(s.data.data);
      setSubmitted(f.data.data.map(fb => fb.subject?._id));
    });
  }, []);

  const available = subjects.filter(s => s.faculty && !submitted.includes(s._id));
  const selected  = subjects.find(s => s._id === form.subject);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rating) return toast.error('Please select an overall rating');
    setLoading(true);
    try {
      await submitFeedback(form);
      toast.success('Feedback submitted successfully! 🎉');
      setForm({ subject: '', rating: 0, comment: '', teachingQuality: 0, subjectClarity: 0, availability: 0 });
      const f = await getMyFeedback();
      setSubmitted(f.data.data.map(fb => fb.subject?._id));
    } catch (err) { toast.error(err.response?.data?.message || 'Submission failed'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title"><h1>Submit Feedback</h1><p>Rate your subjects and faculty</p></div>
      </div>
      <div style={{ maxWidth: 640 }}>
        <div className="card">
          {available.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <h3>All caught up!</h3>
              <p>You've submitted feedback for all available subjects.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Select Subject</label>
                <select className="form-select" required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}>
                  <option value="">— Choose a subject —</option>
                  {available.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.code}) – Sem {s.semester}</option>
                  ))}
                </select>
              </div>

              {selected && (
                <div className="feedback-card" style={{ marginBottom: 20 }}>
                  <p className="text-sm"><strong>Faculty:</strong> {selected.faculty?.name}</p>
                  <p className="text-sm text-muted">{selected.department} · Semester {selected.semester}</p>
                </div>
              )}

              <StarPicker label="⭐ Overall Rating *" value={form.rating} onChange={v => setForm({...form, rating: v})} />
              <StarPicker label="🧑‍🏫 Teaching Quality" value={form.teachingQuality} onChange={v => setForm({...form, teachingQuality: v})} />
              <StarPicker label="📖 Subject Clarity" value={form.subjectClarity} onChange={v => setForm({...form, subjectClarity: v})} />
              <StarPicker label="🕐 Faculty Availability" value={form.availability} onChange={v => setForm({...form, availability: v})} />

              <div className="form-group">
                <label className="form-label">Comments (optional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Share your experience with this subject and faculty..."
                  value={form.comment}
                  onChange={e => setForm({...form, comment: e.target.value})}
                  maxLength={500}
                />
                <p className="text-xs text-muted mt-1">{form.comment.length}/500 characters</p>
              </div>

              <button className="btn btn-primary btn-full" type="submit" disabled={loading || !form.subject}>
                {loading ? 'Submitting…' : '✉️ Submit Feedback'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

// ── Feedback History ───────────────────────────────────────────────────────
const FeedbackHistory = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getMyFeedback().then(r => { setFeedback(r.data.data); setLoading(false); });
  }, []);

  return (
    <>
      <div className="topbar">
        <div className="topbar-title"><h1>My Feedback History</h1><p>All feedback you have submitted</p></div>
      </div>
      {loading ? <div className="spinner-wrap"><div className="spinner"/></div> : feedback.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 60 }}>
          <div className="empty-icon">📋</div>
          <h3>No feedback history</h3>
          <p>Submit feedback for your subjects to see them here.</p>
        </div>
      ) : feedback.map(f => (
        <div className="feedback-card" key={f._id}>
          <div className="flex justify-between items-center" style={{ flexWrap:'wrap', gap:8 }}>
            <div>
              <strong style={{ fontSize: '1rem' }}>{f.subject?.name}</strong>
              <span className="badge badge-purple" style={{ marginLeft: 8 }}>{f.subject?.code}</span>
            </div>
            <div className="rating-display">
              {[1,2,3,4,5].map(n=><span key={n} className={`star ${n<=f.rating?'filled':''}`}>★</span>)}
              <span className="text-sm text-muted" style={{marginLeft:6}}>{f.rating}/5</span>
            </div>
          </div>
          <p className="text-sm text-muted mt-1">👨‍🏫 {f.faculty?.name} · {f.subject?.department} · {new Date(f.createdAt).toLocaleDateString()}</p>
          {f.comment && <p className="text-sm mt-2" style={{ color:'var(--text-secondary)', fontStyle:'italic' }}>"{f.comment}"</p>}
          {(f.teachingQuality || f.subjectClarity || f.availability) && (
            <div className="flex gap-3 mt-2" style={{ flexWrap:'wrap' }}>
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

// ── Student Dashboard Shell ────────────────────────────────────────────────
const StudentDashboard = () => (
  <div className="dashboard-layout">
    <Sidebar />
    <main className="main-content">
      <Routes>
        <Route index   element={<StudentOverview />} />
        <Route path="submit"  element={<SubmitFeedback />} />
        <Route path="history" element={<FeedbackHistory />} />
      </Routes>
    </main>
  </div>
);

export default StudentDashboard;
