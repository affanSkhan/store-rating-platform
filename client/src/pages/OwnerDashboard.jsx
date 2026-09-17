import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../lib/api';
import RatingStars from '../components/RatingStars';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [error, setError] = useState('');

  async function load() {
    setError('');
    try { const { data } = await api.get('/owner/dashboard', { params: { name, email, sortOrder } }); setData(data); }
    catch (err) { setError(getErrorMessage(err)); }
  }
  useEffect(() => { load(); }, [sortOrder]);

  return (
    <>
      <div className="page-header"><div><div className="eyebrow">Store owner</div><h1>Store performance</h1><p>See who rated your store and how the overall score is trending.</p></div></div>
      {error && <div className="error">{error}</div>}
      {data && <div className="hero"><div className="panel hero-card"><div className="eyebrow">Your store</div><h2>{data.store.name}</h2><p>{data.store.address}</p><div className="muted" style={{ marginTop: 14, fontSize: 13 }}>{data.totalRatings} submitted rating(s)</div></div><div className="panel hero-card hero-score"><div className="score">{data.averageRating ? data.averageRating.toFixed(1) : '—'}</div><RatingStars value={data.averageRating || 0} /><div className="meta">Average store rating</div></div></div>}
      <section className="panel"><div className="panel-pad"><div className="eyebrow">Rating activity</div><h2 style={{ margin: 0 }}>Customers who submitted ratings</h2><div className="controls" style={{ marginTop: 14 }}><input className="input grow" placeholder="Search by user name" value={name} onChange={e => setName(e.target.value)} /><input className="input grow" placeholder="Search by email" value={email} onChange={e => setEmail(e.target.value)} /><button className="button primary" onClick={load}>Search</button><button className="button secondary" onClick={() => setSortOrder(v => v === 'asc' ? 'desc' : 'asc')}>Updated {sortOrder === 'asc' ? '↑' : '↓'}</button></div></div><div className="table-wrap"><table><thead><tr>{['name','email','address','value','updatedAt'].map(field => <th key={field}><button className="sort-button" onClick={() => { if (sortBy === field) setSortOrder(v => v === 'asc' ? 'desc' : 'asc'); else { setSortBy(field); setSortOrder('asc'); } }}>{field === 'value' ? 'Rating' : field === 'updatedAt' ? 'Updated' : field.charAt(0).toUpperCase() + field.slice(1)} {sortBy === field ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}</button></th>)}</tr></thead><tbody>{data?.ratings?.slice().sort((a,b) => { const av = sortBy === 'value' ? a.value : sortBy === 'updatedAt' ? new Date(a.updatedAt).getTime() : a.user[sortBy]; const bv = sortBy === 'value' ? b.value : sortBy === 'updatedAt' ? new Date(b.updatedAt).getTime() : b.user[sortBy]; return String(av).localeCompare(String(bv), undefined, { numeric: true }) * (sortOrder === 'asc' ? 1 : -1); }).map(row => <tr key={row.id}><td><strong>{row.user.name}</strong></td><td>{row.user.email}</td><td>{row.user.address}</td><td><div className="rating-cell"><RatingStars value={row.value} /><span className="rating-number">{row.value}/5</span></div></td><td>{new Date(row.updatedAt).toLocaleDateString()}</td></tr>)}{data && data.ratings.length === 0 && <tr><td colSpan="5" className="empty">No ratings match the current filters.</td></tr>}{!data && !error && <tr><td colSpan="5" className="loading">Loading dashboard…</td></tr>}</tbody></table></div></section>
    </>
  );
}
