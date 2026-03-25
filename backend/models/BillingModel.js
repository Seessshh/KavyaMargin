import mongoose from 'mongoose';

const billingModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  margin: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, { timestamps: true });

const BillingConfig = mongoose.model('BillingConfig', billingModelSchema);

export default BillingConfig;