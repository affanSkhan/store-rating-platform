import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../lib/api';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function update(key, value) { setForm(prev => ({ ...prev, [key]: value })); }

  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    try { await signup(form); navigate('/stores'); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card panel">
        <div className="brand" style={{ marginBottom: 22 }}><span className="brand-mark">R</span><span>Rating Hub</span></div>
        <div className="eyebrow">Customer registration</div>
        <h1>Create your account</h1>
        <p>Sign up as a normal user and start rating stores.</p>
        {error && <div className="error">{error}</div>}
        <form className="form-grid" onSubmit={submit}>
          <div className="form-field"><label>Full name</label><input className="input" value={form.name} onChange={e => update('name', e.target.value)} minLength={20} maxLength={60} required /><span className="helper">20–60 characters</span></div>
          <div className="form-field"><label>Email</label><input className="input" type="email" value={form.email} onChange={e => update('email', e.target.value)} required /></div>
          <div className="form-field"><label>Address</label><textarea className="textarea" value={form.address} onChange={e => update('address', e.target.value)} maxLength={400} required /></div>
          <div className="form-field"><label>Password</label><input className="input" type="password" value={form.password} onChange={e => update('password', e.target.value)} minLength={8} maxLength={16} required /><span className="helper">8–16 chars · one uppercase · one special character</span></div>
          <button className="button primary" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
        </form>
        <div className="auth-switch">Already registered? <Link to="/login">Back to sign in</Link></div>
      </div>
    </div>
  );
}
