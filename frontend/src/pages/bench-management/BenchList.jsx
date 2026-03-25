import React, { useState, useEffect } from 'react';
import { Briefcase, Search, Download, Clock, AlertTriangle, UserCog, X } from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

const BenchList = () => {
  // --- 1. RBAC SECURITY CHECK ---
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const canEditBench = ['Super Admin', 'Company Admin', 'HR'].includes(currentUser?.role);

  // --- STATE MANAGEMENT ---
  const [benchList, setBenchList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manageForm, setManageForm] = useState({
    status: 'Bench',
    department: '',
    role: ''
  });

  // 2. Fetch Employees on Load
  useEffect(() => {
    fetchBenchData();
  }, []);

  const fetchBenchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/employees');
      if (response.ok) {
        const dbEmployees = await response.json();
        // Filter ONLY employees who are currently on the bench
        const benchedEmployees = dbEmployees.filter(emp => emp.status === 'Bench');
        setBenchList(benchedEmployees);
      }
    } catch (error) {
      console.error("Failed to fetch bench list:", error);
    }
  };

  // 3. Calculate Bench Days Logic
  const calculateBenchDays = (dateString) => {
    if (!dateString) return 0;
    const benchDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - benchDate);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
  };

  // 4. Modal Handlers
  const openManageModal = (resource) => {
    setSelectedResource(resource);
    setManageForm({
      status: resource.status || 'Bench',
      department: resource.department || '',
      role: resource.role || ''
    });
    setIsManageModalOpen(true);
  };

  const handleManageInputChange = (e) => {
    const { name, value } = e.target;
    setManageForm(prev => ({ ...prev, [name]: value }));
  };

  // 5. Submit Update to Database
  const handleUpdateResource = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Use the resource's ID to send a PUT request to your backend
      const resourceId = selectedResource._id || selectedResource.id;
      
      const response = await fetch(`http://localhost:5000/api/employees/${resourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manageForm)
      });

      if (!response.ok) throw new Error("Failed to update resource");

      // If they were moved to 'Active', this refresh will automatically remove them from the Bench List view!
      fetchBenchData();
      setIsManageModalOpen(false);
      
    } catch (error) {
      console.error("Error updating resource:", error);
      alert("Failed to update resource. Ensure your backend handles PUT /api/employees/:id");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6. Search Filter & Dynamic Calculations
  const filteredBench = benchList.filter(res => 
    (res.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (res.role || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (res.department || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBenchDays = benchList.reduce((acc, curr) => acc + calculateBenchDays(curr.updatedAt || curr.createdAt), 0);
  const avgBenchTime = benchList.length > 0 ? Math.round(totalBenchDays / benchList.length) : 0;
  const criticalCount = benchList.filter(res => calculateBenchDays(res.updatedAt || res.createdAt) > 60).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-blue-500" />
            Bench List Report
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Inventory of unallocated resources and their bench duration.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => exportToCSV(benchList, 'Bench_Resources.csv')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </header>

      {/* Dynamic Bench Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm transition-colors">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Bench Count</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-100">{benchList.length}</h3>
            <span className="text-xs font-bold text-slate-500">Resources</span>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm transition-colors">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Avg. Bench Time</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-100">{avgBenchTime}</h3>
            <span className="text-xs font-bold text-slate-500">Days</span>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm transition-colors border-t-4 border-t-rose-500/80">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Critical ({'>'}60 Days)</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-rose-500">
              {criticalCount.toString().padStart(2, '0')}
            </h3>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
        </div>
      </div>

      {/* Dynamic Bench Table */}
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by name or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-200 transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Resource</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Dept</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Bench Time</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Cost Impact</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                
                {/* SECURED: Actions Column */}
                {canEditBench && (
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredBench.length === 0 ? (
                <tr>
                  <td colSpan={canEditBench ? "6" : "5"} className="px-6 py-8 text-center text-slate-500 text-sm">
                    No resources currently on bench.
                  </td>
                </tr>
              ) : (
                filteredBench.map((res) => {
                  const benchDays = calculateBenchDays(res.updatedAt || res.createdAt);
                  const isCritical = benchDays > 60;

                  return (
                    <tr key={res.id || res._id} className="hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-bold text-slate-100">{res.name}</p>
                          <p className="text-xs text-slate-400 font-medium">{res.role}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-500">{res.department}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Clock className={`w-3.5 h-3.5 ${isCritical ? 'text-rose-500' : 'text-slate-500'}`} />
                          <span className={`text-sm font-bold ${isCritical ? 'text-rose-400' : 'text-slate-300'}`}>
                            {benchDays} Days
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-slate-100">
                          ₹{(res.monthlyCost || 0).toLocaleString('en-IN')}/mo
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
                          {res.status}
                        </span>
                      </td>

                      {/* SECURED: Manage button */}
                      {canEditBench && (
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => openManageModal(res)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold transition-colors"
                          >
                            <UserCog className="w-3.5 h-3.5" />
                            Manage
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MANAGE RESOURCE MODAL --- */}
      {isManageModalOpen && selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-slate-100">Manage Resource</h2>
                <p className="text-xs text-blue-400 font-bold mt-1">{selectedResource.name}</p>
              </div>
              <button 
                onClick={() => setIsManageModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateResource} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Update Status</label>
                <select 
                  name="status" 
                  value={manageForm.status} 
                  onChange={handleManageInputChange}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-200"
                >
                  <option value="Bench">🟡 Keep on Bench</option>
                  <option value="Active">🟢 Move to Active (Assigned)</option>
                  <option value="Leave">🔵 Long-term Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Update Department</label>
                <select 
                  name="department" 
                  value={manageForm.department} 
                  onChange={handleManageInputChange}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-200"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR & Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Update Role / Title</label>
                <input 
                  type="text" 
                  name="role" 
                  value={manageForm.role} 
                  onChange={handleManageInputChange}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-200"
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsManageModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Update Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BenchList;