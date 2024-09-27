import { Request, Response, NextFunction } from "express";
import Application from "../models/Application"; 

// Middleware para verificar se uma vaga possui candidaturas associadas
const checkJobApplicationsMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Verificar se existem candidaturas associadas à vaga
    const hasApplications = await Application.exists({ jobId: id });

    if (hasApplications) {
      return res.status(400).json({ message: "Não é possível excluir a vaga pois há candidaturas associadas." });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Erro ao verificar candidaturas para esta vaga", error });
  }
};

export default checkJobApplicationsMiddleware;
