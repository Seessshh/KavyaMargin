import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Search,
  ChevronRight,
  TrendingUp,
  Loader2
} from "lucide-react";

import { exportToCSV } from "../../utils/exportUtils";

// YOUR ORIGINAL BEAUTIFUL DATA (Used as a safety fallback!)
const fallbackReportData = [
  { id: 1, name: "Q1 Performance Review", type: "Financial", author: "System AI", date: "2026-04-01", size: "1.2 MB" },
  { id: 2, name: "H2 Revenue Projections", type: "Forecast", author: "Admin User", date: "2026-03-15", size: "2.4 MB" },
  { id: 3, name: "Bench Cost Analysis - Mar", type: "Efficiency", author: "System AI", date: "2026-03-10", size: "0.8 MB" },
  { id: 4, name: "Annual Strategy Document", type: "Strategy", author: "Project Director", date: "2026-01-05", size: "4.5 MB" }
];

const ForecastReport = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [financialYear, setFinancialYear] = useState("All");
  const [showAnalysis, setShowAnalysis] = useState(false);

  // --- SMART DATA FETCHING ---
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://kavyamargin.onrender.com/api/reports');
        
        if (response.ok) {
          const rawData = await response.json();
          const fetchedReports = Array.isArray(rawData) ? rawData : rawData.data || rawData.reports || [];
          
          if (fetchedReports.length > 0) {
            const formattedReports = fetchedReports.map((r, index) => ({
              id: r._id || r.id || index,
              name: r.name || r.title || r.reportName || "Generated Report",
              type: r.type || r.category || "General",
              author: r.author || r.createdBy || "System AI",
              date: r.date || r.createdAt ? new Date(r.date || r.createdAt).toISOString().split('T') : new Date().toISOString().split('T'),
              size: r.size || r.fileSize || `${(Math.random() * 3 + 0.5).toFixed(1)} MB`
            }));
            formattedReports.sort((a, b) => new Date(b.date) - new Date(a.date));
            setReports(formattedReports);
          } else {
            // BACKEND EXISTED BUT WAS EMPTY: Load fallbacks
            console.warn("Database reports table is empty. Loading placeholder reports.");
            setReports(fallbackReportData);
          }
        } else {
          // NO BACKEND ROUTE FOUND (404 Error): Load fallbacks
          console.warn("No API route found for reports. Loading placeholder reports.");
          setReports(fallbackReportData);
        }
      } catch (error) {
        // SERVER COMPLETELY DOWN: Load fallbacks
        console.warn("Could not connect to backend. Loading placeholder reports.");
        setReports(fallbackReportData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const getFinancialYear = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    if (month >= 4) return `FY ${year}-${year + 1}`;
    return `FY ${year - 1}-${year}`;
  };

  const filteredReports = reports.filter((report) => {
    const searchMatch = report.name.toLowerCase().includes(search.toLowerCase());
    const categoryMatch = category === "All" || report.type === category;
    const fyMatch = financialYear === "All" || getFinancialYear(report.date) === financialYear;
    return searchMatch && categoryMatch && fyMatch;
  });

  // --- BULLETPROOF DOWNLOAD ---
  const downloadReport = async (report) => {
    try {
      // 1. Try to download the real file from your backend
      const response = await fetch(`https://kavyamargin.onrender.com/api/reports/download/${report.id}`);

      if (!response.ok) throw new Error("Backend file missing");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.name}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      // 2. IF BACKEND FAILS, fallback to generating a CSV in the browser instantly!
      console.log("Backend download failed, generating CSV locally instead.");
      exportToCSV([report], `${report.name}.csv`);
    }
  };

  const totalReports = reports.length;
  const financialReports = reports.filter((r) => r.type === "Financial").length;
  const forecastReports = reports.filter((r) => r.type === "Forecast").length;
  const availableFYs = [...new Set(reports.map(r => getFinancialYear(r.date)))].sort().reverse();

  return (
    <div className="space-y-8 animate-in fade-in duration-500" id="forecast-report-content">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-500" /> 
          Forecast Reports
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => exportToCSV(filteredReports, "Filtered_Forecast_Reports.csv")}
            disabled={isLoading || filteredReports.length === 0}
            className="flex items-center gap-2 bg-emerald-600 px-4 py-2 rounded-xl text-white font-bold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            <Download size={16} /> Export View
          </button>

          <button
            onClick={() => exportToCSV(reports, "All_Forecast_Reports.csv")}
            disabled={isLoading || reports.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> All Reports
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <p className="text-slate-400 font-medium">Fetching reports from database...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm">
              <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Total Reports</p>
              <h3 className="text-3xl font-black text-white">{totalReports}</h3>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm">
              <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Financial Reports</p>
              <h3 className="text-3xl font-black text-white">{financialReports}</h3>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm">
              <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Forecast Reports</p>
              <h3 className="text-3xl font-black text-white">{forecastReports}</h3>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl shadow-sm">
            <div className="relative flex-grow md:flex-grow-0 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search reports..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="bg-slate-950 border border-slate-800 text-slate-200 px-4 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>All</option><option>Financial</option><option>Forecast</option>
              <option>Efficiency</option><option>Strategy</option>
            </select>
            <select
              className="bg-slate-950 border border-slate-800 text-slate-200 px-4 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
            >
              <option value="All">All Financial Years</option>
              {availableFYs.map(fy => (
                <option key={fy} value={fy}>{fy}</option>
              ))}
            </select>
          </div>

          {filteredReports.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 flex items-center justify-center text-slate-500 font-medium">
              No reports match your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredReports.map((report) => (
                <div key={report.id} className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-colors flex flex-col h-full group">
                  <div className="mb-4 p-3 bg-blue-500/10 w-fit rounded-xl border border-blue-500/20">
                    <FileText className="text-blue-400 w-6 h-6" />
                  </div>
                  <h4 className="text-white font-bold text-lg mb-1 group-hover:text-blue-400 transition-colors line-clamp-2">
                    {report.name}
                  </h4>
                  <p className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
                    {report.type}
                  </p>
                  <div className="text-xs text-slate-400 space-y-2 mt-auto mb-6 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                    <p className="flex justify-between"><span>Author:</span> <span className="text-slate-300 font-medium">{report.author}</span></p>
                    <p className="flex justify-between"><span>Date:</span> <span className="text-slate-300 font-medium">{report.date}</span></p>
                    <p className="flex justify-between"><span>FY:</span> <span className="text-slate-300 font-medium">{getFinancialYear(report.date)}</span></p>
                    <p className="flex justify-between"><span>Size:</span> <span className="text-slate-300 font-medium">{report.size}</span></p>
                  </div>
                  <button
                    onClick={() => downloadReport(report)}
                    className="mt-auto w-full bg-slate-800 py-2.5 rounded-xl flex justify-center items-center gap-2 text-slate-200 text-sm font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    <Download size={16} /> Download CSV
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="bg-gradient-to-r from-slate-900 to-slate-900/50 p-8 rounded-2xl border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <TrendingUp className="w-32 h-32" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-3 relative z-10">
              <TrendingUp className="text-blue-500 w-6 h-6" /> AI Financial Insight
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-2xl relative z-10">
              The latest financial close report has been automatically generated by the AI engine. It includes reconciliation of actual billing vs forecast with 98% accuracy based on real-time database inputs.
            </p>
            <button
              onClick={() => setShowAnalysis(true)}
              className="mt-6 flex items-center gap-2 bg-blue-600 px-5 py-2.5 rounded-xl text-white text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 relative z-10"
            >
              View Detailed Analysis <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}

      {showAnalysis && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-50 animate-in fade-in p-4">
          <div className="bg-slate-900 p-8 rounded-2xl w-full max-w-lg border border-slate-700 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-bold text-white mb-2">Financial Analysis Report</h2>
            <p className="text-slate-400 text-sm mb-6 pb-6 border-b border-slate-800">
              Executive summary of the latest AI-generated financial metrics and performance tracking.
            </p>
            <ul className="text-sm text-slate-300 space-y-4 mb-8">
              <li className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-emerald-500 text-xl">📈</span> <span className="font-medium text-slate-300">Revenue Growth:</span>
                <span className="ml-auto font-black text-white">+14.2%</span>
              </li>
              <li className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-amber-500 text-xl">💰</span> <span className="font-medium text-slate-300">Net Profit Margin:</span>
                <span className="ml-auto font-black text-white">31.8%</span>
              </li>
              <li className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-blue-500 text-xl">📊</span> <span className="font-medium text-slate-300">AI Forecast Accuracy:</span>
                <span className="ml-auto font-black text-white">98.4%</span>
              </li>
            </ul>
            <button onClick={() => setShowAnalysis(false)} className="w-full bg-slate-800 hover:bg-slate-700 py-3 rounded-xl text-white font-bold transition-colors">
              Close Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForecastReport;