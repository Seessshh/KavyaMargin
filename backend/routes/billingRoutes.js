import express from 'express';
import BillingRate from '../models/BillingRate.js';

const router = express.Router();

// GET all billing rates
router.get('/', async (req, res) => {
  try {
    const rates = await BillingRate.find();
    res.status(200).json(rates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new billing rate
router.post('/', async (req, res) => {
  try {
    const newRate = new BillingRate(req.body);
    const savedRate = await newRate.save();
    res.status(201).json(savedRate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT (update) a billing rate
router.put('/:id', async (req, res) => {
  try {
    const updatedRate = await BillingRate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedRate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a billing rate
router.delete('/:id', async (req, res) => {
  try {
    await BillingRate.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Rate deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;