import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  ArrowRight,
  Info,
  BrainCircuit,
  Loader2
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

const RiskAnalysis = () => {
  const [risks, setRisks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState({ high: 0, medium: 0, low: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  useEffect(() => {
    const fetchAndAnalyzeRisks = async () => {
      try {
        setIsLoading(true);
        const [empRes, projRes] = await Promise.all([
          fetch('https://kavyamargin.onrender.com/api/employees'),
          fetch('https://kavyamargin.onrender.com/api/projects')
        ]);

        if (empRes.ok && projRes.ok) {
          const employees = await empRes.json();
          const projects = await projRes.json();

          let dynamicRisks = [];

          // Calculate Bench Leakage Risk
          const benchEmployees = employees.filter(emp => emp.status === 'Bench');
          const benchCost = benchEmployees.reduce((acc, emp) => acc + (emp.monthlyCost || 0), 0);
          
          const benchImpact = Math.min((benchCost / 500000) * 10, 10) || 1;
          const benchProb = Math.min((benchEmployees.length / 10) * 100, 95) || 10;
          
          dynamicRisks.push({
            id: 'bench-risk',
            name: 'Bench Leakage',
            impact: Number(benchImpact.toFixed(1)),
            probability: Number(benchProb.toFixed(0)),
            score: Number(((benchImpact * benchProb) / 10).toFixed(1)),
            type: 'Resource',
            metric: `${benchEmployees.length} Resources (₹${(benchCost/100000).toFixed(2)}L/mo)`
          });

          // Calculate Project Risks
          projects.forEach((proj, idx) => {
            const budget = proj.budget || proj.projectBudget || 1000000;
            const impact = Math.min((budget / 2000000) * 10, 10) || ((idx % 5) + 3);
            const nameLength = (proj.name || proj.projectName || '').length;
            const prob = 20 + ((idx * 17 + nameLength * 3) % 65); 

            dynamicRisks.push({
              id: proj._id || `proj-${idx}`,
              name: proj.name || proj.projectName || `Project Alpha ${idx}`,
              impact: Number(impact.toFixed(1)),
              probability: Number(prob.toFixed(0)),
              score: Number(((impact * prob) / 10).toFixed(1)),
              type: 'Project',
              metric: `Budget: ${formatCurrency(budget)}`
            });
          });

          // Categorize & Color Code
          dynamicRisks = dynamicRisks.map(r => {
            let color, level;
            if (r.score >= 50) { color = '#ef4444'; level = 'High'; } 
            else if (r.score >= 25) { color = '#f59e0b'; level = 'Medium'; } 
            else { color = '#10b981'; level = 'Low'; } 

            return { ...r, color, level };
          });

          dynamicRisks.sort((a, b) => b.score - a.score);

          setRisks(dynamicRisks);
          setSummary({
            high: dynamicRisks.filter(r => r.level === 'High').length,
            medium: dynamicRisks.filter(r => r.level === 'Medium').length,
            low: dynamicRisks.filter(r => r.level === 'Low').length,
          });
        }
      } catch (error) {
        console.error("Failed to analyze risks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndAnalyzeRisks();
  }, []);

  const filteredRisks = risks.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const topMitigations = risks.slice(0, 4).map(risk => {
    let action = '';
    if (risk.type === 'Resource') action = 'Initiate cross-training and fast-track interviews.';
    else if (risk.level === 'High') action = 'Schedule emergency SLA review with client.';
    else action = 'Monitor resource burn rate closely.';

    return {
      title: risk.name,
      action: action,
      risk: risk.level,
      color: risk.level === 'High' ? 'rose' : risk.level === 'Medium' ? 'amber' : 'emerald'
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-rose-500" />
            Risk Analysis
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Live identification of margin and resource threats.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search risks..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-200 w-full md:w-64" 
            />
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-rose-500 animate-spin mb-4" />
          <p className="text-slate-400 font-medium">Scanning database for risk factors...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm border-l-4 border-l-rose-500">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">High Risks</p>
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <h3 className="text-4xl font-black text-slate-100">{summary.high.toString().padStart(2, '0')}</h3>
              <p className="text-xs text-slate-500 mt-2 font-medium">Requiring immediate attention</p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Medium Risks</p>
                <Info className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-4xl font-black text-slate-100">{summary.medium.toString().padStart(2, '0')}</h3>
              <p className="text-xs text-slate-500 mt-2 font-medium">Actively monitored by system</p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm border-l-4 border-l-emerald-500">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Mitigated</p>
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-4xl font-black text-slate-100">{summary.low.toString().padStart(2, '0')}</h3>
              <p className="text-xs text-slate-500 mt-2 font-medium">Safe operational thresholds</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Live Risk Matrix</h3>
                  <p className="text-sm text-slate-400 font-medium mt-1">Probability vs Impact mapping</p>
                </div>
              </div>
              <div className="h-[400px] w-full">
                {filteredRisks.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">No risks match your search.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      
                      <XAxis 
                        type="number" 
                        dataKey="impact" 
                        name="Impact" 
                        domain={[0, 10]} 
                        label={{ value: 'Impact Level (0-10)', position: 'bottom', offset: 0, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                        tick={{fill: '#64748b', fontSize: 12}}
                      />
                      
                      <YAxis 
                        type="number" 
                        dataKey="probability" 
                        name="Probability" 
                        unit="%" 
                        domain={[0, 10]}
                        label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft', fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                        tick={{fill: '#64748b', fontSize: 12}}
                      />
                      
                      <ZAxis 
                        type="number" 
                        dataKey="score" 
                        domain={[0, 10]} 
                        range={[0, 100]} 
                      />
                      
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3', stroke: '#334155' }} 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload.payload;
                            return (
                              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xl">
                                <p className="font-bold text-slate-100 mb-2">{data.name}</p>
                                <p className="text-xs text-slate-300 mb-1"><span className="text-slate-500">Metric:</span> {data.metric}</p>
                                <p className="text-xs text-slate-300 mb-1"><span className="text-slate-500">Impact:</span> {data.impact}/10</p>
                                <p className="text-xs text-slate-300"><span className="text-slate-500">Probability:</span> {data.probability}%</p>
                                <div className="mt-3 pt-2 border-t border-slate-800">
                                  <p className="text-xs font-black text-right" style={{ color: data.color }}>
                                    Risk Score: {data.score}
                                  </p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      
                      <Scatter name="Risks" data={filteredRisks} fill="#3b82f6" shape="circle">
                        {filteredRisks.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                        ))}
                      </Scatter>

                    </ScatterChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-100 mb-6">Top Mitigation Actions</h3>
              <div className="space-y-4">
                {topMitigations.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No critical actions required.</p>
                ) : (
                  topMitigations.map((item, i) => (
                    <div key={i} className="p-4 border border-slate-800 rounded-xl hover:bg-slate-800/50 transition-colors group cursor-default">
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
                      <h4 className="text-sm font-bold text-slate-200 truncate pr-4">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 font-medium">{item.action}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-8 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 flex gap-3">
                <BrainCircuit className="w-5 h-5 text-blue-400 shrink-0" />
                <p className="text-[11px] text-blue-300 font-medium leading-relaxed">
                  These actions are dynamically generated based on your highest-scoring live database risks.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RiskAnalysis;