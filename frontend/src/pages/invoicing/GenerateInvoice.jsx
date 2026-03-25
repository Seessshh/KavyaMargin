import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const GenerateInvoice = () => {
  const navigate = useNavigate();

  // New state to hold the list of projects from the DB
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    client: "",
    project: "",
    amount: "",
    dueDate: "",
    status: "Pending"
  });

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/projects");
        const projectData = Array.isArray(response.data) ? response.data : response.data.data || response.data.projects || [];
        setProjects(projectData);
      } catch (error) {
        console.error("Failed to fetch projects for dropdown:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Standard handler for manual typing
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // SMART HANDLER: Auto-fills client and amount when a project is selected
  const handleProjectSelect = (e) => {
    const selectedProjectName = e.target.value;
    
    // Find the full project object from our fetched array
    const selectedProject = projects.find(p => p.name === selectedProjectName || p.projectName === selectedProjectName);

    if (selectedProject) {
      // Safely extract and clean the revenue/budget string to prevent NaN errors
      const rawRevenue = selectedProject.revenue || selectedProject.budget || selectedProject.amount || "0";
      const cleanRevenueString = String(rawRevenue).replace(/[^0-9.]/g, "");
      const amount = Number(cleanRevenueString) || 0;

      // Auto-fill the form state
      setFormData({
        ...formData,
        project: selectedProjectName,
        client: selectedProject.client || "",
        amount: amount // Fills in the clean number
      });
    } else {
      // If they select the default "Select a Project" option, clear the fields
      setFormData({
        ...formData,
        project: "",
        client: "",
        amount: ""
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const invoiceData = {
      client: formData.client,
      project: formData.project,
      amount: Number(formData.amount), 
      date: new Date().toISOString().split("T"),
      dueDate: formData.dueDate,
      status: formData.status
    };

    try {
      const response = await axios.post("http://localhost:5000/api/invoices", invoiceData);
      console.log("Saved to MongoDB:", response.data);
      alert("Invoice created successfully in MongoDB!");
      navigate("/invoicing/list");
    } catch (error) {
      console.error("Error saving to database:", error);
      alert("Failed to save invoice. Is your backend server running?");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 animate-in fade-in">
      <h2 className="text-2xl font-bold mb-6 text-slate-200">
        Create Invoice
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* DROPDOWN FOR PROJECT SELECTION */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Select Project</label>
          <select
            name="project"
            required
            value={formData.project}
            onChange={handleProjectSelect}
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all disabled:opacity-50"
            disabled={isLoading}
          >
            <option value="">
              {isLoading ? "Loading projects..." : "— Select a Project —"}
            </option>
            {projects.map((proj, idx) => (
              <option key={proj._id || idx} value={proj.name || proj.projectName}>
                {proj.name || proj.projectName}
              </option>
            ))}
          </select>
        </div>

        {/* CLIENT INPUT (Auto-fills, but user can edit if needed) */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Client Name</label>
          <input
            type="text"
            name="client"
            placeholder="Auto-fills from project..."
            required
            value={formData.client}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
          />
        </div>

        {/* AMOUNT INPUT (Auto-fills, but user can edit if needed) */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Invoice Amount (₹)</label>
          <input
            type="number"
            name="amount"
            placeholder="Auto-fills from project..."
            required
            value={formData.amount}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
          />
        </div>

        {/* DUE DATE */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Due Date</label>
          <input
            type="date"
            name="dueDate"
            required
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all [color-scheme:dark]"
          />
        </div>

        {/* STATUS */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
          >
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all mt-4"
        >
          Generate Invoice
        </button>
      </form>
    </div>
  );
};

export default GenerateInvoice;