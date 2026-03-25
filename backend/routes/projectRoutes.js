import express from 'express';
import Project from '../models/Project.js'; // Note the .js extension

const router = express.Router();

// GET: Fetch all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST: Add a new project
router.post('/', async (req, res) => {
  try {
    const { name, client, margin, revenue, status } = req.body;
    
    const newProject = await Project.create({
      name, client, margin, revenue, status
    });

    res.status(201).json(newProject);
  } catch (error) {
    console.error("Error saving project:", error);
    res.status(400).json({ message: 'Failed to create project' });
  }
});

// ==========================================
// NEW: DELETE Route added to fix the error
// ==========================================
router.delete('/:id', async (req, res) => {
  try {
    // req.params.id grabs the ID from the URL we sent from the frontend
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    
    if (!deletedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;