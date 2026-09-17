import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import RatingStars from '../components/RatingStars';
import { api, getErrorMessage } from '../lib/api';

export default function UserStores() {
  const [stores, setStores] = useState([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [draft, setDraft] = useState({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true); setError('');
    try {
      const { data } = await api.get('/stores', { params: { name, address, sortBy, sortOrder } });
      setStores(data);
      setDraft(Object.fromEntries(data.map(store => [store.id, store.myRating || 0])));
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [sortBy, sortOrder]);

  async function rate(store) {
    const value = Number(draft[store.id]);
    if (!value || value < 1 || value > 5) return;
    setError(''); setNotice('');
    try {
      await api.post(`/ratings/${store.id}`, { value });
      setNotice(`${store.name} was rated ${value}/5.`);
      await load();
    } catch (err) { setError(getErrorMessage(err)); }
  }

  function toggleSort(field) {
    if (sortBy === field) setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  }

  return (
    <>
      <div className="page-header">
        <div><div className="eyebrow">Customer view</div><h1>Find a store</h1><p>Search registered stores and leave one rating per store.</p></div>
      </div>
      {notice && <div className="success">{notice}</div>}
      {error && <div className="error">{error}</div>}
      <div className="panel panel-pad" style={{ marginBottom: 14 }}>
        <div className="controls" style={{ marginBottom: 0 }}>
          <div style={{ position: 'relative', flex: '1 1 230px' }}><Search size={16} style={{ position: 'absolute', left: 11, top: 12, color: '#98a1b1' }} /><input className="input grow" style={{ width: '100%', paddingLeft: 34 }} placeholder="Search by store name" value={name} onChange={e => setName(e.target.value)} /></div>
          <input className="input grow" placeholder="Filter by address" value={address} onChange={e => setAddress(e.target.value)} />
          <button className="button primary" onClick={load}>Search</button>
        </div>
      </div>
      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead><tr><th><button className="sort-button" onClick={() => toggleSort('name')}>Store {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}</button></th><th>Address</th><th>Overall rating</th><th>Your rating</th><th>Action</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="5" className="loading">Loading stores…</td></tr> : stores.length === 0 ? <tr><td colSpan="5" className="empty">No stores matched the current search.</td></tr> : stores.map(store => (
                <tr key={store.id}>
                  <td><strong>{store.name}</strong><div className="muted" style={{ fontSize: 11, marginTop: 3 }}>{store.email}</div></td>
                  <td>{store.address}</td>
                  <td><div className="rating-cell"><RatingStars value={store.rating || 0} /><span className="rating-number">{store.rating ? store.rating.toFixed(1) : '—'}</span></div></td>
                  <td><div className="inline-form"><select className="select" value={draft[store.id] || 0} onChange={e => setDraft(prev => ({ ...prev, [store.id]: e.target.value }))}><option value="0">Not rated</option>{[1,2,3,4,5].map(v => <option key={v} value={v}>{v} / 5</option>)}</select></div></td>
                  <td><button className="button secondary" onClick={() => rate(store)}>{store.myRating ? 'Update rating' : 'Submit rating'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
