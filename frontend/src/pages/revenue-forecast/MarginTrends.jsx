import React, { useState } from "react";
import { TrendingUp, Download } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  Legend,
} from "recharts";

import { exportToPDF } from "../../utils/exportUtils";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const allData = [
  { month: "Jan", gross: 32, net: 24, target: 30 },
  { month: "Feb", gross: 34, net: 26, target: 30 },
  { month: "Mar", gross: 31, net: 22, target: 30 },
  { month: "Apr", gross: 35, net: 28, target: 30 },
  { month: "May", gross: 38, net: 31, target: 30 },
  { month: "Jun", gross: 36, net: 29, target: 30 },
  { month: "Jul", gross: 40, net: 33, target: 32 },
  { month: "Aug", gross: 37, net: 30, target: 32 },
  { month: "Sep", gross: 39, net: 34, target: 33 },
  { month: "Oct", gross: 42, net: 36, target: 34 },
  { month: "Nov", gross: 41, net: 35, target: 34 },
  { month: "Dec", gross: 44, net: 38, target: 35 },
];

const MarginTrends = () => {

  const [filter, setFilter] = useState("all");

  const getFilteredData = () => {

    if (filter === "1") return allData.slice(-1);

    if (filter === "3") return allData.slice(-3);

    if (filter === "6") return allData.slice(-6);

    if (filter === "12") return allData;

    if (filter === "all") return allData;

    return allData;

  };

  const trendData = getFilteredData();

  // KPI Calculations
  const avgGross =
    trendData.reduce((sum, item) => sum + item.gross, 0) /
    (trendData.length || 1);

  const avgNet =
    trendData.reduce((sum, item) => sum + item.net, 0) /
    (trendData.length || 1);

  const bestMonth = trendData.reduce(
    (max, item) => (item.net > (max?.net || 0) ? item : max),
    {}
  );

  const lowestMonth = trendData.reduce(
    (min, item) => (item.net < (min?.net || Infinity) ? item : min),
    {}
  );

  const targetAchievement =
    trendData.reduce((sum, item) => sum + (item.net / item.target) * 100, 0) /
    (trendData.length || 1);

  // Excel Export
  const exportExcel = () => {

    const worksheet = XLSX.utils.json_to_sheet(trendData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "MarginData");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer]);

    saveAs(data, "MarginTrends.xlsx");

  };

  return (

    <div id="margin-trends-content">

      {/* Header */}

      <header className="flex justify-between mb-8">

        <h1 className="text-3xl font-bold text-white flex gap-2">
          <TrendingUp /> Margin Trends
        </h1>

        <div className="flex gap-4">

          {/* Filter Dropdown */}

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-800 text-white px-3 py-2 rounded"
          >
            <option value="all">All</option>
            <option value="1">Last 1 Month</option>
            <option value="3">Last 3 Months</option>
            <option value="6">Last 6 Months</option>
            <option value="12">Last 12 Months</option>
          </select>

          {/* Excel Export */}

          <button
            onClick={exportExcel}
            className="bg-green-600 px-4 py-2 rounded text-white"
          >
            Export Excel
          </button>

          {/* PDF Export */}

          <button
            onClick={() =>
              exportToPDF("margin-trends-content", "MarginTrends.pdf")
            }
            className="flex gap-2 bg-blue-600 px-4 py-2 rounded"
          >
            <Download size={16} /> PDF
          </button>

        </div>

      </header>

      {/* KPI Cards */}

      <div className="grid grid-cols-4 gap-6 mb-6">

        <div className="bg-slate-900 p-6 rounded-xl">
          <p className="text-xs text-gray-400">Average Gross Margin</p>
          <h3 className="text-2xl text-white">{avgGross.toFixed(1)}%</h3>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <p className="text-xs text-gray-400">Average Net Margin</p>
          <h3 className="text-2xl text-white">{avgNet.toFixed(1)}%</h3>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <p className="text-xs text-gray-400">Best Month Margin</p>
          <h3 className="text-2xl text-green-400">
            {bestMonth.month} ({bestMonth.net}%)
          </h3>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <p className="text-xs text-gray-400">Lowest Month Margin</p>
          <h3 className="text-2xl text-red-400">
            {lowestMonth.month} ({lowestMonth.net}%)
          </h3>
        </div>

      </div>

      {/* Target Achievement */}

      <div className="bg-slate-900 p-6 rounded-xl mb-6">

        <p className="text-xs text-gray-400">Target Achievement</p>

        <h3 className="text-3xl text-yellow-400">
          {targetAchievement.toFixed(1)}%
        </h3>

      </div>

      {/* Chart */}

      <div className="bg-slate-900 p-6 rounded-xl">

        <ResponsiveContainer width="100%" height={350}>

          <AreaChart data={trendData}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis unit="%" />

            <Tooltip />

            <Legend />

            <Area
              dataKey="gross"
              name="Gross Margin"
              stroke="#0ea5e9"
              fill="#0ea5e9"
            />

            <Area
              dataKey="net"
              name="Net Margin"
              stroke="#6366f1"
              fill="#6366f1"
            />

            <Line
              dataKey="target"
              name="Target"
              stroke="#f59e0b"
              strokeWidth={2}
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

    </div>

  );

};

export default MarginTrends;