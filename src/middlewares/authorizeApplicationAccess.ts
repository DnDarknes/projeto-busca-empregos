import { Request, Response, NextFunction } from 'express';
import Application from '../models/Application';
import Job from '../models/Job';
import User from '../models/User';
import mongoose from 'mongoose';

export const authorizeApplicationAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userRole = (req as any).userRole;
    const userId = (req as any).userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    if (req.method === 'GET' && req.params.userId && req.path.includes('/user/')) {
      if (req.params.userId !== userId && userRole !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado a candidaturas de outro usuário' });
      }
      return next();
    }

    if (req.method === 'GET' && req.params.jobId && req.path.includes('/job/')) {
      const jobId = req.params.jobId;

      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ message: 'ID da vaga inválido' });
      }

      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ message: 'Vaga não encontrada' });
      }

      const isAdmin = user.role === 'admin';
      const isJobCreator = job.createdBy.toString() === userId;

      if (!isAdmin && !isJobCreator) {
        return res.status(403).json({ message: 'Acesso negado às candidaturas desta vaga' });
      }

      return next();
    }

    const applicationId = req.params.applicationId || req.params.id;
    if (!applicationId) {
      return res.status(400).json({ message: 'ID de candidatura não informado' });
    }

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({ message: 'ID de candidatura inválido' });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Candidatura não encontrada' });
    }

    const job = await Job.findById(application.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Vaga relacionada à candidatura não encontrada' });
    }

    const isAdmin = user.role === 'admin';
    const isJobCreator = job.createdBy.toString() === userId;

    if (!isAdmin && !isJobCreator) {
      return res.status(403).json({ message: 'Acesso negado à candidatura' });
    }

    next();
  } catch (error) {
    console.error('Erro na autorização da candidatura:', error);
    return res.status(500).json({ message: 'Erro na verificação de acesso à candidatura' });
  }
};
