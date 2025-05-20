import { Request, Response } from 'express';
import * as Yup from 'yup';
import User from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = Yup.object().shape({
  name: Yup.string().required('Nome é obrigatório'),
  email: Yup.string().email('Email inválido').required('Email é obrigatório'),
  password: Yup.string().min(6, 'A senha deve ter pelo menos 6 caracteres').required('Senha é obrigatória'),
  role: Yup.string().oneOf(['admin', 'recrutador', 'usuario'], 'Tipo de usuário inválido').optional()
});

// registro de Usuário ou Recrutador
export const register = async (req: Request, res: Response) => {
  try {
    await userSchema.validate(req.body);

    const { name, email, password, role } = req.body;

    if (role === 'admin') {
      return res.status(403).json({ message: 'Não é permitido criar um usuário com papel de admin por esta rota' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    return res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (error: any) {
    if (error instanceof Yup.ValidationError) {
      return res.status(400).json({ message: 'Erro de validação', errors: error.errors });
    }

    console.error(error);
    return res.status(500).json({ message: 'Erro ao registrar usuário', error: error.message || 'Erro desconhecido' });
  }
};

// registro de Admin
export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
    });

    await admin.save();

    res.status(201).json({ message: 'Administrador criado com sucesso', userId: admin._id });
  } catch (error: any) {
    res.status(500).json({ message: 'Erro ao registrar administrador', error: error.message });
  }
}
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

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    return res.status(200).json({ token, role: user.role });
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
    const userId = req.params.id;
    const updates = req.body;
    
    if ('role' in updates) {
      delete updates.role;
    }

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

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
    const userId = req.params.id;
    const updates = req.body;
    
    if ('role' in updates) {
      delete updates.role;
    }

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

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
    const userId = req.params.id;
    const loggedUserId = req.userId;

    if (userId !== loggedUserId && (req as any).userRole !== 'admin') {
      return res.status(403).json({ message: 'Você não tem permissão para excluir este perfil' });
    }

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