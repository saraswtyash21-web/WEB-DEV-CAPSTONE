import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listStudents = asyncHandler(async (req, res) => {
  const students = await User.find({ role: 'student' }).select('name email').sort({ name: 1 }).limit(500);
  res.json({ students: students.map((student) => ({ id: student.id, name: student.name, email: student.email })) });
});
