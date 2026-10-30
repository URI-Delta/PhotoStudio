import { Router } from 'express';
import StaffMember from '../models/StaffMember.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const staff = await StaffMember.find().sort({ role: 1, name: 1 });
    res.json(staff);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const member = await StaffMember.create(req.body);
    res.status(201).json(member);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const member = await StaffMember.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!member) return res.status(404).json({ error: 'Staff member not found' });
    res.json(member);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const member = await StaffMember.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ error: 'Staff member not found' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
