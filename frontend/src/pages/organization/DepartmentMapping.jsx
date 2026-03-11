import React, { useState } from 'react';
import { Network, Plus, Trash2, Users, Download, Info } from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

const DepartmentMapping = () => {
  const [departments, setDepartments] = useState([
    { id: 1, name: 'Engineering', head: 'Rajesh Kumar', staffCount: 145, budget: '₹12M' },
    { id: 2, name: 'Product Management', head: 'Sneha Reddy', staffCount: 24, budget: '₹4M' },
    { id: 3, name: 'Design', head: 'Ananya Singh', staffCount: 18, budget: '₹2.5M' },
    { id: 4, name: 'Sales & Marketing', head: 'Vikram Mehta', staffCount: 32, budget: '₹6M' },
    { id: 5, name: 'Human Resources', head: 'Priya Sharma', staffCount: 12, budget: '₹1.8M' },
  ]);

  const [newDept, setNewDept] = useState({ name: '', head: '', staffCount: '', budget: '' });

  const handleAddDept = (e) => {
    e.preventDefault();
    if (newDept.name && newDept.head) {
      setDepartments([...departments, { ...newDept, id: Date.now() }]);
      setNewDept({ name: '', head: '', staffCount: '', budget: '' });
    }
  };

  const deleteDept = (id) => {
    setDepartments(departments.filter(d => d.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <Network className="w-8 h-8 text-primary-600" />
            Department Mapping
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Define your organizational structure and departmental ownership.</p>
        </div>
        <button 
          onClick={() => exportToCSV(departments, 'Departments.csv')}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Dept Form */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm h-fit transition-all">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">Create Department</h3>
          <form onSubmit={handleAddDept} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Department Name</label>
              <input 
                type="text" 
                placeholder="e.g. Quality Assurance"
                value={newDept.name}
                onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 dark:text-slate-200" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Department Head</label>
              <input 
                type="text" 
                placeholder="Manager Name"
                value={newDept.head}
                onChange={(e) => setNewDept({ ...newDept, head: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 dark:text-slate-200" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Staff Count</label>
                <input 
                  type="number" 
                  placeholder="0"
                  value={newDept.staffCount}
                  onChange={(e) => setNewDept({ ...newDept, staffCount: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 dark:text-slate-200" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Budget</label>
                <input 
                  type="text" 
                  placeholder="₹0"
                  value={newDept.budget}
                  onChange={(e) => setNewDept({ ...newDept, budget: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 dark:text-slate-200" 
                />
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20">
              <Plus className="w-4 h-4" />
              Create Department
            </button>
          </form>
        </div>

        {/* Dept Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:border-primary-200 dark:hover:border-primary-500/50 transition-all group relative">
              <button 
                onClick={() => deleteDept(dept.id)}
                className="absolute top-4 right-4 p-2 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{dept.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Head: {dept.head}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Team Size</p>
                  <p className="text-lg font-black text-slate-700 dark:text-slate-300 mt-1">{dept.staffCount}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Annual Budget</p>
                  <p className="text-lg font-black text-slate-700 dark:text-slate-300 mt-1">{dept.budget}</p>
                </div>
              </div>
            </div>
          ))}

          <div className="md:col-span-2 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl flex gap-3 border border-amber-100 dark:border-amber-900/20 transition-colors">
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium leading-relaxed">
              Departments are used for cost allocation and resource grouping. Ensure the "Head of Department" is correctly mapped for approval workflows.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentMapping;
