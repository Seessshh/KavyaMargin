import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Receipt, Search, Download, Trash2, Pencil, X, CheckCircle2, Clock, AlertCircle
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';
import { Link } from 'react-router-dom';

const InvoiceList = () => {
  // --- 1. RBAC SECURITY CHECK ---
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  // Only Admins can edit/delete/create invoices. PMs and Viewers are Read-Only!
  const canEditInvoice = ['Super Admin', 'Company Admin'].includes(currentUser?.role);

  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  
  // State to track which invoice is currently being edited
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

  // 2. Delete Invoice (SECURED)
  const deleteInvoice = async (id) => {
    if (!canEditInvoice) return; // Double security block!

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
      const response = await axios.put(`http://localhost:5000/api/invoices/${editingInvoice._id}`, editingInvoice);
      
      setInvoices(invoices.map(inv => inv._id === editingInvoice._id ? response.data : inv));
      
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
      
      {/* Header & Stats */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <Receipt className="w-8 h-8 text-blue-500" /> Invoices
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {/* SECURED: Only Admins can see the Create Invoice button */}
          {canEditInvoice && (
            <Link to="/invoicing/generate" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">
              Create Invoice
            </Link>
          )}
        </div>
      </header>

      {/* Table Section */}
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        
        {/* Search & Filters */}
        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search client or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">Client / Project</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                {/* SECURED: Actions Header only visible to Admins */}
                {canEditInvoice && (
                  <th className="px-6 py-4 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {currentInvoices.length === 0 ? (
                <tr>
                  <td colSpan={canEditInvoice ? "4" : "3"} className="px-6 py-8 text-center text-slate-500 text-sm">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                currentInvoices.map(inv => (
                  <tr key={inv._id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-200">{inv.client}</p>
                      <p className="text-xs font-medium text-slate-500">{inv.project}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-slate-100">
                        ₹{inv.amount?.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400'
                        : inv.status === 'Overdue' ? 'bg-rose-500/10 text-rose-400'
                        : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    
                    {/* SECURED: Actions Column only visible to Admins */}
                    {canEditInvoice && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* EDIT BUTTON */}
                          <button 
                            onClick={() => setEditingInvoice(inv)} 
                            className="p-2 text-slate-500 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit Invoice"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          
                          {/* DELETE BUTTON */}
                          <button 
                            onClick={() => deleteInvoice(inv._id)} 
                            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- THE EDIT MODAL (SECURED) --- */}
      {editingInvoice && canEditInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-100">Edit Invoice</h3>
              <button onClick={() => setEditingInvoice(null)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Client</label>
                <input 
                  type="text" name="client" required
                  value={editingInvoice.client} onChange={handleEditChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Project</label>
                <input 
                  type="text" name="project" required
                  value={editingInvoice.project} onChange={handleEditChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Amount (₹)</label>
                  <input 
                    type="number" name="amount" required
                    value={editingInvoice.amount} onChange={handleEditChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Status</label>
                  <select 
                    name="status" 
                    value={editingInvoice.status} onChange={handleEditChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none"
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
                  className="flex-1 px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
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