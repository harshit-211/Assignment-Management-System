import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

export default function StudentDashboard() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    setLoading(true);
    try {
      const { data } = await api.get('/groups/mine');
      setGroups(data);
    } catch {
      setError('Could not load your groups.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      await api.post('/groups', { name });
      setName('');
      setShowForm(false);
      loadGroups();
    } catch {
      setError('Could not create the group.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl">My groups</h2>
          <p className="text-ink/60 text-sm mt-1">Groups you've created or joined</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-forest text-paper text-sm font-medium px-4 py-2 rounded hover:bg-forest-dark"
        >
          {showForm ? 'Cancel' : 'New group'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 border border-line rounded p-4 bg-white flex gap-3">
          <input
            autoFocus
            required
            placeholder="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border border-line rounded px-3 py-2 text-sm focus:border-forest"
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-forest text-paper text-sm font-medium px-4 py-2 rounded hover:bg-forest-dark disabled:opacity-50"
          >
            {creating ? 'Creating…' : 'Create'}
          </button>
        </form>
      )}

      {error && <p className="text-brick text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-ink/50 text-sm">Loading…</p>
      ) : groups.length === 0 ? (
        <div className="border border-dashed border-line rounded p-8 text-center">
          <p className="text-ink/60 text-sm">
            You're not in any groups yet. Create one to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {groups.map((g) => (
            <Link
              key={g.id}
              to={`/groups/${g.id}`}
              className="block border border-line rounded p-4 bg-white hover:border-forest transition-colors"
            >
              <h3 className="font-medium">{g.name}</h3>
              <p className="text-ink/50 text-xs mt-1">
                Created {new Date(g.created_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
