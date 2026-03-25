import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Briefcase,
  PieChart,
  BrainCircuit,
  FileText,
  Receipt,
  ShieldCheck,
  TrendingDown,
  Loader2
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart,
  Area
} from 'recharts';

const StatCard = ({ title, value, change, icon: Icon, trend, color }) => (
  <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-800/50 shadow-lg hover:shadow-blue-500/5 hover:border-blue-500/30 transition-all duration-300 group">
    <div className="flex items-start justify-between">
      <div className="space-y-4 w-full">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl bg-slate-800/50 ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{title}</p>
        </div>
        <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
            trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
          }`}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}%
          </div>
          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">vs prev month</span>
        </div>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Dynamic State
  const [chartData, setChartData] = useState([]);
  const [kpis, setKpis] = useState({
    portfolioMargin: 0,
    operationalCost: 0,
    utilization: 0,
    successRate: 0
  });
  const [insights, setInsights] = useState({
    depts: 0,
    empCost: 0,
    benchCount: 0,
    activeProjects: 0,
    pendingInvoices: 0
  });

  // Helper to format large currencies into Millions (M) or Lakhs (L)
  const formatCompact = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 1000000) return `₹${(val / 1000000).toFixed(2)}M`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    return `₹${(val / 1000).toFixed(1)}k`;
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch everything concurrently to save time
      const [projRes, empRes, invRes] = await Promise.all([
        fetch('http://localhost:5000/api/projects').catch(() => ({ ok: false })),
        fetch('http://localhost:5000/api/employees').catch(() => ({ ok: false })),
        fetch('http://localhost:5000/api/invoices').catch(() => ({ ok: false }))
      ]);

      const projects = projRes.ok ? await projRes.json().then(d => Array.isArray(d) ? d : d.data || d.projects || []) : [];
      const employees = empRes.ok ? await empRes.json().then(d => Array.isArray(d) ? d : d.data || d.employees || []) : [];
      const invoices = invRes.ok ? await invRes.json().then(d => Array.isArray(d) ? d : d.data || d.invoices || []) : [];

      // --- 1. PROCESS EMPLOYEES (Cost & Utilization) ---
      let totalEmpCost = 0;
      let benchCount = 0;
      const uniqueRoles = new Set();

      employees.forEach(emp => {
        totalEmpCost += Number(emp.monthlyCost || emp.salary || 0);
        if (emp.role || emp.department) uniqueRoles.add(emp.role || emp.department);
        if (String(emp.status).toLowerCase() === 'bench') benchCount++;
      });

      const activeEmps = employees.length - benchCount;
      const utilizationRate = employees.length > 0 ? (activeEmps / employees.length) * 100 : 0;

      // --- 2. PROCESS INVOICES (Pending Revenue) ---
      let pendingDues = 0;
      invoices.forEach(inv => {
        if (String(inv.status).toLowerCase() !== 'paid') {
          pendingDues += Number(inv.amount || 0);
        }
      });

      // --- 3. PROCESS PROJECTS (Revenue, Margin, & Chart) ---
      let totalRevenue = 0;
      let totalMargin = 0;
      let healthyProjects = 0;
      let activeProjectCount = 0;
      
      const monthlyData = {};

      projects.forEach(proj => {
        // String cleaner for revenue
        const rawRev = proj.revenue || proj.amount || proj.budget || "0";
        const revVal = Number(String(rawRev).replace(/[^0-9.]/g, "")) || 0;
        
        // String cleaner for margin (assume it's a percentage or raw number)
        const rawMarg = proj.margin || proj.Margin || "0";
        const margVal = Number(String(rawMarg).replace(/[^0-9.]/g, "")) || 0;

        totalRevenue += revVal;
        
        // Convert margin % into absolute value for the portfolio sum
        const absoluteMargin = revVal * (margVal / 100); 
        totalMargin += (absoluteMargin > 0 ? absoluteMargin : margVal); // fallback if it's already absolute

        const status = String(proj.status || '').toLowerCase();
        if (status.includes('track') || status.includes('exceeding') || status.includes('progress')) healthyProjects++;
        if (status !== 'completed' && status !== 'closed') activeProjectCount++;

        // Group for Chart
        const date = new Date(proj.createdAt || proj.startDate || new Date());
        const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear().toString().substr(-2)}`;
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = { month: monthYear, revenue: 0, margin: 0, timestamp: date.getTime() };
        }
        
        // Convert large numbers down to "Millions" for the chart Y axis
        monthlyData[monthYear].revenue += (revVal / 1000000); 
        monthlyData[monthYear].margin += ((absoluteMargin || margVal) / 1000000); 
      });

      const successRate = activeProjectCount > 0 ? (healthyProjects / activeProjectCount) * 100 : 0;

      // Prepare Chart Array
      let chartArray = Object.values(monthlyData).sort((a, b) => a.timestamp - b.timestamp);
      // Give it default data if DB is empty to prevent a blank chart
      if (chartArray.length === 0) {
        chartArray = [
          { month: 'Jan', revenue: 0, margin: 0 }, { month: 'Feb', revenue: 0, margin: 0 }
        ];
      }

      // --- 4. UPDATE STATE ---
      setChartData(chartArray);
      
      setKpis({
        portfolioMargin: totalMargin || 0,
        operationalCost: totalEmpCost || 0,
        utilization: utilizationRate,
        successRate: successRate
      });

      setInsights({
        depts: uniqueRoles.size || 5,
        empCost: totalEmpCost,
        benchCount: benchCount,
        activeProjects: activeProjectCount,
        pendingInvoices: pendingDues
      });

    } catch (error) {
      console.error("Error fetching overview data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Dynamic Module Array
  const dynamicModuleInsights = [
    { label: 'Organization', icon: ShieldCheck, status: 'Active', value: `${insights.depts} Roles`, color: 'text-blue-400' },
    { label: 'Employee Cost', icon: Users, status: 'Monthly', value: formatCompact(insights.empCost), color: 'text-indigo-400' },
    { label: 'Bench Management', icon: Briefcase, status: 'Optimization', value: `${insights.benchCount} Resources`, color: 'text-amber-400' },
    { label: 'Active Projects', icon: FileText, status: 'Running', value: `${insights.activeProjects} Projects`, color: 'text-emerald-400' },
    { label: 'AI Prediction', icon: BrainCircuit, status: '92% Acc', value: '+4.2% Growth', color: 'text-purple-400' },
    { label: 'Unpaid Invoices', icon: Receipt, status: 'Pending', value: formatCompact(insights.pendingInvoices), color: 'text-rose-400' },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-white tracking-tighter">Enterprise <span className="text-blue-500">Overview</span></h1>
          <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500/50" />
            Live system monitoring and cross-module intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-2xl text-xs font-bold text-slate-400">
            Updated: {new Date().toLocaleTimeString()}
          </div>
          <button 
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 uppercase tracking-widest disabled:opacity-50"
          >
            {isLoading ? 'Syncing...' : 'Refresh Data'}
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-slate-900/20 rounded-[2.5rem] border border-slate-800/50">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Aggregating Enterprise Data...</p>
        </div>
      ) : (
        <>
          {/* Primary KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Portfolio Margin" 
              value={formatCompact(kpis.portfolioMargin)} 
              change="8.4" 
              trend="up" 
              icon={TrendingUp}
              color="text-blue-400"
            />
            <StatCard 
              title="Operational Cost" 
              value={formatCompact(kpis.operationalCost)} 
              change="2.1" 
              trend="down" 
              icon={TrendingDown}
              color="text-rose-400"
            />
            <StatCard 
              title="Resource Utilization" 
              value={`${kpis.utilization.toFixed(1)}%`} 
              change="5.6" 
              trend="up" 
              icon={Activity}
              color="text-emerald-400"
            />
            <StatCard 
              title="Project Success Rate" 
              value={`${kpis.successRate.toFixed(1)}%`} 
              change="0.4" 
              trend="up" 
              icon={ShieldCheck}
              color="text-purple-400"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Performance Chart */}
            <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-800/50 shadow-xl">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Revenue & Margin Velocity</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Consolidated monthly trajectory (in Millions)</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase">Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase">Margin</span>
                  </div>
                </div>
              </div>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorMarg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.5} />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#475569', fontSize: 10, fontWeight: 800}} 
                      dy={15}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#475569', fontSize: 10, fontWeight: 800}} 
                      tickFormatter={(v) => `₹${v.toFixed(1)}M`}
                    />
                    <Tooltip 
                      cursor={{stroke: '#334155', strokeWidth: 2}}
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        border: '1px solid #1e293b',
                        borderRadius: '20px',
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)'
                      }} 
                      formatter={(value) => [`₹${Number(value).toFixed(2)}M`, undefined]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorRev)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="margin" 
                      stroke="#10b981" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorMarg)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Module Health/Insights */}
            <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-800/50 shadow-xl flex flex-col">
              <h3 className="text-xl font-black text-white tracking-tight mb-8">Module <span className="text-blue-500">Intelligence</span></h3>
              <div className="flex-1 space-y-5">
                {dynamicModuleInsights.map((item, i) => (
                  <div key={i} className="group p-4 bg-slate-800/20 hover:bg-slate-800/40 rounded-[1.5rem] border border-slate-800/50 transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl bg-slate-950/50 group-hover:scale-110 transition-transform ${item.color}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-black text-slate-100 tracking-tight truncate">{item.label}</p>
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{item.status}</span>
                        </div>
                        <p className="text-lg font-black text-white mt-1">{item.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-4 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all">
                System Deep Dive
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;