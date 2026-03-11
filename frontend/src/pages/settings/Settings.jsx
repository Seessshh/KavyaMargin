import React from 'react';

const Settings = () => {
  return (
    <div className="settings-page animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Settings</h1>
        <p className="text-slate-400 mt-2 font-medium">Manage your account preferences and system configurations.</p>
      </header>

      <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-sm p-6 md:p-8 max-w-2xl transition-all">
        <h2 className="text-xl font-bold text-slate-100 mb-6">Profile Settings</h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 ml-1">Full Name</label>
              <input 
                type="text" 
                defaultValue="Admin User" 
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-200 transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 ml-1">Role</label>
              <input 
                type="text" 
                defaultValue="Project Director" 
                disabled 
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-500 cursor-not-allowed font-medium" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 ml-1">Email Address</label>
            <input 
              type="email" 
              defaultValue="admin@kavyamargin.com" 
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-200 transition-all" 
            />
          </div>
          <div className="pt-4">
            <button className="w-full md:w-auto px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
