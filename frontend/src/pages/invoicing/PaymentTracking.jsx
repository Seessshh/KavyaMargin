import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  IndianRupee,
  Search,
  Download,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  CalendarDays
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { exportToCSV } from "../../utils/exportUtils";

const PaymentTracking = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All"); // New state for month filter
  const [loading, setLoading] = useState(true);

  // 1. Fetch data from MongoDB
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/invoices");
        setInvoices(response.data);
      } catch (error) {
        console.error("Error fetching payment data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  // 2. Extract unique "Month Year" combinations for the dropdown (e.g., "March 2026")
  const availableMonths = [...new Set(invoices.map((inv) => {
    const d = new Date(inv.date);
    return `${d.toLocaleString("default", { month: "long" })} ${d.getFullYear()}`;
  }))];

  // 3. Master Filter: Applies both Search Term and Month Selection
  const filteredInvoices = invoices.filter((p) => {
    const d = new Date(p.date);
    const invoiceMonthYear = `${d.toLocaleString("default", { month: "long" })} ${d.getFullYear()}`;
    
    const matchesSearch = p.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = selectedMonth === "All" || invoiceMonthYear === selectedMonth;

    return matchesSearch && matchesMonth;
  });

  // 4. Calculate Totals based strictly on the filtered data
  const totalCollected = filteredInvoices
    .filter((p) => p.status === "Paid")
    .reduce((acc, p) => acc + p.amount, 0);

  const totalPending = filteredInvoices
    .filter((p) => p.status === "Pending" || p.status === "Overdue")
    .reduce((acc, p) => acc + p.amount, 0);

  // 5. Generate Chart Data based strictly on the filtered data
  const processChartData = () => {
    const monthMap = {};

    filteredInvoices.forEach((inv) => {
      const date = new Date(inv.date);
      // Using "Month Year" for the chart labels to be precise
      const monthLabel = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;

      if (!monthMap[monthLabel]) {
        monthMap[monthLabel] = { 
          month: monthLabel, 
          collected: 0, 
          pending: 0, 
          sortOrder: date.getTime() 
        };
      }

      if (inv.status === "Paid") {
        monthMap[monthLabel].collected += inv.amount;
      } else {
        monthMap[monthLabel].pending += inv.amount;
      }
    });

    return Object.values(monthMap).sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const collectionData = processChartData();

  // Send Reminder Logic
  const sendReminders = () => {
    const pendingPayments = filteredInvoices.filter(
      (p) => p.status === "Pending" || p.status === "Overdue"
    );

    if (pendingPayments.length === 0) {
      alert("No pending or overdue payments to send reminders for in this view.");
      return;
    }

    const clients = [...new Set(pendingPayments.map((p) => p.client))].join(", ");
    alert(`Reminder simulated and sent to: ${clients}`);
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-400">Loading payment data...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <IndianRupee className="w-8 h-8 text-blue-500" />
            Payment Tracking
          </h1>
          <p className="text-slate-400">
            Monitor incoming revenue and pending receivables.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* MONTH FILTER DROPDOWN */}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
            <CalendarDays className="w-4 h-4 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent outline-none text-sm text-slate-200 cursor-pointer"
            >
              <option value="All">All Months</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          {/* SEARCH */}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search client..."
              className="bg-transparent outline-none text-sm text-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* EXPORT */}
          <button
            onClick={() => exportToCSV(filteredInvoices, "Payment_History.csv")}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-300 hover:bg-slate-800"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </header>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <p className="text-slate-400 text-sm">Total Collected {selectedMonth !== 'All' ? `(${selectedMonth})` : ''}</p>
          <p className="text-emerald-400 text-3xl font-black mt-2 tracking-tight">
            ₹{totalCollected.toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <p className="text-slate-400 text-sm">Pending & Overdue {selectedMonth !== 'All' ? `(${selectedMonth})` : ''}</p>
          <p className="text-amber-400 text-3xl font-black mt-2 tracking-tight">
            ₹{totalPending.toLocaleString()}
          </p>
        </div>
      </div>

      {/* COLLECTION CHART */}
      <div className="bg-slate-900 p-8 rounded-xl border border-slate-800">
        <h3 className="text-lg font-bold text-slate-100 mb-6">
          Collection Performance
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={collectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" axisLine={false} tickLine={false} />
              <YAxis
                stroke="#64748b"
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v / 1000}k`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                itemStyle={{ color: '#e2e8f0' }}
                formatter={(value) => `₹${value.toLocaleString()}`}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="collected" fill="#10b981" name="Collected" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TRANSACTION TABLE */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h4 className="text-slate-100 font-bold">Transactions {selectedMonth !== 'All' ? `for ${selectedMonth}` : ''}</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-xs uppercase font-semibold text-slate-400">Client</th>
                <th className="px-6 py-4 text-xs uppercase font-semibold text-slate-400">Amount</th>
                <th className="px-6 py-4 text-xs uppercase font-semibold text-slate-400">Date</th>
                <th className="px-6 py-4 text-xs uppercase font-semibold text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-slate-500">
                    No transactions found for this period.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-slate-100 font-semibold">
                      {p.client}
                    </td>
                    <td className="px-6 py-4 text-slate-100 font-black tracking-tight">
                      ₹{p.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {new Date(p.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full w-fit ${
                          p.status === "Paid"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : p.status === "Overdue"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {p.status === "Paid" ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : p.status === "Overdue" ? (
                          <AlertCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SEND REMINDER BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={sendReminders}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
        >
          Send Reminders
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PaymentTracking;