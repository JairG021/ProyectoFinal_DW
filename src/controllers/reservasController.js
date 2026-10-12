import { Router } from "express";
import Reserva from "../domain/entities/Reserva.js";
import reservasRepository from "../infrastructure/reservasRepository.js";
import { parseCodigo, validateReservationBody } from "../utils/validation.js";

export function createReservasRouter(repository = reservasRepository) {
  const router = Router();

  router.get("/", async (_request, response) => {
    const reservas = await repository.findAll();
    response.json({ data: reservas });
  });

  router.get("/:codigo", async (request, response) => {
    const codigo = parseCodigo(request.params.codigo);
    const reserva = await repository.findByCodigo(codigo);
    if (!reserva) {
      return response.status(404).json({
        error: { message: "No se encontró la reserva solicitada." },
      });
    }
    return response.json({ data: reserva });
  });

  router.post("/", async (request, response) => {
    const values = validateReservationBody(request.body);
    if (values.fecha_salida <= values.fecha_entrada) {
      return response.status(400).json({
        error: { message: '"fecha_salida" debe ser posterior a "fecha_entrada".' },
      });
    }
    const reserva = await repository.create(
      new Reserva({
        ...values,
        fecha_reservacion: values.fecha_reservacion ?? new Date().toISOString(),
      }),
    );
    return response.status(201).json({ data: reserva });
  });

  router.patch("/:codigo", async (request, response) => {
    const codigo = parseCodigo(request.params.codigo);
    const values = validateReservationBody(request.body, { partial: true });
    const existing = await repository.findByCodigo(codigo);
    if (!existing) {
      return response.status(404).json({
        error: { message: "No se encontró la reserva solicitada." },
      });
    }
    const updatedValues = { ...existing, ...values };
    if (updatedValues.fecha_salida <= updatedValues.fecha_entrada) {
      return response.status(400).json({
        error: { message: '"fecha_salida" debe ser posterior a "fecha_entrada".' },
      });
    }
    const reserva = await repository.update(codigo, new Reserva(values));
    if (!reserva) {
      return response.status(404).json({
        error: { message: "No se encontró la reserva solicitada." },
      });
    }
    return response.json({ data: reserva });
  });

  router.delete("/:codigo", async (request, response) => {
    const codigo = parseCodigo(request.params.codigo);
    const deleted = await repository.remove(codigo);
    if (!deleted) {
      return response.status(404).json({
        error: { message: "No se encontró la reserva solicitada." },
      });
    }
    return response.status(204).end();
  });

  return router;
}

export default createReservasRouter();
