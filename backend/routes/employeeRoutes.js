import express from 'express';
import Employee from '../models/Employee.js';

const router = express.Router();

// --- THE BUG KILLER FUNCTION ---
// This acts as a bouncer, physically ripping the date out of the array 
// before Mongoose is allowed to look at it.
const sanitizeDate = (dateVal) => {
  if (!dateVal) return dateVal;
  if (Array.isArray(dateVal)) return dateVal;
  if (typeof dateVal === 'string' && dateVal.includes('[')) {
    const match = dateVal.match(/\d{4}-\d{2}-\d{2}/);
    return match ? match : dateVal;
  }
  return dateVal;
};
// -------------------------------

// GET: Fetch all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.status(200).json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST: Add a new employee 
router.post('/', async (req, res) => {
  try {
    // ONLY clean the date if it actually exists in the payload!
    if (req.body.joiningDate !== undefined) {
      req.body.joiningDate = sanitizeDate(req.body.joiningDate);
    }
    
    const newEmployee = await Employee.create(req.body);
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error("Error saving employee:", error);
    res.status(400).json({ message: error.message });
  }
});

// PUT: Update an existing employee
router.put('/:id', async (req, res) => {
  try {
    // ONLY clean the date if it actually exists in the payload!
    if (req.body.joiningDate !== undefined) {
      req.body.joiningDate = sanitizeDate(req.body.joiningDate);
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    res.json(updatedEmployee);
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE: Remove an employee
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;