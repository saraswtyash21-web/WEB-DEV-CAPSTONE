import Book from '../models/Book.js';
import IssueRecord from '../models/IssueRecord.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const POPULATE = [{ path: 'student', select: 'name email' }, { path: 'book', select: 'title author category coverUrl' }, { path: 'issuedBy', select: 'name' }];
const isStaff = (user) => ['admin', 'librarian'].includes(user.role);

export const listIssues = asyncHandler(async (req, res) => {
  const filter = isStaff(req.user) ? {} : { student: req.user.id };
  if (req.query.status === 'active') filter.returnedAt = null;
  if (req.query.status === 'returned') filter.returnedAt = { $ne: null };
  if (req.query.overdue === 'true') { filter.returnedAt = null; filter.dueDate = { $lt: new Date() }; }
  const issues = await IssueRecord.find(filter).populate(POPULATE).sort({ createdAt: -1 }).limit(500);
  res.json({ issues });
});

export const createIssue = asyncHandler(async (req, res) => {
  const { bookId } = req.body;
  const studentId = req.user.role === 'student' ? req.user.id : req.body.studentId;
  if (!studentId || !bookId || (req.user.role !== 'student' && !req.body.dueDate)) return res.status(400).json({ message: 'Student, book and due date are required.' });
  const due = req.user.role === 'student' ? new Date(Date.now() + 14 * 86_400_000) : new Date(req.body.dueDate);
  if (Number.isNaN(due.getTime()) || due <= new Date()) return res.status(400).json({ message: 'Due date must be in the future.' });
  const [student, book] = await Promise.all([User.findById(studentId), Book.findById(bookId)]);
  if (!student || student.role !== 'student') return res.status(404).json({ message: 'Student account not found.' });
  if (!book) return res.status(404).json({ message: 'Book not found.' });
  const alreadyBorrowed = await IssueRecord.exists({ student: studentId, book: bookId, returnedAt: null });
  if (alreadyBorrowed) return res.status(409).json({ message: 'This student already has an active loan for this book.' });
  const reserved = await Book.findOneAndUpdate({ _id: bookId, availableCopies: { $gt: 0 } }, { $inc: { availableCopies: -1 } }, { new: true });
  if (!reserved) return res.status(409).json({ message: 'No copies of this book are currently available.' });
  try {
    const issue = await IssueRecord.create({ student: studentId, book: bookId, issuedBy: req.user.id, dueDate: due });
    await issue.populate(POPULATE);
    res.status(201).json({ issue });
  } catch (error) {
    await Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: 1 } });
    throw error;
  }
});

export const returnBook = asyncHandler(async (req, res) => {
  const now = new Date();
  const existing = await IssueRecord.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Loan record not found.' });
  if (!isStaff(req.user) && String(existing.student) !== req.user.id) return res.status(403).json({ message: 'You can only return your own books.' });
  if (existing.returnedAt) return res.status(409).json({ message: 'This book has already been returned.' });
  const lateDays = Math.max(0, Math.ceil((now - existing.dueDate) / 86_400_000));
  const configuredRate = Number(process.env.LATE_FEE_PER_DAY || 5);
  const rate = Number.isFinite(configuredRate) && configuredRate >= 0 ? configuredRate : 5;
  const issue = await IssueRecord.findOneAndUpdate({ _id: req.params.id, returnedAt: null }, { $set: { returnedAt: now, fineAmount: lateDays * rate } }, { new: true });
  if (!issue) return res.status(409).json({ message: 'This book has already been returned.' });
  await Book.findByIdAndUpdate(issue.book, { $inc: { availableCopies: 1 } });
  await issue.populate(POPULATE);
  res.json({ issue, lateDays, fine: issue.fineAmount, fineRatePerDay: rate });
});

export const getReports = asyncHandler(async (req, res) => {
  const today = new Date();
  const [mostBorrowed, overdue, activeCount, bookCount, studentCount, totalFines] = await Promise.all([
    IssueRecord.aggregate([{ $group: { _id: '$book', borrowCount: { $sum: 1 } } }, { $sort: { borrowCount: -1 } }, { $limit: 5 }, { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'book' } }, { $unwind: '$book' }, { $project: { _id: 0, title: '$book.title', author: '$book.author', borrowCount: 1 } }]),
    IssueRecord.find({ returnedAt: null, dueDate: { $lt: today } }).populate([{ path: 'student', select: 'name email' }, { path: 'book', select: 'title author' }]).sort({ dueDate: 1 }).limit(100),
    IssueRecord.countDocuments({ returnedAt: null }), Book.countDocuments(), User.countDocuments({ role: 'student' }),
    IssueRecord.aggregate([{ $match: { returnedAt: { $ne: null } } }, { $group: { _id: null, amount: { $sum: '$fineAmount' } } }])
  ]);
  res.json({ summary: { activeLoans: activeCount, books: bookCount, students: studentCount, finesAssessed: totalFines[0]?.amount || 0 }, mostBorrowed, overdue });
});
