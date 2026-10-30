import { useEffect, useState } from 'react';
import Modal from '../components/Modal.jsx';
import { api } from '../api.js';

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.list('packages').then(setPackages).catch((e) => setError(e.message));
  useEffect(load, []);

  const remove = async (id) => {
    try { await api.remove('packages', id); load(); } catch (e) { setError(e.message); }
  };

  const save = async (form) => {
    const payload = {
      name: form.name, price: Number(form.price), durationHours: Number(form.durationHours),
      description: form.description, includes: form.includes, active: form.active,
    };
    try {
      if (form._id) await api.update('packages', form._id, payload);
      else await api.create('packages', payload);
      setEditing(null); load();
    } catch (e) { setError(e.message); }
  };

  return (
    <div>
      <div className="page-head">
        <h1>Packages</h1>
        <button className="btn primary" onClick={() => setEditing({})}>+ New package</button>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="card-grid">
        {packages.map((p) => (
          <div key={p._id} className={`card price-card ${p.active ? '' : 'inactive'}`}>
            <div className="card-head">
              <strong>{p.name}</strong>
              <span className="row-actions">
                <button className="icon-btn" onClick={() => setEditing(p)}>✎</button>
                <button className="icon-btn danger" onClick={() => remove(p._id)}>🗑</button>
              </span>
            </div>
            <div className="price-row">
              <span className="price">${p.price}</span>
              <span className="muted">{p.durationHours}h session</span>
            </div>
            <p className="small">{p.description}</p>
            <ul className="includes">
              {(p.includes ?? []).map((i) => <li key={i}>{i}</li>)}
            </ul>
            {!p.active && <span className="tag">inactive</span>}
          </div>
        ))}
      </div>
      {editing && (
        <Modal title={editing._id ? 'Edit package' : 'New package'} onClose={() => setEditing(null)}>
          <PackageForm pkg={editing} onSave={save} />
        </Modal>
      )}
    </div>
  );
}

function PackageForm({ pkg, onSave }) {
  const [form, setForm] = useState({
    _id: pkg._id,
    name: pkg.name ?? '',
    price: pkg.price ?? '',
    durationHours: pkg.durationHours ?? 1,
    description: pkg.description ?? '',
    includes: pkg.includes ?? [],
    active: pkg.active ?? true,
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form className="stack" onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
      <label>Name <input required value={form.name} onChange={(e) => set('name', e.target.value)} /></label>
      <div className="two-col">
        <label>Price ($) <input required type="number" min="0" step="1" value={form.price} onChange={(e) => set('price', e.target.value)} /></label>
        <label>Duration (h) <input required type="number" min="0.5" step="0.5" value={form.durationHours} onChange={(e) => set('durationHours', e.target.value)} /></label>
      </div>
      <label>Description <textarea rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} /></label>
      <label>Includes <span className="muted small">(comma separated)</span>
        <input value={form.includes.join(', ')} onChange={(e) => set('includes', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))} />
      </label>
      <label className="check">
        <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} />
          Active (bookable)
      </label>
      <div className="form-actions">
        <button type="submit" className="btn primary">Save package</button>
      </div>
    </form>
  );
}
