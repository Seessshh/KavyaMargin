import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Calculator, RefreshCw, Download, ArrowRight, PieChart as PieChartIcon, Database } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import domtoimage from 'dom-to-image';
import jsPDF from 'jspdf';

const MarginCalculator = () => {
  const navigate = useNavigate();
  
  const [dbRates, setDbRates] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [activeCurrency, setActiveCurrency] = useState('USD');
  const [isExporting, setIsExporting] = useState(false);

  const [inputs, setFormData] = useState({
    billingRate: 45,
    resourceCost: 18,
    utilization: 85,
    overhead: 15,
    hours: 160,
  });

  const [results, setResults] = useState({
    revenue: 0,
    cost: 0,
    margin: 0,
    marginPercent: 0,
  });

  // Fetch rates from DB
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/billing-rates');
        setDbRates(response.data);
      } catch (error) {
        console.error("Error fetching billing rates:", error);
      }
    };
    fetchRates();
  }, []);

  // Handle Dropdown Selection
  const handleRoleSelect = (e) => {
    const roleId = e.target.value;
    setSelectedRole(roleId);

    if (roleId) {
      const selected = dbRates.find(r => r._id === roleId);
      if (selected) {
        setFormData(prev => ({
          ...prev,
          billingRate: selected.onshore,
          resourceCost: selected.offshore
        }));
        setActiveCurrency(selected.currency || 'USD');
      }
    }
  };

  // Run Calculations
  useEffect(() => {
    const revenue = inputs.billingRate * (inputs.hours * (inputs.utilization / 100));
    const directCost = inputs.resourceCost * inputs.hours;
    const overheadCost = revenue * (inputs.overhead / 100);
    const totalCost = directCost + overheadCost;
    const margin = revenue - totalCost;
    const marginPercent = revenue > 0 ? (margin / revenue) * 100 : 0;

    setResults({ revenue, cost: totalCost, margin, marginPercent });
  }, [inputs]);

  const chartData = [
    { name: 'Margin', value: results.margin > 0 ? results.margin : 0, color: '#0ea5e9' },
    { name: 'Direct Cost', value: inputs.resourceCost * inputs.hours, color: '#6366f1' },
    { name: 'Overhead', value: results.revenue * (inputs.overhead / 100), color: '#94a3b8' },
  ];

  // Formatting Helpers
  const formatCurrency = (val) => {
    const locale = activeCurrency === 'INR' ? 'en-IN' : 'en-US';
    return new Intl.NumberFormat(locale, { 
      style: 'currency', 
      currency: activeCurrency,
      maximumFractionDigits: 0 
    }).format(val);
  };

  const getSymbol = () => {
    if (activeCurrency === 'INR') return '₹';
    if (activeCurrency === 'EUR') return '€';
    return '$';
  };

  const handleSaveToScenarios = () => {
    const scenarioData = {
      name: selectedRole ? dbRates.find(r => r._id === selectedRole)?.role + ' (Imported)' : `Custom Config (${activeCurrency})`,
      billingRate: inputs.billingRate,
      resources: Math.max(1, Math.round(inputs.hours / 160)), 
      margin: results.marginPercent,
      currency: activeCurrency // <-- We are now sending the currency over!
    };
    navigate('/billing/scenario-simulator', { state: { importedScenario: scenarioData } });
  };

  // --- Modern PDF Export (dom-to-image) ---
  const handleDownloadPDF = async () => {
    const element = document.getElementById('margin-calc-content');
    if (!element) return;

    try {
      setIsExporting(true);
      const dataUrl = await domtoimage.toPng(element, {
        bgcolor: '#0f172a',
        quality: 1.0,
        style: { transform: 'scale(1)' }
      });
      
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Margin_Calculation_Report.pdf');
    } catch (error) {
      console.error("PDF GENERATION ERROR:", error);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-4 bg-slate-950 rounded-xl" id="margin-calc-content">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <Calculator className="w-8 h-8 text-primary-600" />
            Margin Calculator
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Quickly calculate project margins based on billing rates and resource costs.</p>
        </div>
        <button 
          onClick={handleDownloadPDF}
          disabled={isExporting}
          className={`flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all shadow-sm ${isExporting ? 'opacity-0' : 'opacity-100'}`}
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Generating...' : 'Download PDF'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-sm space-y-6 transition-all">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-primary-500" /> Adjust Parameters
            </h3>
            <span className="text-xs font-bold bg-slate-800 text-slate-400 px-2 py-1 rounded">
              Currency: {activeCurrency}
            </span>
          </div>
          
          <div className="space-y-5">
            <div className="space-y-2 pb-4 border-b border-slate-800">
              <label className="text-sm font-bold text-primary-400 flex items-center gap-2">
                <Database className="w-4 h-4" /> Import from Config
              </label>
              <select 
                value={selectedRole}
                onChange={handleRoleSelect}
                className="w-full px-4 py-2.5 bg-slate-950 border border-primary-500/30 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-200 cursor-pointer transition-colors"
              >
                <option value="">-- Custom Manual Entry --</option>
                {dbRates.map(rate => (
                  <option key={rate._id} value={rate._id}>
                    {rate.role} ({rate.currency === 'USD' ? '$' : rate.currency === 'INR' ? '₹' : '€'}{rate.onshore} / {rate.currency === 'USD' ? '$' : rate.currency === 'INR' ? '₹' : '€'}{rate.offshore})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Hourly Billing Rate ({getSymbol()})</label>
              <input 
                type="number" value={inputs.billingRate}
                onChange={(e) => { setSelectedRole(''); setFormData({ ...inputs, billingRate: Number(e.target.value) }) }}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-200" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Resource Hourly Cost ({getSymbol()})</label>
              <input 
                type="number" value={inputs.resourceCost}
                onChange={(e) => { setSelectedRole(''); setFormData({ ...inputs, resourceCost: Number(e.target.value) }) }}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-200" 
              />
            </div>

            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-300">Target Utilization</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" min="0" max="100" value={inputs.utilization}
                    onChange={(e) => setFormData({ ...inputs, utilization: Number(e.target.value) })}
                    className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-sm text-center font-bold text-primary-400 outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                  <span className="text-slate-500 font-bold">%</span>
                </div>
              </div>
              <input 
                type="range" min="0" max="100" value={inputs.utilization}
                onChange={(e) => setFormData({ ...inputs, utilization: Number(e.target.value) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-600" 
              />
              <div className="flex justify-between items-center text-xs font-medium">
                <span className={`${inputs.utilization > 85 ? 'text-rose-400' : inputs.utilization >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {inputs.utilization > 85 ? 'High (Burnout Risk)' : inputs.utilization >= 75 ? 'Healthy Target' : 'Low (Bench Risk)'}
                </span>
                <span className="text-slate-400">
                  <strong className="text-slate-200">{Math.round(inputs.hours * (inputs.utilization / 100))}</strong> / {inputs.hours} hrs
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Overhead % (SGA, etc.)</label>
              <input 
                type="number" value={inputs.overhead}
                onChange={(e) => setFormData({ ...inputs, overhead: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-200" 
              />
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group transition-all flex flex-col">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <PieChartIcon className="w-24 h-24 text-primary-600" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Gross Margin (%)</p>
              <h3 className={`text-5xl font-black mt-2 ${results.marginPercent > 30 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {results.marginPercent.toFixed(1)}%
              </h3>
              
              <div className="mt-4 h-[180px] w-full shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                      isAnimationActive={false} 
                    >
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#f8fafc' }} formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-800 space-y-2">
                {chartData.map((data, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full block" style={{ backgroundColor: data.color }}></span>
                      <span className="text-slate-300 font-medium">{data.name}</span>
                    </div>
                    <span className="font-bold text-slate-100">{formatCurrency(data.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6 transition-all flex flex-col justify-between">
              <div>
                <h4 className="text-slate-100 font-bold text-lg border-b border-slate-800 pb-4">Financial Breakdown</h4>
                <div className="space-y-4 mt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm font-medium">Est. Monthly Revenue</span>
                    <span className="text-slate-100 font-bold">{formatCurrency(results.revenue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm font-medium">Total Monthly Cost</span>
                    <span className="text-slate-100 font-bold">{formatCurrency(results.cost)}</span>
                  </div>
                  <div className="h-[1px] bg-slate-800 my-4" />
                  <div className="flex justify-between items-center">
                    <span className="text-primary-400 text-sm font-black uppercase tracking-widest">Net Margin</span>
                    <span className="text-primary-400 text-2xl font-black">{formatCurrency(results.margin)}</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleSaveToScenarios}
                className={`w-full py-3 mt-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${isExporting ? 'hidden' : 'flex'}`}
              >
                Save to Scenarios
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarginCalculator;