import React, { useState } from 'react';
import { BarChart3, TrendingUp, Download, Search, Filter, AlertCircle, CheckCircle2 } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';

const ProjectMarginDashboard = () => {
  const [projects, setProjects] = useState([
    { id: 1, name: 'Project Alpha', client: 'TechCorp', margin: 32, status: 'On Track', revenue: '₹4.5M' },
    { id: 2, name: 'Project Beta', client: 'GlobalSoft', margin: 18, status: 'At Risk', revenue: '₹2.1M' },
    { id: 3, name: 'Cloud Migration', client: 'SkyHigh', margin: 45, status: 'Exceeding', revenue: '₹8.4M' },
    { id: 4, name: 'Mobile App', client: 'FitTrack', margin: 24, status: 'On Track', revenue: '₹3.2M' },
    { id: 5, name: 'AI Engine', client: 'DeepMind', margin: 38, status: 'Exceeding', revenue: '₹6.7M' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500" id="project-margin-content">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary-600" />
            Project Margin Dashboard
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Monitor real-time profitability across your entire project portfolio.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => exportToCSV(projects, 'Project_Margins.csv')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button 
            onClick={() => exportToPDF('project-margin-content', 'Margin_Dashboard.pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20"
          >
            Full Report PDF
          </button>
        </div>
      </header>

      {/* Overview Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-sm transition-all">
          <h3 className="text-lg font-bold text-slate-100 mb-8">Margin Distribution (%)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projects}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} 
                  unit="%"
                />
                <Tooltip 
                  cursor={{fill: '#0f172a'}}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: '#0f172a',
                    color: '#f8fafc'
                  }}
                />
                <Bar dataKey="margin" radius={[4, 4, 0, 0]}>
                  {projects.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.margin < 20 ? '#f43f5e' : entry.margin > 35 ? '#10b981' : '#0ea5e9'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-sm transition-all">
          <h3 className="text-lg font-bold text-slate-100 mb-6">Portfolio Summary</h3>
          <div className="space-y-6">
            <div className="p-4 bg-emerald-900/10 rounded-2xl border border-emerald-900/20">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Avg. Portfolio Margin</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-3xl font-black text-emerald-100 mt-2">31.4%</p>
            </div>
            <div className="p-4 bg-rose-900/10 rounded-2xl border border-rose-900/20">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">At Risk Projects</span>
                <AlertCircle className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-3xl font-black text-rose-100 mt-2">01</p>
            </div>
            <div className="p-4 bg-primary-900/10 rounded-2xl border border-primary-900/20">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-primary-500 uppercase tracking-widest">Total Active Revenue</span>
                <TrendingUp className="w-4 h-4 text-primary-500" />
              </div>
              <p className="text-3xl font-black text-primary-100 mt-2">₹24.9M</p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden transition-all">
        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search project or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 outline-none text-slate-200"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-xl text-sm font-bold transition-all border border-slate-800">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredProjects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-200">{p.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-400 font-medium">{p.client}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-black ${p.margin < 20 ? 'text-rose-500' : p.margin > 35 ? 'text-emerald-500' : 'text-primary-500'}`}>
                        {p.margin}%
                      </span>
                      <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                        <div 
                          className={`h-full rounded-full ${p.margin < 20 ? 'bg-rose-500' : p.margin > 35 ? 'bg-emerald-500' : 'bg-primary-500'}`}
                          style={{ width: `${p.margin}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-200">{p.revenue}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      p.status === 'Exceeding' ? 'bg-emerald-900/20 text-emerald-500' : 
                      p.status === 'At Risk' ? 'bg-rose-900/20 text-rose-500' : 
                      'bg-primary-900/20 text-primary-500'
                    }`}>
                      {p.status}
                    </span>
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

export default ProjectMarginDashboard;
