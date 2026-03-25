import React, { useState, useEffect } from 'react';
import { Target, Download, TrendingUp, AlertCircle, Search, ChevronRight, IndianRupee, PieChart } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { exportToCSV } from '../../utils/exportUtils';

const BudgetTracking = () => {
  // 1. State for Database Projects & Expanded UI
  const [projects, setProjects] = useState([]);
  const [expandedProject, setExpandedProject] = useState(null); // NEW: Tracks which card is open

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
        console.error("Failed to fetch projects for budget tracking:", error);
      }
    };

    fetchProjects();
  }, []);

  // 3. Dynamic Calculations for Project Cards
  // Upgraded to pass through original data for the expanded view
  const dynamicProjects = projects.map(p => {
    const budget = parseFloat(p.revenue.replace(/[^0-9.]/g, '')) || 0;
    const spent = budget * (1 - (p.margin / 100));

    return {
      id: p.id,
      name: p.name,
      originalRevenue: p.revenue, // Keeps the original "₹1.5M" string for display
      margin: p.margin,
      budget: budget,
      spent: spent
    };
  });

  // 4. Dynamic Calculations for the Area Chart (Rolling 6-Month Window)
  const totalBudget = dynamicProjects.reduce((sum, p) => sum + p.budget, 0) || 500000;
  const totalSpent = dynamicProjects.reduce((sum, p) => sum + p.spent, 0) || 450000;

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return d.toLocaleString('en-US', { month: 'short' });
  });

  const dynamicChartData = months.map((month, index) => {
    const progression = (index + 1) / 6;
    return { month: month, budget: totalBudget * progression, actual: totalSpent * progression };
  });

  // 5. Format Currency Helper
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR', 
    maximumFractionDigits: 0 
  }).format(val);

  // 6. Toggle Expansion Handler
  const toggleExpand = (projectId) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500" id="budget-tracking-content">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <IndianRupee className="w-8 h-8 text-primary-600" />
            Budget Tracking
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Compare allocated budgets against actual expenditures across projects.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => exportToCSV(dynamicChartData, 'Budget_Analysis.csv')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </header>

      {/* Overview Chart */}
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-sm transition-all">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-100">Budget vs Actual Spend</h3>
            <p className="text-sm text-slate-400 font-medium mt-1">Rolling 6-month historical tracking</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary-500 rounded-full" />
              <span className="text-xs font-bold text-slate-400">Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-800 rounded-full" />
              <span className="text-xs font-bold text-slate-400">Budget</span>
            </div>
          </div>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%" minHeight={100}>
            <AreaChart data={dynamicChartData}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
              <Tooltip 
                cursor={{stroke: '#1e293b', strokeWidth: 1}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#0f172a', color: '#f8fafc' }}
                formatter={(val) => [formatCurrency(val), '']}
              />
              <Area type="monotone" dataKey="budget" stroke="#334155" fill="#0f172a" strokeWidth={2} strokeDasharray="5 5" />
              <Area type="monotone" dataKey="actual" stroke="#0ea5e9" fill="url(#colorActual)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dynamic Project Budgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dynamicProjects.length === 0 ? (
          <div className="col-span-1 md:col-span-2 text-center py-10 text-slate-500">
            No projects found. Add projects from the dashboard to see them here.
          </div>
        ) : (
          dynamicProjects.map((item) => {
            const isOverBudget = item.spent > item.budget;
            const percentUsed = item.budget > 0 ? ((item.spent / item.budget) * 100) : 0;
            const isExpanded = expandedProject === item.id;
            
            return (
              <div 
                key={item.id} 
                onClick={() => toggleExpand(item.id)}
                className={`bg-slate-900 p-6 rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                  isExpanded ? 'border-primary-500/50 shadow-md shadow-primary-500/10' : 'border-slate-800 shadow-sm hover:border-slate-700'
                }`}
              >
                {/* Standard Card Header */}
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-bold text-slate-100">{item.name}</h4>
                  <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-primary-500' : ''}`} />
                </div>

                {/* Standard Card Stats */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Spent</p>
                      <p className="text-xl font-black text-slate-100 mt-1">{formatCurrency(item.spent)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Budget</p>
                      <p className="text-sm font-bold text-slate-400 mt-1">{formatCurrency(item.budget)}</p>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${isOverBudget ? 'bg-rose-500' : 'bg-primary-500'}`}
                      style={{ width: `${Math.min(100, percentUsed)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      isOverBudget ? 'bg-rose-900/20 text-rose-500' : 'bg-emerald-900/20 text-emerald-500'
                    }`}>
                      {isOverBudget ? 'Over Budget' : 'Within Budget'}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {percentUsed.toFixed(1)}% used
                    </span>
                  </div>
                </div>

                {/* NEW: Expanded Margin Details Section */}
                <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] mt-6 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="pt-6 border-t border-slate-800/50">
                      <div className="flex items-center gap-2 mb-4">
                        <PieChart className="w-4 h-4 text-primary-500" />
                        <h5 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Margin Breakdown</h5>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/50">
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Contract Value</p>
                          <p className="text-lg font-black text-slate-200">{item.originalRevenue}</p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/50">
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Target Margin</p>
                          <p className={`text-lg font-black ${item.margin >= 30 ? 'text-emerald-400' : item.margin < 20 ? 'text-rose-400' : 'text-primary-400'}`}>
                            {item.margin}%
                          </p>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/30">
                        To maintain a <strong>{item.margin}% margin</strong> on a contract value of <strong>{item.originalRevenue}</strong>, total expenditure must not exceed the calculated budget cap of <strong>{formatCurrency(item.budget)}</strong>.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BudgetTracking;