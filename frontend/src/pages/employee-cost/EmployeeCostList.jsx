import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Download, Plus, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { exportToCSV, exportToXML } from '../../utils/exportUtils';
import { Link } from 'react-router-dom';

const EmployeeCostList = () => {
  // Start with an empty array. Data will now ONLY come from MongoDB.
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Keep getting the current user from localStorage for auth purposes
    const user = JSON.parse(localStorage.getItem('currentUser'));
    setCurrentUser(user);

    // FETCH FROM MONGODB
    const fetchEmployees = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/employees');
        if (response.ok) {
          const dbEmployees = await response.json();
          if (Array.isArray(dbEmployees)) {
            setEmployees(dbEmployees);
          }
        } else {
          console.error('Failed to fetch employees');
        }
      } catch (error) {
        console.error("Error connecting to database:", error);
      }
    };

    fetchEmployees();
  }, []);

  // DELETE FROM MONGODB
  const deleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/employees/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // If the DB successfully deleted it, remove it from the UI
          const updatedEmployees = employees.filter(emp => (emp.id || emp._id) !== id);
          setEmployees(updatedEmployees);
        } else {
          alert('Failed to delete employee from database.');
        }
      } catch (error) {
        console.error("Error deleting employee:", error);
        alert('Server connection error while deleting.');
      }
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const name = emp?.name || '';
    const role = emp?.role || '';
    const dept = emp?.department || '';
    
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           role.toLowerCase().includes(searchTerm.toLowerCase()) ||
           dept.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatCurrency = (val) => 
    new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR', 
      maximumFractionDigits: 0 
    }).format(val);

  return (
    <div className="space-y-8 animate-in fade-in duration-500" id="employee-list-content">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            Employee Cost List
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Detailed breakdown of employee compensation and organizational costs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => exportToCSV(employees, 'Employee_Costs.csv')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          
          {currentUser?.role !== 'Project Manager' && currentUser?.role !== 'Team Lead' && (
            <Link 
              to="/employee-cost/add"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              Add Employee
            </Link>
          )}
        </div>
      </header>

      {/* Filters & Search */}
      <div className="bg-slate-900/50 backdrop-blur-xl p-4 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between transition-colors">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by name, role, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-200 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-800/50 text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all border border-slate-700">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Employee</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Department</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Annual CTC</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Monthly Cost</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredEmployees.length === 0 ? (
                 <tr>
                   <td colSpan="6" className="px-6 py-8 text-center text-slate-500 text-sm">
                     No employees found. Add a new employee to get started.
                   </td>
                 </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  // Fallback ID logic in case your DB uses _id instead of id
                  const empId = emp.id || emp._id; 
                  
                  return (
                  <tr key={empId} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center font-bold text-xs">
                          {emp.name ? emp.name.split(' ').map(n => n).join('').substring(0, 2) : '?'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-100">{emp.name}</p>
                          <p className="text-xs text-slate-400 font-medium">{emp.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-400">{emp.department}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-100">{formatCurrency(emp.CTC || 0)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-100">{formatCurrency(emp.monthlyCost || 0)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        emp.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {currentUser?.role !== 'Project Manager' && currentUser?.role !== 'Team Lead' && (
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link 
                            to={`/employee-cost/edit/${empId}`}
                            className="p-2 text-slate-500 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => deleteEmployee(empId)}
                            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-all">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCostList;