import { useEffect, useState } from 'react';
import { Plus, Store as StoreIcon, Users, Star } from 'lucide-react';
import { api, getErrorMessage } from '../lib/api';
import SortableHeader from '../components/SortableHeader';
import RatingStars from '../components/RatingStars';

const emptyUser = { name: '', email: '', address: '', password: '', role: 'USER' };
const emptyStore = { name: '', email: '', address: '', ownerId: '' };

function Modal({ title, onClose, children }) {
  return <div className="modal-backdrop"><div className="modal panel"><div className="modal-head"><h2>{title}</h2><button className="close" onClick={onClose}>✕</button></div>{children}</div></div>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState({ items: [], pagination: { page: 1, pageSize: 8, total: 0, pageCount: 0 } });
  const [stores, setStores] = useState({ items: [], pagination: { page: 1, pageSize: 8, total: 0, pageCount: 0 } });
  const [userFilters, setUserFilters] = useState({ name: '', email: '', address: '', role: '', sortBy: 'name', sortOrder: 'asc', page: 1, pageSize: 8 });
  const [storeFilters, setStoreFilters] = useState({ name: '', email: '', address: '', sortBy: 'name', sortOrder: 'asc', page: 1, pageSize: 8 });
  const [modal, setModal] = useState(null);
  const [userForm, setUserForm] = useState(emptyUser);
  const [storeForm, setStoreForm] = useState(emptyStore);
  const [owners, setOwners] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [detail, setDetail] = useState(null);

  async function loadStats() { const { data } = await api.get('/admin/dashboard'); setStats(data); }
  async function loadUsers() { const { data } = await api.get('/admin/users', { params: userFilters }); setUsers(data); }
  async function loadStores() { const { data } = await api.get('/admin/stores', { params: storeFilters }); setStores(data); }
  async function loadOwners() {
    const { data } = await api.get('/admin/users', { params: { role: 'STORE_OWNER', page: 1, pageSize: 50, sortBy: 'name', sortOrder: 'asc' } });
    setOwners(data.items);
  }

  useEffect(() => { Promise.all([loadStats(), loadUsers(), loadStores(), loadOwners()]).catch(err => setError(getErrorMessage(err))); }, []);
  useEffect(() => { loadUsers().catch(err => setError(getErrorMessage(err))); }, [userFilters]);
  useEffect(() => { loadStores().catch(err => setError(getErrorMessage(err))); }, [storeFilters]);

  function sortUser(field) { setUserFilters(prev => ({ ...prev, page: 1, sortBy: field, sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc' })); }
  function sortStore(field) { setStoreFilters(prev => ({ ...prev, page: 1, sortBy: field, sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc' })); }
  function changeFilter(setter, key, value) { setter(prev => ({ ...prev, [key]: value, page: 1 })); }

  async function createUser(e) {
    e.preventDefault(); setError('');
    try { await api.post('/admin/users', userForm); setNotice('User created successfully.'); setModal(null); setUserForm(emptyUser); await Promise.all([loadUsers(), loadOwners(), loadStats()]); }
    catch (err) { setError(getErrorMessage(err)); }
  }
  async function createStore(e) {
    e.preventDefault(); setError('');
    try { await api.post('/admin/stores', { ...storeForm, ownerId: storeForm.ownerId || undefined }); setNotice('Store created successfully.'); setModal(null); setStoreForm(emptyStore); await Promise.all([loadStores(), loadStats()]); }
    catch (err) { setError(getErrorMessage(err)); }
  }
  async function showDetail(id) { setError(''); try { const { data } = await api.get(`/admin/users/${id}`); setDetail(data); } catch (err) { setError(getErrorMessage(err)); } }

  return (
    <>
      <div className="page-header"><div><div className="eyebrow">System administrator</div><h1>Platform overview</h1><p>Keep an eye on the platform and manage its core records.</p></div><div className="inline-form"><button className="button secondary" onClick={() => setModal('store')}><Plus size={15} /> Store</button><button className="button primary" onClick={() => setModal('user')}><Plus size={15} /> User</button></div></div>
      {notice && <div className="success">{notice}</div>}
      {error && <div className="error">{error}</div>}
      <div className="stats">
        <div className="panel stat-card"><div className="stat-label"><Users size={14} /> Users</div><div className="stat-value">{stats?.totalUsers ?? '—'}</div><div className="stat-foot">All registered accounts</div></div>
        <div className="panel stat-card"><div className="stat-label"><StoreIcon size={14} /> Stores</div><div className="stat-value">{stats?.totalStores ?? '—'}</div><div className="stat-foot">Stores available on the platform</div></div>
        <div className="panel stat-card"><div className="stat-label"><Star size={14} /> Ratings</div><div className="stat-value">{stats?.totalRatings ?? '—'}</div><div className="stat-foot">Ratings submitted so far</div></div>
      </div>

      <section className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-pad"><div className="eyebrow">People</div><h2 style={{ margin: 0 }}>Users</h2><p className="muted" style={{ marginTop: 5 }}>Normal users and administrators are listed here; store owners remain available through the complete user-detail view.</p><div className="controls" style={{ marginTop: 14 }}>
          <input className="input grow" placeholder="Name" value={userFilters.name} onChange={e => changeFilter(setUserFilters, 'name', e.target.value)} />
          <input className="input grow" placeholder="Email" value={userFilters.email} onChange={e => changeFilter(setUserFilters, 'email', e.target.value)} />
          <input className="input grow" placeholder="Address" value={userFilters.address} onChange={e => changeFilter(setUserFilters, 'address', e.target.value)} />
          <select className="select" value={userFilters.role} onChange={e => changeFilter(setUserFilters, 'role', e.target.value)}><option value="">Normal + admin</option><option value="USER">Normal user</option><option value="ADMIN">Admin</option><option value="STORE_OWNER">Store owner</option></select>
        </div></div>
        <div className="table-wrap"><table><thead><tr><th><SortableHeader label="Name" field="name" {...userFilters} onSort={sortUser} /></th><th><SortableHeader label="Email" field="email" {...userFilters} onSort={sortUser} /></th><th><SortableHeader label="Address" field="address" {...userFilters} onSort={sortUser} /></th><th><SortableHeader label="Role" field="role" {...userFilters} onSort={sortUser} /></th><th></th></tr></thead><tbody>{users.items.map(user => <tr key={user.id}><td><strong>{user.name}</strong></td><td>{user.email}</td><td>{user.address}</td><td><span className={`badge ${user.role.toLowerCase().replace('_','-')}`}>{user.role.replace('_',' ')}</span></td><td><button className="small-button" onClick={() => showDetail(user.id)}>Details</button></td></tr>)}{!users.items.length && <tr><td colSpan="5" className="empty">No users matched the current filters.</td></tr>}</tbody></table></div>
        <div className="pagination"><span>{users.pagination.total} result(s)</span><div className="pagination-actions"><button className="small-button" disabled={userFilters.page <= 1} onClick={() => setUserFilters(prev => ({...prev, page: prev.page - 1}))}>Previous</button><button className="small-button" disabled={userFilters.page >= users.pagination.pageCount} onClick={() => setUserFilters(prev => ({...prev, page: prev.page + 1}))}>Next</button></div></div>
      </section>

      <section className="panel">
        <div className="panel-pad"><div className="eyebrow">Store registry</div><h2 style={{ margin: 0 }}>Stores</h2><p className="muted" style={{ marginTop: 5 }}>Search and sort the registered stores and their calculated average rating.</p><div className="controls" style={{ marginTop: 14 }}>
          <input className="input grow" placeholder="Name" value={storeFilters.name} onChange={e => changeFilter(setStoreFilters, 'name', e.target.value)} />
          <input className="input grow" placeholder="Email" value={storeFilters.email} onChange={e => changeFilter(setStoreFilters, 'email', e.target.value)} />
          <input className="input grow" placeholder="Address" value={storeFilters.address} onChange={e => changeFilter(setStoreFilters, 'address', e.target.value)} />
        </div></div>
        <div className="table-wrap"><table><thead><tr><th><SortableHeader label="Name" field="name" {...storeFilters} onSort={sortStore} /></th><th><SortableHeader label="Email" field="email" {...storeFilters} onSort={sortStore} /></th><th><SortableHeader label="Address" field="address" {...storeFilters} onSort={sortStore} /></th><th>Rating</th><th>Owner</th></tr></thead><tbody>{stores.items.map(store => <tr key={store.id}><td><strong>{store.name}</strong></td><td>{store.email}</td><td>{store.address}</td><td><div className="rating-cell"><RatingStars value={store.rating || 0} /><span className="rating-number">{store.rating ? store.rating.toFixed(1) : '—'}</span></div></td><td>{store.owner?.name || <span className="muted">Unassigned</span>}</td></tr>)}{!stores.items.length && <tr><td colSpan="5" className="empty">No stores matched the current filters.</td></tr>}</tbody></table></div>
        <div className="pagination"><span>{stores.pagination.total} result(s)</span><div className="pagination-actions"><button className="small-button" disabled={storeFilters.page <= 1} onClick={() => setStoreFilters(prev => ({...prev, page: prev.page - 1}))}>Previous</button><button className="small-button" disabled={storeFilters.page >= stores.pagination.pageCount} onClick={() => setStoreFilters(prev => ({...prev, page: prev.page + 1}))}>Next</button></div></div>
      </section>

      {detail && <Modal title="User details" onClose={() => setDetail(null)}><div className="detail-grid"><div className="detail-item"><span>Name</span><strong>{detail.name}</strong></div><div className="detail-item"><span>Email</span><strong>{detail.email}</strong></div><div className="detail-item"><span>Address</span><strong>{detail.address}</strong></div><div className="detail-item"><span>Role</span><strong>{detail.role.replace('_',' ')}</strong></div></div>{detail.store && <div className="panel panel-pad" style={{ marginTop: 14 }}><div className="eyebrow">Owned store</div><strong>{detail.store.name}</strong><div className="muted" style={{ marginTop: 4 }}>{detail.store.address}</div><div className="rating-cell" style={{ marginTop: 12 }}><RatingStars value={detail.store.rating || 0} /><span>{detail.store.rating ? `${detail.store.rating.toFixed(1)} average` : 'No ratings yet'}</span></div></div>}</Modal>}
      {modal === 'user' && <Modal title="Add user" onClose={() => setModal(null)}><form className="form-grid" onSubmit={createUser}><div className="form-field"><label>Name</label><input className="input" minLength="20" maxLength="60" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} required /></div><div className="form-field"><label>Email</label><input className="input" type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} required /></div><div className="form-field"><label>Address</label><textarea className="textarea" maxLength="400" value={userForm.address} onChange={e => setUserForm({...userForm, address: e.target.value})} required /></div><div className="form-field"><label>Password</label><input className="input" type="password" minLength="8" maxLength="16" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} required /></div><div className="form-field"><label>Role</label><select className="select" value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})}><option value="USER">Normal user</option><option value="ADMIN">Admin</option><option value="STORE_OWNER">Store owner</option></select></div><div className="form-actions"><button className="button secondary" type="button" onClick={() => setModal(null)}>Cancel</button><button className="button primary">Create user</button></div></form></Modal>}
      {modal === 'store' && <Modal title="Add store" onClose={() => setModal(null)}><form className="form-grid" onSubmit={createStore}><div className="form-field"><label>Store name</label><input className="input" value={storeForm.name} onChange={e => setStoreForm({...storeForm, name: e.target.value})} required /></div><div className="form-field"><label>Email</label><input className="input" type="email" value={storeForm.email} onChange={e => setStoreForm({...storeForm, email: e.target.value})} required /></div><div className="form-field"><label>Address</label><textarea className="textarea" maxLength="400" value={storeForm.address} onChange={e => setStoreForm({...storeForm, address: e.target.value})} required /></div><div className="form-field"><label>Store owner <span className="muted">(optional)</span></label><select className="select" value={storeForm.ownerId} onChange={e => setStoreForm({...storeForm, ownerId: e.target.value})}><option value="">No owner assigned</option>{owners.map(owner => <option key={owner.id} value={owner.id}>{owner.name} · {owner.email}</option>)}</select></div><div className="form-actions"><button className="button secondary" type="button" onClick={() => setModal(null)}>Cancel</button><button className="button primary">Create store</button></div></form></Modal>}
    </>
  );
}
