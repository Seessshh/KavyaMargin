import React from 'react';
import { 
  Users, 
  TrendingUp, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign,
  Activity,
  Briefcase
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  AreaChart,
  Area
} from 'recharts';

const data = [
  { name: 'Jan', margin: 2400, revenue: 4000 },
  { name: 'Feb', margin: 1398, revenue: 3000 },
  { name: 'Mar', margin: 9800, revenue: 12000 },
  { name: 'Apr', margin: 3908, revenue: 5000 },
  { name: 'May', margin: 4800, revenue: 6500 },
  { name: 'Jun', margin: 3800, revenue: 5900 },
];

const StatCard = ({ title, value, change, icon: Icon, trend }) => (
  <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm hover:border-blue-500/30 transition-all group">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-black text-slate-100 mt-2">{value}</h3>
        <div className="flex items-center gap-1.5 mt-2">
          {trend === 'up' ? (
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
          )}
          <span className={trend === 'up' ? 'text-emerald-400 font-bold text-sm' : 'text-rose-400 font-bold text-sm'}>
            {change}%
          </span>
          <span className="text-[10px] text-slate-500 font-bold ml-0.5 tracking-tight uppercase">vs last month</span>
        </div>
      </div>
      <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Analytics Dashboard</h1>
        <p className="text-slate-400 mt-2 font-medium">Real-time insights across your project portfolio and resource bench.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Overall Margin" 
          value="₹ 4.2M" 
          change="12.5" 
          trend="up" 
          icon={TrendingUp} 
        />
        <StatCard 
          title="Active Projects" 
          value="24" 
          change="8.2" 
          trend="up" 
          icon={Briefcase} 
        />
        <StatCard 
          title="Bench Cost" 
          value="₹ 840K" 
          change="4.1" 
          trend="down" 
          icon={Activity} 
        />
        <StatCard 
          title="Risk Exposure" 
          value="Medium" 
          change="0" 
          trend="up" 
          icon={AlertCircle} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-sm transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Revenue vs Margin</h3>
              <p className="text-sm text-slate-400 font-medium mt-1">Monthly performance tracking</p>
            </div>
            <select className="bg-slate-800 border border-slate-700 rounded-xl text-sm px-3 py-1.5 font-bold text-slate-300 outline-none cursor-pointer hover:bg-slate-700 transition-colors">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorMargin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#acc2e6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis 
                  dataKey="name" 
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
                <Area 
                  type="monotone" 
                  dataKey="margin" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorMargin)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Component: Risk/Alerts */}
        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-sm transition-all">
          <h3 className="text-lg font-bold text-slate-100 mb-6">Recent Alerts</h3>
          <div className="space-y-6">
            {[
              { type: 'High', title: 'Margin Drop - Project Alpha', time: '2h ago', color: 'text-rose-400 bg-rose-500/10' },
              { type: 'Med', title: 'Contract Renewal Due', time: '5h ago', color: 'text-amber-400 bg-amber-500/10' },
              { type: 'Low', title: 'Resource Reallocation', time: '1d ago', color: 'text-emerald-400 bg-emerald-500/10' }
            ].map((alert, i) => (
              <div key={i} className="flex gap-4 group cursor-pointer">
                <div className={`w-1 rounded-full h-12 ${
                  alert.type === 'High' ? 'bg-rose-500' : 
                  alert.type === 'Med' ? 'bg-amber-500' : 
                  'bg-emerald-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full whitespace-nowrap ${alert.color}`}>
                      {alert.type}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold whitespace-nowrap uppercase tracking-tighter">{alert.time}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-300 mt-1.5 group-hover:text-blue-400 transition-colors line-clamp-1">{alert.title}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold rounded-xl transition-all border border-slate-700">
            View All Notifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
