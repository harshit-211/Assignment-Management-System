import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function navClass({ isActive }) {
  return `block px-4 py-2.5 rounded text-sm font-medium transition-colors ${
    isActive ? 'bg-forest text-paper' : 'text-paper/80 hover:bg-forest-dark hover:text-paper'
  }`;
}

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-60 shrink-0 bg-ink min-h-screen flex flex-col justify-between py-6">
      <div>
        <div className="px-4 mb-8">
          <h1 className="font-serif text-xl text-paper leading-tight">JoinEazy</h1>
          <p className="text-paper/50 text-xs mt-1">
            {user?.role === 'admin' ? 'Professor console' : 'Student workspace'}
          </p>
        </div>

        <nav className="px-2 flex flex-col gap-1">
          {user?.role === 'admin' ? (
            <NavLink to="/admin" end className={navClass}>
              Assignments
            </NavLink>
          ) : (
            <>
              <NavLink to="/dashboard" end className={navClass}>
                My groups
              </NavLink>
              <NavLink to="/assignments" className={navClass}>
                Assignments
              </NavLink>
            </>
          )}
        </nav>
      </div>

      <div className="px-4">
        <p className="text-paper/60 text-xs mb-2 truncate">{user?.email}</p>
        <button
          onClick={logout}
          className="text-sm text-paper/80 hover:text-paper underline underline-offset-2"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
