import { Request, Response } from "express";
import Job from "../models/Job";
import { authMiddleware } from "../middlewares/authMiddleware"; // ajuste o caminho conforme necessário

// Criar nova vaga
export const createJob = [authMiddleware, async (req: Request, res: Response) => {
  const { title, description, company, location } = req.body;

  try {
    const newJob = new Job({
      title,
      description,
      company,
      location: {
        type: "Point",
        coordinates: location.coordinates // Certifique-se de que o formato está correto
      }
    });

    await newJob.save();
    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar vaga", error });
  }
}];

// Obter todas as vagas
export const getAllJobs = [authMiddleware, async (req: Request, res: Response) => {
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Erro ao obter vagas", error });
  }
}];

// Obter uma vaga por ID
export const getJobById = [authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Vaga não encontrada." });
    }
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: "Erro ao obter vaga", error });
  }
}];

// Atualizar vaga (PUT)
export const updateJob = [authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const job = await Job.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!job) {
      return res.status(404).json({ message: "Vaga não encontrada." });
    }
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar vaga", error });
  }
}];

// Modificar vaga (PATCH)
export const patchJob = [authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const job = await Job.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!job) {
      return res.status(404).json({ message: "Vaga não encontrada." });
    }
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: "Erro ao modificar vaga", error });
  }
}];

// Excluir vaga
export const deleteJob = [authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ message: "Vaga não encontrada." });
    }

    await Job.findByIdAndDelete(id);
    res.status(200).json({ message: "Vaga excluída com sucesso." });
  } catch (error) {
    res.status(500).json({ message: "Erro ao excluir vaga", error });
  }
}];

