import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function leave() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand-mark">R</span>
          <span>Rating Hub</span>
        </Link>
        <nav className="nav-links">
          {user?.role === 'ADMIN' && <NavLink to="/admin">Admin</NavLink>}
          {user?.role === 'USER' && <NavLink to="/stores">Stores</NavLink>}
          {user?.role === 'STORE_OWNER' && <NavLink to="/owner">Owner dashboard</NavLink>}
          {user && <NavLink to="/password">Password</NavLink>}
        </nav>
        {user && (
          <div className="user-menu">
            <span className="avatar"><UserRound size={16} /></span>
            <div className="user-copy">
              <strong>{user.name}</strong>
              <span>{user.role.replace('_', ' ')}</span>
            </div>
            <button className="icon-button" title="Log out" onClick={leave}><LogOut size={17} /></button>
          </div>
        )}
      </header>
      <main className="page-wrap">{children}</main>
      <footer className="site-footer">Rating Hub · Role-based store ratings</footer>
    </div>
  );
}
