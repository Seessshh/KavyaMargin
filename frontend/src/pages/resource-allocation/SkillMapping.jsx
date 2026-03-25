import React, { useState, useEffect } from 'react';
import { Target, Search, Download, Star, Code2, Database, Layout, Settings, Edit2, X, Save } from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

const SkillMapping = () => {
  // --- 1. RBAC SECURITY CHECK ---
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  // HR is specifically excluded here to enforce Read-Only mode
  const canEditResource = ['Super Admin', 'Company Admin', 'Project Manager', 'Team Lead'].includes(currentUser?.role);

  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    primarySkill: '',
    secondarySkill: '',
    proficiency: 'Beginner',
    experience: ''
  });

  // Fetch Employees from DB
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('https://kavyamargin.onrender.com/api/employees');
        if (response.ok) {
          const dbEmployees = await response.json();
          if (Array.isArray(dbEmployees)) {
            setEmployees(dbEmployees);
          }
        }
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  // Dynamic Summary Counters
  const engineeringCount = employees.filter(e => e.department === 'Engineering').length;
  const productCount = employees.filter(e => e.department === 'Product').length;
  const designCount = employees.filter(e => e.department === 'Design').length;
  const hrCount = employees.filter(e => e.department === 'HR').length;

  // Search Filter
  const filteredSkills = employees.filter(emp => {
    const nameMatch = (emp.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const primaryMatch = (emp.primarySkill || '').toLowerCase().includes(searchTerm.toLowerCase());
    const secondaryMatch = (emp.secondarySkill || '').toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || primaryMatch || secondaryMatch;
  });

  // Handle Modal Open/Close
  const openModal = (emp) => {
    setSelectedEmp(emp);
    setFormData({
      primarySkill: emp.primarySkill || '',
      secondarySkill: emp.secondarySkill || '',
      proficiency: emp.proficiency || 'Beginner',
      experience: emp.experience || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEmp(null);
  };

  // Handle Skill Update (PUT Request)
  const handleUpdateSkills = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`https://kavyamargin.onrender.com/api/employees/${selectedEmp.id || selectedEmp._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedEmployee = await response.json();
        setEmployees(employees.map(emp => 
          (emp.id || emp._id) === (updatedEmployee.id || updatedEmployee._id) ? updatedEmployee : emp
        ));
        closeModal();
      } else {
        alert("Failed to update skills.");
      }
    } catch (error) {
      console.error("Error updating skills:", error);
      alert("Server connection error.");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to render stars based on text proficiency
  const renderStars = (level) => {
    let score = 0;
    if (level === 'Expert') score = 5;
    if (level === 'Advanced') score = 4;
    if (level === 'Intermediate') score = 3;
    if (level === 'Beginner') score = 2;

    const starsArray = Array.from({length: 5}, (_, i) => i + 1); 

    return (
      <div className="flex items-center gap-1">
        {starsArray.map((star) => (
          <Star 
            key={star} 
            className={`w-3 h-3 ${
              star <= score ? 'text-amber-400 fill-amber-400' : 'text-slate-700 fill-slate-700'
            }`} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-500" />
            Skill Mapping
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Inventory and analysis of core competencies across the workforce.</p>
        </div>
        <button 
          onClick={() => exportToCSV(employees, 'Skill_Matrix.csv')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </header>

      {/* Dynamic Skill Categories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm text-center">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Code2 className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-100">Engineering</h4>
          <p className="text-2xl font-black text-slate-100 mt-1">{engineeringCount}</p>
          <p className="text-xs text-slate-500 font-medium">Resources</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm text-center">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Database className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-100">Product</h4>
          <p className="text-2xl font-black text-slate-100 mt-1">{productCount}</p>
          <p className="text-xs text-slate-500 font-medium">Resources</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm text-center">
          <div className="w-12 h-12 bg-pink-500/10 text-pink-400 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Layout className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-100">Design</h4>
          <p className="text-2xl font-black text-slate-100 mt-1">{designCount}</p>
          <p className="text-xs text-slate-500 font-medium">Resources</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm text-center">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Settings className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-100">HR</h4>
          <p className="text-2xl font-black text-slate-100 mt-1">{hrCount}</p>
          <p className="text-xs text-slate-500 font-medium">Resources</p>
        </div>
      </div>

      {/* Dynamic Skill Matrix Table */}
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by name or skill..."
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
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Resource</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Primary Skill</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Secondary Skill</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Proficiency</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Exp.</th>
                
                {/* SECURED: Actions Header */}
                {canEditResource && (
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredSkills.length === 0 ? (
                <tr>
                  <td colSpan={canEditResource ? "6" : "5"} className="px-6 py-8 text-center text-slate-500 text-sm">
                    No employees found.
                  </td>
                </tr>
              ) : (
                filteredSkills.map((emp) => (
                  <tr key={emp.id || emp._id} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-100">{emp.name}</span>
                        <span className="text-xs text-slate-500">{emp.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {emp.primarySkill ? (
                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">{emp.primarySkill}</span>
                      ) : (
                        <span className="text-xs text-slate-600 italic">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {emp.secondarySkill ? (
                        <span className="text-xs font-medium text-slate-300 bg-slate-800 px-2 py-1 rounded-md">{emp.secondarySkill}</span>
                      ) : (
                        <span className="text-xs text-slate-600 italic">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {emp.proficiency ? renderStars(emp.proficiency) : <span className="text-xs text-slate-600 italic">Not set</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-400">{emp.experience || '-'}</span>
                    </td>

                    {/* SECURED: Edit Skills Button */}
                    {canEditResource && (
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openModal(emp)}
                          className="p-2 text-slate-500 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Edit Skills"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Skills Modal */}
      {isModalOpen && canEditResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Update Skills</h3>
                <p className="text-xs text-slate-400 mt-1">Modifying skills for <strong className="text-slate-200">{selectedEmp?.name}</strong></p>
              </div>
              <button onClick={closeModal} className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateSkills} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Primary Skill</label>
                <input 
                  type="text" 
                  value={formData.primarySkill}
                  onChange={(e) => setFormData({...formData, primarySkill: e.target.value})}
                  placeholder="e.g. React.js"
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-200" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Secondary Skill</label>
                <input 
                  type="text" 
                  value={formData.secondarySkill}
                  onChange={(e) => setFormData({...formData, secondarySkill: e.target.value})}
                  placeholder="e.g. Node.js"
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-200" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Proficiency</label>
                <select 
                  value={formData.proficiency}
                  onChange={(e) => setFormData({...formData, proficiency: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-200 appearance-none"
                >
                  <option value="Beginner">Beginner (2 Stars)</option>
                  <option value="Intermediate">Intermediate (3 Stars)</option>
                  <option value="Advanced">Advanced (4 Stars)</option>
                  <option value="Expert">Expert (5 Stars)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Experience (Years)</label>
                <input 
                  type="text" 
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  placeholder="e.g. 5 Years"
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-200" 
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
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
                  {isSaving ? 'Saving...' : 'Save Skills'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillMapping;