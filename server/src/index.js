import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import { seedIfEmpty } from './seed.js';
import clientsRouter from './routes/clients.js';
import packagesRouter from './routes/packages.js';
import staffRoutes from './routes/staff.js';
import bookingsRoutes from './routes/bookings.js';
import statsRoutes from './routes/stats.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'photosphere-api' }));

app.use('/api/clients', clientsRouter);
app.use('/api/packages', packagesRouter);
app.use('/api/staff', staffRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/stats', statsRoutes);

// basic error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[api]', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

try {
  await connectDB();
  await seedIfEmpty();
  app.listen(PORT, () => console.log(`[api] listening on http://localhost:${PORT}`));
} catch (e) {
  console.error('Fatal startup error:', e);
  process.exit(1);
}
