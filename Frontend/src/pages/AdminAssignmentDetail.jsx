import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';
import StatusPill from '../components/StatusPill.jsx';

export default function AdminAssignmentDetail() {
  const { id } = useParams();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/submissions/assignment/${id}`).then(({ data }) => {
      setRows(data);
      setLoading(false);
    });
  }, [id]);

  const confirmedCount = rows.filter((r) => r.status === 'confirmed').length;

  return (
    <div className="max-w-3xl">
      <Link to="/admin" className="text-sm text-forest underline underline-offset-2">
        ← Assignments
      </Link>

      <h2 className="font-serif text-2xl mt-3 mb-1">Submission status</h2>
      <p className="text-ink/60 text-sm mb-6">
        {loading ? 'Loading…' : `${confirmedCount} of ${rows.length} groups confirmed`}
      </p>

      {!loading && (
        <div className="border border-line rounded bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-ink/50 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Group</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Confirmed at</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.group_id} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-3">{r.group_name}</td>
                  <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                  <td className="px-4 py-3 text-ink/50">
                    {r.confirmed_at ? new Date(r.confirmed_at).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
