import { Request, Response } from "express";
import Application from "../models/Application";
import User from "../models/User";
import Job from "../models/Job";

export const applyToJob = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const jobId = req.params.id;

    const user = await User.findById(userId);
    if (!user || user.role !== 'usuario') {
      return res.status(403).json({ message: 'Apenas candidatos podem aplicar.' });
    }

    const resume = req.file?.path;
    if (!resume) {
      return res.status(400).json({ message: 'Arquivo de currículo é obrigatório.' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Vaga não encontrada.' });
    }

    const existing = await Application.findOne({ userId, jobId });
    if (existing) {
      return res.status(400).json({ message: 'Já se candidatou a essa vaga.' });
    }

    const app = new Application({ userId, jobId, resume });
    await app.save();

    return res.status(201).json({ message: 'Candidatura enviada!' });
  } catch (error: any) {
    console.error('Erro ao se candidatar:', error);
    return res.status(500).json({ message: 'Erro ao se candidatar à vaga', error: error.message });
  }
};
