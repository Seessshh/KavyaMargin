import React, { useState, useEffect } from "react";
import { TrendingUp, Download, Loader2 } from "lucide-react";
import {
  ComposedChart, // Swapped AreaChart to ComposedChart so the Target <Line> works perfectly!
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  Legend,
} from "recharts";

import { exportToCSV } from "../../utils/exportUtils";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const MarginTrends = () => {
  const [allData, setAllData] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // --- DYNAMIC DATA FETCHING ---
  useEffect(() => {
    const fetchMargins = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://kavyamargin.onrender.com/api/projects');
        
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
                timestamp: projDate.getTime(),
                totalMargin: 0,
                projectCount: 0
              };
            }

            // Safely extract the margin number from the database
            const rawMargin = proj.margin || proj.Margin || 0;
            const cleanMargin = Number(String(rawMargin).replace(/[^0-9.-]/g, "")) || 0;

            monthlyAggregation[key].totalMargin += cleanMargin;
            monthlyAggregation[key].projectCount += 1;
          });

          let processedData = Object.values(monthlyAggregation).map(item => {
            const avgNetMargin = item.projectCount > 0 ? (item.totalMargin / item.projectCount) : 0;
            
            return {
              month: item.month,
              year: item.year,
              timestamp: item.timestamp,
              net: Number(avgNetMargin.toFixed(1)),
              // Simulated Gross Margin (Net + standard 8% overhead). 
              // Replace with proj.grossMargin in the future if you add it to your DB!
              gross: Number((avgNetMargin + 8).toFixed(1)), 
              target: 30 // Default target, adjust as needed
            };
          });

          // Sort chronologically (oldest to newest)
          processedData.sort((a, b) => a.timestamp - b.timestamp);

          // Fallback if DB is empty
          if (processedData.length === 0) {
            processedData = [
              { month: "Jan", gross: 0, net: 0, target: 30 }
            ];
          }

          setAllData(processedData);
        }
      } catch (error) {
        console.error("Failed to fetch margin data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMargins();
  }, []);

  // --- FILTERING LOGIC ---
  const getFilteredData = () => {
    if (filter === "1") return allData.slice(-1);
    if (filter === "3") return allData.slice(-3);
    if (filter === "6") return allData.slice(-6);
    if (filter === "12") return allData.slice(-12);
    return allData;
  };

  const trendData = getFilteredData();

  // --- SAFE KPI CALCULATIONS ---
  const avgGross = trendData.length > 0
    ? trendData.reduce((sum, item) => sum + (item.gross || 0), 0) / trendData.length
    : 0;

  const avgNet = trendData.length > 0
    ? trendData.reduce((sum, item) => sum + (item.net || 0), 0) / trendData.length
    : 0;

  const bestMonth = trendData.length > 0 
    ? trendData.reduce((max, item) => ((item.net || 0) > (max?.net || 0) ? item : max), trendData)
    : { month: "N/A", net: 0 };

  const lowestMonth = trendData.length > 0
    ? trendData.reduce((min, item) => ((item.net || 0) < (min?.net || Infinity) ? item : min), trendData)
    : { month: "N/A", net: 0 };

  const targetAchievement = trendData.length > 0
    ? trendData.reduce((sum, item) => {
        const target = item.target || 1; // Prevent divide by zero
        return sum + ((item.net || 0) / target) * 100;
      }, 0) / trendData.length
    : 0;

  // --- EXCEL EXPORT ---
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(trendData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MarginData");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer]);
    saveAs(data, "MarginTrends.xlsx");
  };

  return (
    <div id="margin-trends-content" className="animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex gap-2">
            <TrendingUp className="text-blue-500" /> Margin Trends
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Live tracking of gross and net margin averages over time.</p>
        </div>

        <div className="flex gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-white px-4 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Time</option>
            <option value="1">Last 1 Month</option>
            <option value="3">Last 3 Months</option>
            <option value="6">Last 6 Months</option>
            <option value="12">Last 12 Months</option>
          </select>

          <button
            onClick={exportExcel}
            disabled={isLoading || trendData.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl text-white text-sm font-bold transition-colors disabled:opacity-50"
          >
            Export Excel
          </button>

          <button
            onClick={() => exportToCSV(trendData, "MarginTrends.csv")}
            disabled={isLoading || trendData.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <p className="text-slate-400 font-medium">Calculating margin trends...</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Average Gross Margin</p>
              <h3 className="text-3xl font-black text-white mt-2">{avgGross.toFixed(1)}%</h3>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Average Net Margin</p>
              <h3 className="text-3xl font-black text-white mt-2">{avgNet.toFixed(1)}%</h3>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Best Month Margin</p>
              <h3 className="text-3xl font-black text-emerald-400 mt-2">
                {bestMonth.net}% <span className="text-sm text-slate-400 font-medium">({bestMonth.month})</span>
              </h3>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Lowest Month Margin</p>
              <h3 className="text-3xl font-black text-rose-400 mt-2">
                {lowestMonth.net}% <span className="text-sm text-slate-400 font-medium">({lowestMonth.month})</span>
              </h3>
            </div>
          </div>

          {/* Target Achievement */}
          <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm mb-6 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Target Achievement Rating</p>
              <h3 className={`text-3xl font-black mt-2 ${targetAchievement >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {targetAchievement.toFixed(1)}%
              </h3>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Current active filter:</p>
              <p className="text-lg font-bold text-blue-400 capitalize">
                {filter === 'all' ? 'All Time' : `Last ${filter} Months`}
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm">
            {trendData.length === 0 ? (
              <div className="flex items-center justify-center h-[350px] text-slate-500 font-medium">
                No margin data found for the selected timeframe.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={trendData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis unit="%" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#f1f5f9' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend iconType="circle" />
                  
                  <Area
                    type="monotone"
                    dataKey="gross"
                    name="Gross Margin"
                    stroke="#0ea5e9"
                    fillOpacity={0.2}
                    fill="#0ea5e9"
                  />
                  <Area
                    type="monotone"
                    dataKey="net"
                    name="Net Margin"
                    stroke="#6366f1"
                    fillOpacity={0.3}
                    fill="#6366f1"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    name="Target"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, stroke: '#0f172a' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MarginTrends;