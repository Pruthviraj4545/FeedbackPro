import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navConfig = {
  admin: [
    { label: 'Dashboard', icon: '📊', to: '/admin' },
    { label: 'Students',  icon: '🎓', to: '/admin/students' },
    { label: 'Faculty',   icon: '👨‍🏫', to: '/admin/faculty' },
    { label: 'Subjects',  icon: '📚', to: '/admin/subjects' },
    { label: 'Feedback',  icon: '💬', to: '/admin/feedback' },
  ],
  student: [
    { label: 'Dashboard',   icon: '🏠', to: '/student' },
    { label: 'Submit Feedback', icon: '✍️', to: '/student/submit' },
    { label: 'My Feedback', icon: '📋', to: '/student/history' },
  ],
  faculty: [
    { label: 'Dashboard',  icon: '📊', to: '/faculty' },
    { label: 'My Subjects',icon: '📚', to: '/faculty/subjects' },
    { label: 'Feedback',   icon: '💬', to: '/faculty/feedback' },
    { label: 'Analytics',  icon: '📈', to: '/faculty/analytics' },
  ],
};

const roleLabel = { admin: 'Administrator', student: 'Student', faculty: 'Faculty' };

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = navConfig[user?.role] || [];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || '?';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🎓</div>
        <div className="sidebar-logo-text">
          <h2>FeedbackPro</h2>
          <p>Review System</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-section-label">Navigation</p>
        {links.map(({ label, icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin' || to === '/student' || to === '/faculty'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div className="user-card-info" style={{ flex: 1, overflow: 'hidden' }}>
            <h4 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</h4>
            <p>{roleLabel[user?.role]}</p>
          </div>
        </div>
        <button
          className="btn btn-danger btn-full mt-2"
          style={{ fontSize: '0.82rem' }}
          onClick={handleLogout}
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
