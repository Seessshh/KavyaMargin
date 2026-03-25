import React, { useState, useEffect } from 'react';
import { Calendar, Search, Download, Edit2, ArrowRight, X, Save, AlertCircle } from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

const AvailabilityTracker = () => {
  // --- 1. RBAC SECURITY CHECK ---
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  // HR is specifically excluded here to enforce Read-Only mode
  const canEditResource = ['Super Admin', 'Company Admin', 'Project Manager', 'Team Lead'].includes(currentUser?.role);

  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    currentProject: 'None',
    releaseDate: '',
    allocation: 0
  });

  // Fetch Employees and Projects on Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, projRes] = await Promise.all([
          fetch('http://localhost:5000/api/employees'),
          fetch('http://localhost:5000/api/projects')
        ]);

        if (empRes.ok) {
          const dbEmployees = await empRes.json();
          if (Array.isArray(dbEmployees)) setEmployees(dbEmployees);
        }

        if (projRes.ok) {
          const dbProjects = await projRes.json();
          if (Array.isArray(dbProjects)) setProjects(dbProjects);
        }
      } catch (error) {
        console.error("Failed to fetch data for availability tracker:", error);
      }
    };

    fetchData();
  }, []);

  // Dynamic Summary Calculations
  let availableNow = 0;
  let releasingIn30 = 0;
  let releasingIn60 = 0;

  const today = new Date();

  employees.forEach(emp => {
    const allocation = emp.allocation || 0;
    const project = emp.currentProject || 'None';
    
    // If they have no project or 0% allocation, they are available now
    if (project === 'None' || allocation === 0 || emp.releaseDate === 'Immediate') {
      availableNow++;
    } else if (emp.releaseDate) {
      // Calculate days until release
      const releaseDate = new Date(emp.releaseDate);
      if (!isNaN(releaseDate.getTime())) {
        const diffTime = releaseDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0 && diffDays <= 30) releasingIn30++;
        else if (diffDays > 30 && diffDays <= 60) releasingIn60++;
      }
    }
  });

  // Search Filter
  const filteredAvailability = employees.filter(emp => {
    const nameMatch = (emp.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const projectMatch = (emp.currentProject || '').toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || projectMatch;
  });

  // Modal Handlers
  const openModal = (emp) => {
    setSelectedEmp(emp);
    setFormData({
      currentProject: emp.currentProject || 'None',
      releaseDate: emp.releaseDate && emp.releaseDate !== 'Immediate' ? emp.releaseDate.split('T') : '',
      allocation: emp.allocation || 0
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEmp(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    // Auto-adjustments based on project selection
    if (name === 'currentProject') {
      if (value === 'None') {
        newFormData.allocation = 0;
        newFormData.releaseDate = '';
      } else if (formData.allocation === 0) {
        newFormData.allocation = 100; // Default to 100% if assigning a new project
      }
    }
    setFormData(newFormData);
  };

  const handleUpdateAllocation = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const isBench = formData.currentProject === 'None' || Number(formData.allocation) === 0;
    
    const updatePayload = {
      currentProject: formData.currentProject,
      releaseDate: isBench ? 'Immediate' : formData.releaseDate,
      allocation: Number(formData.allocation),
      status: isBench ? 'Bench' : 'Active'
    };

    try {
      const response = await fetch(`http://localhost:5000/api/employees/${selectedEmp.id || selectedEmp._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (response.ok) {
        const updatedEmployee = await response.json();
        setEmployees(employees.map(emp => 
          (emp.id || emp._id) === (updatedEmployee.id || updatedEmployee._id) ? updatedEmployee : emp
        ));
        closeModal();
      } else {
        alert("Failed to update allocation.");
      }
    } catch (error) {
      console.error("Error updating allocation:", error);
      alert("Server connection error.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-500" />
            Resource Availability Tracker
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Monitor upcoming roll-offs and allocate resources to projects.</p>
        </div>
        <button 
          onClick={() => exportToCSV(employees, 'Resource_Availability.csv')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </header>

      {/* Dynamic Release Timeline Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm border-t-4 border-t-emerald-500/80">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Available Now (Bench)</h4>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-100">{availableNow}</h3>
            <span className="text-xs font-bold text-emerald-400">Resources</span>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm border-t-4 border-t-blue-500/80">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Releasing ≤ 30 Days</h4>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-100">{releasingIn30}</h3>
            <span className="text-xs font-bold text-blue-400">Resources</span>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm border-t-4 border-t-amber-500/80">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Releasing 31-60 Days</h4>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-100">{releasingIn60}</h3>
            <span className="text-xs font-bold text-amber-400">Resources</span>
          </div>
        </div>
      </div>

      {/* Dynamic Availability Table */}
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search resource or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-200"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Resource Name</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Current Project</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Release Date</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Availability</th>
                
                {/* SECURED: Actions Header */}
                {canEditResource && (
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredAvailability.length === 0 ? (
                <tr>
                  <td colSpan={canEditResource ? "5" : "4"} className="px-6 py-8 text-center text-slate-500 text-sm">
                    No resources found.
                  </td>
                </tr>
              ) : (
                filteredAvailability.map((emp) => {
                  const project = emp.currentProject || 'None';
                  const allocation = emp.allocation || 0;
                  const availability = 100 - allocation;
                  const isAvailable = availability > 50;

                  return (
                    <tr key={emp.id || emp._id} className="hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-100">{emp.name}</span>
                        <div className="text-xs text-slate-500">{emp.role}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${project === 'None' ? 'text-slate-500 italic' : 'text-slate-300'}`}>
                          {project}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold ${(!emp.releaseDate || emp.releaseDate === 'Immediate' || project === 'None') ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {(!emp.releaseDate || project === 'None') ? 'Immediate' : new Date(emp.releaseDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-blue-500'}`}
                              style={{ width: `${availability}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-400">{availability}%</span>
                        </div>
                      </td>

                      {/* SECURED: Allocate Button */}
                      {canEditResource && (
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => openModal(emp)}
                            className="p-2 text-slate-500 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-all opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 ml-auto"
                            title="Allocate Resource"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span className="text-xs font-bold">Allocate</span>
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

      {/* Allocate/Edit Modal */}
      {isModalOpen && canEditResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Allocate Resource</h3>
                <p className="text-xs text-slate-400 mt-1">Assigning <strong className="text-slate-200">{selectedEmp?.name}</strong> to a project</p>
              </div>
              <button onClick={closeModal} className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateAllocation} className="p-6 space-y-5">
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assign to Project</label>
                <select 
                  name="currentProject"
                  value={formData.currentProject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-200 appearance-none"
                >
                  <option value="None">None (Move to Bench)</option>
                  {projects.map(proj => (
                    <option key={proj._id || proj.id} value={proj.name || proj.projectName}>
                      {proj.name || proj.projectName}
                    </option>
                  ))}
                </select>
                {projects.length === 0 && (
                  <p className="text-[10px] text-amber-500 mt-1">No projects found. Please add projects to the database first.</p>
                )}
              </div>

              {formData.currentProject !== 'None' && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Expected Release Date</label>
                    <input 
                      type="date" 
                      name="releaseDate"
                      required
                      value={formData.releaseDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-200 [color-scheme:dark]" 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Allocation (%)</label>
                      <span className="text-xs font-bold text-blue-400">{formData.allocation}% Assigned</span>
                    </div>
                    <input 
                      type="range" 
                      name="allocation"
                      min="0"
                      max="100"
                      step="10"
                      value={formData.allocation}
                      onChange={handleInputChange}
                      className="w-full accent-blue-500" 
                    />
                    <p className="text-[10px] text-slate-500">Availability will automatically be set to {100 - formData.allocation}%</p>
                  </div>
                </>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Confirm Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityTracker;