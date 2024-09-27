import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  userId: mongoose.Types.ObjectId; // Referência ao usuário
  jobId: mongoose.Types.ObjectId; // Referência à vaga
  date: Date;
  resume: string;
  status: string; 
}

const applicationSchema = new Schema<IApplication>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  date: { type: Date, default: Date.now },
  resume: { type: String }, 
  status: { 
    type: String,
    enum: ['Pendente', 'Aprovado', 'Rejeitado'], 
    default: 'Pendente',
    required: true
  }
});

export default mongoose.model<IApplication>('Application', applicationSchema);
