import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  lang: { type: String, enum: ['en', 'hi'], default: 'en' },
  // topicId -> true once all quiz answers were correct (checked on the server)
  progress: { type: Map, of: Boolean, default: {} },
}, { timestamps: true });
export default mongoose.model('User', userSchema);
