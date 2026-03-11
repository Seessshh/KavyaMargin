import React, { useState } from 'react';
import { Briefcase, Search, Download, Filter, Clock, AlertTriangle } from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

const benchData = [
  { id: 1, name: 'Rahul Reddy', role: 'Product Manager', dept: 'Product', benchTime: '45 Days', cost: '₹2.0L/mo', status: 'Available' },
  { id: 2, name: 'Kiran Deep', role: 'QA Lead', dept: 'Engineering', benchTime: '12 Days', cost: '₹1.1L/mo', status: 'Interviewing' },
  { id: 3, name: 'Sneha Rao', role: 'Data Analyst', dept: 'Data', benchTime: '62 Days', cost: '₹1.4L/mo', status: 'Available' },
  { id: 4, name: 'Vikram Singh', role: 'DevOps Engineer', dept: 'Engineering', benchTime: '5 Days', cost: '₹1.8L/mo', status: 'Available' },
];

const BenchList = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBench = benchData.filter(res => 
    res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.dept.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-blue-500" />
            Bench List
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Detailed inventory of unallocated resources and their bench duration.</p>
        </div>
        <button 
          onClick={() => exportToCSV(benchData, 'Bench_Inventory.csv')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export Inventory
        </button>
      </header>

      {/* Bench Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm transition-colors">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Bench Count</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-100">21</h3>
            <span className="text-xs font-bold text-slate-500">Resources</span>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm transition-colors">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Avg. Bench Time</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-100">18</h3>
            <span className="text-xs font-bold text-slate-500">Days</span>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm transition-colors">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Critical ({'>'}60 Days)</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-rose-500">03</h3>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
        </div>
      </div>

      {/* Bench Table */}
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
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all border border-slate-700">
            <Filter className="w-4 h-4" />
            Filter by Dept
          </button>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredBench.map((res) => (
                <tr key={res.id} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-slate-100">{res.name}</p>
                      <p className="text-xs text-slate-400 font-medium">{res.role}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-500">{res.dept}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className={`w-3.5 h-3.5 ${parseInt(res.benchTime) > 30 ? 'text-rose-500' : 'text-slate-500'}`} />
                      <span className={`text-sm font-bold ${parseInt(res.benchTime) > 30 ? 'text-rose-400' : 'text-slate-300'}`}>
                        {res.benchTime}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-slate-100">{res.cost}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      res.status === 'Interviewing' 
                        ? 'bg-amber-500/10 text-amber-400' 
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {res.status}
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

export default BenchList;
