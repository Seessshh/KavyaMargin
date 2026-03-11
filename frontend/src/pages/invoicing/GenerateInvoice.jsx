import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Make sure you have axios installed (npm install axios)

const GenerateInvoice = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    client: "",
    project: "",
    amount: "",
    dueDate: "",
    status: "Pending"
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Format the data to match your Mongoose Schema exactly
    const invoiceData = {
      client: formData.client,
      project: formData.project,
      amount: Number(formData.amount), // Keep it as a raw number for the DB
      date: new Date().toISOString().split("T")[0],
      dueDate: formData.dueDate,
      status: formData.status
    };

    try {
      // Send a POST request to your backend API
      const response = await axios.post("http://localhost:5000/api/invoices", invoiceData);
      
      console.log("Saved to MongoDB:", response.data);
      alert("Invoice created successfully in MongoDB!");
      
      // Redirect to invoice list
      navigate("/invoicing/list");

    } catch (error) {
      console.error("Error saving to database:", error);
      alert("Failed to save invoice. Is your backend server running?");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-slate-200">
        Create Invoice
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Your inputs remain exactly the same! */}
        <input
          type="text"
          name="client"
          placeholder="Client Name"
          required
          onChange={handleChange}
          className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-slate-200"
        />
        <input
          type="text"
          name="project"
          placeholder="Project Name"
          required
          onChange={handleChange}
          className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-slate-200"
        />
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          required
          onChange={handleChange}
          className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-slate-200"
        />
        <input
          type="date"
          name="dueDate"
          required
          onChange={handleChange}
          className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-slate-200"
        />
        <select
          name="status"
          onChange={handleChange}
          className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-slate-200"
        >
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Overdue">Overdue</option>
        </select>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-bold"
        >
          Save Invoice
        </button>
      </form>
    </div>
  );
};

export default GenerateInvoice;