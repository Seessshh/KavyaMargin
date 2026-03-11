const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  client: { type: String, required: true },
  margin: { type: Number, required: true },
  revenue: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['On Track', 'At Risk', 'Exceeding'], 
    default: 'On Track' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);