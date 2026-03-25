import React, { useState, useEffect } from 'react';
import { IndianRupee, Plus, Trash2, CheckCircle2, Info, Download, TrendingUp } from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

const BillingModel = () => {
  // 1. Dynamic State
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newModel, setNewModel] = useState({ name: '', description: '', margin: '' });

  // 2. Fetch Models from Database
  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/billing-models');
      if (response.ok) {
        const data = await response.json();
        setModels(data);
      }
    } catch (error) {
      console.error("Error fetching billing models:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Add New Model to Database
  const handleAddModel = async (e) => {
    e.preventDefault();
    if (!newModel.name || !newModel.description || !newModel.margin) return;
    
    setIsSaving(true);
    try {
      // Append the % sign to the margin before saving to DB so it formats nicely in the list
      const payload = { 
        ...newModel, 
        margin: `${newModel.margin}%`, 
        status: 'Active' 
      };
      
      const response = await fetch('http://localhost:5000/api/billing-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const savedModel = await response.json();
        setModels([...models, savedModel]);
        setNewModel({ name: '', description: '', margin: '' }); // Reset form
      } else {
        alert("Failed to save billing model.");
      }
    } catch (error) {
      console.error("Error saving model:", error);
      alert("Server connection error.");
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Delete Model from Database
  const deleteModel = async (id) => {
    if (!window.confirm("Are you sure you want to delete this billing model?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/billing-models/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setModels(models.filter(m => (m._id || m.id) !== id));
      }
    } catch (error) {
      console.error("Error deleting model:", error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <IndianRupee className="w-8 h-8 text-blue-500" />
            Billing Models
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Configure and manage various billing structures for your projects.</p>
        </div>
        <button 
          onClick={() => exportToCSV(models, 'Billing_Models.csv')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ADD NEW MODEL FORM */}
        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-sm h-fit transition-all">
          <h3 className="text-lg font-bold text-slate-100 mb-6">Add New Model</h3>
          <form onSubmit={handleAddModel} className="space-y-5">
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Model Name</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Hybrid Model"
                value={newModel.name}
                onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-200 transition-all" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Target Margin (%)</label>
              <div className="relative">
                <input 
                  type="number" 
                  min="0"
                  required
                  placeholder="30"
                  value={newModel.margin}
                  onKeyDown={(e) => {
                    // STRICT SECURITY: Physically block minus, plus, and exponent keys
                    if (e.key === '-' || e.key === 'e' || e.key === '+') {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    // DATA SECURITY: Ensure the value is strictly a positive number
                    const val = Math.abs(Number(e.target.value));
                    setNewModel({ ...newModel, margin: val === 0 ? '' : val });
                  }}
                  className="w-full pl-4 pr-8 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-200 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
              <textarea 
                required
                placeholder="Briefly describe the billing logic..."
                value={newModel.description}
                onChange={(e) => setNewModel({ ...newModel, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-200 resize-none transition-all"
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              disabled={isSaving}
              className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 mt-4"
            >
              <Plus className="w-4 h-4" />
              {isSaving ? 'Adding...' : 'Add Billing Model'}
            </button>
          </form>
        </div>

        {/* DYNAMIC LIST OF MODELS */}
        <div className="lg:col-span-2 space-y-4">
          
          {isLoading ? (
            <div className="p-8 text-center text-slate-500 font-bold">Loading billing models...</div>
          ) : models.length === 0 ? (
            <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 text-center text-slate-500 font-bold">
              No billing models found. Add one to get started.
            </div>
          ) : (
            models.map((model) => (
              <div key={model._id || model.id} className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between group hover:border-blue-500/50 transition-all">
                <div className="flex gap-4">
                  <div className={`p-3 rounded-xl ${model.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-slate-100">{model.name}</h4>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${model.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                        {model.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{model.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-xs font-bold text-slate-300">Margin: {model.margin}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => deleteModel(model._id || model.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  title="Delete Model"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}

          {/* Quick Info Alert */}
          <div className="p-4 bg-blue-500/10 rounded-xl flex gap-3 border border-blue-500/20 mt-6">
            <Info className="w-5 h-5 text-blue-400 shrink-0" />
            <p className="text-[11px] text-blue-300 font-medium leading-relaxed">
              Changing a billing model status to 'Inactive' will not affect existing projects but will prevent it from being selected for new ones.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BillingModel;