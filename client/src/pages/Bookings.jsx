import { useEffect, useState } from 'react';
import Modal from '../components/Modal.jsx';
import { api } from '../api.js';

const STATUSES = ['scheduled', 'confirmed', 'completed', 'cancelled'];
const fmtDate = (d) => new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState([]);
  const [packages, setPackages] = useState([]);
  const [staff, setStaff] = useState([]);
  const [editing, setEditing] = useState(null); // null | {} | existing booking
  const [error, setError] = useState('');

  const load = () => api.list('bookings').then(setBookings).catch((e) => setError(e.message));

  useEffect(() => {
    load();
    api.list('clients').then(setClients).catch(console.error);
    api.list('packages').then(setPackages).catch(console.error);
    api.list('staff').then(setStaff).catch(console.error);
  }, []);

  const remove = async (id) => {
    try { await api.remove('bookings', id); load(); } catch (e) { setError(e.message); }
  };

  const cycleStatus = async (b, status) => {
    try { await api.update('bookings', b._id, { ...b, pkg: b.pkg?._id ?? b.pkg, client: b.client?._id ?? b.client, staff: (b.staff ?? []).map((s) => s._id ?? s), status }); load(); }
    catch (e) { setError(e.message); }
  };

  const save = async (form) => {
    const payload = {
      client: form.client, pkg: form.pkg, staff: form.staff,
      date: new Date(form.date).toISOString(), status: form.status,
      location: form.location, notes: form.notes,
    };
    try {
      if (form._id) await api.update('bookings', form._id, payload);
      else await api.create('bookings', payload);
      setEditing(null); load();
    } catch (e) { setError(e.message); }
  };

  return (
    <div>
      <div className="page-head">
        <h1>Bookings</h1>
        <button className="btn primary" onClick={() => setEditing({})}>+ New booking</button>
      </div>
      {error && <p className="error">{error}</p>}
      <section className="panel">
        {bookings.length === 0 && <p className="muted">No bookings yet.</p>}
        {bookings.length > 0 && (
          <table>
            <thead>
              <tr><th>Client</th><th>Packages</th><th>When</th><th>Crew</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td><strong>{b.client?.name ?? '—'}</strong><br /><span className="muted small">{b.location}</span></td>
                  <td>{b.pkg?.name}<br /><span className="muted small">${b.pkg?.price}</span></td>
                  <td>{fmtDate(b.date)}</td>
                  <td className="muted small">{(b.staff ?? []).map((s) => s.name).join(', ') || '—'}</td>
                  <td>
                    <select className={`status ${b.status}`} value={b.status} onChange={(e) => cycleStatus(b, e.target.value)}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="row-actions">
                    <button className="icon-btn" title="Edit" onClick={() => setEditing(b)}>✎</button>
                    <button className="icon-btn danger" title="Delete" onClick={() => remove(b._id)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {editing && (
        <Modal title={editing._id ? 'Edit booking' : 'New booking'} onClose={() => setEditing(null)}>
          <BookingForm booking={editing} clients={clients} packages={packages} staff={staff} onSave={save} />
        </Modal>
      )}
    </div>
  );
}

function BookingForm({ booking, clients, packages, staff, onSave }) {
  const [form, setForm] = useState({
    _id: booking._id,
    client: booking.client?._id ?? booking.client ?? '',
    pkg: booking.pkg?._id ?? booking.pkg ?? '',
    staff: (booking.staff ?? []).map((s) => s._id ?? s),
    date: booking.date ? toLocalInput(booking.date) : toLocalInput(new Date(Date.now() + 86400000).toISOString()),
    status: booking.status ?? 'scheduled',
    location: booking.location ?? 'Studio A',
    notes: booking.notes ?? '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form
      className="stack"
      onSubmit={(e) => { e.preventDefault(); onSave(form); }}
    >
      <label>Client
        <select required value={form.client} onChange={(e) => set('client', e.target.value)}>
          <option value="" disabled>Select a client…</option>
          {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </label>
      <label>Package
        <select required value={form.pkg} onChange={(e) => set('pkg', e.target.value)}>
          <option value="" disabled>Select a package…</option>
          {packages.map((p) => <option key={p._id} value={p._id}>{p.name} — ${p.price}</option>)}
        </select>
      </label>
      <label>Crew
        <select multiple size={4} value={form.staff} onChange={(e) => set('staff', [...e.target.selectedOptions].map((o) => o.value))}>
          {staff.map((s) => <option key={s._id} value={s._id}>{s.name} — {s.role}</option>)}
        </select>
      </label>
      <label>Date & time
        <input type="datetime-local" required value={form.date} onChange={(e) => set('date', e.target.value)} />
      </label>
      <div className="two-col">
        <label>Status
          <select value={form.status} onChange={(e) => set('status', e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label>Location
          <input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Studio A" />
        </label>
      </div>
      <label>Notes
        <textarea rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
      </label>
      <div className="form-actions">
        <button type="submit" className="btn primary">Save booking</button>
      </div>
    </form>
  );
}
