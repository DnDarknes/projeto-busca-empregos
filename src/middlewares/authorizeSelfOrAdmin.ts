import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

export const authorizeSelfOrAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const userIdFromToken = req.userId;
  const userIdFromParams = req.params.id || req.body.id;

  try {
    const user = await User.findById(userIdFromToken);

    if (!user) {
      return res.status(404).json({ message: 'Usuário autenticado não encontrado' });
    }

    if (user.role === 'admin' || userIdFromToken === userIdFromParams) {
      return next();
    }

    return res.status(403).json({ message: 'Acesso negado: apenas o administrador ou o próprio usuário pode modificar este perfil' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro na verificação de permissões' });
  }
};
