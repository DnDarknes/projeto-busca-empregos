import { Request, Response, NextFunction } from 'express';
import Job from '../models/Job';
import { IJob } from '../models/Job';

interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
  job?: IJob;
}

export const authorizeJobAccess = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Vaga não encontrada.' });
    }

    if (job.createdBy.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para esta ação.' });
    }

    req.job = job;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Erro ao verificar permissões.', error });
  }
};
