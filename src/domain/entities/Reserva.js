export default class Reserva {
  constructor({
    codigo,
    codigo_habitacion,
    nombre_cliente,
    telefono_cliente,
    fecha_reservacion,
    fecha_entrada,
    fecha_salida,
  }) {
    this.codigo = codigo;
    this.codigo_habitacion = codigo_habitacion;
    this.nombre_cliente = nombre_cliente;
    this.telefono_cliente = telefono_cliente;
    this.fecha_reservacion = normalizeDateTime(fecha_reservacion);
    this.fecha_entrada = fecha_entrada;
    this.fecha_salida = fecha_salida;
  }

  static fromRow(row) {
    return new Reserva(row);
  }

  toDatabaseValues() {
    return Object.fromEntries(
      Object.entries({
        codigo_habitacion: this.codigo_habitacion,
        nombre_cliente: this.nombre_cliente,
        telefono_cliente: this.telefono_cliente,
        fecha_reservacion: this.fecha_reservacion,
        fecha_entrada: this.fecha_entrada,
        fecha_salida: this.fecha_salida,
      }).filter(([, value]) => value !== undefined),
    );
  }
}

function normalizeDateTime(value) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 19).replace("T", " ");
  }
  if (typeof value === "string" && value.includes("T")) {
    return new Date(value).toISOString().slice(0, 19).replace("T", " ");
  }
  return value;
}
