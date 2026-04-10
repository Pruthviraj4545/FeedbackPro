import { useState, useEffect } from 'react';
import { getAdminUsers, createAdminUser, deleteAdminUser, toggleUserStatus } from '../../services/api';
import toast from 'react-hot-toast';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name:'', email:'', password:'', department:'', rollNumber:'' });

  const load = async () => {
    try { const { data } = await getAdminUsers('student'); setStudents(data.data); }
    catch { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createAdminUser({ ...form, role: 'student' });
      toast.success('Student added!');
      setShowModal(false);
      setForm({ name:'', email:'', password:'', department:'', rollNumber:'' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this student?')) return;
    try { await deleteAdminUser(id); toast.success('Deleted'); load(); }
    catch { toast.error('Error deleting'); }
  };

  const handleToggle = async (id) => {
    try { await toggleUserStatus(id); load(); }
    catch { toast.error('Error'); }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.rollNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="topbar">
        <div className="topbar-title"><h1>Manage Students</h1><p>{students.length} students registered</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>➕ Add Student</button>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Student List</h2>
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input placeholder="Search students…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {loading ? <div className="spinner-wrap"><div className="spinner"/></div> : (
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>Name</th><th>Email</th><th>Roll No</th><th>Department</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">🎓</div><h3>No students found</h3></div></td></tr>
                ) : filtered.map(s => (
                  <tr key={s._id}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.rollNumber || '—'}</td>
                    <td>{s.department || '—'}</td>
                    <td><span className={`badge ${s.isActive ? 'badge-green' : 'badge-red'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-secondary btn-sm" onClick={() => handleToggle(s._id)}>
                          {s.isActive ? '🚫 Deactivate' : '✅ Activate'}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Add New Student</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              {[['Full Name','name','text','Aditya Kumar'],['Email','email','email','aditya@example.com'],['Password','password','password','Min. 6 chars'],['Department','department','text','Computer Science'],['Roll Number','rollNumber','text','CS21001']].map(([label,name,type,ph]) => (
                <div className="form-group" key={name}>
                  <label className="form-label">{label}</label>
                  <input className="form-input" type={type} placeholder={ph} required={['name','email','password'].includes(name)}
                    value={form[name]} onChange={e => setForm({...form,[name]:e.target.value})} />
                </div>
              ))}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Student</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminStudents;
