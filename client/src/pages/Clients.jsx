import { useEffect, useState } from 'react';
import Modal from '../components/Modal.jsx';
import { api } from '../api.js';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.list('clients').then(setClients).catch((e) => setError(e.message));
  useEffect(load, []);

  const remove = async (id) => {
    try { await api.remove('clients', id); load(); } catch (e) { setError(e.message); }
  };

  const save = async (form) => {
    const payload = { name: form.name, email: form.email, phone: form.phone, tags: form.tags, notes: form.notes };
    try {
      if (form._id) await api.update('clients', form._id, payload);
      else await api.create('clients', payload);
      setEditing(null); load();
    } catch (e) { setError(e.message); }
  };

  return (
    <div>
      <div className="page-head">
        <h1>Clients</h1>
        <button className="btn primary" onClick={() => setEditing({})}>+ New client</button>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="card-grid">
        {clients.map((c) => (
          <div key={c._id} className="card">
            <div className="card-head">
              <strong>{c.name}</strong>
              <span className="row-actions">
                <button className="icon-btn" onClick={() => setEditing(c)}>✎</button>
                <button className="icon-btn danger" onClick={() => remove(c._id)}>🗑</button>
              </span>
            </div>
            <p className="muted">{c.email || '—'}</p>
            <p className="muted small">{c.phone || '—'}</p>
            <p className="small">{c.notes}</p>
            <div className="tags">{(c.tags ?? []).map((t) => <span key={t} className="tag">{t}</span>)}</div>
          </div>
        ))}
      </div>
      {editing && (
        <Modal title={editing._id ? 'Edit client' : 'New client'} onClose={() => setEditing(null)}>
          <ClientForm client={editing} onSave={save} />
        </Modal>
      )}
    </div>
  );
}

function ClientForm({ client, onSave }) {
  const [form, setForm] = useState({
    _id: client._id,
    name: client.name ?? '',
    email: client.email ?? '',
    phone: client.phone ?? '',
    tags: client.tags ?? [],
    notes: client.notes ?? '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form className="stack" onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
      <label>Name <input required value={form.name} onChange={(e) => set('name', e.target.value)} /></label>
      <div className="two-col">
        <label>Email <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></label>
        <label>Phone <input value={form.phone} onChange={(e) => set('phone', e.target.value)} /></label>
      </div>
      <label>Tags <span className="muted small">(comma separated)</span>
        <input value={form.tags.join(', ')} onChange={(e) => set('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))} />
      </label>
      <label>Notes <textarea rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} /></label>
      <div className="form-actions">
        <button type="submit" className="btn primary">Save client</button>
      </div>
    </form>
  );
}
