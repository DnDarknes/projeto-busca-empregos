import { Request, Response, NextFunction } from "express";
import Application from "../models/Application"; // Importa o modelo de Application

// Middleware para verificar se um perfil de usuário possui candidaturas associadas
const checkUserApplicationsMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; // ID do usuário a ser excluído

    // Verificar se existem candidaturas associadas ao usuário (userId)
    const hasApplications = await Application.findOne({ userId: id });

    if (hasApplications) {
      return res.status(400).json({ message: "Não é possível excluir o perfil do usuário pois há candidaturas associadas." });
    }

    next(); // Se não houver candidaturas associadas, continua o fluxo
  } catch (error) {
    res.status(500).json({ message: "Erro ao verificar candidaturas para este usuário", error });
  }
};

export default checkUserApplicationsMiddleware;
