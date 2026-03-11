import React, { useState } from 'react';
import { Calendar, Search, Download, Filter, UserPlus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

const availabilityData = [
  { id: 1, name: 'Amit Verma', currentProject: 'Project Alpha', releaseDate: '2026-04-15', availability: '0%', allocation: '100%' },
  { id: 2, name: 'Sonal Singh', currentProject: 'Design System', releaseDate: '2026-03-20', availability: '20%', allocation: '80%' },
  { id: 3, name: 'Rahul Reddy', currentProject: 'None', releaseDate: 'Immediate', availability: '100%', allocation: '0%' },
  { id: 4, name: 'Pooja Gupta', currentProject: 'Mobile App', releaseDate: '2026-05-10', availability: '0%', allocation: '100%' },
  { id: 5, name: 'Kiran Deep', currentProject: 'None', releaseDate: 'Immediate', availability: '100%', allocation: '0%' },
];

const AvailabilityTracker = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAvailability = availabilityData.filter(res => 
    res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.currentProject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-500" />
            Resource Availability Tracker
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Monitor upcoming roll-offs and resource availability for future planning.</p>
        </div>
        <button 
          onClick={() => exportToCSV(availabilityData, 'Resource_Availability.csv')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </header>

      {/* Release Timeline Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm border-t-4 border-t-emerald-500/80">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Available Now</h4>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-100">21</h3>
            <span className="text-xs font-bold text-emerald-400">Resources</span>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm border-t-4 border-t-blue-500/80">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Releasing in 30 Days</h4>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-100">12</h3>
            <span className="text-xs font-bold text-blue-400">Resources</span>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm border-t-4 border-t-amber-500/80">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Releasing in 60 Days</h4>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-100">34</h3>
            <span className="text-xs font-bold text-amber-400">Resources</span>
          </div>
        </div>
      </div>

      {/* Availability Table */}
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search resource..."
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
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredAvailability.map((res) => (
                <tr key={res.id} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-100">{res.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-400 font-medium">{res.currentProject}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold ${res.releaseDate === 'Immediate' ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {res.releaseDate}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${parseInt(res.availability) > 50 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                          style={{ width: res.availability }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-400">{res.availability}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-400 hover:text-blue-300 font-bold text-xs flex items-center justify-end gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      Request Allocation
                      <ArrowRight className="w-3 h-3" />
                    </button>
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

export default AvailabilityTracker;
