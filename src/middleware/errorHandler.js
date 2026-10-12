import { ApiError } from "../utils/validation.js";

const connectionErrors = new Set([
  "ECONNREFUSED",
  "ETIMEDOUT",
  "ENOTFOUND",
  "EHOSTUNREACH",
  "PROTOCOL_CONNECTION_LOST",
  "ER_CON_COUNT_ERROR",
]);

export function errorHandler(error, _request, response, _next) {
  if (error instanceof ApiError) {
    return response.status(error.status).json({
      error: { message: error.message },
    });
  }
  if (error?.type === "entity.parse.failed" || error instanceof SyntaxError) {
    return response.status(400).json({
      error: { message: "El cuerpo de la solicitud contiene JSON inválido." },
    });
  }
  if (connectionErrors.has(error?.code)) {
    console.error("No fue posible conectar con MySQL:", error.code);
    return response.status(503).json({
      error: { message: "No fue posible conectar con la base de datos." },
    });
  }
  if (error?.code === "ER_NO_REFERENCED_ROW_2") {
    return response.status(409).json({
      error: { message: "La habitación indicada no existe." },
    });
  }
  if (error?.code === "ER_ROW_IS_REFERENCED_2") {
    return response.status(409).json({
      error: { message: "No se puede eliminar la habitación porque tiene reservas asociadas." },
    });
  }
  if (error?.code === "ER_DUP_ENTRY") {
    return response.status(409).json({
      error: { message: "Ya existe un registro con esos datos únicos." },
    });
  }
  if (error?.code?.startsWith("ER_") || error?.code?.startsWith("PROTOCOL_")) {
    console.error("Error al consultar la base de datos:", error.code);
    return response.status(500).json({
      error: { message: "Ocurrió un error al consultar la base de datos." },
    });
  }
  console.error("Error inesperado en la API:", error);
  return response.status(500).json({
    error: { message: "Ocurrió un error inesperado en el servidor." },
  });
}
