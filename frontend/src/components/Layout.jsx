import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const staff = ['admin', 'librarian'].includes(user?.role);
  async function logout() { await signOut(); navigate('/login'); }
  return <div className="app-shell">
    <aside className="sidebar">
      <NavLink to="/" className="brand"><span className="brand-mark">CL</span><span>Campus<span className="brand-light">Library</span></span></NavLink>
      <div className="side-label">YOUR SPACE</div>
      <nav className="nav-list">
        <NavLink to="/" end className="nav-link"><span>⌂</span> Overview</NavLink>
        <NavLink to="/books" className="nav-link"><span>▤</span> Browse books</NavLink>
        <NavLink to="/loans" className="nav-link"><span>↗</span> {staff ? 'Loan desk' : 'My loans'}</NavLink>
        {staff && <NavLink to="/reports" className="nav-link"><span>▥</span> Reports</NavLink>}
        {user?.role === 'admin' && <NavLink to="/team" className="nav-link"><span>♙</span> Library team</NavLink>}
      </nav>
      <div className="sidebar-bottom"><div className="help-card"><span className="help-icon">✳</span><strong>Need a hand?</strong><small>Ask the library team for help finding your next read.</small></div><div className="profile-row"><div className="avatar">{user?.name?.[0]?.toUpperCase()}</div><div className="profile-info"><strong>{user?.name}</strong><small>{user?.role}</small></div><button className="icon-button" aria-label="Sign out" title="Sign out" onClick={logout}>↗</button></div></div>
    </aside>
    <main className="main-area"><header className="topbar"><div className="breadcrumbs">CampusLibrary <span>/</span> <b>Library portal</b></div><div className="topbar-right"><span className="status-dot"></span> Library services online <span className="topbar-divider"></span><div className="avatar avatar-small">{user?.name?.[0]?.toUpperCase()}</div></div></header><div className="page-content"><Outlet /></div></main>
  </div>;
}
