import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  head: {
    type: String,
    required: true,
    trim: true
  },
  budget: {
    type: String,
    trim: true,
    default: '₹0'
  }
}, { timestamps: true });

const Department = mongoose.model('Department', departmentSchema);

export default Department;