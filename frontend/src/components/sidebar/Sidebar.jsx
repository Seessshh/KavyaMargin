import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building2, IndianRupee, BarChart3, 
  BrainCircuit, PieChart, Briefcase, FileText, Receipt, 
  TrendingUp, ChevronRight, X, LogOut
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ==========================================
// 1. THE RBAC DICTIONARIES (From your PDF)
// ==========================================

// Who is allowed to see the module AT ALL? (Full ✅ AND Viewers 👁)
const moduleAccess = {
  'Dashboard': ['Super Admin', 'Company Admin', 'Project Manager', 'HR', 'Team Lead', 'Viewer'],
  'Organization': ['Super Admin', 'Company Admin'],
  'Employee Cost': ['Super Admin', 'Company Admin', 'Project Manager', 'HR', 'Team Lead'],
  'Billing': ['Super Admin', 'Company Admin', 'Project Manager', 'Team Lead'],
  'Margin Tracker': ['Super Admin', 'Company Admin', 'Project Manager', 'HR', 'Team Lead', 'Viewer'],
  'AI Prediction': ['Super Admin', 'Company Admin', 'Project Manager', 'Team Lead'],
  'Resource Allocation': ['Super Admin', 'Company Admin', 'Project Manager', 'HR', 'Team Lead'],
  'Bench Management': ['Super Admin', 'Company Admin', 'Project Manager', 'HR', 'Team Lead'],
  'Contract Analyzer': ['Super Admin', 'Company Admin', 'Project Manager'],
  'Invoicing': ['Super Admin', 'Company Admin', 'Project Manager', 'Viewer'],
  'Revenue Forecast': ['Super Admin', 'Company Admin', 'Project Manager', 'HR', 'Team Lead']
};

// Who is allowed to CREATE/EDIT within that module? (Full ✅ ONLY)
// If a user is NOT in this list, they will not see the "Add", "Generate", or "Upload" sub-menus!
const writeAccess = {
  'Organization': ['Super Admin', 'Company Admin'],
  'Employee Cost': ['Super Admin', 'Company Admin', 'HR'], 
  'Billing': ['Super Admin', 'Company Admin', 'Project Manager'], 
  'Margin Tracker': ['Super Admin', 'Company Admin', 'Project Manager'], 
  'AI Prediction': ['Super Admin', 'Company Admin', 'Project Manager'], 
  'Resource Allocation': ['Super Admin', 'Company Admin', 'Project Manager', 'Team Lead'], 
  'Bench Management': ['Super Admin', 'Company Admin', 'HR'], 
  'Contract Analyzer': ['Super Admin', 'Company Admin'], 
  'Invoicing': ['Super Admin', 'Company Admin'], 
  'Revenue Forecast': ['Super Admin', 'Company Admin'] 
};

// ==========================================
// 2. THE MASTER MENU LIST
// ==========================================
const masterMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { 
    label: 'Organization', icon: Building2,
    children: [
      { label: 'Company Setup', path: '/organization/company-setup' },
      { label: 'Billing Model', path: '/organization/billing-model' },
      { label: 'Department Mapping', path: '/organization/department-mapping' },
    ]
  },
  {
    label: 'Employee Cost', icon: Users,
    children: [
      { label: 'Cost List', path: '/employee-cost/list' },
      { label: 'Add Cost', path: '/employee-cost/add', isAction: true }, // isAction flags write-only routes
      { label: 'Breakdown', path: '/employee-cost/breakdown' },
    ]
  },
  {
    label: 'Billing', icon: IndianRupee,
    children: [
      { label: 'Rate Config', path: '/billing/rate-config' },
      { label: 'Margin Calculator', path: '/billing/margin-calculator' },
      { label: 'Scenario Simulator', path: '/billing/scenario-simulator' },
    ]
  },
  {
    label: 'Margin Tracker', icon: BarChart3,
    children: [
      { label: 'Dashboard', path: '/margin-tracker/dashboard' },
      { label: 'Budget Tracking', path: '/margin-tracker/budget-tracking' },
      { label: 'Burn Rate', path: '/margin-tracker/burn-rate' },
    ]
  },
  {
    label: 'AI Prediction', icon: BrainCircuit,
    children: [
      { label: 'Margin Prediction', path: '/ai-prediction/margin-prediction' },
      { label: 'Risk Analysis', path: '/ai-prediction/risk-analysis' },
      { label: 'Forecast Insights', path: '/ai-prediction/forecast-insights' },
    ]
  },
  {
    label: 'Resource Allocation', icon: PieChart,
    children: [
      { label: 'Dashboard', path: '/resource-allocation/dashboard' },
      { label: 'Skill Mapping', path: '/resource-allocation/skill-mapping' },
      { label: 'Availability Tracker', path: '/resource-allocation/availability-tracker' },
    ]
  },
  {
    label: 'Bench Management', icon: Briefcase,
    children: [
      { label: 'Bench List', path: '/bench-management/list' },
      { label: 'Cost Analysis', path: '/bench-management/cost-analysis' },
      { label: 'Reallocation Suggestions', path: '/bench-management/reallocation-suggestions' },
    ]
  },
  {
    label: 'Contract Analyzer', icon: FileText,
    children: [
      { label: 'Upload Contract', path: '/contract-analyzer/upload', isAction: true },
      { label: 'Insights', path: '/contract-analyzer/insights' },
      { label: 'SLA Analysis', path: '/contract-analyzer/sla-analysis' },
    ]
  },
  {
    label: 'Invoicing', icon: Receipt,
    children: [
      { label: 'Invoice List', path: '/invoicing/list' },
      { label: 'Generate Invoice', path: '/invoicing/generate', isAction: true },
      { label: 'Payment Tracking', path: '/invoicing/payment-tracking' },
    ]
  },
  {
    label: 'Revenue Forecast', icon: TrendingUp,
    children: [
      { label: 'Dashboard', path: '/revenue-forecast/dashboard' },
      { label: 'Report', path: '/revenue-forecast/report' },
      { label: 'Margin Trends', path: '/revenue-forecast/margin-trends' },
    ]
  }
];

const Sidebar = ({ isOpen, onClose }) => {
  const [openMenus, setOpenMenus] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Grab the logged-in user when the sidebar loads
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const toggleMenu = (label) => {
    setOpenMenus(prev => prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]);
  };

  const handleSignOut = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  // ==========================================
  // 3. THE SMART FILTER
  // ==========================================
  const filteredMenuItems = useMemo(() => {
    // If no one is logged in, show nothing
    if (!currentUser) return [];
    
    // Default to 'Viewer' if role is missing just to be safe
    const role = currentUser.role || 'Viewer';

    return masterMenuItems
      // STEP A: Check if the user's role is allowed to see the main module at all
      .filter(item => {
        if (item.label === 'Dashboard') return true; // Everyone sees Dashboard
        return moduleAccess[item.label]?.includes(role);
      })
      // STEP B: If they can see the module, check if they are "View Only" for that module
      .map(item => {
        const hasWriteAccess = writeAccess[item.label]?.includes(role);

        // If they are View Only, filter out any child routes marked as `isAction: true` (like Add/Generate)
        if (!hasWriteAccess && item.children) {
          const readOnlyChildren = item.children.filter(child => !child.isAction);
          return { ...item, children: readOnlyChildren };
        }
        
        return item;
      });
  }, [currentUser]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-slate-950/80 backdrop-blur-xl border-r border-slate-800 h-screen flex flex-col z-40 transition-transform duration-300 lg:sticky lg:top-0 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h1 className="text-xl font-black text-blue-500 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            KavyaMargin
          </h1>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg lg:hidden transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* User Info Display */}
        {currentUser && (
          <div className="px-6 py-4 border-b border-slate-800/50 bg-slate-900/30">
            <p className="text-sm font-bold text-white truncate">{currentUser.fullName}</p>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-0.5">
              {currentUser.role}
            </p>
          </div>
        )}

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-hide">
          {filteredMenuItems.map((item) => (
            <div key={item.label}>
              {item.path ? (
                <NavLink
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors",
                    isActive ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ) : (
                <div>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold text-slate-400 hover:bg-slate-900 hover:text-slate-100 transition-colors",
                      openMenus.includes(item.label) && "bg-slate-900/50 text-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn("w-4 h-4", openMenus.includes(item.label) && "text-blue-400")} />
                      {item.label}
                    </div>
                    <ChevronRight className={cn("w-3 h-3 transition-transform", openMenus.includes(item.label) && "rotate-90")} />
                  </button>
                  {openMenus.includes(item.label) && (
                    <div className="mt-1 ml-9 space-y-1 border-l border-slate-800 pl-2">
                      {item.children?.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          onClick={() => window.innerWidth < 1024 && onClose()}
                          className={({ isActive }) => cn(
                            "block px-3 py-2 rounded-md text-xs font-bold transition-colors",
                            isActive ? "text-blue-400 bg-blue-500/5" : "text-slate-500 hover:text-slate-200 hover:bg-slate-900"
                          )}
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;