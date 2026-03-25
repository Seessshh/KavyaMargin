import React, { useState, useEffect } from "react";
import { Download, Filter, IndianRupee, Loader2 } from "lucide-react";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";

import { exportToCSV, exportToXML } from "../../utils/exportUtils";

const RevenueDashboard = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  // --- DYNAMIC DATA FETCHING & AGGREGATION ---
  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/api/projects');
        
        if (response.ok) {
          const rawData = await response.json();
          const projects = Array.isArray(rawData) ? rawData : rawData.data || rawData.projects || [];
          
          const monthlyAggregation = {};

          projects.forEach(proj => {
            const projDate = new Date(proj.createdAt || proj.startDate || new Date());
            const monthName = projDate.toLocaleString('default', { month: 'short' });
            const year = projDate.getFullYear();
            const key = `${monthName}-${year}`;

            if (!monthlyAggregation[key]) {
              monthlyAggregation[key] = { 
                month: monthName, 
                year: year, 
                confirmed: 0, 
                weighted: 0, 
                target: 0,
                timestamp: projDate.getTime() 
              };
            }

            const rawRevenue = proj.revenue || proj.Revenue || proj.REVENUE || proj.budget || proj.amount || "0";
            const cleanRevenueString = String(rawRevenue).replace(/[^0-9.]/g, "");
            const budget = Number(cleanRevenueString) || 0;

            const status = String(proj.status || proj.Status || '').toLowerCase();

            if (status === 'on track' || status === 'exceeding') {
              monthlyAggregation[key].confirmed += budget;
              monthlyAggregation[key].weighted += budget; 
            } else if (status === 'at risk') {
              monthlyAggregation[key].confirmed += budget;
              monthlyAggregation[key].weighted += (budget * 0.5); 
            } else {
              monthlyAggregation[key].confirmed += budget;
              monthlyAggregation[key].weighted += budget;
            }
          });

          let processedData = Object.values(monthlyAggregation);

          processedData = processedData.map(item => ({
            ...item,
            target: Math.round(item.weighted * 1.15) || 0
          }));

          processedData.sort((a, b) => a.timestamp - b.timestamp);

          if (processedData.length === 0) {
            processedData = [
              { month: "Jan", year: new Date().getFullYear(), confirmed: 0, weighted: 0, target: 0 }
            ];
          }

          setRevenueData(processedData);
        }
      } catch (error) {
        console.error("Failed to fetch revenue data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  /* FILTER DATA */
  const filteredData = revenueData.filter((item) => {
    const monthMatch = selectedMonth === "All" || item.month === selectedMonth;
    const yearMatch = selectedYear === "All" || item.year === Number(selectedYear);
    return monthMatch && yearMatch;
  });

  /* KPI CALCULATIONS */
  const totalBacklog = filteredData.reduce((acc, item) => acc + (item.confirmed || 0), 0);
  const pipeline = filteredData.reduce((acc, item) => acc + (item.weighted || 0), 0);
  const avgRevenue = filteredData.length > 0 ? totalBacklog / filteredData.length : 0;

  /* CURRENCY FORMATTER */
  const formatCurrency = (val) => {
    const safeVal = isNaN(val) ? 0 : val;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(safeVal);
  };

  const availableYears = [...new Set(revenueData.map(item => item.year))].sort((a, b) => b - a);

  return (
    <div
      id="revenue-dashboard-content"
      className="space-y-8 p-6 bg-slate-950 min-h-screen text-white animate-in fade-in duration-500"
    >
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <IndianRupee className="w-8 h-8 text-blue-500" />
            Revenue Forecast Dashboard
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Predictive analysis of future revenue streams and margin expectations.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => exportToCSV(revenueData, 'Revenue_Forecast.csv')}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </header>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-4 items-center bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl shadow-sm">
        <Filter className="text-slate-400 w-5 h-5 ml-2" />

        <select
          className="bg-slate-950 border border-slate-800 text-slate-200 px-4 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="All">All Months</option>
          <option>Jan</option><option>Feb</option><option>Mar</option><option>Apr</option>
          <option>May</option><option>Jun</option><option>Jul</option><option>Aug</option>
          <option>Sep</option><option>Oct</option><option>Nov</option><option>Dec</option>
        </select>

        <select
          className="bg-slate-950 border border-slate-800 text-slate-200 px-4 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="All">All Years</option>
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <button
          onClick={() => {
            setSelectedMonth("All");
            setSelectedYear("All");
          }}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          Reset Filters
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <p className="text-slate-400 font-medium">Aggregating project revenue data...</p>
        </div>
      ) : (
        <>
          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Backlog</p>
              <h3 className="text-3xl font-black text-slate-100 mt-2">
                {formatCurrency(totalBacklog)}
              </h3>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Weighted Pipeline</p>
              <h3 className="text-3xl font-black text-blue-400 mt-2">
                {formatCurrency(pipeline)}
              </h3>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Avg Revenue / Month</p>
              <h3 className="text-3xl font-black text-slate-100 mt-2">
                {formatCurrency(avgRevenue)}
              </h3>
            </div>
          </div>

          {/* CHART */}
          <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm">
            {filteredData.length === 0 ? (
              <div className="flex items-center justify-center h-[400px] text-slate-500 font-medium">
                No revenue data found for the selected filters.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400} minHeight={400} minWidth={100}>
                <ComposedChart data={filteredData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis 
                    axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10}
                    tickFormatter={(value) => {
                      if (value >= 10000000) return `₹${(value/10000000).toFixed(1)}Cr`;
                      if (value >= 100000) return `₹${(value/100000).toFixed(0)}L`;
                      return `₹${(value/1000).toFixed(0)}k`;
                    }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#1e293b', opacity: 0.4 }}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#f1f5f9' }}
                    itemStyle={{ fontWeight: 'bold' }}
                    formatter={(val) => formatCurrency(val)} 
                  />
                  <Legend iconType="circle" verticalAlign="top" height={36} />
                  <Bar dataKey="confirmed" name="Confirmed Revenue" fill="#0ea5e9" radius={[]} />
                  <Bar dataKey="weighted" name="Weighted Pipeline" fill="lightgreen" radius={[]} />
                  <Line type="monotone" dataKey="target" name="Growth Target" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, stroke: '#0f172a' }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RevenueDashboard;