import React, { useState, useEffect } from 'react';
import { PieChart as PieChartIcon, BarChart3, TrendingUp, Download, Info } from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { exportToCSV } from '../../utils/exportUtils';

const COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981', '#f59e0b'];

const CostBreakdown = () => {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/employees');
        if (response.ok) {
          const dbEmployees = await response.json();
          if (Array.isArray(dbEmployees)) {
            setEmployees(dbEmployees);
          }
        }
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  // --- THE FIX: Bulletproof Data Sanitizer ---
  // This completely stops NaN errors by catching dirty database values
  const getSafeCost = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  // 3. Dynamic Summary Calculations
  const totalEmployees = employees.length;
  const totalMonthlyCost = employees.reduce((sum, emp) => sum + getSafeCost(emp.monthlyCost), 0);
  const avgCostPerResource = totalEmployees > 0 ? (totalMonthlyCost / totalEmployees) : 0;

  // 4. Dynamic Department Grouping
  const deptMap = {};
  employees.forEach(emp => {
    const dept = emp.department || 'Unassigned';
    deptMap[dept] = (deptMap[dept] || 0) + getSafeCost(emp.monthlyCost);
  });

  const deptCostData = Object.keys(deptMap).map(key => ({
    name: key,
    value: deptMap[key]
  })).sort((a, b) => b.value - a.value);

  const highestDept = deptCostData.length > 0 ? deptCostData : { name: 'N/A', value: 0 };
  const highestDeptPercentage = totalMonthlyCost > 0 ? Math.round((getSafeCost(highestDept.value) / totalMonthlyCost) * 100) : 0;

  // 5. Dynamic Monthly Trend
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return d;
  });

  const monthlyTrend = months.map(monthDate => {
    let monthCost = 0;
    employees.forEach(emp => {
      if (!emp.joiningDate) {
        monthCost += getSafeCost(emp.monthlyCost);
      } else {
        const joinDate = new Date(emp.joiningDate);
        if (joinDate <= monthDate || (joinDate.getMonth() === monthDate.getMonth() && joinDate.getFullYear() === monthDate.getFullYear())) {
          monthCost += getSafeCost(emp.monthlyCost);
        }
      }
    });

    return {
      month: monthDate.toLocaleString('en-US', { month: 'short' }),
      cost: monthCost
    };
  });

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR', 
    maximumFractionDigits: 0 
  }).format(val);

  return (
    <div className="space-y-8 animate-in fade-in duration-500" id="cost-breakdown-content">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <PieChartIcon className="w-8 h-8 text-primary-600" />
            Cost Breakdown
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Visual analysis of organizational spending and cost distribution.</p>
        </div>
        <button 
          onClick={() => exportToCSV(deptCostData, 'Cost_Breakdown_Analysis.csv')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm transition-colors">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Monthly Cost</p>
          <h3 className="text-3xl font-black text-slate-100 mt-2">{formatCurrency(totalMonthlyCost)}</h3>
          <p className="text-xs text-emerald-500 font-bold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Active Payroll Run
          </p>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm transition-colors">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Avg. Cost Per Resource</p>
          <h3 className="text-3xl font-black text-slate-100 mt-2">{formatCurrency(avgCostPerResource)}</h3>
          <p className="text-xs text-slate-500 font-medium mt-2 italic">Based on {totalEmployees} active resources</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm transition-colors">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Highest Spending Dept</p>
          <h3 className="text-3xl font-black text-slate-100 mt-2 truncate">{highestDept.name}</h3>
          <p className="text-xs text-slate-500 font-medium mt-2 italic">{highestDeptPercentage}% of total organization cost</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-sm transition-colors">
          <h3 className="text-lg font-bold text-slate-100 mb-8">Department-wise Distribution</h3>
          <div className="h-[350px] w-full">
            {deptCostData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">No department data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minHeight={100}>
                <PieChart>
                  <Pie
                    data={deptCostData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {deptCostData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ 
                      borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      backgroundColor: '#0f172a', color: '#f8fafc'
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-sm transition-colors">
          <h3 className="text-lg font-bold text-slate-100 mb-8">Monthly Cost Trend</h3>
          <div className="h-[350px] w-full">
            {employees.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">No hiring trend data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minHeight={100}>
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} />
                  <YAxis 
                    axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} 
                    tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ 
                      borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      backgroundColor: '#0f172a', color: '#f8fafc'
                    }}
                  />
                  <Bar dataKey="cost" fill="#0ea5e9" radius={1} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="bg-primary-900/10 p-6 rounded-2xl border border-primary-900/20 flex gap-4 transition-colors">
        <Info className="w-6 h-6 text-primary-500 shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-primary-400">Cost Analysis Insight</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {totalEmployees > 0 
              ? `The majority of our monthly expenditure is driven by the ${highestDept.name} department, representing ${highestDeptPercentage}% of total organizational costs. Based on ${totalEmployees} active resources, our blended average cost per head currently sits at ${formatCurrency(avgCostPerResource)}.`
              : "Add employees to generate cost analysis insights."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CostBreakdown;