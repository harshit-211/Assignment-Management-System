import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

const emptyForm = { title: '', description: '', due_date: '', onedrive_link: '', target_type: 'all' };

export default function AdminDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const [{ data: a }, { data: s }] = await Promise.all([
        api.get('/assignments'),
        api.get('/analytics/summary'),
      ]);
      setAssignments(a);
      setSummary(s);
    } catch (err) {
      console.error('Dashboard load failed:', err.response?.status, err.response?.data);
    }
 }

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/assignments', form);
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create the assignment.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl">Assignments</h2>
          <p className="text-ink/60 text-sm mt-1">
            {summary ? `${summary.completion_rate_percent}% overall completion across ${summary.total_assignments} assignment(s)` : ''}
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-forest text-paper text-sm font-medium px-4 py-2 rounded hover:bg-forest-dark"
        >
          {showForm ? 'Cancel' : 'New assignment'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="max-w-xl border border-line rounded bg-white p-5 mb-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              required
              value={form.title}
              onChange={update('title')}
              className="w-full border border-line rounded px-3 py-2 text-sm focus:border-forest"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={update('description')}
              className="w-full border border-line rounded px-3 py-2 text-sm focus:border-forest"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Due date</label>
              <input
                type="datetime-local"
                required
                value={form.due_date}
                onChange={update('due_date')}
                className="w-full border border-line rounded px-3 py-2 text-sm focus:border-forest"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">OneDrive link</label>
              <input
                type="url"
                required
                placeholder="https://..."
                value={form.onedrive_link}
                onChange={update('onedrive_link')}
                className="w-full border border-line rounded px-3 py-2 text-sm focus:border-forest"
              />
            </div>
          </div>

          {error && <p className="text-brick text-sm">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="bg-forest text-paper text-sm font-medium px-4 py-2 rounded hover:bg-forest-dark disabled:opacity-50 self-start"
          >
            {saving ? 'Posting…' : 'Post assignment'}
          </button>
          <p className="text-ink/40 text-xs">
            Posted to all groups. Group-specific targeting can be added from the assignment detail view.
          </p>
        </form>
      )}

      {assignments.length === 0 ? (
        <div className="border border-dashed border-line rounded p-8 text-center">
          <p className="text-ink/60 text-sm">No assignments posted yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {assignments.map((a) => (
            <Link
              key={a.id}
              to={`/admin/assignments/${a.id}`}
              className="block border border-line rounded bg-white p-4 hover:border-forest transition-colors"
            >
              <h3 className="font-medium">{a.title}</h3>
              <p className="text-ink/50 text-xs mt-1">
                Due {new Date(a.due_date).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
