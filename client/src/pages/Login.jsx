import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../lib/api';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) navigate('/'); }, [user, navigate]);

  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      const loggedIn = await login(email, password);
      navigate(loggedIn.role === 'ADMIN' ? '/admin' : loggedIn.role === 'STORE_OWNER' ? '/owner' : '/stores');
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card panel">
        <div className="brand" style={{ marginBottom: 22 }}><span className="brand-mark">R</span><span>Rating Hub</span></div>
        <div className="eyebrow">Shared access</div>
        <h1>Sign in to Rating Hub</h1>
        <p>One login for customers, store owners, and administrators.</p>
        {error && <div className="error">{error}</div>}
        <form className="form-grid" onSubmit={submit}>
          <div className="form-field"><label>Email</label><input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div className="form-field"><label>Password</label><input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          <button className="button primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <div className="auth-switch">New customer? <Link to="/signup">Create an account</Link></div>
        <div className="helper" style={{ marginTop: 14, display: 'flex', gap: 8 }}><ShieldCheck size={15} /> Role-based access is applied after authentication.</div>
      </div>
    </div>
  );
}
