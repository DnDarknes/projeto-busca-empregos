import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import jobRoutes from "./routes/jobRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Conexão com o MongoDB
mongoose.set('strictQuery', false);
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    console.log("Conectado ao MongoDB Atlas");
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Erro ao conectar ao MongoDB Atlas:", error.message);
  });
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use("/auth", authRoutes);
app.use("/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api",applicationRoutes);