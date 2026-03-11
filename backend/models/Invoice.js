// backend/models/Invoice.js
import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  client: { type: String, required: true },
  project: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Overdue'], 
    default: 'Pending' 
  }
}, { timestamps: true });

export default mongoose.model('Invoice', invoiceSchema);