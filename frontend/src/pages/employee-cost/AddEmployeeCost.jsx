import React, { useState, useEffect } from 'react';
import { UserPlus, Save, ArrowLeft, DollarSign, Briefcase, Building2, Calendar, Layout, Activity } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

const AddEmployeeCost = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // NEW: State to hold dynamic departments
  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    department: '', // Default to empty so they are forced to select a valid one
    joiningDate: '',
    ctc: '',
    variablePay: '',
    benefits: '',
    location: 'Offshore',
    status: 'Active', 
  });

  useEffect(() => {
    // 1. Check User Role
    const user = JSON.parse(localStorage.getItem('currentUser'));
    setCurrentUser(user);
    if (user?.role === 'Project Manager' || user?.role === 'Team Lead') {
      navigate('/dashboard');
    }

    // 2. Fetch Departments for the Dropdown
    const fetchDepartments = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/departments');
        if (response.ok) {
          const data = await response.json();
          setDepartments(data);
          // If not in edit mode and departments exist, set the first one as default
          if (!id && data.length > 0) {
            setFormData(prev => ({ ...prev, department: data.name }));
          }
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    // 3. Fetch Employee Data (If in Edit Mode)
    const fetchEmployeeForEdit = async () => {
      if (id) {
        setIsEditMode(true);
        try {
          const response = await fetch('http://localhost:5000/api/employees');
          if (response.ok) {
            const employees = await response.json();
            const employeeToEdit = employees.find(emp => (emp.id || emp._id) === id);
            
            if (employeeToEdit) {
              const [firstName, ...lastNameParts] = employeeToEdit.name.split(' ');
              
              let safeDate = '';
              if (employeeToEdit.joiningDate && employeeToEdit.joiningDate !== 'Immediate') {
                 safeDate = Array.isArray(employeeToEdit.joiningDate) 
                   ? employeeToEdit.joiningDate.split('T') 
                   : String(employeeToEdit.joiningDate).split('T');
              }

              setFormData({
                firstName: firstName || '',
                lastName: lastNameParts.join(' ') || '',
                email: employeeToEdit.email || '',
                role: employeeToEdit.role || '',
                department: employeeToEdit.department || '',
                joiningDate: safeDate,
                ctc: employeeToEdit.CTC || '',
                variablePay: employeeToEdit.variablePay || '',
                benefits: employeeToEdit.benefits || '',
                location: employeeToEdit.location || 'Offshore',
                status: employeeToEdit.status || 'Active',
              });
            }
          }
        } catch (error) {
          console.error("Error fetching employee for edit:", error);
          alert("Could not load employee data.");
        }
      }
    };

    fetchDepartments();
    fetchEmployeeForEdit();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let finalDate = "";
    const rawDateString = String(formData.joiningDate); 
    const dateMatch = rawDateString.match(/\d{4}-\d{2}-\d{2}/);
    
    if (dateMatch) {
      finalDate = dateMatch; 
    }

    const employeeData = {
      name: `${formData.firstName} ${formData.lastName}`,
      role: formData.role,
      department: formData.department,
      CTC: Number(formData.ctc),
      monthlyCost: Math.round(Number(formData.ctc) / 12),
      status: formData.status,
      email: formData.email,
      joiningDate: finalDate, 
      variablePay: Number(formData.variablePay) || 0,
      location: formData.location
    };

    if (formData.status === 'Bench') {
      employeeData.currentProject = 'None';
      employeeData.allocation = 0;
      employeeData.releaseDate = 'Immediate';
    }

    try {
      const url = isEditMode 
        ? `http://localhost:5000/api/employees/${id}` 
        : 'http://localhost:5000/api/employees';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData),
      });

      if (response.ok) {
        alert(isEditMode ? 'Employee cost data updated successfully!' : 'Employee cost data added successfully!');
        navigate('/employee-cost/list');
      } else {
        const errorData = await response.json();
        alert(`Failed to save: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error saving employee to DB:", error);
      alert('Failed to connect to the server. Check backend terminal.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <header className="flex items-center gap-4">
        <Link to="/employee-cost/list" className="p-2 hover:bg-slate-800 rounded-xl border border-transparent transition-all text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-blue-500" />
            {isEditMode ? 'Edit Employee Cost' : 'Add Employee Cost'}
          </h1>
          <p className="text-slate-400 mt-1 font-medium">
            {isEditMode ? 'Update existing resource cost configuration.' : 'Onboard a new resource and configure their cost structure.'}
          </p>
        </div>
      </header>

      <div className="bg-slate-900/50 backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-slate-800 shadow-sm max-w-4xl transition-all">
        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Basic Info */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-800/50 pb-4">
              <Building2 className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-slate-100 uppercase tracking-widest text-xs">Professional Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                <input 
                  type="text" 
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-200 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                <input 
                  type="text" 
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-200 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-200 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Designation / Role</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-200 transition-all" 
                  />
                </div>
              </div>
              
              {/* DYNAMIC DEPARTMENT DROPDOWN */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Department</label>
                <div className="relative">
                  <Layout className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select 
                    name="department"
                    required
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-200 appearance-none transition-all"
                  >
                    <option value="" disabled>Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id || dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  {departments.length === 0 && (
                    <p className="text-[10px] text-amber-500 absolute -bottom-5 left-1">No departments found. Add one in Organization Settings.</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Employee Status</label>
                <div className="relative">
                  <Activity className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select 
                    name="status"
                    required
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-200 appearance-none transition-all"
                  >
                    <option value="Active">Active (Assigned to Project)</option>
                    <option value="Bench">Bench (Unassigned)</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Financials */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-800/50 pb-4">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-slate-100 uppercase tracking-widest text-xs">Cost Structure</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* STRICT VALIDATION: CTC */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Annual CTC (Gross)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">₹</span>
                  <input 
                    type="number" 
                    name="ctc"
                    required
                    min="0"
                    placeholder="0"
                    value={formData.ctc}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e' || e.key === '+') e.preventDefault();
                    }}
                    onChange={(e) => {
                      const val = Math.abs(Number(e.target.value));
                      setFormData({ ...formData, ctc: val === 0 ? '' : val });
                    }}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-200 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                  />
                </div>
              </div>
              
              {/* STRICT VALIDATION: Variable Pay */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Variable Pay (%)</label>
                <input 
                  type="number" 
                  name="variablePay"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={formData.variablePay}
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e' || e.key === '+') e.preventDefault();
                  }}
                  onChange={(e) => {
                    const val = Math.abs(Number(e.target.value));
                    setFormData({ ...formData, variablePay: val === 0 ? '' : val });
                  }}
                  className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-200 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Joining Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="date" 
                    name="joiningDate"
                    required
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-200 [color-scheme:dark] transition-all" 
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-4 pt-6 border-t border-slate-800/50">
            <button 
              type="button" 
              onClick={() => navigate('/employee-cost/list')}
              className="px-8 py-3 bg-slate-800 text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading || departments.length === 0}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Saving...' : (isEditMode ? 'Update Employee Cost' : 'Save Employee Cost')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeCost;