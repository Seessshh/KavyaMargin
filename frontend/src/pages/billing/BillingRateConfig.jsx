import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Plus, Trash2, Edit2, Download, Info, Search, X } from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

const BillingRateConfig = () => {
  // --- 1. RBAC SECURITY CHECK ---
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  // Only these roles can Add, Edit, or Delete. Everyone else (like Team Leads) is Read-Only!
  const canEditBilling = ['Super Admin', 'Company Admin', 'Project Manager'].includes(currentUser?.role);

  const [rates, setRates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [formData, setFormData] = useState({
    role: '',
    offshore: '',
    onshore: '',
    currency: 'USD',
    status: 'Active'
  });

  // 1. Fetch Rates from MongoDB
  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const response = await axios.get('https://kavyamargin.onrender.com/api/billing-rates');
      setRates(response.data);
    } catch (error) {
      console.error("Error fetching rates:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Form Inputs
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Open Modal for Add or Edit
  const openModal = (rate = null) => {
    if (rate) {
      setEditingRate(rate);
      setFormData(rate);
    } else {
      setEditingRate(null);
      setFormData({ role: '', offshore: '', onshore: '', currency: 'USD', status: 'Active' });
    }
    setIsModalOpen(true);
  };

  // 4. Submit Form (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        offshore: Number(formData.offshore),
        onshore: Number(formData.onshore)
      };

      if (editingRate) {
        // Update existing
        await axios.put(`https://kavyamargin.onrender.com/api/billing-rates/${editingRate._id}`, payload);
      } else {
        // Create new
        await axios.post('https://kavyamargin.onrender.com/api/billing-rates', payload);
      }
      
      fetchRates(); // Refresh table
      setIsModalOpen(false); // Close modal
    } catch (error) {
      console.error("Error saving rate:", error);
      alert("Failed to save rate. Check if backend is running.");
    }
  };

  // 5. Delete Rate
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this billing rate?")) return;
    try {
      await axios.delete(`https://kavyamargin.onrender.com/api/billing-rates/${id}`);
      setRates(rates.filter(r => r._id !== id));
    } catch (error) {
      console.error("Error deleting rate:", error);
    }
  };

  const filteredRates = rates.filter(r => r.role.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-primary-600" />
            Billing Rate Configuration
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Standardize and manage hourly billing rates across different roles and regions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => exportToCSV(filteredRates, 'Standard_Billing_Rates.csv')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          
          {/* SECURED: Only allowed roles can see the Add button */}
          {canEditBilling && (
            <button 
              onClick={() => openModal()}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20"
            >
              <Plus className="w-4 h-4" />
              Add New Rate
            </button>
          )}
        </div>
      </header>

      {/* Search and Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-900/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-800 shadow-sm transition-colors">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950/50 border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-slate-800 transition-all outline-none text-slate-200"
            />
          </div>
        </div>
        <div className="bg-amber-900/10 p-4 rounded-2xl border border-amber-900/20 flex items-center gap-3">
          <Info className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-[11px] text-amber-400 font-bold leading-tight">
            Rates are synced with the database. Live updates are active.
          </p>
        </div>
      </div>

      {/* Rates Table */}
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/30 border-b border-slate-800">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Role / Designation</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Offshore Rate (/hr)</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Onshore Rate (/hr)</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Status</th>
                {/* SECURED: Hide the Actions column header for Read-Only users */}
                {canEditBilling && (
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={canEditBilling ? "5" : "4"} className="text-center py-8 text-slate-500">Loading rates...</td></tr>
              ) : filteredRates.length === 0 ? (
                <tr><td colSpan={canEditBilling ? "5" : "4"} className="text-center py-8 text-slate-500">No rates found.</td></tr>
              ) : (
                filteredRates.map((rate) => (
                  <tr key={rate._id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-200">{rate.role}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-black text-primary-400">
                        {rate.currency === 'USD' ? '$' : rate.currency === 'INR' ? '₹' : ''}{rate.offshore}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-black text-indigo-400">
                        {rate.currency === 'USD' ? '$' : rate.currency === 'INR' ? '₹' : ''}{rate.onshore}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${rate.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                        {rate.status}
                      </span>
                    </td>
                    
                    {/* SECURED: Hide the Edit/Delete buttons for Read-Only users */}
                    {canEditBilling && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openModal(rate)} className="p-2 text-slate-500 hover:text-primary-400 hover:bg-slate-800 rounded-lg transition-all">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(rate._id)} className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all">
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

      {/* --- ADD / EDIT MODAL --- */}
      {isModalOpen && canEditBilling && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-100">{editingRate ? 'Edit' : 'Add'} Billing Rate</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Role / Designation</label>
                <input 
                  type="text" name="role" required placeholder="e.g. Senior Architect"
                  value={formData.role} onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Offshore Rate</label>
                  <input 
                    type="number" name="offshore" required placeholder="0"
                    value={formData.offshore} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Onshore Rate</label>
                  <input 
                    type="number" name="onshore" required placeholder="0"
                    value={formData.onshore} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Currency</label>
                  <select 
                    name="currency" value={formData.currency} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-200"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Status</label>
                  <select 
                    name="status" value={formData.status} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-200"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-700 transition-all">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20">
                  {editingRate ? 'Update Rate' : 'Save Rate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingRateConfig;