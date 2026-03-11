import React, { useState } from 'react';
import { FileText, Upload, CheckCircle2, AlertCircle, Clock, Search, FileCode } from 'lucide-react';

const UploadContract = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([
    { name: 'Service_Agreement_TechCorp.pdf', size: '2.4 MB', status: 'Analyzed', date: '2026-03-01' },
    { name: 'SLA_Cloud_Migration.docx', size: '1.1 MB', status: 'Processing', date: '2026-03-05' },
  ]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
          <Upload className="w-8 h-8 text-blue-500" />
          Contract Upload & Analysis
        </h1>
        <p className="text-slate-400 mt-2 font-medium">Upload legal documents for automated AI analysis of margins, SLAs, and compliance.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Zone */}
        <div className="lg:col-span-2 space-y-6">
          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            className={`relative h-80 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all ${
              dragActive ? 'border-blue-500 bg-blue-500/10 scale-[1.01]' : 'border-slate-800 bg-slate-900/50 backdrop-blur-xl'
            }`}
          >
            <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-4">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Drag & Drop Contracts</h3>
            <p className="text-sm text-slate-400 mt-1 font-medium">or click to browse from your computer</p>
            <p className="text-[10px] text-slate-500 mt-4 uppercase font-bold tracking-widest">Supports PDF, DOCX, TXT (Max 25MB)</p>
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>

          {/* Recent Uploads */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h4 className="font-bold text-slate-100">Recent Uploads</h4>
              <button className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-colors">View All</button>
            </div>
            <div className="divide-y divide-slate-800">
              {uploadedFiles.map((file, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-800 rounded-lg">
                      <FileText className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-100">{file.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{file.size} • {file.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      file.status === 'Analyzed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {file.status}
                    </span>
                    {file.status === 'Analyzed' && (
                      <button className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">View Insights</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Processing Info */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-3xl shadow-xl shadow-black/20 text-white border border-slate-800">
            <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-blue-400" />
              Analysis Engine
            </h4>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/30">
                  <span className="text-[10px] font-bold text-blue-400">01</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100">Clause Extraction</p>
                  <p className="text-xs text-slate-400 mt-1">Identifies payment terms, penalties, and resource obligations.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/30">
                  <span className="text-[10px] font-bold text-blue-400">02</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100">Margin Validation</p>
                  <p className="text-xs text-slate-400 mt-1">Cross-references billing rates with internal cost sheets.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/30">
                  <span className="text-[10px] font-bold text-blue-400">03</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100">Risk Scoring</p>
                  <p className="text-xs text-slate-400 mt-1">Flags unfavorable terms or potential compliance issues.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-500/10 p-6 rounded-2xl border border-amber-500/20">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-amber-100 uppercase tracking-widest">Compliance Tip</h5>
                <p className="text-xs text-amber-300 mt-1 leading-relaxed font-medium">
                  Ensure all signed addendums are uploaded along with the master service agreement for 100% accuracy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadContract;
