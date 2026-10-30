import Client from './models/Client.js';
import Package from './models/Package.js';
import StaffMember from './models/StaffMember.js';
import Booking from './models/Booking.js';

export async function seedIfEmpty() {
  if ((await Client.countDocuments()) > 0) return;

  const clients = await Client.create([
    { name: 'Amara Osei', email: 'amara.osei@email.com', phone: '+1 415 555 0134', tags: ['portrait', 'recurring'], notes: 'Prefers warm tones, books quarterly family shoots.' },
    { name: 'Dixit & Arjun Patel', email: 'patels@email.com', phone: '+1 415 555 0177', tags: ['wedding'], notes: 'Engagement shoot booked — wedding later this year.' },
    { name: 'Lume Skincare', email: 'brand@lume.co', phone: '+1 415 555 0121', tags: ['commercial'], notes: 'Product catalog, monthly retainer.' },
    { name: 'Jason Marlow', email: 'j.marlow@email.com', phone: '+1 415 555 0189', tags: ['headshots'], notes: 'LinkedIn headshots for a 6-person sales team.' },
    { name: 'Nia Kimathi', email: 'nia.k@email.com', phone: '+1 415 555 0152', tags: ['portrait'], notes: 'Piano performance portraits.' },
  ]);

  const packages = await Package.create([
    { name: 'Family Portrait', price: 249, durationHours: 1, description: 'One-hour studio session for up to five people.', includes: ['1 location', '10 retouched images', 'Online gallery'] },
    { name: 'Wedding Essentials', price: 1899, durationHours: 8, description: 'Full-day coverage with a two-photographer team.', includes: ['2 photographers', '300+ edited images', 'Sneak peek in 48h'] },
    { name: 'Product Catalog', price: 549, durationHours: 3, description: 'Lifestyle and white-background product shots.', includes: ['Lighting setup', '20 SKUs', 'Commercial usage rights'] },
    { name: 'Team Headshots', price: 399, durationHours: 2, description: 'Consistent headshots for small teams.', includes: ['Up to 8 people', 'Hair/mirror station', 'Same-day proofs'] },
    { name: 'Performance Portraits', price: 329, durationHours: 1.5, description: 'Stage-inspired portraits of musicians and dancers.', includes: ['Smoke/haze rig', '15 retouched images'] },
  ]);

  const staff = await StaffMember.create([
    { name: 'Rosa Delgado', role: 'Photographer', specialty: 'Weddings & events' },
    { name: 'Ken Whitfield', role: 'Photographer', specialty: 'Commercial lighting' },
    { name: 'Mira Soltani', role: 'Assistant', specialty: 'Set & props' },
    { name: 'Theo Braun', role: 'Editor', specialty: 'Color grading' },
    { name: 'Priya Nair', role: 'Studio Manager', specialty: 'Scheduling & client care' },
  ]);

  const now = new Date();
  const day = (offset, hour, min = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    d.setHours(hour, min, 0, 0);
    return d;
  };

  await Booking.create([
    { client: clients[0]._id, pkg: packages[0]._id, staff: [staff[0]._id, staff[2]._id], date: day(1, 10), status: 'confirmed', location: 'Studio A', notes: 'Two young kids — keep backdrops simple.' },
    { client: clients[1]._id, pkg: packages[1]._id, staff: [staff[0]._id, staff[1]._id], date: day(4, 14), status: 'scheduled', location: 'On location', notes: 'Golden-hour engagement, Bay Bridge overlook.' },
    { client: clients[2]._id, pkg: packages[2]._id, staff: [staff[1]._id], date: day(6, 9, 30), status: 'confirmed', location: 'Studio B', notes: 'Serum lineup refresh, ship samples ahead.' },
    { client: clients[3]._id, pkg: packages[3]._id, staff: [staff[0]._id, staff[3]._id], date: day(-3, 11), status: 'completed', location: 'Studio A' },
    { client: clients[4]._id, pkg: packages[4]._id, staff: [staff[2]._id, staff[3]._id], date: day(-8, 16), status: 'completed', location: 'Studio A', notes: 'Haze rig requested.' },
    { client: clients[0]._id, pkg: packages[0]._id, staff: [staff[0]._id], date: day(-15, 10), status: 'completed', location: 'Studio A' },
    { client: clients[3]._id, pkg: packages[2]._id, staff: [staff[1]._id], date: day(9, 13), status: 'cancelled', location: 'Studio B', notes: 'Client pushed to next quarter.' },
    { client: clients[2]._id, pkg: packages[3]._id, staff: [staff[1]._id, staff[2]._id], date: day(-1, 15), status: 'completed', location: 'Studio A' },
  ]);

  console.log('[seed] demo data created');
}
