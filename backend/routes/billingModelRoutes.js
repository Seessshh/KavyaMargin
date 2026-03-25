import express from 'express';
import BillingConfig from '../models/BillingModel.js';

const router = express.Router();

// GET: Fetch all billing models
router.get('/', async (req, res) => {
  try {
    const models = await BillingConfig.find().sort({ createdAt: -1 });
    res.status(200).json(models);
  } catch (error) {
    console.error("Error fetching billing models:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// POST: Add a new billing model
router.post('/', async (req, res) => {
  try {
    const { name, margin, description, status } = req.body;

    const newModel = new BillingConfig({
      name,
      margin,
      description,
      status: status || 'Active'
    });

    const savedModel = await newModel.save();
    res.status(201).json(savedModel);
  } catch (error) {
    console.error("Error saving billing model:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// DELETE: Remove a billing model
router.delete('/:id', async (req, res) => {
  try {
    const deletedModel = await BillingConfig.findByIdAndDelete(req.params.id);
    if (!deletedModel) {
      return res.status(404).json({ message: "Model not found" });
    }
    res.status(200).json({ message: "Model deleted successfully" });
  } catch (error) {
    console.error("Error deleting billing model:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;