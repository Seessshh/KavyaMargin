import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Receipt, Search, Download, Trash2, Pencil, X, CheckCircle2, Clock, AlertCircle
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';
import { Link } from 'react-router-dom';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  
  // NEW: State to track which invoice is currently being edited
  const [editingInvoice, setEditingInvoice] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const invoicesPerPage = 5;

  // 1. Fetch Invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/invoices');
        setInvoices(response.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  // 2. Delete Invoice
  const deleteInvoice = async (id) => {
    if (!window.confirm("Delete this invoice?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/invoices/${id}`);
      setInvoices(invoices.filter(inv => inv._id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  // 3. Handle Edit Submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send the updated data to the new PUT route on your backend
      const response = await axios.put(`http://localhost:5000/api/invoices/${editingInvoice._id}`, editingInvoice);
      
      // Update the UI immediately with the fresh data from the database
      setInvoices(invoices.map(inv => inv._id === editingInvoice._id ? response.data : inv));
      
      // Close the modal
      setEditingInvoice(null);
      alert("Invoice updated successfully!");
    } catch (err) {
      console.error("Failed to update invoice:", err);
      alert("Failed to update. Check console for errors.");
    }
  };

  // Handle Edit Input Changes
  const handleEditChange = (e) => {
    setEditingInvoice({
      ...editingInvoice,
      [e.target.name]: e.target.name === 'amount' ? Number(e.target.value) : e.target.value
    });
  };

  // Filtering
  const filteredInvoices = invoices.filter(inv => {
    const matchSearch =
      (inv.client && inv.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inv.project && inv.project.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = statusFilter === "All" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Pagination
  const indexOfLast = currentPage * invoicesPerPage;
  const indexOfFirst = indexOfLast - invoicesPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredInvoices.length / invoicesPerPage);

  if (loading) return <div className="text-center text-slate-400 p-10">Loading invoices...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      
      {/* --- Header & Stats Code Remains the Same --- */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <Receipt className="w-8 h-8 text-blue-500" /> Invoices
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/invoicing/generate" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">
            Create Invoice
          </Link>
        </div>
      </header>

      {/* Table Section */}
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden">
        
        {/* Search & Filters */}
        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search client or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/50 text-slate-500 text-xs uppercase">
                <th className="px-6 py-4">Client / Project</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {currentInvoices.map(inv => (
                <tr key={inv._id} className="hover:bg-slate-800/50">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-200">{inv.client}</p>
                    <p className="text-xs text-slate-500">{inv.project}</p>
                  </td>
                  <td className="px-6 py-4 font-black text-slate-200">
                    ₹{inv.amount?.toLocaleString()} 
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400'
                      : inv.status === 'Overdue' ? 'bg-rose-500/10 text-rose-400'
                      : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  
                  {/* --- THE NEW ACTION BUTTONS --- */}
                  <td className="px-6 py-4 text-right flex justify-end gap-3">
                    
                    {/* EDIT BUTTON */}
                    <button 
                      onClick={() => setEditingInvoice(inv)} 
                      className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                      title="Edit Invoice"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    
                    {/* DELETE BUTTON */}
                    <button 
                      onClick={() => deleteInvoice(inv._id)} 
                      className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
                      title="Delete Invoice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- THE EDIT MODAL --- */}
      {editingInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-100">Edit Invoice</h3>
              <button onClick={() => setEditingInvoice(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Client</label>
                <input 
                  type="text" name="client" required
                  value={editingInvoice.client} onChange={handleEditChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 text-sm"
                />
              </div>
              
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Project</label>
                <input 
                  type="text" name="project" required
                  value={editingInvoice.project} onChange={handleEditChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Amount (₹)</label>
                  <input 
                    type="number" name="amount" required
                    value={editingInvoice.amount} onChange={handleEditChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Status</label>
                  <select 
                    name="status" 
                    value={editingInvoice.status} onChange={handleEditChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 text-sm"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setEditingInvoice(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg font-bold hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default InvoiceList;