import { Request, Response } from 'express';
import Application, { IApplication } from '../models/Application';
import User, { IUser } from '../models/User';
import Job from '../models/Job';
import mongoose from 'mongoose';

// Candidatar-se a uma vaga (apenas usuários comuns)
export const applyToJob = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user || user.role !== 'usuario') {
      return res.status(403).json({ message: 'Apenas usuários comuns podem se candidatar a vagas' });
    }

    const { jobId } = req.body;
    const resume = req.file?.path;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Vaga não encontrada' });
    }

    const existingApplication = await Application.findOne({ userId, jobId });
    if (existingApplication) {
      return res.status(400).json({ message: 'Você já se candidatou a esta vaga.' });
    }

    const newApplication = new Application({ userId, jobId, resume });
    await newApplication.save();

    return res.status(201).json({ message: 'Candidatura enviada com sucesso' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao se candidatar à vaga', error: error.message || 'Erro desconhecido' });
  }
};


// Obter candidaturas de um usuário (somente o próprio usuário ou um admin)
export const getUserApplications = async (req: Request, res: Response) => {
  try {
    const targetUserId = req.params.userId;
    const requesterId = req.userId;

    // Verifica se o ID informado é válido
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: 'ID de usuário inválido' });
    }

    const requester = await User.findById(requesterId);
    if (!requester) {
      return res.status(403).json({ message: 'Usuário não autorizado' });
    }

    // Somente o próprio usuário ou um admin pode ver suas candidaturas
    if (requester._id.toString() !== targetUserId && requester.role !== 'admin') {
      return res.status(403).json({ message: 'Você não tem permissão para ver as candidaturas deste usuário' });
    }

    // Busca e popula os dados da vaga
    const applications = await Application.find({ userId: targetUserId }).populate('jobId');

    if (applications.length === 0) {
      return res.status(404).json({ message: 'Nenhuma candidatura encontrada para este usuário' });
    }

    return res.status(200).json(applications);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao obter candidaturas', error: error.message || 'Erro desconhecido' });
  }
};


// Obter candidaturas de uma vaga (apenas recrutador dono da vaga ou admin)
export const getApplicationsByJob = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: 'ID de vaga inválido' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Vaga não encontrada' });
    }

    const user = await User.findById(userId);
    if (!user || (job.createdBy.toString() !== userId && user.role !== 'admin')) {
      return res.status(403).json({ message: 'Apenas o criador da vaga ou um administrador pode ver as candidaturas' });
    }

    const applications = await Application.find({ jobId }).populate('userId') as (IApplication & { userId: IUser })[];

    if (applications.length === 0) {
      return res.status(404).json({ message: 'Nenhuma candidatura encontrada para esta vaga' });
    }

    const populatedApplications = applications.map(application => ({
      application: {
        _id: application._id,
        jobId: application.jobId,
        resume: application.resume,
        date: application.date,
        status: application.status,
      },
      user: {
        _id: application.userId._id,
        name: application.userId.name,
      }
    }));

    return res.status(200).json(populatedApplications);
  } catch (error) {
    const errorMessage = (error as Error).message || 'Erro desconhecido';
    console.error(error);
    return res.status(500).json({ message: 'Erro ao obter candidaturas da vaga', error: errorMessage });
  }
};

// Atualizar status da candidatura (somente recrutador criador da vaga ou admin)
export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({ message: 'ID de candidatura inválido' });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Candidatura não encontrada' });
    }

    const job = await Job.findById(application.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Vaga associada à candidatura não encontrada' });
    }

    const user = await User.findById(userId);
    if (!user || (job.createdBy.toString() !== userId && user.role !== 'admin')) {
      return res.status(403).json({ message: 'Apenas o criador da vaga ou um administrador pode atualizar o status' });
    }

    const validStatuses = ['Pendente', 'Aprovado', 'Rejeitado'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Status inválido. Os status permitidos são: Pendente, Aprovado, Rejeitado.' });
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }
    );

    return res.status(200).json({ message: 'Status da candidatura atualizado com sucesso', updatedApplication });
  } catch (error) {
    const errorMessage = (error as Error).message || 'Erro desconhecido';
    console.error(error);
    return res.status(500).json({ message: 'Erro ao atualizar o status da candidatura', error: errorMessage });
  }
};

// Deletar candidatura (somente recrutador criador da vaga ou admin)
export const deleteApplication = async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({ message: 'ID de candidatura inválido' });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Candidatura não encontrada' });
    }

    const job = await Job.findById(application.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Vaga associada à candidatura não encontrada' });
    }

    const user = await User.findById(userId);
    if (!user || (job.createdBy.toString() !== userId && user.role !== 'admin')) {
      return res.status(403).json({ message: 'Apenas o criador da vaga ou um administrador pode deletar esta candidatura' });
    }

    const deletedApplication = await Application.findByIdAndDelete(applicationId);

    return res.status(200).json({ message: 'Candidatura deletada com sucesso', deletedApplication });
  } catch (error) {
    console.error('Erro ao deletar a candidatura:', error);
    return res.status(500).json({ message: 'Erro ao deletar a candidatura' });
  }
};
