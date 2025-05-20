import { Request, Response } from "express";
import Job from "../models/Job";
import { authMiddleware } from "../middlewares/authMiddleware"; // ajuste o caminho conforme necessário

//cria vagas
export const createJob = async (req: Request, res: Response) => {
  try {
    const { title, description, company, location, accessibilitySupport } = req.body;
    const createdBy = (req as any).userId;

    if (!createdBy) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    if (!title || !description || !company || !location) {
      return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
    }

    if (
      !location.type || location.type !== 'Point' ||
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2 ||
      typeof location.city !== 'string' ||
      typeof location.state !== 'string'
    ) {
      return res.status(400).json({ message: 'Formato de localização inválido. Certifique-se de incluir type, coordinates, city e state.' });
    }

    if (!Array.isArray(accessibilitySupport)) {
      return res.status(400).json({ message: 'Campo accessibilitySupport deve ser um array' });
    }

    const job = new Job({
      title,
      description,
      company,
      location,
      accessibilitySupport,
      createdBy,
    });

    await job.save();

    return res.status(201).json(job);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao criar vaga', error: error.message });
  }
};

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

//Filtra vagas pelo tipo de deficiencia
export const filterJobsByAccessibility = async (req: Request, res: Response) => {
  try {
    const accessibilitySupportParam = req.query.accessibilitySupport as string;

    if (!accessibilitySupportParam) {
      return res.status(400).json({ message: 'Parâmetro accessibilitySupport é obrigatório' });
    }

    const accessibilityTypes = accessibilitySupportParam
      .split(',')
      .map(type => type.trim().toLowerCase())
      .filter(type => type.length > 0);

    if (accessibilityTypes.length === 0) {
      return res.status(400).json({ message: 'Informe pelo menos um tipo válido de accessibilitySupport' });
    }

    const jobs = await Job.find({ accessibilitySupport: { $in: accessibilityTypes } });

    if (jobs.length === 0) {
      return res.status(404).json({
        message: `Não foram encontradas vagas para os tipos de deficiência: ${accessibilityTypes.join(', ')}.`
      });
    }

    return res.status(200).json(jobs);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: 'Erro ao buscar vagas por acessibilidade',
      error: error.message,
    });
  }
};


//Filtra vaga pela localização
export const filterJobsByLocation = async (req: Request, res: Response) => {
  try {
    const { city, state } = req.query;

    if (!city && !state) {
      return res.status(400).json({ message: 'Informe ao menos city ou state para buscar' });
    }

    const filter: any = {};

    if (city) {
      filter['location.city'] = city.toString();
    }

    if (state) {
      filter['location.state'] = state.toString();
    }

    const jobs = await Job.find(filter);

    if (jobs.length === 0) {
      return res.status(404).json({ message: 'Nenhuma vaga encontrada para os filtros informados.' });
    }

    return res.status(200).json(jobs);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao buscar vagas por localização', error: error.message });
  }
};


// Atualizar vaga (PUT)
export const updateJob = [authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  delete updates.createdBy;

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
  delete updates.createdBy;

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

