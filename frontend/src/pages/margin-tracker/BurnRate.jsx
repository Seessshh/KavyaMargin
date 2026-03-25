import React, { useState, useEffect } from 'react';
import { Activity, Download, TrendingDown, TrendingUp, AlertTriangle, Zap, Clock, IndianRupee } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { exportToCSV } from '../../utils/exportUtils';

const BurnRate = () => {
  // 1. State for Database Projects
  const [projects, setProjects] = useState([]);

  // 2. Fetch from MongoDB
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/projects');
        if (response.ok) {
          const dbProjects = await response.json();
          if (Array.isArray(dbProjects)) {
            setProjects(dbProjects);
          }
        }
      } catch (error) {
        console.error("Failed to fetch projects for burn rate:", error);
      }
    };

    fetchProjects();
  }, []);

  // 3. Process Project Data 
  const dynamicProjects = projects.map(p => {
    const budget = parseFloat(p.revenue.replace(/[^0-9.]/g, '')) || 0;
    const spent = budget * (1 - (p.margin / 100));
    return { ...p, budget, spent };
  });

  const totalPortfolioBudget = dynamicProjects.reduce((sum, p) => sum + p.budget, 0) || 600000;
  const totalPortfolioSpent = dynamicProjects.reduce((sum, p) => sum + p.spent, 0) || 500000;

  // 4. Monthly Burn Rate Math
  const monthlyBudget = totalPortfolioBudget / 6;
  const currentMonthSpent = totalPortfolioSpent / 6;
  
  const currentDay = new Date().getDate(); 
  const daysInMonth = 30;

  const chartIntervals = [1, 5, 10, 15, 20, 25, 30];
  const dynamicBurnData = chartIntervals.map(day => {
    const projectedAtDay = monthlyBudget * (day / daysInMonth);
    let actualBurnAtDay = null;
    if (day <= currentDay) {
      actualBurnAtDay = currentMonthSpent * (day / currentDay);
    }
    return { day: `Day ${day}`, projected: projectedAtDay, burn: actualBurnAtDay };
  });

  // 5. Insight Card Calculations
  const dailyBurnRate = currentMonthSpent / (currentDay === 0 ? 1 : currentDay);
  const remainingBudgetThisMonth = monthlyBudget - currentMonthSpent;
  const runwayDaysRemaining = dailyBurnRate > 0 
    ? Math.max(0, Math.round(remainingBudgetThisMonth / dailyBurnRate)) 
    : daysInMonth;
  
  const daysLeftInMonth = daysInMonth - currentDay;
  const isCritical = runwayDaysRemaining < daysLeftInMonth;

  // 6. Currency Formatter
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR', 
    maximumFractionDigits: 0 
  }).format(val);

  // ------------------------------------------------------------------
  // 7. NEW: DYNAMIC MITIGATION ACTIONS LOGIC
  // ------------------------------------------------------------------
  const generateActions = () => {
    let actions = [];

    // Action 1: Burn Rate Emergency Check
    if (isCritical) {
      const savingsTarget = dailyBurnRate * 0.20; // Suggest cutting 20% of daily burn
      actions.push({
        label: 'Freeze Non-Billable Hours',
        impact: `Target Save: ${formatCurrency(savingsTarget)}/day`,
        status: 'Urgent'
      });
    } else {
      actions.push({
        label: 'Cloud Infrastructure Audit',
        impact: 'Reduce fixed server costs by 5%',
        status: 'Pending'
      });
    }

    // Action 2: Low Margin Intervention Check (< 25% margin)
    const lowMarginProjects = dynamicProjects.filter(p => p.margin < 25);
    if (lowMarginProjects.length > 0) {
      // Find the absolute worst performing project
      const worstProject = lowMarginProjects.sort((a, b) => a.margin - b.margin)[0];
      actions.push({
        label: `Scope Review: ${worstProject.name}`,
        impact: `Boost margin from ${worstProject.margin}% to target 25%`,
        status: 'Ready'
      });
    } else {
      actions.push({
        label: 'Maintain Current Velocity',
        impact: 'All project margins are healthy (>25%)',
        status: 'Monitoring'
      });
    }

   // Action 3: Over-Budget Project Check
    const overBudgetProjects = dynamicProjects.filter(p => p.spent > p.budget);
    if (overBudgetProjects.length > 0) {
      actions.push({
        label: `Resource Swap: ${overBudgetProjects[0].name}`,
        impact: 'Swap senior dev for mid-level to lower hourly cost',
        status: 'In Progress'
      });
    } else {
      actions.push({
        label: 'Team Training & Upskilling',
        impact: 'Invest surplus runway in certifications',
        status: 'Ready'
      });
    }

    return actions;
  };

  const mitigationActions = generateActions();

  return (
    <div className="space-y-8 animate-in fade-in duration-500" id="burn-rate-content">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <IndianRupee className="w-8 h-8 text-primary-600" />
            Burn Rate Analysis
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Track daily expenditure velocity to prevent budget overruns.</p>
        </div>
        <button 
          onClick={() => exportToCSV(dynamicBurnData, 'Burn_Rate_Analysis.csv')}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </header>

      {/* Burn Velocity Chart */}
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-sm transition-all">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-100">Cumulative Burn Velocity</h3>
            <p className="text-sm text-slate-400 font-medium mt-1">Current month expenditure trajectory</p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-rose-500 rounded-full" />
              <span className="text-rose-500">Actual Burn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-800 rounded-full" />
              <span className="text-slate-400">Projected</span>
            </div>
          </div>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%" minHeight={100}>
            <LineChart data={dynamicBurnData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
              <Tooltip 
                cursor={{stroke: '#1e293b', strokeWidth: 1}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#0f172a', color: '#f8fafc' }}
                formatter={(val) => [val ? formatCurrency(val) : 'N/A', '']}
              />
              <Line type="monotone" dataKey="projected" stroke="#334155" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              <Line type="monotone" dataKey="burn" stroke="#f43f5e" strokeWidth={4} dot={{r: 6, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff'}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dynamic Insights */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <Clock className={`w-16 h-16 ${isCritical ? 'text-rose-600' : 'text-emerald-600'}`} />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Runway Remaining</p>
            <h3 className="text-3xl font-black text-slate-100 mt-2">{runwayDaysRemaining} Days</h3>
            <p className={`text-xs font-bold mt-2 flex items-center gap-1 ${isCritical ? 'text-rose-500' : 'text-emerald-500'}`}>
              {isCritical ? <AlertTriangle className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isCritical ? 'Critical: Burn exceeding budget' : 'Healthy: Sufficient runway available'}
            </p>
          </div>
          
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <Zap className="w-16 h-16 text-primary-600" />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Daily Burn Rate</p>
            <h3 className="text-3xl font-black text-slate-100 mt-2">{formatCurrency(dailyBurnRate)}</h3>
            <p className="text-xs text-slate-400 font-bold mt-2 flex items-center gap-1">
              Based on {currentDay} days of activity
            </p>
          </div>
        </div>

        {/* Dynamic Action Center */}
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
          <h4 className="text-slate-100 font-bold text-lg mb-6">Mitigation Actions</h4>
          <div className="space-y-4">
            {projects.length === 0 ? (
               <div className="p-4 text-center text-sm text-slate-500">Add projects to see mitigation insights.</div>
            ) : (
              mitigationActions.map((action, i) => (
                <div key={i} className="p-4 bg-slate-950 rounded-xl border border-slate-800 hover:bg-slate-800 transition-all cursor-pointer">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-200">{action.label}</span>
                    <span className={`text-[10px] font-black uppercase ${
                      action.status === 'Urgent' ? 'text-rose-500 animate-pulse' : 
                      action.status === 'Ready' ? 'text-emerald-400' : 
                      action.status === 'Monitoring' ? 'text-primary-400' :
                      action.status === 'Pending' ? 'text-amber-400' : 'text-slate-400'
                    }`}>
                      {action.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">{action.impact}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BurnRate;