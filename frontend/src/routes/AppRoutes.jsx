import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

// Layouts
import DashboardLayout from '../layouts/DashboardLayout';

// Pages - Auth
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Pages - Dashboard
import Dashboard from '../pages/dashboard/Dashboard';

// Pages - Organization
import CompanySetup from '../pages/organization/CompanySetup';
import BillingModel from '../pages/organization/BillingModel';
import DepartmentMapping from '../pages/organization/DepartmentMapping';

// Pages - Employee Cost
import EmployeeCostList from '../pages/employee-cost/EmployeeCostList';
import AddEmployeeCost from '../pages/employee-cost/AddEmployeeCost';
import CostBreakdown from '../pages/employee-cost/CostBreakdown';

// Pages - Billing
import BillingRateConfig from '../pages/billing/BillingRateConfig';
import MarginCalculator from '../pages/billing/MarginCalculator';
import ScenarioSimulator from '../pages/billing/ScenarioSimulator';

// Pages - Margin Tracker
import ProjectMarginDashboard from '../pages/margin-tracker/ProjectMarginDashboard';
import BudgetTracking from '../pages/margin-tracker/BudgetTracking';
import BurnRate from '../pages/margin-tracker/BurnRate';

// Pages - AI Prediction
import MarginPrediction from '../pages/ai-prediction/MarginPrediction';
import RiskAnalysis from '../pages/ai-prediction/RiskAnalysis';
import ForecastInsights from '../pages/ai-prediction/ForecastInsights';

// Pages - Resource Allocation
import ResourceDashboard from '../pages/resource-allocation/ResourceDashboard';
import SkillMapping from '../pages/resource-allocation/SkillMapping';
import AvailabilityTracker from '../pages/resource-allocation/AvailabilityTracker';

// Pages - Bench Management
import BenchList from '../pages/bench-management/BenchList';
import BenchCostAnalysis from '../pages/bench-management/BenchCostAnalysis';
import ReallocationSuggestions from '../pages/bench-management/ReallocationSuggestions';

// Pages - Contract Analyzer
import UploadContract from '../pages/contract-analyzer/UploadContract';
import ContractInsights from '../pages/contract-analyzer/ContractInsights';
import SLAAnalysis from '../pages/contract-analyzer/SLAAnalysis';

// Pages - Invoicing
import InvoiceList from '../pages/invoicing/InvoiceList';
import GenerateInvoice from '../pages/invoicing/GenerateInvoice';
import PaymentTracking from '../pages/invoicing/PaymentTracking';

// Pages - Revenue Forecast
import RevenueDashboard from '../pages/revenue-forecast/RevenueDashboard';
import ForecastReport from '../pages/revenue-forecast/ForecastReport';
import MarginTrends from '../pages/revenue-forecast/MarginTrends';

//setting page 
import Settings from '../pages/settings/Settings';

const AppRoutes = () => {

  const ProtectedRoute = ({ children, allowedRoles }) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // 1. If NO user is logged in, ALWAYS kick them out to the login page
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }

    // 2. If user IS logged in but lacks the correct role, show the Access Denied screen
    if (!allowedRoles.includes(currentUser.role)) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center animate-in fade-in zoom-in duration-500 p-6">
          <div className="p-6 bg-rose-500/10 rounded-[2rem] mb-8 border border-rose-500/20 shadow-[0_0_40px_-10px_rgba(244,63,94,0.3)]">
            <ShieldAlert className="w-20 h-20 text-rose-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Access <span className="text-rose-500">Restricted</span>
          </h1>
          <p className="text-slate-400 max-w-md mx-auto mb-10 text-base md:text-lg">
            Your current security clearance level (<span className="text-slate-200 font-bold">{currentUser.role}</span>) 
            does not authorize you to view or modify this module.
          </p>
          <Link 
            to="/dashboard" 
            className="px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white rounded-xl font-bold transition-all shadow-lg hover:border-slate-600"
          >
            Return to Dashboard
          </Link>
        </div>
      );
    }

    // 3. If they pass all checks, render the page normally
    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard (Everyone who is logged in can see this) */}
        <Route path="/dashboard" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'Project Manager', 'HR', 'Team Lead', 'Viewers']}><Dashboard /></ProtectedRoute></DashboardLayout>} />
        
        {/* --- Organization --- */}
        <Route path="/organization/company-setup" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin']}><CompanySetup /></ProtectedRoute></DashboardLayout>} />
        <Route path="/organization/billing-model" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin']}><BillingModel /></ProtectedRoute></DashboardLayout>} />
        <Route path="/organization/department-mapping" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin']}><DepartmentMapping /></ProtectedRoute></DashboardLayout>} />

        {/* --- Employee Cost Engine --- */}
        {/* View Access */}
        <Route path="/employee-cost/list" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'Project Manager', 'HR', 'Team Lead']}><EmployeeCostList /></ProtectedRoute></DashboardLayout>} />
        <Route path="/employee-cost/breakdown" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'Project Manager', 'HR', 'Team Lead']}><CostBreakdown /></ProtectedRoute></DashboardLayout>} />
        {/* Write Access (PM & Team Lead Blocked) */}
        <Route path="/employee-cost/add" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'HR']}><AddEmployeeCost /></ProtectedRoute></DashboardLayout>} />
        <Route path="/employee-cost/edit/:id" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'HR']}><AddEmployeeCost /></ProtectedRoute></DashboardLayout>} />

        {/* --- Billing Calculator --- */}
        <Route path="/billing/rate-config" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'Project Manager', 'Team Lead']}><BillingRateConfig /></ProtectedRoute></DashboardLayout>} />
        <Route path="/billing/margin-calculator" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'Project Manager', 'Team Lead']}><MarginCalculator /></ProtectedRoute></DashboardLayout>} />
        <Route path="/billing/scenario-simulator" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'Project Manager', 'Team Lead']}><ScenarioSimulator /></ProtectedRoute></DashboardLayout>} />

        <Route path="/margin-tracker/dashboard" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'Project Manager', 'HR', 'Team Lead', 'Viewers']}><ProjectMarginDashboard /></ProtectedRoute></DashboardLayout>} />
        <Route path="/margin-tracker/budget-tracking" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'Project Manager', 'HR', 'Team Lead', 'Viewers']}><BudgetTracking /></ProtectedRoute></DashboardLayout>} />
        <Route path="/margin-tracker/burn-rate" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'Project Manager', 'HR', 'Team Lead', 'Viewers']}><BurnRate /></ProtectedRoute></DashboardLayout>} />

        {/* --- AI Margin Prediction --- */}
        <Route path="/ai-prediction/margin-prediction" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'Project Manager', 'Team Lead']}><MarginPrediction /></ProtectedRoute></DashboardLayout>} />
        <Route path="/ai-prediction/risk-analysis" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'Project Manager', 'Team Lead']}><RiskAnalysis /></ProtectedRoute></DashboardLayout>} />
        <Route path="/ai-prediction/forecast-insights" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'Project Manager', 'Team Lead']}><ForecastInsights /></ProtectedRoute></DashboardLayout>} />

        {/* --- Resource Allocation --- */}
        <Route path="/resource-allocation/dashboard" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'Project Manager', 'HR', 'Team Lead']}><ResourceDashboard /></ProtectedRoute></DashboardLayout>} />
        <Route path="/resource-allocation/skill-mapping" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'Project Manager', 'HR', 'Team Lead']}><SkillMapping /></ProtectedRoute></DashboardLayout>} />
        <Route path="/resource-allocation/availability-tracker" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'Project Manager', 'HR', 'Team Lead']}><AvailabilityTracker /></ProtectedRoute></DashboardLayout>} />

        {/* --- Bench Management --- */}
        <Route path="/bench-management/list" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'Project Manager', 'HR', 'Team Lead']}><BenchList /></ProtectedRoute></DashboardLayout>} />
        <Route path="/bench-management/cost-analysis" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'Project Manager', 'HR', 'Team Lead']}><BenchCostAnalysis /></ProtectedRoute></DashboardLayout>} />
        <Route path="/bench-management/reallocation-suggestions" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'Project Manager', 'HR', 'Team Lead']}><ReallocationSuggestions /></ProtectedRoute></DashboardLayout>} />

        {/* --- Contract Analyzer --- */}
        {/* View Access */}
        <Route path="/contract-analyzer/insights" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'Project Manager']}><ContractInsights /></ProtectedRoute></DashboardLayout>} />
        <Route path="/contract-analyzer/sla-analysis" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'Project Manager']}><SLAAnalysis /></ProtectedRoute></DashboardLayout>} />
        {/* Write Access (PM Blocked) */}
        <Route path="/contract-analyzer/upload" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin']}><UploadContract /></ProtectedRoute></DashboardLayout>} />

        {/* --- Automated Invoicing --- */}
        {/* View Access */}
        <Route path="/invoicing/list" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'Project Manager', 'Viewers']}><InvoiceList /></ProtectedRoute></DashboardLayout>} />
        <Route path="/invoicing/payment-tracking" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'Project Manager', 'Viewers']}><PaymentTracking /></ProtectedRoute></DashboardLayout>} />
        
        {/* Write Access (PM and Viewers Blocked) */}
        <Route path="/invoicing/generate" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin']}><GenerateInvoice /></ProtectedRoute></DashboardLayout>} />

        {/* --- Revenue Forecast --- */}
        <Route path="/revenue-forecast/dashboard" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'Project Manager', 'HR', 'Team Lead']}><RevenueDashboard /></ProtectedRoute></DashboardLayout>} />
        <Route path="/revenue-forecast/report" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'Project Manager', 'HR', 'Team Lead']}><ForecastReport /></ProtectedRoute></DashboardLayout>} />
        <Route path="/revenue-forecast/margin-trends" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'Project Manager', 'HR', 'Team Lead']}><MarginTrends /></ProtectedRoute></DashboardLayout>} />

        
        <Route path="/settings" element={<DashboardLayout><ProtectedRoute allowedRoles={['Super Admin', 'Company Admin', 'Project Manager', 'HR', 'Team Lead', 'Viewers']}><Settings /></ProtectedRoute></DashboardLayout>} />

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;