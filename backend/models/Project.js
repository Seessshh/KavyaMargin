import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  client: { type: String, required: true },
  margin: { type: Number, required: true },
  revenue: { type: String, required: true },
  status: {
    type: String,
    enum: ['On Track', 'At Risk', 'Exceeding'],
    default: 'On Track'
  }
}, { timestamps: true });

projectSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

const Project = mongoose.model('Project', projectSchema);
export default Project;