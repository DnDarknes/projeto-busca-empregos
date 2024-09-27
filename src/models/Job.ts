import mongoose, { Schema, Document } from "mongoose";

export interface IJob extends Document {
  title: string;
  description: string;
  company: string;
  location: {
    type: string;
    coordinates: number[];
  };
}

const jobSchema = new Schema<IJob>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true
    },
    coordinates: { type: [Number], required: true }
  }
});

jobSchema.index({ location: "2dsphere" }); // Adiciona índice geoespacial

export default mongoose.model<IJob>("Job", jobSchema);
