import mongoose from 'mongoose';

const ROLES = ['Photographer', 'Assistant', 'Editor', 'Studio Manager'];

const staffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ROLES, default: 'Photographer' },
    specialty: { type: String, default: '' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export { ROLES };
export default mongoose.model('StaffMember', staffSchema);
