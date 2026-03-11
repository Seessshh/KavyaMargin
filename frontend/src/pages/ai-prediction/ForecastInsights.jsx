import React from 'react';
import { 
  BarChart3, 
  Lightbulb, 
  ArrowRight, 
  TrendingUp, 
  Target, 
  Layers,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Line
} from 'recharts';

const forecastData = [
  { month: 'Jul', revenue: 450000, cost: 320000, target: 480000 },
  { month: 'Aug', revenue: 480000, cost: 335000, target: 490000 },
  { month: 'Sep', revenue: 520000, cost: 350000, target: 510000 },
  { month: 'Oct', revenue: 580000, cost: 380000, target: 550000 },
  { month: 'Nov', revenue: 610000, cost: 400000, target: 600000 },
  { month: 'Dec', revenue: 650000, cost: 420000, target: 630000 },
];

const ForecastInsights = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-blue-500" />
            Forecast Insights
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Strategic revenue and cost projections with AI-derived recommendations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all shadow-sm">
            Export Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
            Apply Recommendations
          </button>
        </div>
      </header>

      {/* Insight Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Est. Revenue H2</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-slate-100">₹3.24M</h3>
            <span className="text-emerald-400 font-bold text-xs">+14%</span>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Est. Cost H2</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-slate-100">₹2.21M</h3>
            <span className="text-rose-400 font-bold text-xs">+8%</span>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Projected Margin</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-slate-100">31.8%</h3>
            <span className="text-emerald-400 font-bold text-xs">Target Met</span>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Forecast Accuracy</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-slate-100">94.2%</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Composed Chart */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-100">H2 2026 Projections</h3>
              <p className="text-sm text-slate-400 font-medium mt-1">Revenue vs Cost with target trajectory</p>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} 
                  dx={-10}
                  tickFormatter={(value) => `₹${value/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    color: '#f1f5f9',
                    padding: '12px'
                  }} 
                />
                <Legend iconType="circle" verticalAlign="top" height={36}/>
                <Bar dataKey="revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Proj. Revenue" />
                <Bar dataKey="cost" fill="#1e293b" radius={[4, 4, 0, 0]} name="Proj. Cost" />
                <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={3} dot={{r: 4}} name="Target Revenue" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-100">AI Recommendations</h3>
          </div>
          <div className="space-y-4">
            {[
              { 
                title: 'Revenue Acceleration', 
                desc: 'Increase offshore billing mix by 5% in Q4 to exceed revenue targets by ₹240k.',
                impact: 'High Impact',
                icon: TrendingUp
              },
              { 
                title: 'Cost Optimization', 
                desc: 'Consolidate training programs for bench resources to reduce indirect costs by 12%.',
                impact: 'Medium Impact',
                icon: Layers
              },
              { 
                title: 'Contract Upsell', 
                desc: 'Project Gamma SLA performance indicates a 85% probability of successful contract expansion.',
                impact: 'Growth Opp',
                icon: Target
              }
            ].map((rec, i) => (
              <div key={i} className="p-5 border border-slate-800 rounded-2xl bg-slate-800/50 hover:bg-slate-800 transition-all cursor-pointer group">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-slate-900 rounded-lg shadow-sm border border-slate-800">
                    <rec.icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">{rec.impact}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{rec.title}</h4>
                <p className="text-[11px] text-slate-500 mt-2 font-medium leading-relaxed">{rec.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastInsights;
