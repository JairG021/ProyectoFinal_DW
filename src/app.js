import cors from "cors";
import express from "express";
import helmet from "helmet";
import { createHabitacionesRouter } from "./controllers/habitacionesController.js";
import { createReservasRouter } from "./controllers/reservasController.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp({
  habitacionesRepository,
  reservasRepository,
} = {}) {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use("/rooms", createHabitacionesRouter(habitacionesRepository));
  app.use("/reservations", createReservasRouter(reservasRepository));
  app.use((_request, response) => {
    response.status(404).json({ error: { message: "Endpoint no encontrado." } });
  });
  app.use(errorHandler);

  return app;
}

const app = createApp();
export default app;
