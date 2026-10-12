import { Router } from "express";
import Habitacion from "../domain/entities/Habitacion.js";
import habitacionesRepository from "../infrastructure/habitacionesRepository.js";
import { parseCodigo, validateRoomBody } from "../utils/validation.js";

export function createHabitacionesRouter(repository = habitacionesRepository) {
  const router = Router();

  router.get("/", async (_request, response) => {
    const habitaciones = await repository.findAll();
    response.json({ data: habitaciones });
  });

  router.get("/:codigo", async (request, response) => {
    const codigo = parseCodigo(request.params.codigo);
    const habitacion = await repository.findByCodigo(codigo);
    if (!habitacion) {
      return response.status(404).json({
        error: { message: "No se encontró la habitación solicitada." },
      });
    }
    return response.json({ data: habitacion });
  });

  router.post("/", async (request, response) => {
    const values = validateRoomBody(request.body);
    const habitacion = await repository.create(new Habitacion(values));
    return response.status(201).json({ data: habitacion });
  });

  router.patch("/:codigo", async (request, response) => {
    const codigo = parseCodigo(request.params.codigo);
    const values = validateRoomBody(request.body, { partial: true });
    const habitacion = await repository.update(codigo, new Habitacion(values));
    if (!habitacion) {
      return response.status(404).json({
        error: { message: "No se encontró la habitación solicitada." },
      });
    }
    return response.json({ data: habitacion });
  });

  router.delete("/:codigo", async (request, response) => {
    const codigo = parseCodigo(request.params.codigo);
    const deleted = await repository.remove(codigo);
    if (!deleted) {
      return response.status(404).json({
        error: { message: "No se encontró la habitación solicitada." },
      });
    }
    return response.status(204).end();
  });

  return router;
}

export default createHabitacionesRouter();
