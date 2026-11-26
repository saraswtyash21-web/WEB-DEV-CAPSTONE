import Book from '../models/Book.js';
import IssueRecord from '../models/IssueRecord.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listBooks = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 12));
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.available === 'true') filter.availableCopies = { $gt: 0 };
  const search = String(req.query.search || '').trim();
  if (search) filter.$or = ['title', 'author', 'category', 'isbn'].map((key) => ({ [key]: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }));
  const [books, total] = await Promise.all([Book.find(filter).sort({ title: 1 }).skip((page - 1) * limit).limit(limit), Book.countDocuments(filter)]);
  res.json({ books, page, pages: Math.ceil(total / limit), total });
});

export const getBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found.' });
  res.json({ book });
});

export const getBookStats = asyncHandler(async (req, res) => {
  const [stats] = await Book.aggregate([{ $group: { _id: null, titles: { $sum: 1 }, availableCopies: { $sum: '$availableCopies' } } }]);
  res.json({ titles: stats?.titles || 0, availableCopies: stats?.availableCopies || 0 });
});

export const createBook = asyncHandler(async (req, res) => {
  const { title, author, category, totalCopies = 1, isbn, description, coverUrl } = req.body;
  if (!title || !author || !category) return res.status(400).json({ message: 'Title, author and category are required.' });
  const book = await Book.create({ title, author, category, totalCopies, availableCopies: totalCopies, isbn, description, coverUrl });
  res.status(201).json({ book });
});

export const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found.' });
  const { totalCopies, availableCopies, ...updates } = req.body;
  Object.assign(book, updates);
  if (totalCopies !== undefined) {
    const borrowed = book.totalCopies - book.availableCopies;
    if (Number(totalCopies) < borrowed) return res.status(400).json({ message: `At least ${borrowed} total copies are currently issued.` });
    book.totalCopies = Number(totalCopies);
    book.availableCopies = book.totalCopies - borrowed;
  }
  await book.save();
  res.json({ book });
});

export const deleteBook = asyncHandler(async (req, res) => {
  const active = await IssueRecord.exists({ book: req.params.id, returnedAt: null });
  if (active) return res.status(409).json({ message: 'This book has active loans and cannot be deleted yet.' });
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found.' });
  res.json({ message: 'Book deleted.' });
});
