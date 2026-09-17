import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import ProgressBar from '../components/ProgressBar.jsx';
import StatusPill from '../components/StatusPill.jsx';
import ConfirmSubmissionModal from '../components/ConfirmSubmissionModal.jsx';

export default function StudentAssignments() {
  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState('');
  const [progress, setProgress] = useState({ assignments: [], progress: { total: 0, confirmed: 0 } });
  const [loading, setLoading] = useState(true);
  const [activeAssignment, setActiveAssignment] = useState(null);

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (groupId) loadProgress(groupId);
  }, [groupId]);

  async function loadGroups() {
    const { data } = await api.get('/groups/mine');
    setGroups(data);
    if (data.length > 0) setGroupId(String(data[0].id));
    else setLoading(false);
  }

  async function loadProgress(id) {
    setLoading(true);
    const { data } = await api.get(`/submissions/group/${id}`);
    setProgress(data);
    setLoading(false);
  }

  function handleConfirmed() {
    setActiveAssignment(null);
    loadProgress(groupId);
  }

  if (groups.length === 0 && !loading) {
    return (
      <div className="border border-dashed border-line rounded p-8 text-center max-w-md">
        <p className="text-ink/60 text-sm">
          Join or create a group first — assignments are tracked per group.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl">Assignments</h2>
          <p className="text-ink/60 text-sm mt-1">Confirm submissions once your group's work is uploaded</p>
        </div>
        {groups.length > 1 && (
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className="border border-line rounded px-3 py-2 text-sm bg-white"
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        )}
      </div>

      {!loading && (
        <div className="border border-line rounded bg-white p-4 mb-6">
          <ProgressBar confirmed={progress.progress.confirmed} total={progress.progress.total} />
        </div>
      )}

      {loading ? (
        <p className="text-ink/50 text-sm">Loading…</p>
      ) : progress.assignments.length === 0 ? (
        <div className="border border-dashed border-line rounded p-8 text-center">
          <p className="text-ink/60 text-sm">No assignments posted for this group yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {progress.assignments.map((a) => (
            <div key={a.assignment_id} className="border border-line rounded bg-white p-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-medium">{a.title}</h3>
                <p className="text-ink/50 text-xs mt-1">
                  Due {new Date(a.due_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={a.onedrive_link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-forest underline underline-offset-2"
                >
                  OneDrive link
                </a>
                <StatusPill status={a.status} />
                {a.status !== 'confirmed' && (
                  <button
                    onClick={() => setActiveAssignment(a)}
                    className="text-sm text-forest font-medium underline underline-offset-2"
                  >
                    Confirm
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeAssignment && (
        <ConfirmSubmissionModal
          assignment={{ id: activeAssignment.assignment_id, title: activeAssignment.title }}
          groupId={groupId}
          onClose={() => setActiveAssignment(null)}
          onConfirmed={handleConfirmed}
        />
      )}
    </div>
  );
}
