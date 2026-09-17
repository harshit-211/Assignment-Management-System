import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not sign in. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-2xl mb-1">JoinEazy</h1>
        <p className="text-ink/60 text-sm mb-8">Sign in to your workspace</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-line rounded px-3 py-2 text-sm bg-white focus:border-forest"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-line rounded px-3 py-2 text-sm bg-white focus:border-forest"
            />
          </div>

          {error && <p className="text-brick text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-forest text-paper rounded py-2.5 text-sm font-medium hover:bg-forest-dark disabled:opacity-50 mt-2"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-sm text-ink/60 mt-6">
          New here?{' '}
          <Link to="/register" className="text-forest font-medium underline underline-offset-2">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
