// backend/routes/invoiceRoutes.js
import express from 'express';
import Invoice from '../models/Invoice.js';

const router = express.Router();

// GET all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new invoice
router.post('/', async (req, res) => {
  try {
    const newInvoice = new Invoice(req.body);
    const savedInvoice = await newInvoice.save();
    res.status(201).json(savedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE an invoice
router.delete('/:id', async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE an invoice
router.put('/:id', async (req, res) => {
  try {
    // findByIdAndUpdate takes the ID, the new data, and {new: true} tells it to return the updated document
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true } 
    );
    res.status(200).json(updatedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



export default router;