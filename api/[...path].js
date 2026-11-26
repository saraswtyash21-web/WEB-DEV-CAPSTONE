import 'dotenv/config';
import app from '../backend/src/app.js';
import { connectDB } from '../backend/src/config/db.js';

let databaseReady;

export default async function handler(req, res) {
  databaseReady ||= connectDB();
  try {
    await databaseReady;
  } catch (error) {
    databaseReady = undefined;
    console.error('Database connection failed:', error.message);
    return res.status(503).json({ message: 'Database is temporarily unavailable.' });
  }
  return app(req, res);
}
