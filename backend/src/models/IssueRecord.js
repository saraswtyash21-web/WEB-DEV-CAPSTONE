import mongoose from 'mongoose';

const issueRecordSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issueDate: { type: Date, default: Date.now, required: true },
  dueDate: { type: Date, required: true, index: true },
  returnedAt: { type: Date, default: null },
  fineAmount: { type: Number, min: 0, default: 0 }
}, { timestamps: true });

issueRecordSchema.index({ student: 1, book: 1 }, { unique: true, partialFilterExpression: { returnedAt: null } });
issueRecordSchema.index({ returnedAt: 1, dueDate: 1 });
export default mongoose.model('IssueRecord', issueRecordSchema, 'issues');
