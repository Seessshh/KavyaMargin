import React, { useState, useEffect } from 'react';
import { IndianRupee, Download, TrendingUp, TrendingDown, AlertCircle, Info } from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { exportToCSV } from '../../utils/exportUtils';

const BenchCostAnalysis = () => {
  const [allEmployees, setAllEmployees] = useState([]);
  const [benchEmployees, setBenchEmployees] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/employees');
        if (response.ok) {
          const dbEmployees = await response.json();
          setAllEmployees(dbEmployees);
          
          const benched = dbEmployees.filter(emp => emp.status === 'Bench');
          setBenchEmployees(benched);

          // Group data by Department for the charts
          const deptStats = benched.reduce((acc, emp) => {
            const dept = emp.department || 'Unassigned';
            if (!acc[dept]) acc[dept] = { department: dept, cost: 0, benchCount: 0 };
            acc[dept].cost += (emp.monthlyCost || 0);
            acc[dept].benchCount += 1;
            return acc;
          }, {});
          
          setChartData(Object.values(deptStats));
        }
      } catch (error) {
        console.error("Failed to fetch financial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinancialData();
  }, []);

  // --- DYNAMIC FINANCIAL CALCULATIONS ---
  // 1. Total Monthly Leakage (Sum of monthly costs for benched employees)
  const totalLeakage = benchEmployees.reduce((acc, emp) => acc + (emp.monthlyCost || 0), 0);

  // 2. Total Company Run Rate (Sum of monthly costs for ALL employees)
  const totalCompanyCost = allEmployees.reduce((acc, emp) => acc + (emp.monthlyCost || 0), 0);

  // 3. Margin Impact % (Bench Cost / Total Cost)
  const marginImpact = totalCompanyCost > 0 ? ((totalLeakage / totalCompanyCost) * 100).toFixed(1) : 0;

  // 4. Recoverable Revenue (Assuming an industry standard 2.5x billing markup on resource cost)
  const recoverableRevenue = totalLeakage * 2.5;

  // Colors for the department bars
  const colors = ['#f43f5e', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500" id="bench-cost-content">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <IndianRupee className="w-8 h-8 text-blue-500" />
            Bench Cost Analysis
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Live financial impact assessment of unallocated resources.</p>
        </div>
        <button 
          onClick={() => exportToCSV(chartData, 'Bench_Cost_By_Department.csv')}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </header>

      {/* Dynamic Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingDown className="w-16 h-16 text-rose-500" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Monthly Bench Leakage</p>
          <h3 className="text-3xl font-black text-rose-500 mt-2">
            {formatCurrency(totalLeakage)}
          </h3>
          <p className="text-xs text-slate-500 mt-2 font-medium italic">Direct salary cost of {benchEmployees.length} unallocated staff</p>
        </div>
        
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <AlertCircle className="w-16 h-16 text-amber-500" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Margin Impact</p>
          <h3 className="text-3xl font-black text-amber-500 mt-2">-{marginImpact}%</h3>
          <p className="text-xs text-slate-500 mt-2 font-medium italic">Reduction in overall gross margin</p>
        </div>
        
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-16 h-16 text-emerald-500" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recoverable Revenue</p>
          <h3 className="text-3xl font-black text-emerald-500 mt-2">
            {formatCurrency(recoverableRevenue)}
          </h3>
          <p className="text-xs text-slate-500 mt-2 font-medium italic">Potential revenue if 100% billable (2.5x multiplier)</p>
        </div>
      </div>

      {/* Dynamic Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Cost by Department Chart */}
        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-100 mb-8">Cost Leakage by Department</h3>
          <div className="h-[350px] w-full">
            {chartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-500 font-medium">No bench data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#1e293b', opacity: 0.4}}
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      border: '1px solid #1e293b',
                      borderRadius: '12px',
                      color: '#f1f5f9'
                    }}
                    itemStyle={{ color: '#f1f5f9', fontWeight: 'bold' }}
                    formatter={(val) => [formatCurrency(val), 'Cost Leakage']}
                  />
                  <Bar dataKey="cost" radius={0} >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bench Count by Department Chart */}
        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-100 mb-8">Benched Resources by Department</h3>
          <div className="h-[350px] w-full">
            {chartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-500 font-medium">No bench data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#1e293b', opacity: 0.4}}
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      border: '1px solid #1e293b',
                      borderRadius: '12px',
                      color: '#f1f5f9'
                    }}
                    formatter={(val) => [val, 'Resources']}
                  />
                  <Bar dataKey="benchCount" fill="#0ea5e9" radius={0} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="bg-blue-500/10 p-6 rounded-2xl border border-blue-500/20 flex gap-4">
        <Info className="w-6 h-6 text-blue-400 shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-blue-100">Live Optimization Insight</h4>
          <p className="text-xs text-blue-300 mt-1 leading-relaxed font-medium">
            These metrics are pulled live from the employee database. Your current bench holds <strong>{benchEmployees.length}</strong> resources, dragging gross margins down by <strong>{marginImpact}%</strong>. Focus allocation efforts on the department with the highest cost leakage shown in the charts above.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BenchCostAnalysis;