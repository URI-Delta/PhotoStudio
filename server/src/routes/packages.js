import { Router } from 'express';
import Package from '../models/Package.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const packages = await Package.find().sort({ price: 1 });
    res.json(packages);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const pkg = await Package.create(req.body);
    res.status(201).json(pkg);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pkg) return res.status(404).json({ error: 'Package not found' });
    res.json(pkg);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);
    if (!pkg) return res.status(404).json({ error: 'Package not found' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
