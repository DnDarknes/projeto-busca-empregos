import mongoose, { Schema, Document, Types } from "mongoose";

export interface IJob extends Document {
  title: string;
  description: string;
  company: string;
  location: {
    type: string;
    coordinates: number[];
    city: string;
    state: string;
  };
  createdBy: Types.ObjectId;
  accessibilitySupport: string[];
}


const jobSchema = new Schema<IJob>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: { type: [Number], required: true },
    city: { type: String, required: true },
    state: { type: String, required: true }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accessibilitySupport: {
    type: [String],
    enum: ['visual', 'auditiva', 'fisica', 'intelectual', 'multipla', 'outra'],
    default: []
  }
});

jobSchema.index({ 'location': '2dsphere' });

export default mongoose.model<IJob>('Job', jobSchema);