// models/Emprendimiento.js
import pool from '../config/database.js';

export class Emprendimiento {
  static table = 'emprendimientos';

  static async create(data) {
    // data ya debe venir saneada por el service (solo columnas válidas)
    const cols = Object.keys(data);
    const placeholders = cols.map(() => '?').join(', ');
    const sql = `INSERT INTO ${this.table} (${cols.join(', ')}) VALUES (${placeholders})`;
    const values = cols.map((c) => data[c]);

    const [result] = await pool.execute(sql, values);
    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT e.*, u.email, u.nombre AS nombre_completo
       FROM ${this.table} e
       INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
       WHERE e.id_emprendimiento = ?`,
      [id]
    );
    return rows[0] ?? null;
  }

  static async findByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT e.*, u.email, u.nombre AS nombre_completo
       FROM ${this.table} e
       INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
       WHERE e.id_usuario = ?`,
      [userId]
    );
    // Política: 1 emprendimiento por usuario
    return rows[0] ?? null;
  }

  static async findAll() {
    const [rows] = await pool.execute(
      `SELECT e.*, u.email, u.nombre AS nombre_completo
       FROM ${this.table} e
       INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
       ORDER BY e.fecha_registro DESC`
    );
    return rows;
  }

  static async update(id, data) {
    const entries = Object.entries(data).filter(
      ([k, v]) => v !== undefined && k !== 'utilidad_neta' && k !== 'id_emprendimiento'
    );
    if (entries.length === 0) return this.findById(id);

    const fields = entries.map(([k]) => `${k} = ?`).join(', ');
    const values = entries.map(([, v]) => v);

    const sql = `UPDATE ${this.table} SET ${fields} WHERE id_emprendimiento = ?`;
    await pool.execute(sql, [...values, id]);

    return this.findById(id);
  }

  static async findManyByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT e.*, u.email, u.nombre AS nombre_completo
       FROM ${this.table} e
       INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
       WHERE e.id_usuario = ?
       ORDER BY e.fecha_registro DESC`,
      [userId]
    );
    return rows; // array
  }
}
