import pool from "./database.js";
import Habitacion from "../domain/entities/Habitacion.js";

export function createHabitacionesRepository(database = pool) {
  return {
    async findAll() {
      const [rows] = await database.execute(
        "SELECT codigo, numero, tipo, valor FROM habitaciones ORDER BY codigo",
      );
      return rows.map(Habitacion.fromRow);
    },

    async findByCodigo(codigo) {
      const [rows] = await database.execute(
        "SELECT codigo, numero, tipo, valor FROM habitaciones WHERE codigo = ?",
        [codigo],
      );
      return rows[0] ? Habitacion.fromRow(rows[0]) : null;
    },

    async create(habitacion) {
      const values = habitacion.toDatabaseValues();
      const [result] = await database.execute(
        "INSERT INTO habitaciones (numero, tipo, valor) VALUES (?, ?, ?)",
        [values.numero, values.tipo, values.valor],
      );
      return this.findByCodigo(result.insertId);
    },

    async update(codigo, habitacion) {
      const values = habitacion.toDatabaseValues();
      const entries = Object.entries(values);
      if (entries.length === 0) return this.findByCodigo(codigo);

      const [result] = await database.execute(
        `UPDATE habitaciones SET ${entries.map(([field]) => `${field} = ?`).join(", ")} WHERE codigo = ?`,
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
        "DELETE FROM habitaciones WHERE codigo = ?",
        [codigo],
      );
      return result.affectedRows > 0;
    },
  };
}

const habitacionesRepository = createHabitacionesRepository();
export default habitacionesRepository;