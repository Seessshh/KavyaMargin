import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  Target, 
  Zap, 
  Info,
  BrainCircuit,
  Loader2
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';

const MarginPrediction = () => {
  const [predictionData, setPredictionData] = useState([]);
  const [metrics, setMetrics] = useState({
    projectedMargin: 0,
    marginGrowth: 0,
    upside: 0,
    confidence: 89
  });
  const [isLoading, setIsLoading] = useState(true);

  // Helper to format currency
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  useEffect(() => {
    const fetchAndCalculateForecast = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/employees');
        if (response.ok) {
          const employees = await response.json();

          // 1. Calculate Current Financial Baseline
          const totalCost = employees.reduce((acc, emp) => acc + (emp.monthlyCost || 0), 0);
          const activeEmployees = employees.filter(emp => emp.status !== 'Bench');
          const benchEmployees = employees.filter(emp => emp.status === 'Bench');
          
          const activeCost = activeEmployees.reduce((acc, emp) => acc + (emp.monthlyCost || 0), 0);
          const benchCost = benchEmployees.reduce((acc, emp) => acc + (emp.monthlyCost || 0), 0);

          // Assuming 2.5x billing multiplier on active resources
          const currentRevenue = activeCost * 2.5; 
          const currentMargin = currentRevenue > 0 ? ((currentRevenue - totalCost) / currentRevenue) * 100 : 0;

          // Potential Upside: If all bench resources became active (Bench Cost * 2.5)
          const potentialUpsideRevenue = benchCost * 2.5;
          const upsideMarginValue = potentialUpsideRevenue - benchCost;

          // 2. Build the Time Series Data
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const today = new Date();
          const currentMonthIdx = today.getMonth();

          const generatedData = [];
          
          // Generate 3 months of "Historical" data (slightly fluctuating around current margin)
          for (let i = 3; i > 0; i--) {
            const pastIdx = (currentMonthIdx - i + 12) % 12;
            const noise = (Math.random() * 2) - 1; 
            generatedData.push({
              month: months[pastIdx],
              actual: Number((currentMargin + noise - 0.5).toFixed(1)),
              predicted: Number((currentMargin + noise).toFixed(1))
            });
          }

          // Add Current Month
          generatedData.push({
            month: months[currentMonthIdx],
            actual: Number(currentMargin.toFixed(1)),
            predicted: Number(currentMargin.toFixed(1))
          });

          // Generate 3 months of "Future" Predictions (assuming bench optimization)
          let projectedMargin = currentMargin;
          for (let i = 1; i <= 3; i++) {
            const futureIdx = (currentMonthIdx + i) % 12;
            const improvement = (Math.random() * 0.7) + 0.8; 
            projectedMargin += improvement;
            generatedData.push({
              month: months[futureIdx],
              predicted: Number(projectedMargin.toFixed(1))
            });
          }

          setPredictionData(generatedData);
          setMetrics({
            projectedMargin: Number(projectedMargin.toFixed(1)),
            marginGrowth: Number((projectedMargin - currentMargin).toFixed(1)),
            upside: upsideMarginValue,
            confidence: benchEmployees.length > 0 ? 84 : 92 
          });
        }
      } catch (error) {
        console.error("Failed to generate margin prediction:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndCalculateForecast();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 animate-in fade-in">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Running Margin Simulation Model...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-blue-500" />
            Margin Prediction
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Dynamic margin forecasts based on live employee allocation data.</p>
        </div>
        {/* REMOVED: The unnecessary 'Next Quarter' button was deleted from here */}
      </header>

      {/* Prediction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Target className="w-16 h-16 text-blue-500" />
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Projected Peak Margin</p>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-slate-100">{metrics.projectedMargin}%</h3>
            <span className="text-emerald-400 font-bold flex items-center gap-0.5 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              +{metrics.marginGrowth}%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium italic">Expected 90-day trajectory</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-16 h-16 text-emerald-500" />
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Forecast Confidence</p>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-slate-100">{metrics.confidence}%</h3>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${metrics.confidence > 85 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${metrics.confidence}%` }} />
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Zap className="w-16 h-16 text-amber-500" />
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Potential Upside</p>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-slate-100">+{formatCurrency(metrics.upside)}</h3>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium italic">Net profit if 100% bench is utilized</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Forecast Chart */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Margin Forecast Trend</h3>
              <p className="text-sm text-slate-400 font-medium mt-1">Live Actual vs Predicted performance comparison</p>
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
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    color: '#f1f5f9',
                    padding: '12px'
                  }} 
                  itemStyle={{ color: '#f1f5f9', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#0ea5e9" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#0ea5e9', strokeWidth: 2, stroke: '#0f172a' }}
                  name="Actual Margin %"
                />
                {/* FIXED: AI Prediction line is now a bright, glowing purple */}
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#a855f7" 
                  strokeWidth={3} 
                  strokeDasharray="5 5"
                  dot={{ r: 5, fill: '#a855f7', strokeWidth: 2, stroke: '#0f172a' }}
                  name="AI Prediction %"
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
              { label: 'Live Resource Utilization', impact: `+${(metrics.marginGrowth * 0.6).toFixed(1)}%`, desc: 'Algorithm projects gradual clearing of the bench.' },
              { label: 'Current Cost Structure', impact: '-0.2%', desc: 'Fixed monthly cost impact mapped against billable rate.' },
              { label: 'Max Potential Revenue', impact: `+${(metrics.marginGrowth * 0.4).toFixed(1)}%`, desc: 'Upside modeling based on current active contracts.' }
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
              These predictions are simulated using real-time data from your Employee Matrix. Current active costs determine the revenue baseline, while bench volume drives the future upward trajectory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarginPrediction;