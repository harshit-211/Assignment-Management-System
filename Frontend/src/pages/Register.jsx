import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create your account. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-2xl mb-1">Create an account</h1>
        <p className="text-ink/60 text-sm mb-8">Join JoinEazy as a student or professor</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full name</label>
            <input
              required
              value={form.name}
              onChange={update('name')}
              className="w-full border border-line rounded px-3 py-2 text-sm bg-white focus:border-forest"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={update('email')}
              className="w-full border border-line rounded px-3 py-2 text-sm bg-white focus:border-forest"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={update('password')}
              className="w-full border border-line rounded px-3 py-2 text-sm bg-white focus:border-forest"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">I am a</label>
            <div className="flex gap-3">
              {['student', 'admin'].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setForm({ ...form, role: r })}
                  className={`flex-1 border rounded py-2 text-sm capitalize ${
                    form.role === r
                      ? 'border-forest bg-forest-light text-forest-dark font-medium'
                      : 'border-line text-ink/70'
                  }`}
                >
                  {r === 'admin' ? 'Professor' : 'Student'}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-brick text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-forest text-paper rounded py-2.5 text-sm font-medium hover:bg-forest-dark disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-ink/60 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-forest font-medium underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
