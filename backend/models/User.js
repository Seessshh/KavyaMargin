// backend/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userRole: { type: String, required: true },
  contactNo: { type: String, required: true },
  address: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('User', userSchema);