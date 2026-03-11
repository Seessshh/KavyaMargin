// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import invoiceRoutes from './routes/invoiceRoutes.js';
import connectDB from './config/db.js';
import billingRoutes from './routes/billingRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors()); // Allow requests from your React app
app.use(express.json()); // Allow Express to read JSON data from requests
app.use('/api/invoices', invoiceRoutes);
app.use('/api/billing-rates', billingRoutes);

// A simple test route
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Kavya Margin Backend is running smoothly!' });
});

// Define the port (defaults to 5000 if not in .env)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is successfully running on port ${PORT}`);
});