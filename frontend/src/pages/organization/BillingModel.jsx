import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, CheckCircle2, Info, Download, TrendingUp } from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

const BillingModel = () => {
  const [models, setModels] = useState([
    { id: 1, name: 'T&M (Time & Material)', description: 'Billing based on actual hours worked.', status: 'Active', margin: '25-30%' },
    { id: 2, name: 'Fixed Price', description: 'Pre-defined cost for entire project scope.', status: 'Active', margin: '35-40%' },
    { id: 3, name: 'Retainer', description: 'Monthly fixed fee for dedicated resources.', status: 'Inactive', margin: '20-25%' },
    { id: 4, name: 'Outcome Based', description: 'Billing linked to specific milestones/results.', status: 'Active', margin: '45%+' },
  ]);

  const [newModel, setNewModel] = useState({ name: '', description: '', margin: '' });

  const handleAddModel = (e) => {
    e.preventDefault();
    if (newModel.name && newModel.description) {
      setModels([...models, { ...newModel, id: Date.now(), status: 'Active' }]);
      setNewModel({ name: '', description: '', margin: '' });
    }
  };

  const deleteModel = (id) => {
    setModels(models.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-primary-600" />
            Billing Models
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Configure and manage various billing structures for your projects.</p>
        </div>
        <button 
          onClick={() => exportToCSV(models, 'Billing_Models.csv')}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add New Model */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm h-fit transition-all">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">Add New Model</h3>
          <form onSubmit={handleAddModel} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Model Name</label>
              <input 
                type="text" 
                placeholder="e.g. Hybrid Model"
                value={newModel.name}
                onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 dark:text-slate-200" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Target Margin (%)</label>
              <input 
                type="text" 
                placeholder="e.g. 30-35%"
                value={newModel.margin}
                onChange={(e) => setNewModel({ ...newModel, margin: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 dark:text-slate-200" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Description</label>
              <textarea 
                placeholder="Briefly describe the billing logic..."
                value={newModel.description}
                onChange={(e) => setNewModel({ ...newModel, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 dark:text-slate-200 resize-none"
              ></textarea>
            </div>
            <button type="submit" className="w-full py-3 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20">
              <Plus className="w-4 h-4" />
              Add Billing Model
            </button>
          </form>
        </div>

        {/* List of Models */}
        <div className="lg:col-span-2 space-y-4">
          {models.map((model) => (
            <div key={model.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-primary-200 dark:hover:border-primary-500/50 transition-all">
              <div className="flex gap-4">
                <div className={`p-3 rounded-xl ${model.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500'}`}>
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">{model.name}</h4>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${model.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500'}`}>
                      {model.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{model.description}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-primary-500" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Margin: {model.margin}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => deleteModel(model.id)}
                className="p-2 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}

          <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-xl flex gap-3 border border-primary-100 dark:border-primary-900/20 transition-colors">
            <Info className="w-5 h-5 text-primary-600 dark:text-primary-400 shrink-0" />
            <p className="text-[11px] text-primary-700 dark:text-primary-300 font-medium leading-relaxed">
              Changing a billing model status to 'Inactive' will not affect existing projects but will prevent it from being selected for new ones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingModel;
