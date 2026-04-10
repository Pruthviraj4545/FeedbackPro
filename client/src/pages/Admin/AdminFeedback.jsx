import { useState, useEffect } from 'react';
import { getAdminFeedback, deleteAdminFeedback } from '../../services/api';
import toast from 'react-hot-toast';

const stars = (n) => '⭐'.repeat(n) + '☆'.repeat(5 - n);

const AdminFeedback = () => {
  const [feedback, setFeedback]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterRating, setFilter] = useState('');

  const load = async () => {
    try { const { data } = await getAdminFeedback(); setFeedback(data.data); }
    catch { toast.error('Failed to load feedback'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    const reason = prompt('Reason for removing this feedback (optional):') ?? '';
    if (reason === null) return;
    try { await deleteAdminFeedback(id, { reason }); toast.success('Feedback removed'); load(); }
    catch { toast.error('Error'); }
  };

  const filtered = feedback.filter(f => {
    const matchSearch =
      f.student?.name.toLowerCase().includes(search.toLowerCase()) ||
      f.subject?.name.toLowerCase().includes(search.toLowerCase()) ||
      f.faculty?.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.comment||'').toLowerCase().includes(search.toLowerCase());
    const matchRating = filterRating ? f.rating === Number(filterRating) : true;
    return matchSearch && matchRating;
  });

  return (
    <>
      <div className="topbar">
        <div className="topbar-title"><h1>All Feedback</h1><p>{feedback.length} entries</p></div>
      </div>

      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <h2 className="card-title">Feedback List</h2>
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-select" style={{ width: 150 }} value={filterRating} onChange={e => setFilter(e.target.value)}>
              <option value="">All Ratings</option>
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ⭐</option>)}
            </select>
          </div>
        </div>

        {loading ? <div className="spinner-wrap"><div className="spinner"/></div> : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">💬</div><h3>No feedback found</h3></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Student</th><th>Subject</th><th>Faculty</th><th>Rating</th><th>Comment</th><th>Date</th><th>Action</th></tr></thead>
              <tbody>
                {filtered.map(f => (
                  <tr key={f._id}>
                    <td>
                      <div>{f.student?.name}</div>
                      <div className="text-xs text-muted">{f.student?.rollNumber}</div>
                    </td>
                    <td>
                      <div>{f.subject?.name}</div>
                      <div className="text-xs text-muted">{f.subject?.code}</div>
                    </td>
                    <td>{f.faculty?.name}</td>
                    <td>
                      <span className={`badge ${f.rating >= 4 ? 'badge-green' : f.rating === 3 ? 'badge-amber' : 'badge-red'}`}>
                        {f.rating}/5
                      </span>
                    </td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.comment || <span className="text-muted">—</span>}
                    </td>
                    <td className="text-xs">{new Date(f.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(f._id)}>🗑️ Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminFeedback;
