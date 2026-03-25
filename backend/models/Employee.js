import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  department: { type: String, required: true },
  CTC: { type: Number, required: true },
  monthlyCost: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Active', 'Bench'], 
    default: 'Active' 
  },
  email: { type: String },
  
  // --- THE ULTIMATE BOUNCER FIX ---
  // This intercepts the data at the schema level BEFORE the CastError can happen.
  joiningDate: { 
    type: String,
    set: function(val) {
      if (!val) return val;
      // If the frontend sends an array ["2025-10-11"], extract the first item
      if (Array.isArray(val)) return String(val);
      // If it sends a weird stringified array "[ '2025-10-11' ]", extract the date
      if (typeof val === 'string' && val.includes('[')) {
        const match = val.match(/\d{4}-\d{2}-\d{2}/);
        return match ? match : val;
      }
      // Otherwise, just make sure it's a string
      return String(val);
    }
  },
  // --------------------------------

  variablePay: { type: Number, default: 0 },
  location: { type: String, default: 'Offshore' },
  primarySkill: { type: String, default: '' },
  secondarySkill: { type: String, default: '' },
  proficiency: { type: String, default: 'Beginner' },
  experience: { type: String, default: '' },
  currentProject: { type: String, default: 'None' },
  // --- THE BOUNCER FIX FOR RELEASE DATE ---
  releaseDate: { 
    type: String, 
    default: 'Immediate',
    set: function(val) {
      if (!val) return val;
      if (Array.isArray(val)) return String(val);
      if (typeof val === 'string' && val.includes('[')) {
        const match = val.match(/\d{4}-\d{2}-\d{2}/);
        return match ? match : val;
      }
      return String(val);
    }
  },
  // ----------------------------------------
  allocation: { type: Number, default: 0 },
}, { timestamps: true });

employeeSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;