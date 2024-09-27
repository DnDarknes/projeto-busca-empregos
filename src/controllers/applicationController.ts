import { Request, Response } from 'express';
import Application, { IApplication } from '../models/Application';
import User, { IUser } from '../models/User';
import Job from '../models/Job';
import mongoose from 'mongoose';

// Candidatar-se a uma Vaga
export const applyToJob = async (req: Request, res: Response) => {
  try {
    const userId = req.userId; // ID do usuário extraído do token
    const { jobId } = req.body; // Apenas jobId agora
    const resume = req.file?.path; // Caminho do arquivo enviado

    // Verifica se a vaga existe
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Vaga não encontrada' });
    }

    // Verifica se o usuário já se candidatou para a vaga
    const existingApplication = await Application.findOne({ userId, jobId });
    if (existingApplication) {
      return res.status(400).json({ message: 'Você já se candidatou a esta vaga.' });
    }

    // Criação da nova candidatura
    const newApplication = new Application({ userId, jobId, resume });
    await newApplication.save();

    return res.status(201).json({ message: 'Candidatura enviada com sucesso' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao se candidatar à vaga', error: error.message || 'Erro desconhecido' });
  }
};


// Obter candidaturas de um usuário
export const getUserApplications = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId; // Obtém o ID do usuário a partir dos parâmetros da requisição

    // Verifica se o userId é válido
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID de usuário inválido' });
    }

    // Busca as candidaturas do usuário e populando os dados da vaga
    const applications = await Application.find({ userId }).populate('jobId'); // Popula as informações da vaga

    if (applications.length === 0) {
      return res.status(404).json({ message: 'Nenhuma candidatura encontrada para este usuário' });
    }

    // Retorna apenas as candidaturas
    return res.status(200).json(applications);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao obter candidaturas', error: error.message || 'Erro desconhecido' });
  }
};


// Obter candidaturas de uma vaga específica
export const getApplicationsByJob = async (req: Request, res: Response) => {
    try {
      const jobId = req.params.jobId;
  
      // Verifica se o jobId é válido
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ message: 'ID de vaga inválido' });
      }
  
      // Busca todas as candidaturas da vaga específica e popula os dados do usuário
      const applications = await Application.find({ jobId }).populate('userId') as (IApplication & { userId: IUser })[];
  
      if (applications.length === 0) {
        return res.status(404).json({ message: 'Nenhuma candidatura encontrada para esta vaga' });
      }
  
      // Monta a estrutura desejada para a resposta
      const populatedApplications = applications.map(application => ({
        application: {
          _id: application._id,
          jobId: application.jobId,
          resume: application.resume,
          date: application.date,
          status: application.status,
        },
        user: {
          _id: application.userId._id, // ID do usuário
          name: application.userId.name, // Nome do usuário
        }
      }));
  
      return res.status(200).json(populatedApplications);
    } catch (error) {
      // Utiliza um type assertion para garantir que error tem a propriedade message
      const errorMessage = (error as Error).message || 'Erro desconhecido';
      console.error(error);
      return res.status(500).json({ message: 'Erro ao obter candidaturas da vaga', error: errorMessage });
    }
  };

// Atualizar status de uma candidatura
export const updateApplicationStatus = async (req: Request, res: Response) => {
    try {
      const { applicationId } = req.params;
      const { status } = req.body;
  
      // Verifica se o applicationId é válido
      if (!mongoose.Types.ObjectId.isValid(applicationId)) {
        return res.status(400).json({ message: 'ID de candidatura inválido' });
      }
  
      // Verifica se o status é válido
      const validStatuses = ['Pendente', 'Aprovado', 'Rejeitado'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Status inválido. Os status permitidos são: Pendente, Aprovado, Rejeitado.' });
      }
  
      // Atualiza o status da candidatura
      const updatedApplication = await Application.findByIdAndUpdate(
        applicationId,
        { status },
        { new: true } // Retorna o documento atualizado
      );
  
      if (!updatedApplication) {
        return res.status(404).json({ message: 'Candidatura não encontrada' });
      }
  
      return res.status(200).json({ message: 'Status da candidatura atualizado com sucesso', updatedApplication });
    } catch (error) {
      const errorMessage = (error as Error).message || 'Erro desconhecido';
      console.error(error);
      return res.status(500).json({ message: 'Erro ao atualizar o status da candidatura', error: errorMessage });
    }
  };

// Deletar uma candidatura
export const deleteApplication = async (req: Request, res: Response) => {
    try {
      const { applicationId } = req.params; // ID da candidatura
  
      // Verifica se o ID da candidatura é válido
      if (!mongoose.Types.ObjectId.isValid(applicationId)) {
        return res.status(400).json({ message: 'ID de candidatura inválido' });
      }
  
      // Deleta a candidatura
      const deletedApplication = await Application.findByIdAndDelete(applicationId);
  
      if (!deletedApplication) {
        return res.status(404).json({ message: 'Candidatura não encontrada' });
      }
  
      return res.status(200).json({ message: 'Candidatura deletada com sucesso', deletedApplication });
    } catch (error) {
      console.error('Erro ao deletar a candidatura:', error);
      return res.status(500).json({ message: 'Erro ao deletar a candidatura' }); 
    }
  };
