import React, { useState } from 'react';
import { Target, Download, TrendingUp, AlertCircle, Search, ChevronRight } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { exportToPDF } from '../../utils/exportUtils';

const budgetData = [
  { month: 'Jan', budget: 400000, actual: 380000 },
  { month: 'Feb', budget: 400000, actual: 410000 },
  { month: 'Mar', budget: 450000, actual: 440000 },
  { month: 'Apr', budget: 450000, actual: 480000 },
  { month: 'May', budget: 500000, actual: 490000 },
  { month: 'Jun', budget: 500000, actual: 520000 },
];

const BudgetTracking = () => {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8 animate-in fade-in duration-500" id="budget-tracking-content">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Target className="w-8 h-8 text-primary-600" />
            Budget Tracking
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Compare allocated budgets against actual expenditures across projects.</p>
        </div>
        <button 
          onClick={() => exportToPDF('budget-tracking-content', 'Budget_Analysis.pdf')}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </header>

      {/* Overview Chart */}
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Budget vs Actual Spend</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">Monthly aggregate tracking across all departments</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary-500 rounded-full" />
              <span className="text-xs font-bold text-slate-500">Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-200 rounded-full" />
              <span className="text-xs font-bold text-slate-500">Budget</span>
            </div>
          </div>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={budgetData}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} 
                tickFormatter={(val) => `₹${val/100000}L`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(val) => formatCurrency(val)}
              />
              <Area type="monotone" dataKey="budget" stroke="#e2e8f0" fill="#f8fafc" strokeWidth={2} />
              <Area type="monotone" dataKey="actual" stroke="#0ea5e9" fill="url(#colorActual)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Project Budgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: 'Project Alpha', budget: 1500000, spent: 1200000, color: 'emerald' },
          { name: 'Project Beta', budget: 800000, spent: 850000, color: 'rose' },
          { name: 'Cloud Migration', budget: 2500000, spent: 1800000, color: 'emerald' },
          { name: 'Mobile App', budget: 1200000, spent: 1100000, color: 'amber' }
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-primary-200 transition-all group cursor-pointer">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-slate-900">{item.name}</h4>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-colors" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Spent</p>
                  <p className="text-xl font-black text-slate-900 mt-1">{formatCurrency(item.spent)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Budget</p>
                  <p className="text-sm font-bold text-slate-500 mt-1">{formatCurrency(item.budget)}</p>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${item.spent > item.budget ? 'bg-rose-500' : 'bg-primary-500'}`}
                  style={{ width: `${Math.min(100, (item.spent / item.budget) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.spent > item.budget ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {item.spent > item.budget ? 'Over Budget' : 'Within Budget'}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {((item.spent / item.budget) * 100).toFixed(1)}% used
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetTracking;
