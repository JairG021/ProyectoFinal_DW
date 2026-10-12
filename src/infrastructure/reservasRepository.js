import pool from "./database.js";
import Reserva from "../domain/entities/Reserva.js";

const reservationSelect = `
  SELECT codigo, codigo_habitacion, nombre_cliente, telefono_cliente,
         fecha_reservacion, fecha_entrada, fecha_salida
  FROM reservas
`;

export function createReservasRepository(database = pool) {
  return {
    async findAll() {
      const [rows] = await database.execute(
        `${reservationSelect} ORDER BY codigo`,
      );
      return rows.map(Reserva.fromRow);
    },

    async findByCodigo(codigo) {
      const [rows] = await database.execute(
        `${reservationSelect} WHERE codigo = ?`,
        [codigo],
      );
      return rows[0] ? Reserva.fromRow(rows[0]) : null;
    },

    async create(reserva) {
      const entries = Object.entries(reserva.toDatabaseValues());
      const fields = entries.map(([field]) => field);
      const placeholders = entries.map(() => "?").join(", ");
      const [result] = await database.execute(
        `INSERT INTO reservas (${fields.join(", ")}) VALUES (${placeholders})`,
        entries.map(([, value]) => value),
      );
      return this.findByCodigo(result.insertId);
    },

    async update(codigo, reserva) {
      const entries = Object.entries(reserva.toDatabaseValues());
      if (entries.length === 0) return this.findByCodigo(codigo);

      const [result] = await database.execute(
        `UPDATE reservas SET ${entries.map(([field]) => `${field} = ?`).join(", ")} WHERE codigo = ?`,
        [...entries.map(([, value]) => value), codigo],
      );
      if (result.affectedRows === 0) {
        const existing = await this.findByCodigo(codigo);
        if (!existing) return null;
      }
      return this.findByCodigo(codigo);
    },

    async remove(codigo) {
      const [result] = await database.execute(
        "DELETE FROM reservas WHERE codigo = ?",
        [codigo],
      );
      return result.affectedRows > 0;
    },
  };
}

const reservasRepository = createReservasRepository();
export default reservasRepository;
