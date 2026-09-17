import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';

export default function GroupDetail() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadGroup();
  }, [id]);

  async function loadGroup() {
    try {
      const { data } = await api.get(`/groups/${id}`);
      setGroup(data);
    } catch {
      setError('Could not load this group.');
    }
  }

  async function handleAddMember(e) {
    e.preventDefault();
    setAdding(true);
    setMessage('');
    setError('');
    try {
      await api.post(`/groups/${id}/members`, { email });
      setEmail('');
      setMessage('Member added.');
      loadGroup();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not add that member.');
    } finally {
      setAdding(false);
    }
  }

  if (!group) {
    return <p className="text-ink/50 text-sm">{error || 'Loading…'}</p>;
  }

  return (
    <div className="max-w-4xl">
      <Link to="/dashboard" className="text-sm text-forest underline underline-offset-2">
        ← My groups
      </Link>

      <h2 className="font-serif text-2xl mt-3 mb-1">{group.name}</h2>
      <p className="text-ink/60 text-sm mb-8">{group.members.length} member(s)</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-line rounded bg-white p-5">
          <h3 className="font-medium text-sm mb-3">Members</h3>
          <ul className="flex flex-col gap-2">
            {group.members.map((m) => (
              <li key={m.id} className="flex justify-between text-sm border-b border-line/60 pb-2 last:border-0 last:pb-0">
                <span>{m.name}</span>
                <span className="text-ink/50">{m.email}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-line rounded bg-white p-5">
          <h3 className="font-medium text-sm mb-3">Add a member</h3>
          <form onSubmit={handleAddMember} className="flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="student@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-line rounded px-3 py-2 text-sm focus:border-forest"
            />
            <button
              type="submit"
              disabled={adding}
              className="bg-forest text-paper text-sm font-medium px-4 py-2 rounded hover:bg-forest-dark disabled:opacity-50 self-start"
            >
              {adding ? 'Adding…' : 'Add'}
            </button>
          </form>
          {message && <p className="text-forest text-sm mt-3">{message}</p>}
          {error && <p className="text-brick text-sm mt-3">{error}</p>}
        </div>
      </div>
    </div>
  );
}
