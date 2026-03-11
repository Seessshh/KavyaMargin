// frontend/src/services/api.js
// Note: If you haven't installed axios yet, run `npm install axios` in your frontend terminal

import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; 

export const getInvoices = async () => {
  const response = await axios.get(`${API_URL}/invoices`);
  return response.data;
};

export const createInvoice = async (invoiceData) => {
  const response = await axios.post(`${API_URL}/invoices`, invoiceData);
  return response.data;
};

export const deleteInvoice = async (id) => {
  const response = await axios.delete(`${API_URL}/invoices/${id}`);
  return response.data;
};