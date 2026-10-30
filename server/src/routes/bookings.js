import { Router } from 'express';
import Booking from '../models/Booking.js';

const router = Router();

const populateAll = (q) =>
  q
    .populate('client', 'name email phone')
    .populate('pkg', 'name price durationHours')
    .populate('staff', 'name role');

router.get('/', async (req, res, next) => {
  try {
    const { status, from, to } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    const bookings = await populateAll(Booking.find(filter)).sort({ date: -1 });
    res.json(bookings);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const booking = await Booking.create(req.body);
    res.status(201).json(await populateAll(Booking.findById(booking._id)));
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(await populateAll(Booking.findById(booking._id)));
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
