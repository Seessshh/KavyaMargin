// backend/models/BillingRate.js
import mongoose from 'mongoose';

const billingRateSchema = new mongoose.Schema({
  role: { type: String, required: true },
  offshore: { type: Number, required: true },
  onshore: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

export default mongoose.model('BillingRate', billingRateSchema);