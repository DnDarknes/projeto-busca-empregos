import { Request, Response, NextFunction } from 'express';
import Application from '../models/Application';

export const handleApplicationsOnJobDelete = async (req: Request, res: Response, next: NextFunction) => {
  const jobId = req.params.id;

  try {
    const result = await Application.updateMany(
      {
        jobId: jobId,
        status: { $ne: 'Aprovado' }
      },
      { $set: { status: 'Rejeitado' } }
    );

    console.log(`Candidaturas rejeitadas: ${result.modifiedCount}`);
    next();
  } catch (error) {
    console.error('Erro ao rejeitar candidaturas:', error);
    return res.status(500).json({ message: 'Erro ao processar candidaturas da vaga' });
  }
};
