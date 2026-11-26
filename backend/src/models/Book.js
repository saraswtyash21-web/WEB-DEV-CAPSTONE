import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180, index: 'text' },
  author: { type: String, required: true, trim: true, maxlength: 120, index: true },
  category: { type: String, required: true, trim: true, maxlength: 80, index: true },
  isbn: { type: String, trim: true, uppercase: true, sparse: true, unique: true, set: (value) => typeof value === 'string' && value.trim() ? value.trim().toUpperCase() : undefined },
  description: { type: String, trim: true, maxlength: 2000, default: '' },
  coverUrl: { type: String, trim: true, default: '' },
  totalCopies: { type: Number, required: true, min: 1, default: 1, validate: Number.isInteger },
  availableCopies: { type: Number, required: true, min: 0, default: 1, validate: Number.isInteger }
}, { timestamps: true });

bookSchema.index({ title: 1, author: 1, category: 1 });
export default mongoose.model('Book', bookSchema, 'books');
