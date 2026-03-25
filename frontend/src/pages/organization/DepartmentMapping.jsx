import React, { useState, useEffect } from 'react';
import { Network, Plus, Trash2, Users, Download, Info } from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

const DepartmentMapping = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newDept, setNewDept] = useState({ name: '', head: '', budget: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [deptRes, empRes] = await Promise.all([
        fetch('https://kavyamargin.onrender.com/api/departments'),
        fetch('https://kavyamargin.onrender.com/api/employees')
      ]);

      if (deptRes.ok) {
        const dbDepts = await deptRes.json();
        setDepartments(dbDepts);
      }
      
      if (empRes.ok) {
        const dbEmps = await empRes.json();
        setEmployees(dbEmps);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDept = async (e) => {
    e.preventDefault();
    if (!newDept.name || !newDept.head || !newDept.budget) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('https://kavyamargin.onrender.com/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDept)
      });

      if (response.ok) {
        const savedDept = await response.json();
        setDepartments([...departments, savedDept]);
        setNewDept({ name: '', head: '', budget: '' }); // Reset form
      } else {
        alert("Failed to save department.");
      }
    } catch (error) {
      console.error("Error saving department:", error);
      alert("Server connection error.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteDept = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;

    try {
      const response = await fetch(`https://kavyamargin.onrender.com/api/departments/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setDepartments(departments.filter(d => (d._id || d.id) !== id));
      }
    } catch (error) {
      console.error("Error deleting department:", error);
    }
  };

  // --- NEW: INDIAN CURRENCY FORMATTER ---
  // Converts raw numbers like 1500000 to "₹15 L" or 12000000 to "₹1.2 Cr"
  const formatIndianCurrency = (value) => {
    if (!value || isNaN(value)) return '₹0';
    const num = Number(value);
    
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
    } else if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2).replace(/\.00$/, '')} L`;
    } else if (num >= 1000) {
      return `₹${(num / 1000).toFixed(2).replace(/\.00$/, '')} K`;
    } else {
      return `₹${num.toLocaleString('en-IN')}`;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <Network className="w-8 h-8 text-blue-500" />
            Department Mapping
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Define your organizational structure and departmental ownership.</p>
        </div>
        <button 
          onClick={() => exportToCSV(departments, 'Departments.csv')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- ADD DEPT FORM --- */}
        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-sm h-fit transition-all">
          <h3 className="text-lg font-bold text-slate-100 mb-6">Create Department</h3>
          <form onSubmit={handleAddDept} className="space-y-5">
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Department Name</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Quality Assurance"
                value={newDept.name}
                onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-200 transition-all" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Department Head</label>
              <select 
                required
                value={newDept.head}
                onChange={(e) => setNewDept({ ...newDept, head: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-200 transition-all appearance-none"
              >
                <option value="" disabled>Select an existing employee...</option>
                {employees.map(emp => (
                  <option key={emp._id || emp.id} value={emp.name}>
                    {emp.name} ({emp.role})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Annual Budget (₹)</label>
              <div className="relative">
                {/* Visual Rupee Symbol */}
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                <input 
                  type="number" 
                  min="0"
                  required
                  placeholder="0"
                  value={newDept.budget}
                  onKeyDown={(e) => {
                    // STRICT SECURITY: Block minus, plus, and exponent keys
                    if (e.key === '-' || e.key === 'e' || e.key === '+') {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    // DATA SECURITY: Ensure only pure, positive numbers are stored
                    const val = Math.abs(Number(e.target.value));
                    setNewDept({ ...newDept, budget: val === 0 ? '' : val });
                  }}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-200 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1 ml-1">
                Preview: {newDept.budget ? formatIndianCurrency(newDept.budget) : '₹0'}
              </p>
            </div>
            
            <button 
              type="submit" 
              disabled={isSaving}
              className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 mt-4"
            >
              <Plus className="w-4 h-4" />
              {isSaving ? 'Creating...' : 'Create Department'}
            </button>
          </form>
        </div>

        {/* --- DEPT GRID --- */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              <div className="md:col-span-2 text-center py-8 text-slate-500 font-bold">Loading departments...</div>
            ) : departments.length === 0 ? (
              <div className="md:col-span-2 text-center py-8 text-slate-500 font-bold">No departments found.</div>
            ) : (
              departments.map((dept) => {
                const actualStaffCount = employees.filter(emp => emp.department === dept.name).length;

                return (
                  <div key={dept._id || dept.id} className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm hover:border-blue-500/50 transition-all group relative">
                    
                    <button 
                      onClick={() => deleteDept(dept._id || dept.id)}
                      className="absolute top-4 right-4 p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-100">{dept.name}</h4>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Head: <span className="text-slate-300">{dept.head}</span></p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6 border-t border-slate-800/50 pt-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Staff</p>
                        <p className="text-lg font-black text-slate-200 mt-1">{actualStaffCount}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Annual Budget</p>
                        {/* THE FORMATTER APPLIED HERE */}
                        <p className="text-lg font-black text-blue-400 mt-1">
                          {formatIndianCurrency(dept.budget)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-4 bg-amber-500/10 rounded-xl flex gap-3 border border-amber-500/20 transition-colors">
            <Info className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-[11px] text-amber-400 font-medium leading-relaxed">
              Departments are used for cost allocation and resource grouping. The "Active Staff" count updates automatically based on the Employee database.
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default DepartmentMapping;