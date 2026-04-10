import { useState, useEffect } from 'react';
import {
  getAdminSubjects, createAdminSubject, updateAdminSubject, deleteAdminSubject,
  getAdminUsers,
} from '../../services/api';
import toast from 'react-hot-toast';

const AdminSubjects = () => {
  const [subjects, setSubjects]   = useState([]);
  const [faculty,  setFaculty]    = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem,  setEditItem]  = useState(null);
  const [form, setForm] = useState({ name:'', code:'', department:'', semester:'', faculty:'' });

  const load = async () => {
    const [s, f] = await Promise.all([getAdminSubjects(), getAdminUsers('faculty')]);
    setSubjects(s.data.data);
    setFaculty(f.data.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openAdd  = ()    => { setEditItem(null); setForm({ name:'',code:'',department:'',semester:'',faculty:'' }); setShowModal(true); };
  const openEdit = (sub) => { setEditItem(sub); setForm({ name:sub.name, code:sub.code, department:sub.department, semester:sub.semester, faculty:sub.faculty?._id||'' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await updateAdminSubject(editItem._id, form);
        toast.success('Subject updated!');
      } else {
        await createAdminSubject(form);
        toast.success('Subject created!');
      }
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this subject and all its feedback?')) return;
    try { await deleteAdminSubject(id); toast.success('Deleted'); load(); }
    catch { toast.error('Error'); }
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title"><h1>Manage Subjects</h1><p>{subjects.length} subjects</p></div>
        <button className="btn btn-primary" onClick={openAdd}>➕ Add Subject</button>
      </div>

      <div className="card">
        <div className="card-header"><h2 className="card-title">Subject List</h2></div>
        {loading ? <div className="spinner-wrap"><div className="spinner"/></div> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Name</th><th>Code</th><th>Department</th><th>Sem</th><th>Faculty</th><th>Actions</th></tr></thead>
              <tbody>
                {subjects.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">📚</div><h3>No subjects yet</h3></div></td></tr>
                ) : subjects.map(s => (
                  <tr key={s._id}>
                    <td>{s.name}</td>
                    <td><span className="badge badge-purple">{s.code}</span></td>
                    <td>{s.department}</td>
                    <td style={{textAlign:'center'}}>{s.semester}</td>
                    <td>{s.faculty ? s.faculty.name : <span className="badge badge-amber">Unassigned</span>}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)}>✏️ Edit</button>
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
              <span className="modal-title">{editItem ? 'Edit Subject' : 'Add Subject'}</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Subject Name</label>
                <input className="form-input" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Data Structures" />
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div className="form-group">
                  <label className="form-label">Subject Code</label>
                  <input className="form-input" required value={form.code} onChange={e=>setForm({...form,code:e.target.value})} placeholder="CS301" />
                </div>
                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <select className="form-select" required value={form.semester} onChange={e=>setForm({...form,semester:e.target.value})}>
                    <option value="">Select</option>
                    {[1,2,3,4,5,6,7,8].map(n=><option key={n} value={n}>Semester {n}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input className="form-input" required value={form.department} onChange={e=>setForm({...form,department:e.target.value})} placeholder="Computer Science" />
              </div>
              <div className="form-group">
                <label className="form-label">Assign Faculty</label>
                <select className="form-select" value={form.faculty} onChange={e=>setForm({...form,faculty:e.target.value})}>
                  <option value="">— Unassigned —</option>
                  {faculty.map(f=><option key={f._id} value={f._id}>{f.name} ({f.department})</option>)}
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editItem ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSubjects;
