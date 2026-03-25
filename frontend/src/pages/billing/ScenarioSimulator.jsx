import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Play, RotateCcw, Download, Plus, Trash2, TrendingUp, AlertCircle } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { exportToCSV } from '../../utils/exportUtils';

const ScenarioSimulator = () => {
  const location = useLocation();
  const navigate = useNavigate();

// Store the defaults so we can revert back to them anytime
// Add currency: 'USD' to the defaults so they don't break
  const defaultScenarios = [
    { id: 1, name: 'Current Baseline', billingRate: 45, resources: 10, margin: 28, currency: 'USD' },
    { id: 2, name: 'High Efficiency', billingRate: 45, resources: 8, margin: 35, currency: 'USD' },
    { id: 3, name: 'Premium Billing', billingRate: 60, resources: 10, margin: 42, currency: 'USD' },
  ];

  const [scenarios, setScenarios] = useState(defaultScenarios);

  // Add currency to the simulation form state
  const [simulation, setSimulation] = useState({
    name: 'New Scenario',
    billingRate: 50,
    resources: 12,
    currency: 'USD' // Default to USD for new manual scenarios
  });

  // --- NEW: Catch data sent from MarginCalculator ---
 const processedLocationKey = useRef(null);

  useEffect(() => {
    if (location.state && location.state.importedScenario && processedLocationKey.current !== location.key) {
      processedLocationKey.current = location.key;

      const newScenario = {
        ...location.state.importedScenario,
        id: Date.now()
      };
      
      setScenarios(prev => [...prev, newScenario]);
      
      // Update the manual form so the next simulation matches the imported currency (e.g., switches to INR)
      if (newScenario.currency) {
        setSimulation(prev => ({ ...prev, currency: newScenario.currency }));
      }
      
      navigate(location.pathname, { replace: true, state: {} }); 
    }
  }, [location, navigate]);

  const runSimulation = () => {
    // Mock calculation
    const margin = (simulation.billingRate * 0.6) - (simulation.resources * 0.5);
    const newScenario = {
      ...simulation,
      id: Date.now(),
      margin: Math.max(15, Math.min(55, margin)), // clamped for realism
    };
    setScenarios([...scenarios, newScenario]);
  };

  const handleReset = () => {
    // 1. Reset the input boxes
    setSimulation({ 
      name: 'New Scenario',
      billingRate: 50,
      resources: 12 
    });
    
    // 2. Wipe the chart clean and restore the defaults
    setScenarios(defaultScenarios);
  };

  const getSymbol = (currencyCode) => {
    if (currencyCode === 'INR') return '₹';
    if (currencyCode === 'EUR') return '€';
    return '$';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500" id="scenario-simulator-content">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <Play className="w-8 h-8 text-primary-600" />
            Scenario Simulator
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Model "What-If" scenarios to predict the impact of rate or resource changes.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all shadow-sm">
          <Download className="w-4 h-4" />
          Export Analysis
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Simulation Controls */}
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-sm space-y-6 transition-all">
          <h3 className="text-lg font-bold text-slate-100 mb-2">Configure Simulation</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Scenario Name</label>
              <input 
                type="text" 
                value={simulation.name}
                onChange={(e) => setSimulation({ ...simulation, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-200" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Avg. Billing Rate ({getSymbol(simulation.currency)})</label>
              <input 
                type="number" 
                value={simulation.billingRate}
                onChange={(e) => setSimulation({ ...simulation, billingRate: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-200" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Total Resources</label>
              <input 
                type="number" 
                value={simulation.resources}
                onChange={(e) => setSimulation({ ...simulation, resources: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-200" 
              />
            </div>
            <div className="pt-4 flex gap-3">
              <button 
                onClick={handleReset}
                className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              <button 
                onClick={runSimulation}
                className="flex-[2] py-3 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" /> Run Simulation
              </button>
            </div>
          </div>
        </div>

        {/* Comparison View */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-sm transition-all">
            <h3 className="text-lg font-bold text-slate-100 mb-8">Scenario Comparison (Margin %)</h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scenarios}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} unit="%" />
                  <Tooltip 
                      cursor={{fill: '#0f172a'}}
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
                        backgroundColor: '#0f172a', 
                        color: '#f8fafc' 
                      }}
                      itemStyle={{ color: '#f8fafc', fontWeight: 'bold' }} // Makes the "margin" value white
                      labelStyle={{ color: '#94a3b8', fontWeight: 'bold', marginBottom: '4px' }} // Makes the scenario title slate-gray
                      formatter={(value) => [`${Math.round(value)}%`, 'Margin']}
                    />
                  <Bar dataKey="margin" radius={[6, 6, 0, 0]}>
                    {scenarios.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.margin > 35 ? '#10b981' : '#0ea5e9'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenarios.map((s) => (
              <div key={s.id} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between group transition-all">
                <div>
                  <h4 className="font-bold text-slate-100">{s.name}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-slate-500 font-medium">Rate: {getSymbol(s.currency)}{s.billingRate}/hr</span>
                    <span className="text-xs text-slate-500 font-medium">Resources: {s.resources}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-black ${s.margin > 35 ? 'text-emerald-500' : 'text-primary-500'}`}>
                    {s.margin.toFixed(1)}%
                  </p>
                  <button 
                    onClick={() => setScenarios(scenarios.filter(sc => sc.id !== s.id))}
                    className="text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioSimulator;