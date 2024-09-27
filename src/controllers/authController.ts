import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Registrar Usuário
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    return res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao registrar usuário', error: error.message || 'Erro desconhecido' });
  }
};

// Login de Usuário
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Senha incorreta' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    return res.status(200).json({ token });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao logar', error: error.message || 'Erro desconhecido' });
  }
};

// Obter Perfil de Usuário
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    return res.status(200).json(user);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao obter perfil', error: error.message || 'Erro desconhecido' });
  }
};

// Atualizar Perfil de Usuário
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const updates = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    return res.status(200).json(updatedUser);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao atualizar perfil', error: error.message || 'Erro desconhecido' });
  }
};

// Atualizar Perfil Parcialmente
export const patchProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const updates = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    return res.status(200).json(updatedUser);
  } catch (error: any) { 
    console.error(error);
    return res.status(500).json({ message: 'Erro ao atualizar perfil', error: error.message || 'Erro desconhecido' });
  }
};

// Excluir Perfil de Usuário
export const deleteProfile = async (req: Request, res: Response) => {
  try {
    // Obtém o ID do usuário a partir dos parâmetros da URL
    const userId = req.params.id;

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    return res.status(200).json({ message: 'Usuário deletado com sucesso' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao deletar usuário', error: error.message || 'Erro desconhecido' });
  }
};

