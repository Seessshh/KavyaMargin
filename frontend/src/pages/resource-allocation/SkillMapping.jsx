import React, { useState } from 'react';
import { Target, Search, Download, Star, Filter, Code2, Database, Layout, Settings } from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

const skillData = [
  { id: 1, resource: 'Amit Verma', primary: 'React.js', secondary: 'Node.js', level: 'Expert', experience: '8 Years' },
  { id: 2, resource: 'Sonal Singh', primary: 'Figma', secondary: 'Adobe XD', level: 'Expert', experience: '5 Years' },
  { id: 3, resource: 'Rahul Reddy', primary: 'Agile/Scrum', secondary: 'Jira', level: 'Intermediate', experience: '10 Years' },
  { id: 4, resource: 'Pooja Gupta', primary: 'Java', secondary: 'Spring Boot', level: 'Expert', experience: '6 Years' },
  { id: 5, resource: 'Kiran Deep', primary: 'Selenium', secondary: 'Cypress', level: 'Advanced', experience: '4 Years' },
];

const SkillMapping = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSkills = skillData.filter(s => 
    s.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.primary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.secondary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-500" />
            Skill Mapping
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Inventory and analysis of core competencies across the workforce.</p>
        </div>
        <button 
          onClick={() => exportToCSV(skillData, 'Skill_Matrix.csv')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </header>

      {/* Skill Categories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm text-center">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Code2 className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-100">Frontend</h4>
          <p className="text-2xl font-black text-slate-100 mt-1">45</p>
          <p className="text-xs text-slate-500 font-medium">Resources</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm text-center">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Database className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-100">Backend</h4>
          <p className="text-2xl font-black text-slate-100 mt-1">68</p>
          <p className="text-xs text-slate-500 font-medium">Resources</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm text-center">
          <div className="w-12 h-12 bg-pink-500/10 text-pink-400 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Layout className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-100">Design</h4>
          <p className="text-2xl font-black text-slate-100 mt-1">18</p>
          <p className="text-xs text-slate-500 font-medium">Resources</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm text-center">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Settings className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-100">DevOps</h4>
          <p className="text-2xl font-black text-slate-100 mt-1">24</p>
          <p className="text-xs text-slate-500 font-medium">Resources</p>
        </div>
      </div>

      {/* Skill Matrix Table */}
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
          <button className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-xl text-sm font-bold transition-all border border-slate-800">
            <Filter className="w-4 h-4" />
            Advanced Search
          </button>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredSkills.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-100">{s.resource}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">{s.primary}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-300 bg-slate-800 px-2 py-1 rounded-md">{s.secondary}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-3 h-3 ${
                            s.level === 'Expert' ? 'text-amber-400 fill-amber-400' : 
                            s.level === 'Advanced' && star <= 4 ? 'text-amber-400 fill-amber-400' :
                            s.level === 'Intermediate' && star <= 3 ? 'text-amber-400 fill-amber-400' :
                            'text-slate-700 fill-slate-700'
                          }`} 
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-400">{s.experience}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SkillMapping;
