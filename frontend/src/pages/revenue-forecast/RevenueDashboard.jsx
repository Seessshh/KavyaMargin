import React, { useState } from "react";
import { TrendingUp, Download, Filter, FileSpreadsheet } from "lucide-react";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

import { exportToPDF, exportToCSV } from "../../utils/exportUtils";

/* Revenue Data */

const revenueData = [
  { month: "Jan", year: 2025, confirmed: 320000, weighted: 350000, target: 360000 },
  { month: "Feb", year: 2025, confirmed: 300000, weighted: 340000, target: 350000 },
  { month: "Mar", year: 2025, confirmed: 420000, weighted: 470000, target: 450000 },
  { month: "Apr", year: 2025, confirmed: 390000, weighted: 430000, target: 420000 },
  { month: "May", year: 2025, confirmed: 410000, weighted: 460000, target: 450000 },
  { month: "Jun", year: 2025, confirmed: 450000, weighted: 500000, target: 470000 },

  { month: "Jul", year: 2024, confirmed: 350000, weighted: 390000, target: 380000 },
  { month: "Aug", year: 2024, confirmed: 370000, weighted: 410000, target: 400000 },
  { month: "Sep", year: 2024, confirmed: 360000, weighted: 420000, target: 410000 },
];

const RevenueDashboard = () => {

  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");

  /* FILTER DATA */

  const filteredData = revenueData.filter((item) => {

    const monthMatch =
      selectedMonth === "All" || item.month === selectedMonth;

    const yearMatch =
      selectedYear === "All" || item.year === Number(selectedYear);

    return monthMatch && yearMatch;

  });

  /* KPI CALCULATIONS */

  const totalBacklog = filteredData.reduce(
    (acc, item) => acc + item.confirmed,
    0
  );

  const pipeline = filteredData.reduce(
    (acc, item) => acc + item.weighted,
    0
  );

  const avgRevenue =
    filteredData.length > 0
      ? totalBacklog / filteredData.length
      : 0;

  /* CURRENCY FORMATTER */

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  return (

    <div
      id="revenue-dashboard-content"
      className="space-y-8 p-6 bg-slate-950 min-h-screen text-white"
    >

      {/* HEADER */}

      <header className="flex justify-between items-center">

        <h1 className="text-3xl flex gap-2">
          <TrendingUp /> Revenue Forecast
        </h1>

        <div className="flex gap-3">

          {/* CSV EXPORT */}

          <button
            onClick={() =>
              exportToCSV(filteredData, "RevenueForecast.csv")
            }
            className="flex gap-2 bg-green-600 px-4 py-2 rounded"
          >
            <FileSpreadsheet size={16} /> CSV
          </button>

          {/* PDF EXPORT */}

          {/* <button
            onClick={() =>
              exportToPDF(
                "revenue-dashboard-content",
                "RevenueForecast.pdf"
              )
            }
            className="flex gap-2 bg-blue-600 px-4 py-2 rounded"
          >
            <Download size={16} /> PDF
          </button> */}

        </div>

      </header>

      {/* FILTERS */}

      <div className="flex gap-4 items-center bg-slate-900 p-4 rounded-lg">

        <Filter className="text-gray-400" />

        {/* MONTH FILTER */}

        <select
          className="bg-slate-800 p-2 rounded"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="All">All Months</option>
          <option>Jan</option>
          <option>Feb</option>
          <option>Mar</option>
          <option>Apr</option>
          <option>May</option>
          <option>Jun</option>
          <option>Jul</option>
          <option>Aug</option>
          <option>Sep</option>
          <option>Oct</option>
          <option>Nov</option>
          <option>Dec</option>
        </select>

        {/* YEAR FILTER */}

        <select
          className="bg-slate-800 p-2 rounded"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="All">All Years</option>
          <option value="2026">2026</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </select>

        {/* RESET BUTTON */}

        <button
          onClick={() => {
            setSelectedMonth("All");
            setSelectedYear("All");
          }}
          className="bg-gray-700 px-4 py-2 rounded"
        >
          Reset
        </button>

      </div>

      {/* KPI CARDS */}

      <div className="grid grid-cols-3 gap-6">

        <div className="bg-slate-900 p-6 rounded-xl">
          <p className="text-xs text-gray-400">Total Backlog</p>
          <h3 className="text-2xl">
            {formatCurrency(totalBacklog)}
          </h3>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <p className="text-xs text-gray-400">Weighted Pipeline</p>
          <h3 className="text-2xl text-blue-400">
            {formatCurrency(pipeline)}
          </h3>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <p className="text-xs text-gray-400">Revenue / Month</p>
          <h3 className="text-2xl">
            {formatCurrency(avgRevenue)}
          </h3>
        </div>

      </div>

      {/* CHART */}

      <div className="bg-slate-900 p-6 rounded-xl">

        <ResponsiveContainer width="100%" height={400}>

          <ComposedChart data={filteredData}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip formatter={(val) => formatCurrency(val)} />

            <Legend />

            <Bar dataKey="confirmed" fill="#0ea5e9" />

            <Bar dataKey="weighted" fill="#1e293b" />

            <Line
              dataKey="target"
              stroke="#f59e0b"
              strokeWidth={3}
            />

          </ComposedChart>

        </ResponsiveContainer>

      </div>

    </div>

  );
};

export default RevenueDashboard;