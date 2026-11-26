import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /.+@.+\..+/ },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['student', 'librarian', 'admin'], default: 'student' },
  refreshTokenHash: { type: String, select: false, default: null }
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
});
userSchema.methods.comparePassword = function (candidate) { return bcrypt.compare(candidate, this.password); };
userSchema.methods.toSafeJSON = function () { return { id: this.id, name: this.name, email: this.email, role: this.role }; };

export default mongoose.model('User', userSchema, 'users');
