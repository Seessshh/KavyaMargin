import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Download, Search, Filter, AlertCircle, 
  CheckCircle2, IndianRupee, Plus, X, Trash2 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell
} from 'recharts';
import { exportToCSV } from '../../utils/exportUtils';

const ProjectMarginDashboard = () => {
  // --- 1. RBAC SECURITY CHECK ---
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const canAddProject = ['Super Admin', 'Company Admin', 'Project Manager'].includes(currentUser?.role);

  // 2. State Management
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    client: '',
    margin: '',
    revenue: '',
    status: 'On Track'
  });

  // 3. Fetch Data from MongoDB on Load
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('https://kavyamargin.onrender.com/api/projects');
        if (response.ok) {
          const dbProjects = await response.json();
          if (Array.isArray(dbProjects)) {
            setProjects(dbProjects); 
          }
        }
      } catch (error) {
        console.error("Failed to fetch projects from DB:", error);
      }
    };

    fetchProjects();
  }, []);

  // --- NEW: INDIAN CURRENCY FORMATTER ---
  const formatIndianCurrency = (value) => {
    if (!value) return '₹0';
    
    // Extract numbers, ignoring currency symbols
    let num = Number(String(value).replace(/[^0-9.]/g, ''));
    
    // Fallback: If legacy database entries used 'M' for millions, convert them so it doesn't break
    if (String(value).toUpperCase().includes('M')) {
      num = num * 1000000;
    }

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

  // 4. Safe Filtering Logic
  const safeProjects = Array.isArray(projects) ? projects : [];
  const filteredProjects = safeProjects.filter(p => {
    const projectName = p?.name || '';
    const clientName = p?.client || '';
    
    return projectName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           clientName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // 5. DYNAMIC PORTFOLIO CALCULATIONS
  const totalProjects = safeProjects.length;

  const avgMargin = totalProjects > 0 
    ? (safeProjects.reduce((sum, p) => sum + Number(p.margin), 0) / totalProjects).toFixed(1)
    : "0.0";

  const atRiskCount = safeProjects.filter(p => p.status === 'At Risk').length;
  const formattedAtRiskCount = atRiskCount < 10 ? `0${atRiskCount}` : atRiskCount;

  // Fix: Sum up raw numbers for total active revenue and then format to Lakhs/Crores
  const totalRevenueNumber = safeProjects.reduce((sum, p) => {
    let val = String(p.revenue).replace(/[^0-9.]/g, '');
    let num = Number(val);
    if (String(p.revenue).toUpperCase().includes('M')) num *= 1000000; 
    return sum + (isNaN(num) ? 0 : num);
  }, 0);
  const totalRevenueStr = formatIndianCurrency(totalRevenueNumber);

  // 6. Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({ ...prev, [name]: value }));
  };

  const handleAddProject = async (e) => {
    e.preventDefault();

    const projectDataToSave = {
      name: newProject.name,
      client: newProject.client,
      margin: Number(newProject.margin),
      revenue: Number(newProject.revenue), // Save purely as a number
      status: newProject.status
    };

    try {
      const response = await fetch('https://kavyamargin.onrender.com/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectDataToSave),
      });

      if (!response.ok) throw new Error('Failed to save to database');
      
      const savedProject = await response.json(); 
      setProjects([...safeProjects, savedProject]);
      
      setNewProject({ name: '', client: '', margin: '', revenue: '', status: 'On Track' });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Failed to save project.");
    }
  };

  // --- NEW: DELETE HANDLER ---
  const handleDeleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to remove this project?")) return;

    try {
      const response = await fetch(`https://kavyamargin.onrender.com/api/projects/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setProjects(projects.filter(p => (p._id || p.id) !== id));
      } else {
        alert("Failed to delete project.");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative" id="project-margin-content">
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <IndianRupee className="w-8 h-8 text-blue-500" />
            Project Margin Dashboard
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Monitor real-time profitability across your entire project portfolio.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => exportToCSV(safeProjects, 'Project_Margins.csv')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          
          {canAddProject && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              Add Project
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-sm transition-all">
          <h3 className="text-lg font-bold text-slate-100 mb-8">Margin Distribution (%)</h3>

{/* Added min-w-0 to the parent div to stop flex/grid collapsing */}
<div className="h-[300px] w-full min-w-0">
  
  {/* Added minHeight and minWidth props to the ResponsiveContainer */}
  <ResponsiveContainer width="100%" height="100%" minHeight={300} minWidth={0}>
    
    <BarChart data={safeProjects}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} />
      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} unit="%" />
      <Tooltip 
        cursor={{fill: '#0f172a'}}
        contentStyle={{ 
          borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
          backgroundColor: '#0f172a', color: '#f8fafc'
        }}
      />
      <Bar dataKey="margin" radius={0}>
        {safeProjects.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.margin < 20 ? '#f43f5e' : entry.margin > 35 ? '#10b981' : '#3b82f6'} />
        ))}
      </Bar>
    </BarChart>
    
  </ResponsiveContainer>
</div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-sm transition-all">
          <h3 className="text-lg font-bold text-slate-100 mb-6">Portfolio Summary</h3>
          <div className="space-y-6">
            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Avg. Portfolio Margin</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-3xl font-black text-emerald-400 mt-2">{avgMargin}%</p>
            </div>
            <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">At Risk Projects</span>
                <AlertCircle className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-3xl font-black text-rose-400 mt-2">{formattedAtRiskCount}</p>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Total Active Revenue</span>
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-3xl font-black text-blue-400 mt-2">{totalRevenueStr}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-sm overflow-hidden transition-all">
        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search project or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-200 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-xl text-sm font-bold transition-all border border-slate-800">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>
        
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Project Name</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Client</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Margin</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Revenue</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                {/* Add Actions header if user has permission */}
                {canAddProject && (
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredProjects.map((p, idx) => (
                <tr key={p._id || p.id || idx} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-200">{p.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-400 font-medium">{p.client}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-black ${p.margin < 20 ? 'text-rose-500' : p.margin > 35 ? 'text-emerald-500' : 'text-blue-500'}`}>
                        {p.margin}%
                      </span>
                      <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                        <div 
                          className={`h-full rounded-full ${p.margin < 20 ? 'bg-rose-500' : p.margin > 35 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                          style={{ width: `${p.margin}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {/* Applying the format Indian Currency here */}
                    <span className="text-sm font-bold text-slate-200">{formatIndianCurrency(p.revenue)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      p.status === 'Exceeding' ? 'bg-emerald-500/10 text-emerald-400' : 
                      p.status === 'At Risk' ? 'bg-rose-500/10 text-rose-400' : 
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  
                  {/* Delete Button (Protected) */}
                  {canAddProject && (
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteProject(p._id || p.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Remove Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={canAddProject ? "6" : "5"} className="px-6 py-8 text-center text-slate-500 text-sm">
                    No projects found. Add a new project to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && canAddProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-slate-100">Add New Project</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddProject} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Project Name</label>
                <input 
                  required
                  type="text" name="name" value={newProject.name} onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-200"
                  placeholder="e.g. Website Redesign"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Client</label>
                <input 
                  required
                  type="text" name="client" value={newProject.client} onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-200"
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Margin (%)</label>
                  <input 
                    required min="0" max="100"
                    type="number" name="margin" value={newProject.margin} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-200"
                    placeholder="e.g. 25"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Revenue (₹)</label>
                  <input 
                    required
                    type="number" min="0" name="revenue" value={newProject.revenue} 
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e' || e.key === '+') e.preventDefault();
                    }}
                    onChange={(e) => {
                      const val = Math.abs(Number(e.target.value));
                      setNewProject({ ...newProject, revenue: val === 0 ? '' : val });
                    }}
                    className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="e.g. 1500000"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Preview: {formatIndianCurrency(newProject.revenue)}</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                <select 
                  name="status" value={newProject.status} onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-200 appearance-none"
                >
                  <option value="On Track">On Track</option>
                  <option value="At Risk">At Risk</option>
                  <option value="Exceeding">Exceeding</option>
                </select>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800/50">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProjectMarginDashboard;