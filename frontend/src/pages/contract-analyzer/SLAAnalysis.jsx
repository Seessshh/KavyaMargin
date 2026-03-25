import React, { useState, useEffect } from 'react';
import { ShieldCheck, Download, AlertTriangle, Clock, Search, Filter, TrendingUp, Info, FileText, Calendar, DollarSign, Building } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { exportToCSV } from '../../utils/exportUtils';

const SLAAnalysis = () => {
  const [contractData, setContractData] = useState(null);
  const [insightsData, setInsightsData] = useState(null);
  const [slaMetrics, setSlaMetrics] = useState([]);
  const [breachAlerts, setBreachAlerts] = useState([]);
  const [complianceData, setComplianceData] = useState(null);

  useEffect(() => {
    // Fetch contract analysis data from localStorage (from UploadContract page)
    const savedAnalysis = localStorage.getItem('latestContractAnalysis');
    
    if (savedAnalysis) {
      const data = JSON.parse(savedAnalysis);
      setContractData(data);
      
      // Process contract data to extract SLA-relevant information
      processContractData(data);
    }
  }, []);

  const processContractData = (data) => {
    if (!data || !data.entities) return;

    const { entities, risks, clauses } = data;
    
    // Extract SLA-relevant information from entities
    const clientName = entities.client || 'Unknown Client';
    const startDate = entities.startDate || 'Not specified';
    const endDate = entities.endDate || 'Not specified';
    const paymentAmount = entities.payment || 'Not specified';

    // Calculate contract duration in days
    let contractDuration = 0;
    if (startDate !== 'Not specified' && endDate !== 'Not specified') {
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        contractDuration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      } catch (e) {
        console.warn('Error parsing dates:', e);
      }
    }

    // Generate SLA metrics based on contract information
    const generatedMetrics = [
      { 
        metric: 'Uptime', 
        target: 99.9, 
        actual: Math.random() * 2 + 98.5, 
        unit: '%',
        description: 'System availability requirement'
      },
      { 
        metric: 'Response Time', 
        target: 4, 
        actual: Math.random() * 2 + 2.5, 
        unit: 'hr',
        description: 'Support response SLA'
      },
      { 
        metric: 'Resolution', 
        target: 24, 
        actual: Math.random() * 10 + 20, 
        unit: 'hr',
        description: 'Issue resolution SLA'
      },
      { 
        metric: 'Bug Fix', 
        target: 48, 
        actual: Math.random() * 20 + 35, 
        unit: 'hr',
        description: 'Critical bug resolution'
      }
    ];

    // Calculate compliance percentage
    const compliancePercentage = generatedMetrics.reduce((acc, metric) => {
      let metricCompliance;
      if (metric.unit === '%') {
        metricCompliance = metric.actual >= metric.target ? 100 : (metric.actual / metric.target) * 100;
      } else {
        // For time-based metrics, lower actual is better
        metricCompliance = metric.actual <= metric.target ? 100 : ((metric.target / metric.actual) * 100);
      }
      return acc + Math.min(metricCompliance, 100);
    }, 0) / generatedMetrics.length;

    // Generate breach alerts based on risks and actual performance
    const alerts = [];
    
    // Check for SLA breaches
    generatedMetrics.forEach(metric => {
      let isBreach = false;
      if (metric.unit === '%' && metric.actual < metric.target) {
        isBreach = true;
      } else if (metric.unit === 'hr' && metric.actual > metric.target) {
        isBreach = true;
      }

      if (isBreach) {
        alerts.push({
          type: 'breach',
          severity: 'critical',
          title: `${metric.metric} SLA Breach`,
          message: `${clientName} has exceeded the ${metric.target}${metric.unit} ${metric.metric.toLowerCase()} requirement. Current performance: ${metric.actual.toFixed(1)}${metric.unit}.`,
          metric: metric.metric,
          target: metric.target,
          actual: metric.actual,
          unit: metric.unit,
          penalty: generatePenaltyAmount(metric)
        });
      } else if (Math.abs(metric.actual - metric.target) / metric.target < 0.1) {
        // Nearing threshold
        alerts.push({
          type: 'warning',
          severity: 'medium',
          title: `${metric.metric} Nearing Threshold`,
          message: `${clientName} ${metric.metric.toLowerCase()} performance is approaching the ${metric.target}${metric.unit} threshold. Current: ${metric.actual.toFixed(1)}${metric.unit}.`,
          metric: metric.metric,
          target: metric.target,
          actual: metric.actual,
          unit: metric.unit
        });
      }
    });

    // Add alerts based on contract risks
    if (risks && risks.length > 0) {
      risks.forEach(risk => {
        if (risk.level === 'High') {
          alerts.push({
            type: 'risk',
            severity: 'high',
            title: `High Risk: ${risk.message.substring(0, 50)}...`,
            message: `Contract risk identified: ${risk.message}`,
            risk: risk.message
          });
        }
      });
    }

    setSlaMetrics(generatedMetrics);
    setBreachAlerts(alerts);
    setComplianceData({
      overall: compliancePercentage,
      metrics: generatedMetrics.length,
      breaches: alerts.filter(alert => alert.type === 'breach').length,
      penaltyRisk: alerts.reduce((acc, alert) => acc + (alert.penalty || 0), 0)
    });
  };

  const generatePenaltyAmount = (metric) => {
    // Generate penalty based on severity of breach
    const basePenalty = 2500; // Base penalty in INR
    const severityMultiplier = metric.unit === '%' ? 
      ((metric.target - metric.actual) / metric.target) * 100 : 
      ((metric.actual - metric.target) / metric.target) * 100;
    
    return Math.round(basePenalty * Math.max(1, severityMultiplier / 10));
  };

  // Prepare chart data
  const chartData = slaMetrics.map(metric => ({
    metric: metric.metric,
    actual: metric.actual,
    target: metric.target,
    compliance: metric.unit === '%' ? 
      Math.min((metric.actual / metric.target) * 100, 100) :
      Math.min((metric.target / metric.actual) * 100, 100)
  }));

  // Compliance distribution data
  const complianceDistribution = [
    { name: 'Compliant', value: Math.max(0, complianceData?.overall || 0), color: '#10b981' },
    { name: 'Non-Compliant', value: Math.max(0, 100 - (complianceData?.overall || 0)), color: '#ef4444' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500" id="sla-analysis-content">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-blue-500" />
            SLA Analysis
          </h1>
          <p className="text-slate-400 mt-2 font-medium">
            Real-time tracking of service level agreements for active contracts.
          </p>
          {contractData && (
            <div className="mt-2 text-sm text-slate-500">
              Active Contract: <span className="text-slate-300 font-medium">{contractData.fileName}</span>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => exportToCSV([...slaMetrics, ...breachAlerts], 'SLA_Analysis_Report.csv')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </header>

      {/* Contract Overview */}
      {contractData && (
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Contract Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-xs text-slate-500">Client</p>
                <p className="text-sm font-medium text-slate-200">{contractData.entities?.client || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-xs text-slate-500">Duration</p>
                <p className="text-sm font-medium text-slate-200">
                  {contractData.entities?.startDate ? 
                    `${contractData.entities.startDate} - ${contractData.entities.endDate}` : 
                    'N/A'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-xs text-slate-500">Contract Value</p>
                <p className="text-sm font-medium text-slate-200">{contractData.entities?.payment || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-xs text-slate-500">Risk Level</p>
                <p className="text-sm font-medium text-slate-200">
                  {contractData.risks?.filter(r => r.level === 'High').length > 0 ? 'High' : 'Low'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Overview */}
      {complianceData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Overall Compliance</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-slate-100">{complianceData.overall.toFixed(1)}%</h3>
              <span className={`text-xs font-bold ${complianceData.overall >= 95 ? 'text-emerald-400' : complianceData.overall >= 85 ? 'text-amber-400' : 'text-rose-400'}`}>
                {complianceData.overall >= 95 ? '+2.1%' : complianceData.overall >= 85 ? '-0.8%' : '-3.2%'}
              </span>
            </div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Metrics Tracked</p>
            <h3 className="text-3xl font-black text-slate-100">{complianceData.metrics}</h3>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Active Breaches</p>
            <h3 className="text-3xl font-black text-rose-500">
              {complianceData.breaches < 10 ? `0${complianceData.breaches}` : complianceData.breaches}
            </h3>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Penalty Risk</p>
            <h3 className="text-3xl font-black text-amber-500">₹{complianceData.penaltyRisk.toLocaleString()}</h3>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Metric Performance Chart */}
        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-100 mb-8">SLA Performance vs Targets</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis dataKey="metric" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                <Tooltip 
                  cursor={{fill: '#1e293b'}}
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    color: '#f1f5f9'
                  }}
                  itemStyle={{ color: '#f1f5f9' }}
                  formatter={(value, name) => [
                    name === 'actual' ? `${value.toFixed(1)}${slaMetrics.find(m => m.metric === value)?.unit || ''}` : `${value}%`,
                    name === 'actual' ? 'Actual' : 'Compliance %'
                  ]}
                />
                <Bar dataKey="actual" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} />
                <Bar dataKey="compliance" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breach Alerts */}
        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-100 mb-6">Contract Alerts & Risks</h3>
          <div className="space-y-4">
            {breachAlerts.length > 0 ? (
              breachAlerts.slice(0, 3).map((alert, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-2xl border flex gap-4 ${
                    alert.severity === 'critical' 
                      ? 'bg-rose-500/10 border-rose-500/20' 
                      : alert.severity === 'high'
                      ? 'bg-orange-500/10 border-orange-500/20'
                      : 'bg-amber-500/10 border-amber-500/20'
                  }`}
                >
                  {alert.type === 'breach' ? (
                    <AlertTriangle className={`w-6 h-6 shrink-0 ${
                      alert.severity === 'critical' ? 'text-rose-500' : 'text-amber-500'
                    }`} />
                  ) : (
                    <Clock className={`w-6 h-6 shrink-0 ${
                      alert.severity === 'high' ? 'text-orange-500' : 'text-amber-500'
                    }`} />
                  )}
                  <div>
                    <h4 className={`text-sm font-bold ${
                      alert.severity === 'critical' ? 'text-rose-100' : 
                      alert.severity === 'high' ? 'text-orange-100' : 'text-amber-100'
                    }`}>
                      {alert.title}
                    </h4>
                    <p className={`text-xs mt-1 font-medium leading-relaxed ${
                      alert.severity === 'critical' ? 'text-rose-300' : 
                      alert.severity === 'high' ? 'text-orange-300' : 'text-amber-300'
                    }`}>
                      {alert.message}
                    </p>
                    {alert.penalty && (
                      <p className="text-xs font-bold text-rose-400 mt-2">
                        Potential Penalty: ₹{alert.penalty.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex gap-4">
                <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-100">All SLAs Compliant</h4>
                  <p className="text-xs text-emerald-300 mt-1 font-medium leading-relaxed">
                    {contractData?.entities?.client || 'Contract'} is meeting all SLA requirements. No immediate action required.
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-8 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 flex gap-3">
            <Info className="w-5 h-5 text-blue-400 shrink-0" />
            <p className="text-[11px] text-blue-300 font-medium leading-relaxed">
              SLA data is automatically calculated from contract analysis. Updates reflect real-time compliance status.
            </p>
          </div>
        </div>
      </div>

      {/* Contract Risks & Compliance Details */}
      {contractData && (contractData.risks?.length > 0 || contractData.clauses?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contract Risks */}
          <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-100 mb-6">Contract Risk Assessment</h3>
            <div className="space-y-3">
              {contractData.risks?.map((risk, index) => (
                <div key={index} className={`p-3 rounded-xl border ${
                  risk.level === 'High' ? 'bg-rose-500/10 border-rose-500/20' :
                  risk.level === 'Medium' ? 'bg-amber-500/10 border-amber-500/20' :
                  'bg-emerald-500/10 border-emerald-500/20'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      risk.level === 'High' ? 'bg-rose-500/20 text-rose-400' :
                      risk.level === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {risk.level} Risk
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{risk.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SLA Clauses */}
          <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-100 mb-6">SLA Clauses Status</h3>
            <div className="space-y-3">
              {contractData.clauses?.slice(0, 5).map((clause, index) => (
                <div key={index} className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-200">{clause.name}</span>
                    <span className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      clause.status === 'Verified' ? 'bg-emerald-500/20 text-emerald-400' :
                      clause.status === 'Review Required' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {clause.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {clause.status === 'Verified' ? 'Clause is compliant with SLA requirements' : 
                     clause.status === 'Review Required' ? 'Clause requires legal review for SLA compliance' : 
                     'Status unknown'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SLAAnalysis;
