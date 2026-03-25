import React, { useState, useEffect } from 'react';
import { Save, User, Mail, Shield, Bell, Palette, Database, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const Settings = () => {
  // Form state management
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: '',
    phone: '',
    department: '',
    timezone: 'Asia/Kolkata',
    language: 'en'
  });

  // UI state management
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Load user data on component mount
  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = () => {
    try {
      // Try to load from localStorage first (for demo purposes)
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        setFormData(JSON.parse(savedSettings));
        return;
      }

      // Get current user from localStorage (if using your existing auth system)
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser) {
        setFormData({
          fullName: currentUser.name || 'Admin User',
          email: currentUser.email || 'admin@kavyamargin.com',
          role: currentUser.role || 'Project Director',
          phone: currentUser.phone || '+91 9876543210',
          department: currentUser.department || 'Technology',
          timezone: 'Asia/Kolkata',
          language: 'en'
        });
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
    setSaveError('');
    setSaveSuccess(false);
  };

  // Validate form data
  const validateForm = () => {
    const { fullName, email } = formData;
    
    if (!fullName.trim()) {
      setSaveError('Full name is required');
      return false;
    }
    
    if (!email.trim()) {
      setSaveError('Email address is required');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSaveError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  // Save settings function
  const saveSettings = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setSaveError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage (in real app, this would be an API call)
      localStorage.setItem('userSettings', JSON.stringify(formData));
      
      // Update currentUser in localStorage if exists
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const updatedUser = {
        ...currentUser,
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        department: formData.department
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      setSaveSuccess(true);
      setHasChanges(false);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveError('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset changes
  const resetChanges = () => {
    loadUserSettings();
    setHasChanges(false);
    setSaveError('');
    setSaveSuccess(false);
  };

  return (
    <div className="settings-page animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Settings</h1>
        <p className="text-slate-400 mt-2 font-medium">Manage your account preferences and system configurations.</p>
      </header>

      <div className="space-y-8">
        {/* Success/Error Messages */}
        {saveSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <p className="text-emerald-300 font-medium">Settings saved successfully!</p>
          </div>
        )}

        {saveError && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <p className="text-rose-300 font-medium">{saveError}</p>
          </div>
        )}

        {/* Profile Settings */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-sm p-6 md:p-8 transition-all">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-slate-100">Profile Settings</h2>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Full Name *</label>
                <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-200 transition-all" 
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Role</label>
                <input 
                  type="text" 
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  disabled 
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-500 cursor-not-allowed font-medium" 
                />
                <p className="text-xs text-slate-500 ml-1">Role can only be changed by administrators</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 ml-1">Email Address *</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-200 transition-all" 
                placeholder="Enter your email address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-200 transition-all" 
                  placeholder="+91 9876543210"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Department</label>
                <input 
                  type="text" 
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-200 transition-all" 
                  placeholder="Your department"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-sm p-6 md:p-8 transition-all">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-slate-100">Preferences</h2>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Timezone</label>
                <select 
                  value={formData.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-200 transition-all"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Language</label>
                <select 
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-200 transition-all"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-sm p-6 md:p-8 transition-all">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-slate-100">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div>
                <h4 className="text-sm font-medium text-slate-200">Email Notifications</h4>
                <p className="text-xs text-slate-400">Receive updates via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div>
                <h4 className="text-sm font-medium text-slate-200">SLA Breach Alerts</h4>
                <p className="text-xs text-slate-400">Get notified of SLA violations</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div>
                <h4 className="text-sm font-medium text-slate-200">Weekly Reports</h4>
                <p className="text-xs text-slate-400">Receive weekly summary reports</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4">
            <button 
              onClick={saveSettings}
              disabled={!hasChanges || loading}
              className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
            
            {hasChanges && (
              <button 
                onClick={resetChanges}
                disabled={loading}
                className="px-8 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
              >
                Reset Changes
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Database className="w-4 h-4" />
            <span>Settings are saved locally</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
