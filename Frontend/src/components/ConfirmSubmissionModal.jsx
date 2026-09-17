import { useState } from 'react';
import api from '../api/axios.js';

export default function ConfirmSubmissionModal({ assignment, groupId, onClose, onConfirmed }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleFirstConfirm() {
    setLoading(true);
    setError('');
    try {
      await api.post(`/submissions/${assignment.id}/confirm`, { group_id: groupId });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleFinalConfirm() {
    setLoading(true);
    setError('');
    try {
      await api.post(`/submissions/${assignment.id}/verify`, { group_id: groupId });
      onConfirmed();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-50">
      <div className="bg-paper border border-line rounded max-w-sm w-full p-6">
        <h3 className="font-serif text-lg mb-2">{assignment.title}</h3>

        {step === 1 && (
          <>
            <p className="text-sm text-ink/70 mb-5">
              Have you uploaded your group's work to the OneDrive link and are ready to mark this
              assignment as submitted?
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 border border-line rounded py-2 text-sm hover:bg-line/30"
              >
                Not yet
              </button>
              <button
                onClick={handleFirstConfirm}
                disabled={loading}
                className="flex-1 bg-forest text-paper rounded py-2 text-sm hover:bg-forest-dark disabled:opacity-50"
              >
                {loading ? 'Checking…' : 'Yes, I have submitted'}
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-sm text-ink/70 mb-5">
              This is final. Once confirmed, your professor will see this assignment as submitted
              for your group. Confirm again to finish.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 border border-line rounded py-2 text-sm hover:bg-line/30"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalConfirm}
                disabled={loading}
                className="flex-1 bg-forest text-paper rounded py-2 text-sm hover:bg-forest-dark disabled:opacity-50"
              >
                {loading ? 'Confirming…' : 'Confirm submission'}
              </button>
            </div>
          </>
        )}

        {error && <p className="text-brick text-sm mt-3">{error}</p>}
      </div>
    </div>
  );
}
