import React, { useState, useEffect } from 'react';
import { Users, PieChart as PieChartIcon, Download, Search, Filter, UserCheck, UserMinus, UserPlus, AlertCircle } from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { exportToCSV } from '../../utils/exportUtils';

const ResourceDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [employees, setEmployees] = useState([]);

  // 1. Fetch data from MongoDB
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    setCurrentUser(user);

    const fetchEmployees = async () => {
      try {
        const response = await fetch('https://kavyamargin.onrender.com/api/employees');
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

  // 2. Dynamic Workforce Calculations
  const billableDepts = ['Engineering', 'Design', 'Product'];
  
  let billableCount = 0;
  let nonBillableCount = 0;
  let benchCount = 0;

  const deptMap = {};

  employees.forEach(emp => {
    const dept = emp.department || 'Unassigned';
    
    // Initialize department in map if it doesn't exist yet
    if (!deptMap[dept]) {
      deptMap[dept] = { name: dept, billable: 0, nonBillable: 0, bench: 0 };
    }

    // Categorize the employee
    if (emp.status === 'Bench') {
      benchCount++;
      deptMap[dept].bench++;
    } else if (billableDepts.includes(dept)) {
      billableCount++;
      deptMap[dept].billable++;
    } else {
      nonBillableCount++;
      deptMap[dept].nonBillable++;
    }
  });

  const totalWorkforce = employees.length;
  // Utilization Rate: (Billable / Total) * 100
  const utilizationRate = totalWorkforce > 0 ? ((billableCount / totalWorkforce) * 100).toFixed(1) : "0.0";

  // 3. Prepare Chart Data Arrays
  const allocationData = [
    { name: 'Billable', value: billableCount, color: '#0ea5e9' },
    { name: 'Non-Billable', value: nonBillableCount, color: '#6366f1' },
    { name: 'Bench', value: benchCount, color: '#f43f5e' },
  ].filter(item => item.value > 0);

  const deptAllocation = Object.values(deptMap);

  return (
    <div className="space-y-8 animate-in fade-in duration-500" id="resource-dashboard-content">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            Resource Allocation Dashboard
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Real-time overview of workforce distribution and utilization.</p>
        </div>
        <button 
          onClick={() => exportToCSV(allocationData, 'Resource_Allocation_Report.csv')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </header>

      {/* Dynamic Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm transition-all hover:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><UserCheck className="w-4 h-4" /></div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Utilization Rate</p>
          </div>
          <h3 className="text-3xl font-black text-slate-100">{utilizationRate}%</h3>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm transition-all hover:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><UserPlus className="w-4 h-4" /></div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Billable Resources</p>
          </div>
          <h3 className="text-3xl font-black text-slate-100">{billableCount}</h3>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm transition-all hover:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg"><UserMinus className="w-4 h-4" /></div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bench Resources</p>
          </div>
          <h3 className="text-3xl font-black text-slate-100">{benchCount}</h3>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm transition-all hover:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg"><Users className="w-4 h-4" /></div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Workforce</p>
          </div>
          <h3 className="text-3xl font-black text-slate-100">{totalWorkforce}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dynamic Allocation Breakdown */}
        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-100 mb-8">Workforce Distribution</h3>
          <div className="h-[350px] w-full">
            {totalWorkforce === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No employee data found</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minHeight={100}>
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', border: '1px solid #1e293b',
                      borderRadius: '12px', color: '#f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                    itemStyle={{ color: '#f1f5f9' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Dynamic Dept Wise Allocation */}
        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-100 mb-8">Departmental Allocation</h3>
          <div className="h-[350px] w-full">
            {totalWorkforce === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">Add employees to see distribution</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minHeight={100}>
                <BarChart data={deptAllocation}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} allowDecimals={false} />
                  <Tooltip 
                    cursor={{fill: '#1e293b', opacity: 0.4}}
                    contentStyle={{ 
                      backgroundColor: '#0f172a', border: 'none',
                      borderRadius: '12px', color: '#f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                    itemStyle={{ color: '#f1f5f9' }}
                  />
                  <Legend />
                  <Bar dataKey="billable" stackId="a" fill="#0ea5e9" radius={0} name="Billable" />
                  <Bar dataKey="nonBillable" stackId="a" fill="#6366f1" radius={0} name="Non-Billable" />
                  <Bar dataKey="bench" stackId="a" fill="#f43f5e" radius={0} name="Bench" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDashboard;