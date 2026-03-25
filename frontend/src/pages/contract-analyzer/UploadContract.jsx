import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  BrainCircuit,
  FileSearch,
  AlertTriangle,
  FileCode
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UploadContract = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const [appState, setAppState] = useState('idle');
  const [analysisStep, setAnalysisStep] = useState('');
  const [results, setResults] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    setCurrentUser(user);

    if (
      user?.role === 'Project Manager' ||
      user?.role === 'Team Lead' ||
      user?.role === 'HR' ||
      user?.role === 'Viewers'
    ) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave' || e.type === 'drop') setDragActive(false);
  };

  const processFile = async (file) => {
    if (!file) return;

    // safer file validation
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const allowedExtensions = ['pdf', 'txt', 'docx'];
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      alert('Upload Blocked: Only PDF, DOCX, or TXT files are allowed.');
      return;
    }

    setAppState('analyzing');

    setTimeout(() => setAnalysisStep('Extracting text via OCR...'), 500);
    setTimeout(() => setAnalysisStep('Applying NLP models...'), 2000);
    setTimeout(() => setAnalysisStep('Classifying clauses...'), 3500);
    setTimeout(() => setAnalysisStep('Running risk detection...'), 5000);

    const formData = new FormData();
    formData.append('contract', file);

    try {
      const response = await fetch('http://localhost:5000/api/contracts/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to analyze contract');

      const data = await response.json();

      const mappedData = {
        ...data,
        clauses: data.clauses.map((c) => ({
          ...c,
          icon:
            c.iconName === 'ShieldCheck'
              ? CheckCircle2
              : c.iconName === 'AlertTriangle'
              ? AlertTriangle
              : CheckCircle2
        }))
      };

      setTimeout(() => {
        localStorage.setItem('latestContractAnalysis', JSON.stringify(data));
        setResults(mappedData);
        setAppState('results');
      }, 6500);
    } catch (error) {
      console.error(error);
      alert('Error analyzing contract. Make sure backend is running.');
      resetAnalyzer();
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const resetAnalyzer = () => {
    setAppState('idle');
    setResults(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      <header>
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <BrainCircuit className="w-8 h-8 text-blue-500" />
          AI Contract Analyzer
        </h1>
        <p className="text-slate-400 mt-2">
          Upload PDF, DOCX, or TXT agreements for automated analysis.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* MAIN UPLOAD AREA */}
        <div className="lg:col-span-2">

          {appState === 'idle' && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative h-96 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition ${
                dragActive
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-800 bg-slate-900'
              }`}
            >
              <Upload className="w-12 h-12 text-blue-400 mb-4" />

              <h3 className="text-xl font-bold text-white">
                Drag & Drop Contract
              </h3>

              <p className="text-slate-400 mt-2">
                or click to browse
              </p>

              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt"
              />
            </div>
          )}

          {appState === 'analyzing' && (
            <div className="h-96 flex flex-col items-center justify-center border border-blue-500 rounded-2xl bg-slate-900">
              <BrainCircuit className="w-16 h-16 text-blue-400 animate-bounce mb-4" />

              <h3 className="text-xl font-bold text-white">
                AI Engine Processing
              </h3>

              <p className="text-blue-400 mt-2">{analysisStep}</p>
            </div>
          )}

          {appState === 'results' && results && (
            <div className="space-y-6">

              <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl">
                <div>
                  <h3 className="text-white font-bold">{results.fileName}</h3>
                  <p className="text-green-400 text-sm">Analysis Complete</p>
                </div>

                <button
                  onClick={resetAnalyzer}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg"
                >
                  Analyze Another
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                <div className="bg-slate-900 p-4 rounded-xl">
                  <p className="text-xs text-slate-400">Client</p>
                  <p className="text-white font-bold">
                    {results.entities.client}
                  </p>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl">
                  <p className="text-xs text-slate-400">Start Date</p>
                  <p className="text-white font-bold">
                    {results.entities.startDate}
                  </p>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl">
                  <p className="text-xs text-slate-400">End Date</p>
                  <p className="text-white font-bold">
                    {results.entities.endDate}
                  </p>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl">
                  <p className="text-xs text-slate-400">Payment</p>
                  <p className="text-blue-400 font-bold">
                    {results.entities.payment}
                  </p>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">

          <div className="bg-blue-600/10 p-6 rounded-2xl border border-blue-500/20">
            <h4 className="font-bold text-blue-400 flex items-center gap-2 mb-4">
              <FileCode className="w-5 h-5" />
              NLP Workflow
            </h4>

            <ul className="text-sm text-slate-300 space-y-2">
              <li>1. OCR Text Extraction</li>
              <li>2. Entity Recognition</li>
              <li>3. Clause Classification</li>
              <li>4. Risk Detection</li>
            </ul>
          </div>

          <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
            <p className="text-xs text-amber-300">
              Supports <b>PDF, DOCX, TXT</b>. Ensure files are not password protected.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default UploadContract;