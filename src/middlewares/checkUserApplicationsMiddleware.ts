import { Request, Response, NextFunction } from "express";
import Application from "../models/Application";

// Middleware para verificar se um perfil de usuário possui candidaturas associadas
const checkUserApplicationsMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const hasApplications = await Application.findOne({ userId: id });

    if (hasApplications) {
      return res.status(400).json({ message: "Não é possível excluir o perfil do usuário pois há candidaturas associadas." });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Erro ao verificar candidaturas para este usuário", error });
  }
};

export default checkUserApplicationsMiddleware;
