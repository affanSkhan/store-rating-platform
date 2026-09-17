import { useState } from 'react';
import { api, getErrorMessage } from '../lib/api';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault(); setError(''); setNotice('');
    try {
      await api.patch('/auth/password', { currentPassword, newPassword });
      setCurrentPassword(''); setNewPassword('');
      setNotice('Your password has been updated.');
    } catch (err) { setError(getErrorMessage(err)); }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div className="page-header"><div><div className="eyebrow">Account security</div><h1>Change password</h1><p>Use a new password that meets the same policy as registration.</p></div></div>
      <div className="panel panel-pad">
        {notice && <div className="success">{notice}</div>}
        {error && <div className="error">{error}</div>}
        <form className="form-grid" onSubmit={submit}>
          <div className="form-field"><label>Current password</label><input className="input" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required /></div>
          <div className="form-field"><label>New password</label><input className="input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={8} maxLength={16} required /></div>
          <div className="form-actions"><button className="button primary">Update password</button></div>
        </form>
      </div>
    </div>
  );
}
