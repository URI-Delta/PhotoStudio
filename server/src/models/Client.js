import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    tags: { type: [String], default: [] },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Client', clientSchema);
