import { Request } from "express";

declare global {
    namespace Express {
        interface Request {
            userId?: string; // ou mongoose.Types.ObjectId dependendo do que você está usando
        }
    }
}
