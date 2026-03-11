import React, { useState } from 'react';
import Sidebar from '../components/sidebar/Sidebar_manager';
import Navbar from '../components/navbar/Navbar';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Navbar sticky at the top of main content */}
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Content area scrolling independently */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 scrollbar-hide">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
