import React from 'react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Filter,
  ArrowRight,
  Info,
  BrainCircuit
} from 'lucide-react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const riskData = [
  { name: 'Project Alpha', impact: 8, probability: 70, score: 5.6, color: '#ef4444' },
  { name: 'Resource Bench', impact: 9, probability: 40, score: 3.6, color: '#f59e0b' },
  { name: 'Project Beta', impact: 4, probability: 20, score: 0.8, color: '#10b981' },
  { name: 'Global Billing', impact: 6, probability: 60, score: 3.6, color: '#f59e0b' },
  { name: 'Project Gamma', impact: 2, probability: 10, score: 0.2, color: '#10b981' },
  { name: 'Offshore Ramp-up', impact: 7, probability: 80, score: 5.6, color: '#ef4444' },
];

const RiskAnalysis = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-rose-500" />
            Risk Analysis
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Identify and mitigate potential margin and resource risks.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search risks..." className="pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-200" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all shadow-sm">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </header>

      {/* Risk Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">High Risks</p>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <h3 className="text-4xl font-black text-slate-100">04</h3>
          <p className="text-xs text-slate-500 mt-2 font-medium">Requiring immediate attention</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Medium Risks</p>
            <Info className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-4xl font-black text-slate-100">12</h3>
          <p className="text-xs text-slate-500 mt-2 font-medium">Being monitored by AI</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Mitigated</p>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <h3 className="text-4xl font-black text-slate-100">28</h3>
          <p className="text-xs text-slate-500 mt-2 font-medium">Resolved in the last 30 days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Risk Matrix Chart */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Risk Matrix</h3>
              <p className="text-sm text-slate-400 font-medium mt-1">Probability vs Impact mapping</p>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  type="number" 
                  dataKey="impact" 
                  name="Impact" 
                  unit="" 
                  domain={[0, 10]} 
                  label={{ value: 'Impact', position: 'bottom', offset: 0, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tick={{fill: '#64748b', fontSize: 12}}
                />
                <YAxis 
                  type="number" 
                  dataKey="probability" 
                  name="Probability" 
                  unit="%" 
                  domain={[0, 100]}
                  label={{ value: 'Probability', angle: -90, position: 'insideLeft', fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tick={{fill: '#64748b', fontSize: 12}}
                />
                <ZAxis type="number" dataKey="score" range={[100, 1000]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xl">
                          <p className="font-bold text-slate-100">{data.name}</p>
                          <p className="text-xs text-slate-500 mt-1">Impact: {data.impact}/10</p>
                          <p className="text-xs text-slate-500">Probability: {data.probability}%</p>
                          <p className="text-xs font-bold text-blue-400 mt-1 text-right">Risk Score: {data.score}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Risks" data={riskData}>
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Critical Alerts & Actions */}
        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-100 mb-6">Top Mitigation Actions</h3>
          <div className="space-y-4">
            {[
              { title: 'Optimize Project Alpha', action: 'Shift 2 FTEs to Offshore', risk: 'High', color: 'rose' },
              { title: 'Bench Utilization', action: 'Internal Skill Upskilling', risk: 'Med', color: 'amber' },
              { title: 'Contract SLA Review', action: 'Update Penalty Clauses', risk: 'Med', color: 'amber' },
              { title: 'Resource Allocation', action: 'Reassign from Bench', risk: 'Low', color: 'emerald' }
            ].map((item, i) => (
              <div key={i} className="p-4 border border-slate-800 rounded-xl hover:bg-slate-800/50 transition-colors group cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    item.color === 'rose' ? 'bg-rose-500/10 text-rose-400' :
                    item.color === 'amber' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {item.risk} Risk
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
                <h4 className="text-sm font-bold text-slate-200">{item.title}</h4>
                <p className="text-xs text-slate-500 mt-1 font-medium">{item.action}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 flex gap-3">
            <BrainCircuit className="w-5 h-5 text-blue-400 shrink-0" />
            <p className="text-[11px] text-blue-300 font-medium leading-relaxed">
              AI recommendations are based on historical mitigation success rates and current resource availability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAnalysis;
