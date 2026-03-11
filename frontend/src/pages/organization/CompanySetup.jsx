import React, { useState } from 'react';
import { Building2, Save, Download, Globe, MapPin, Mail, Phone, Hash } from 'lucide-react';
import { exportToPDF } from '../../utils/exportUtils';

const CompanySetup = () => {
  const [formData, setFormData] = useState({
    companyName: 'KavyaMargin Enterprises',
    registrationNumber: 'REG-123456789',
    taxId: 'TAX-987654321',
    industry: 'Information Technology',
    website: 'https://kavyamargin.com',
    email: 'contact@kavyamargin.com',
    phone: '+91 98765 43210',
    address: '123 Tech Park, Financial District, Hyderabad, India',
    currency: 'INR',
    fiscalYearStart: 'April',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Company details updated successfully!');
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500" id="company-setup-content">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary-600" />
            Company Setup
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage your organization's core information and global settings.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => exportToPDF('company-setup-content', 'Company_Setup.pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  Company Name
                </label>
                <input 
                  type="text" 
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 dark:text-slate-200 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-slate-400" />
                  Registration Number
                </label>
                <input 
                  type="text" 
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 dark:text-slate-200 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-400" />
                  Website
                </label>
                <input 
                  type="url" 
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 dark:text-slate-200 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  Work Email
                </label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 dark:text-slate-200 transition-all" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                Office Address
              </label>
              <textarea 
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 dark:text-slate-200 transition-all resize-none"
              ></textarea>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-3 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Info/Quick Stats */}
        <div className="space-y-6">
          <div className="bg-primary-600 p-8 rounded-2xl shadow-lg shadow-primary-500/20 text-white">
            <h3 className="text-lg font-bold mb-4">Organization Profile</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-primary-100">
                <span className="text-sm">Currency</span>
                <span className="font-bold text-white">{formData.currency}</span>
              </div>
              <div className="flex justify-between items-center text-primary-100">
                <span className="text-sm">Fiscal Year</span>
                <span className="font-bold text-white">{formData.fiscalYearStart} - March</span>
              </div>
              <div className="flex justify-between items-center text-primary-100">
                <span className="text-sm">Global Offices</span>
                <span className="font-bold text-white">03</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">Compliance Status</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Tax ID Verified</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Active Registration</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySetup;
