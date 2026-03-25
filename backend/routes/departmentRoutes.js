import express from 'express';
import Department from '../models/Department.js';

const router = express.Router();

// GET: Fetch all departments
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 });
    res.status(200).json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// POST: Add a new department
router.post('/', async (req, res) => {
  try {
    const { name, head, budget } = req.body;

    const newDept = new Department({
      name,
      head,
      budget: budget || '₹0'
    });

    const savedDept = await newDept.save();
    res.status(201).json(savedDept);
  } catch (error) {
    console.error("Error saving department:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// DELETE: Remove a department
router.delete('/:id', async (req, res) => {
  try {
    const deletedDept = await Department.findByIdAndDelete(req.params.id);
    if (!deletedDept) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;