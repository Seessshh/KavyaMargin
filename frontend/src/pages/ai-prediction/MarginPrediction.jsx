import React from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Target, 
  Zap, 
  Calendar,
  Info
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';

const predictionData = [
  { month: 'Jan', actual: 18.5, predicted: 18.5 },
  { month: 'Feb', actual: 19.2, predicted: 19.0 },
  { month: 'Mar', actual: 20.1, predicted: 19.8 },
  { month: 'Apr', actual: 19.5, predicted: 20.5 },
  { month: 'May', predicted: 21.2 },
  { month: 'Jun', predicted: 22.5 },
  { month: 'Jul', predicted: 23.8 },
];

const MarginPrediction = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-blue-500" />
            Margin Prediction
          </h1>
          <p className="text-slate-400 mt-2 font-medium">AI-driven margin forecasts and performance projections.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all shadow-sm">
            <Calendar className="w-4 h-4" />
            Q3 2026
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
            Run Simulation
          </button>
        </div>
      </header>

      {/* Prediction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Target className="w-16 h-16 text-blue-500" />
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Projected Q3 Margin</p>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-slate-100">23.8%</h3>
            <span className="text-emerald-400 font-bold flex items-center gap-0.5 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              +2.1%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium italic">Based on current resource allocation & contracts</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-16 h-16 text-emerald-500" />
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Confidence Level</p>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-slate-100">89%</h3>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '89%' }} />
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Zap className="w-16 h-16 text-amber-500" />
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Potential Upside</p>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-slate-100">+₹1.2M</h3>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium italic">Through bench optimization in July</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Forecast Chart */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Margin Forecast Trend</h3>
              <p className="text-sm text-slate-400 font-medium mt-1">Actual vs Predicted performance comparison</p>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictionData}>
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
                  unit="%"
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
                <Legend iconType="circle" />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#0ea5e9" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#0ea5e9', strokeWidth: 2, stroke: '#0f172a' }}
                  name="Actual Margin"
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#475569" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: '#475569', strokeWidth: 1, stroke: '#0f172a' }}
                  name="AI Prediction"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prediction Drivers */}
        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-100 mb-6">Key Prediction Drivers</h3>
          <div className="space-y-6">
            {[
              { label: 'Resource Utilization', impact: '+1.4%', desc: 'Expected increase in billable hours' },
              { label: 'Project Portfolio Mix', impact: '+0.8%', desc: 'Shift towards high-margin offshore projects' },
              { label: 'Currency Volatility', impact: '-0.3%', desc: 'Predicted INR-USD fluctuations' },
              { label: 'Bench Cost reduction', impact: '+0.5%', desc: 'Scheduled project ramp-ups' }
            ].map((driver, i) => (
              <div key={i} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 group hover:border-blue-500/30 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-200">{driver.label}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${driver.impact.startsWith('+') ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                    {driver.impact}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">{driver.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 flex gap-3">
            <Info className="w-5 h-5 text-blue-400 shrink-0" />
            <p className="text-[11px] text-blue-300 font-medium leading-relaxed">
              Predictions are generated using historical data from the past 24 months and current project pipelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal icon import since BrainCircuit was used in header but not imported from lucide
import { BrainCircuit } from 'lucide-react';

export default MarginPrediction;
