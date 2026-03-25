// backend/server.js
import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Route Imports
import invoiceRoutes from './routes/invoiceRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import projectRoutes from './routes/projectRoutes.js'; 
import employeeRoutes from './routes/employeeRoutes.js';// <-- NEW: Imported project routes
import authRoutes from './routes/authRoutes.js';
import billingModelRoutes from './routes/billingModelRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import contractRoutes from './routes/contractRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'], // Add your React port here
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json()); 

// Route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/billing-rates', billingRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/employees', employeeRoutes); // <-- NEW: Tells Express to listen here
app.use('/api/billing-models', billingModelRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/contracts', contractRoutes);


// A simple test route
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Kavya Margin Backend is running smoothly!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is successfully running on port ${PORT}`);
});

// Example Backend Route
app.get('/api/reports/download/:id', async (req, res) => {
  // 1. Find the report by ID in MongoDB
  // 2. Generate the CSV data
  // 3. Send it to the frontend:
  res.header('Content-Type', 'text/csv');
  res.attachment('report.csv');
  return res.send(csvData);
});