import { useEffect, useState } from 'react';
import Studio3D from '../components/Studio3D.jsx';
import { api } from '../api.js';

const money = (n) => `$${(n ?? 0).toLocaleString()}`;
const fmtDate = (d) =>
  new Date(d).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Dashboard({ go }) {
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    api.stats().then(setStats).catch(console.error);
    api
      .list('bookings', { from: new Date().toISOString().slice(0, 10) })
      .then((bs) => setUpcoming(bs.filter((b) => b.status !== 'cancelled').sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 6)))
      .catch(console.error);
  }, []);

  const maxDay = Math.max(1, ...(stats?.weekdayCounts ?? [0]));

  return (
    <div>
      <section className="hero">
        <Studio3D className="hero-canvas" />
        <div className="hero-overlay">
          <p className="hero-kicker">PhotoSphere Studio Manager</p>
          <h1>Your set, lit and booked.</h1>
          <p className="hero-sub">
            Clients, sessions, crew and packages in one place — the studio floor you see
            there is rendered live with three.js. Drag to look around.
          </p>
          <button className="btn primary" onClick={() => go('bookings')}>Manage bookings</button>
        </div>
      </section>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Clients</span>
          <span className="stat-value">{stats ? stats.totalClients : '—'}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Sessions booked</span>
          <span className="stat-value">{stats ? stats.totalBookings : '—'}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Upcoming sessions</span>
          <span className="stat-value">{stats ? stats.upcomingCount : '—'}</span>
        </div>
        <div className="stat-card accent">
          <span className="stat-label">Revenue this month</span>
          <span className="stat-value">{stats ? money(stats.revenueThisMonth) : '—'}</span>
        </div>
      </div>

      <div className="dash-cols">
        <section className="panel">
          <h2>Upcoming sessions</h2>
          {upcoming.length === 0 && <p className="muted">Nothing on the calendar — time to shoot some promos.</p>}
          {upcoming.map((b) => (
            <div key={b._id} className="row">
              <div className="row-main">
                <strong>{b.client?.name ?? 'Client'}</strong>
                <span className="muted">{b.pkg?.name} · {b.location}</span>
              </div>
              <div className="row-side">
                <span className="badge">{b.status}</span>
                <span className="muted small">{fmtDate(b.date)}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="panel">
          <h2>Session load · last 4 weeks</h2>
          <div className="bars">
            {(stats?.weekdayCounts ?? [0, 0, 0, 0, 0, 0, 0]).map((c, i) => (
              <div key={i} className="bar-col">
                <div className="bar-track">
                  <div className="bar-fill" style={{ height: `${(c / maxDay) * 100}%` }}>
                    <span className="bar-count">{c}</span>
                  </div>
                </div>
                <span className="bar-label">{WEEKDAYS[i]}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
