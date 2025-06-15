import { Request, Response } from "express";
import Job from "../models/Job";
import { authMiddleware } from "../middlewares/authMiddleware";

// Criar vaga
export const createJob = async (req: Request, res: Response) => {
  const { title, description, company, location, accessibilitySupport } = req.body;
  const createdBy = (req as any).userId;
  if (!createdBy) return res.status(401).json({ message: 'Usuário não autenticado' });
  if (!title || !description || !company || !location) {
    return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
  }
  if (location.type !== 'Point' || !Array.isArray(location.coordinates) || location.coordinates.length !== 2
      || typeof location.city !== 'string' || typeof location.state !== 'string') {
    return res.status(400).json({ message: 'Formato de localização inválido.' });
  }
  if (!Array.isArray(accessibilitySupport)) {
    return res.status(400).json({ message: 'Campo accessibilitySupport deve ser um array' });
  }
  const job = new Job({ title, description, company, location, accessibilitySupport, createdBy });
  await job.save();
  return res.status(201).json(job);
};

// Obter todas as vagas
export const getAllJobs = [authMiddleware, async (req: Request, res: Response) => {
  const role = (req as any).userRole;
  const jobs = role === 'recrutador'
    ? await Job.find().populate('createdBy', 'name email')
    : await Job.find();
  res.status(200).json(jobs);
}];

// Obter vaga por ID
export const getJobById = [authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const role = (req as any).userRole;
  const job = role === 'recrutador'
    ? await Job.findById(id).populate('createdBy', 'name email')
    : await Job.findById(id);
  if (!job) return res.status(404).json({ message: "Vaga não encontrada." });
  res.status(200).json(job);
}];

// Filtro combinado: acessibilidade e/ou estado
export const filterJobsByAccessibility = async (req: Request, res: Response) => {
  const { accessibilitySupport, state } = req.query as any;
  if (!accessibilitySupport && !state) {
    return res.status(400).json({ message: 'Informe ao menos um filtro' });
  }
  const query: any = {};
  if (accessibilitySupport) {
    const types = (accessibilitySupport as string).split(',').map(t => t.trim().toLowerCase());
    query.accessibilitySupport = { $in: types };
  }
  if (state) {
    query['location.state'] = (state as string).toUpperCase();
  }
  const jobs = await Job.find(query);
  if (jobs.length === 0) return res.status(404).json({ message: 'Nenhuma vaga encontrada.' });
  res.status(200).json(jobs);
};

// Atualizar vaga (PUT)
export const updateJob = [authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  delete updates.createdBy;
  const job = await Job.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!job) return res.status(404).json({ message: "Vaga não encontrada." });
  res.status(200).json(job);
}];

// PATCH vaga
export const patchJob = [authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  delete updates.createdBy;
  const job = await Job.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!job) return res.status(404).json({ message: "Vaga não encontrada." });
  res.status(200).json(job);
}];

// Excluir vaga
export const deleteJob = [authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) return res.status(404).json({ message: "Vaga não encontrada." });
  await Job.findByIdAndDelete(id);
  res.status(200).json({ message: "Vaga excluída com sucesso." });
}];
