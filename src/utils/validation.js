export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function parseCodigo(value) {
  if (!/^[1-9]\d*$/.test(value)) {
    throw new ApiError(400, "El código debe ser un número entero positivo.");
  }
  return Number(value);
}

function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function validateString(value, field, maxLength) {
  if (
    typeof value !== "string" ||
    value.trim().length === 0 ||
    value.trim().length > maxLength
  ) {
    throw new ApiError(
      400,
      `"${field}" debe ser texto no vacío de máximo ${maxLength} caracteres.`,
    );
  }
}

function validateReservationDate(value, field, allowDateTime = false) {
  const validSqlDateTime =
    allowDateTime &&
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value) &&
    isValidDate(value.slice(0, 10)) &&
    isValidTime(value.slice(11, 19)) &&
    isValidDateTime(value.replace(" ", "T"));
  const validIsoDateTime =
    allowDateTime &&
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})?$/.test(value) &&
    isValidDate(value.slice(0, 10)) &&
    isValidTime(value.slice(11, 19)) &&
    isValidDateTime(value);
  if (validSqlDateTime || validIsoDateTime || isValidDate(value)) return;
  throw new ApiError(400, `"${field}" debe ser una fecha válida en formato YYYY-MM-DD.`);
}

function isValidDateTime(value) {
  const date = new Date(value);
  return !Number.isNaN(date.valueOf());
}

function isValidTime(value) {
  const [hours, minutes, seconds] = value.split(":").map(Number);
  return hours < 24 && minutes < 60 && seconds < 60;
}

const roomFields = {
  numero(value) {
    if (!Number.isInteger(value) || value < 1) {
      throw new ApiError(400, '"numero" debe ser un entero positivo.');
    }
  },
  tipo(value) {
    validateString(value, "tipo", 50);
  },
  valor(value) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      throw new ApiError(400, '"valor" debe ser un número mayor o igual a cero.');
    }
  },
};

const reservationFields = {
  codigo_habitacion(value) {
    if (!Number.isInteger(value) || value < 1) {
      throw new ApiError(400, '"codigo_habitacion" debe ser un entero positivo.');
    }
  },
  nombre_cliente(value) {
    validateString(value, "nombre_cliente", 100);
  },
  telefono_cliente(value) {
    validateString(value, "telefono_cliente", 20);
  },
  fecha_reservacion(value) {
    validateReservationDate(value, "fecha_reservacion", true);
  },
  fecha_entrada(value) {
    validateReservationDate(value, "fecha_entrada");
  },
  fecha_salida(value) {
    validateReservationDate(value, "fecha_salida");
  },
};

function validateBody(body, fields, requiredFields, { partial = false } = {}) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError(400, "El cuerpo de la solicitud debe ser un objeto JSON.");
  }
  const providedFields = Object.keys(body);
  if (providedFields.length === 0) {
    throw new ApiError(400, "Debe enviar al menos un campo para procesar la solicitud.");
  }
  for (const field of providedFields) {
    const validate = fields[field];
    if (!validate) throw new ApiError(400, `El campo "${field}" no está permitido.`);
    validate(body[field]);
  }
  if (!partial) {
    for (const field of requiredFields) {
      if (body[field] === undefined) {
        throw new ApiError(400, `El campo "${field}" es obligatorio.`);
      }
    }
  }
  return body;
}

export function validateRoomBody(body, options) {
  return validateBody(body, roomFields, ["numero", "tipo", "valor"], options);
}

export function validateReservationBody(body, options) {
  return validateBody(
    body,
    reservationFields,
    [
      "codigo_habitacion",
      "nombre_cliente",
      "telefono_cliente",
      "fecha_entrada",
      "fecha_salida",
    ],
    options,
  );
}
