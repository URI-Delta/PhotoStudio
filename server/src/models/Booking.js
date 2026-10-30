import mongoose from 'mongoose';

export const BOOKING_STATUSES = ['scheduled', 'confirmed', 'completed', 'cancelled'];

const bookingSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    pkg: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    staff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StaffMember' }],
    date: { type: Date, required: true },
    status: { type: String, enum: BOOKING_STATUSES, default: 'scheduled' },
    location: { type: String, default: 'Studio A' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

bookingSchema.virtual('amount').get(function () {
  return this.pkg?.price ?? null;
});

export default mongoose.model('Booking', bookingSchema);
