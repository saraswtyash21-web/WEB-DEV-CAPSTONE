import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ErrorMessage } from '../components/Toast';

export default function AuthPage({ mode = 'login' }) {
  const isRegister = mode === 'register';
  const { user, signIn, register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (loading) return <div className="screen-loading">Loading…</div>;
  if (user) return <Navigate to="/" replace />;
  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    try { isRegister ? await register(form.name, form.email, form.password) : await signIn(form.email, form.password); navigate('/'); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <div className="auth-screen"><section className="auth-art"><NavBrand /><div className="auth-art-copy"><span className="eyebrow">A BETTER WAY TO BORROW</span><h1>Knowledge has<br /><em>a place.</em></h1><p>Discover, borrow and keep track of the books that move you.</p><div className="quote-card"><span>“</span><p>A library is not a luxury but one of the necessities of life.</p><small>— Henry Ward Beecher</small></div></div><span className="auth-foot">YOUR CAMPUS, YOUR LIBRARY.</span></section><section className="auth-panel"><div className="auth-form-wrap"><span className="eyebrow">CAMPUS LIBRARY PORTAL</span><h2>{isRegister ? 'Create your account' : 'Welcome back'}</h2><p className="muted">{isRegister ? 'Sign up to explore the collection and track your loans.' : 'Sign in to pick up where your reading left off.'}</p><ErrorMessage>{error}</ErrorMessage><form onSubmit={submit} className="form-stack">{isRegister && <label>Your name<input required minLength="2" maxLength="80" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Aanya Sharma" /></label>}<label>College email<input required type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@college.edu" /></label><label>Password<input required type="password" minLength="8" autoComplete={isRegister ? 'new-password' : 'current-password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={isRegister ? 'At least 8 characters' : 'Enter your password'} /></label><button className="button button-primary button-wide" disabled={busy}>{busy ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'} <span>→</span></button></form><p className="auth-switch">{isRegister ? 'Already have an account?' : 'New to CampusLibrary?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create account'}</Link></p><small className="auth-note">Librarian and admin accounts are created by the library administrator.</small></div></section></div>;
}
function NavBrand() { return <Link to="/login" className="brand brand-on-dark"><span className="brand-mark">CL</span><span>Campus<span className="brand-light">Library</span></span></Link>; }
