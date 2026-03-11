import React, { useState } from 'react';
import { UserPlus, Save, ArrowLeft, DollarSign, Briefcase, Building2, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AddEmployeeCost = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    department: '',
    joiningDate: '',
    ctc: '',
    variablePay: '',
    benefits: '',
    location: 'Offshore',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Adding employee:', formData);
    alert('Employee cost data added successfully!');
    navigate('/employee-cost/list');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center gap-4">
        <Link to="/employee-cost/list" className="p-2 hover:bg-slate-900 rounded-xl border border-transparent hover:border-slate-800 transition-all text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-primary-600" />
            Add Employee Cost
          </h1>
          <p className="text-slate-400 mt-1 font-medium">Onboard a new resource and configure their cost structure.</p>
        </div>
      </header>

      <div className="bg-slate-900 p-8 md:p-12 rounded-3xl border border-slate-800 shadow-sm max-w-4xl transition-all">
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Basic Info */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
              <Building2 className="w-5 h-5 text-primary-500" />
              <h3 className="font-bold text-slate-100 uppercase tracking-widest text-xs">Professional Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">First Name</label>
                <input 
                  type="text" 
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-200" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Last Name</label>
                <input 
                  type="text" 
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-200" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Work Email</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-200" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Designation / Role</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-200" 
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Financials */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
              <DollarSign className="w-5 h-5 text-primary-500" />
              <h3 className="font-bold text-slate-100 uppercase tracking-widest text-xs">Cost Structure</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Annual CTC (Gross)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">₹</span>
                  <input 
                    type="number" 
                    name="ctc"
                    required
                    value={formData.ctc}
                    onChange={handleInputChange}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-200" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Variable Pay (%)</label>
                <input 
                  type="number" 
                  name="variablePay"
                  value={formData.variablePay}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-200" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 ml-1">Joining Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="date" 
                    name="joiningDate"
                    required
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-200" 
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-4 pt-6 border-t border-slate-800">
            <button 
              type="button" 
              onClick={() => navigate('/employee-cost/list')}
              className="px-8 py-3 bg-slate-800 text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-8 py-3 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Employee Cost
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeCost;
