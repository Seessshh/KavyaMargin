import React, { useState } from "react";
import {
  FileText,
  Download,
  Search,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

import { exportToCSV, exportToPDF } from "../../utils/exportUtils";

const reportData = [
  {
    id: 1,
    name: "Q1 Performance Review",
    type: "Financial",
    author: "System AI",
    date: "2026-04-01",
    size: "1.2 MB",
  },
  {
    id: 2,
    name: "H2 Revenue Projections",
    type: "Forecast",
    author: "Admin User",
    date: "2026-03-15",
    size: "2.4 MB",
  },
  {
    id: 3,
    name: "Bench Cost Analysis - Mar",
    type: "Efficiency",
    author: "System AI",
    date: "2026-03-10",
    size: "0.8 MB",
  },
  {
    id: 4,
    name: "Annual Strategy Document",
    type: "Strategy",
    author: "Project Director",
    date: "2026-01-05",
    size: "4.5 MB",
  },
];

const ForecastReport = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [financialYear, setFinancialYear] = useState("All");
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Function to get Financial Year from date
  const getFinancialYear = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;

    if (month >= 4) {
      return `FY ${year}-${year + 1}`;
    } else {
      return `FY ${year - 1}-${year}`;
    }
  };

  // Filter Reports
  const filteredReports = reportData.filter((report) => {
    const searchMatch = report.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const categoryMatch =
      category === "All" || report.type === category;

    const fyMatch =
      financialYear === "All" ||
      getFinancialYear(report.date) === financialYear;

    return searchMatch && categoryMatch && fyMatch;
  });

  // Download report
  const downloadReport = (report) => {
    exportToCSV([report], `${report.name}.csv`);
  };

  // Stats
  const totalReports = reportData.length;

  const financialReports = reportData.filter(
    (r) => r.type === "Financial"
  ).length;

  const forecastReports = reportData.filter(
    (r) => r.type === "Forecast"
  ).length;

  return (
    <div className="space-y-8" id="forecast-report-content">

      {/* Header */}

      <header className="flex justify-between items-center">

        <h1 className="text-3xl font-bold text-white flex gap-2">
          <FileText /> Forecast Reports
        </h1>

        <div className="flex gap-3">

          <button
            onClick={() =>
              exportToCSV(filteredReports, "ForecastReports.csv")
            }
            className="flex gap-2 bg-green-600 px-4 py-2 rounded-lg text-white"
          >
            <Download size={16} /> CSV
          </button>

          <button
            onClick={() =>
              exportToPDF(
                "forecast-report-content",
                "ForecastReports.pdf"
              )
            }
            className="flex gap-2 bg-blue-600 px-4 py-2 rounded-lg text-white"
          >
            <Download size={16} /> PDF
          </button>

        </div>

      </header>

      {/* Stats Cards */}

      <div className="grid grid-cols-3 gap-6">

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
          <p className="text-gray-400 text-sm">Total Reports</p>
          <h3 className="text-2xl text-white">{totalReports}</h3>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
          <p className="text-gray-400 text-sm">Financial Reports</p>
          <h3 className="text-2xl text-white">{financialReports}</h3>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
          <p className="text-gray-400 text-sm">Forecast Reports</p>
          <h3 className="text-2xl text-white">{forecastReports}</h3>
        </div>

      </div>

      {/* Filters */}

      <div className="flex gap-4">

        {/* Search */}

        <div className="relative">

          <Search className="absolute left-2 top-2 text-gray-400" />

          <input
            type="text"
            placeholder="Search reports"
            className="pl-8 p-2 bg-slate-800 rounded text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        {/* Category */}

        <select
          className="bg-slate-800 p-2 rounded text-white"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>All</option>
          <option>Financial</option>
          <option>Forecast</option>
          <option>Efficiency</option>
          <option>Strategy</option>
        </select>

        {/* Financial Year Selector */}

        <select
          className="bg-slate-800 p-2 rounded text-white"
          value={financialYear}
          onChange={(e) => setFinancialYear(e.target.value)}
        >
          <option value="All">All Financial Years</option>
          <option value="FY 2025-2026">FY 2025-2026</option>
          <option value="FY 2026-2027">FY 2026-2027</option>
          <option value="FY 2027-2028">FY 2027-2028</option>
        </select>

      </div>

      {/* Report Cards */}

      <div className="grid grid-cols-4 gap-6">

        {filteredReports.map((report) => (

          <div
            key={report.id}
            className="bg-slate-900 p-6 rounded-xl border border-slate-700 hover:border-blue-500 transition"
          >

            <FileText className="text-blue-400 mb-4" />

            <h4 className="text-white font-semibold">
              {report.name}
            </h4>

            <p className="text-blue-400 text-xs">
              {report.type}
            </p>

            <div className="text-xs text-gray-400 mt-4">

              <p>Author: {report.author}</p>

              <p>Date: {report.date}</p>

              <p>FY: {getFinancialYear(report.date)}</p>

              <p>Size: {report.size}</p>

            </div>

            <button
              onClick={() => downloadReport(report)}
              className="mt-4 w-full bg-blue-600 py-2 rounded flex justify-center gap-2 text-white hover:bg-blue-700"
            >
              <Download size={14} /> Download
            </button>

          </div>

        ))}

      </div>

      {/* AI Insight */}

      <div className="bg-slate-900 p-8 rounded-xl border border-slate-800">

        <h3 className="text-xl text-white mb-2 flex items-center gap-2">
          <TrendingUp /> AI Financial Insight
        </h3>

        <p className="text-slate-400 text-sm">
          The March financial close report has been automatically generated
          by the AI engine. It includes reconciliation of actual billing
          vs forecast with 98% accuracy.
        </p>

        <button
          onClick={() => setShowAnalysis(true)}
          className="mt-6 flex gap-2 bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700"
        >
          View Analysis <ChevronRight size={16} />
        </button>

      </div>

      {/* Analysis Modal */}

      {showAnalysis && (

        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">

          <div className="bg-slate-900 p-8 rounded-xl w-[500px] border border-slate-700">

            <h2 className="text-xl text-white mb-4">
              Financial Analysis Report
            </h2>

            <p className="text-slate-400 text-sm mb-4">
              Revenue increased by 14% in March compared to February.
            </p>

            <ul className="text-sm text-slate-300 space-y-2">
              <li>📈 Revenue Growth: +14%</li>
              <li>💰 Profit Margin: 32%</li>
              <li>📊 Forecast Accuracy: 98%</li>
            </ul>

            <button
              onClick={() => setShowAnalysis(false)}
              className="mt-6 bg-blue-600 px-4 py-2 rounded text-white"
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>
  );
};

export default ForecastReport;