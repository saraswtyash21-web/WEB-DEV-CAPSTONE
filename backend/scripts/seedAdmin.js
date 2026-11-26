import 'dotenv/config';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';

await connectDB();
const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
  console.error('Set ADMIN_NAME, ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters in backend/.env.');
  process.exit(1);
}
const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
if (existing) console.log(`Account already exists for ${ADMIN_EMAIL}.`);
else {
  await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' });
  console.log(`Admin account created for ${ADMIN_EMAIL}.`);
}
process.exit(0);
