import pool from '../config/database.js';

export class Emprendedor {
  // Crear emprendedor - VERSIÓN CORREGIDA
  static async create(emprendedorData) {
    // Convertir undefined a null para MySQL
    const {
      id_usuario, 
      nombre_negocio, 
      antiguedad_meses = 0, 
      ingreso_neto_diario = 0, 
      estabilidad_vivienda = 'familiar',
      telefono = null,
      direccion = null
    } = emprendedorData;
    
    const [result] = await pool.execute(
      `INSERT INTO emprendedores 
      (id_usuario, nombre_negocio, antiguedad_meses, ingreso_neto_diario, estabilidad_vivienda, telefono, direccion) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id_usuario, 
        nombre_negocio, 
        antiguedad_meses, 
        ingreso_neto_diario, 
        estabilidad_vivienda, 
        telefono, 
        direccion
      ]
    );
    
    return this.findById(result.insertId);
  }

  // Buscar por ID
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT e.*, u.email, u.nombre as nombre_completo 
       FROM emprendedores e 
       INNER JOIN usuarios u ON e.id_usuario = u.id_usuario 
       WHERE e.id_emprendedor = ?`,
      [id]
    );
    return rows[0];
  }

  // Buscar por ID de usuario
  static async findByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT e.*, u.email, u.nombre as nombre_completo 
       FROM emprendedores e 
       INNER JOIN usuarios u ON e.id_usuario = u.id_usuario 
       WHERE e.id_usuario = ?`,
      [userId]
    );
    return rows[0];
  }

  // Obtener todos los emprendedores
  static async findAll() {
    const [rows] = await pool.execute(
      `SELECT e.*, u.email, u.nombre as nombre_completo 
       FROM emprendedores e 
       INNER JOIN usuarios u ON e.id_usuario = u.id_usuario 
       ORDER BY e.fecha_creacion DESC`
    );
    return rows;
  }

  // Actualizar emprendedor
  static async update(id, emprendedorData) {
    const fields = [];
    const values = [];

    Object.keys(emprendedorData).forEach(key => {
      if (emprendedorData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(emprendedorData[key]);
      }
    });

    values.push(id);

    await pool.execute(
      `UPDATE emprendedores SET ${fields.join(', ')} WHERE id_emprendedor = ?`,
      values
    );

    return this.findById(id);
  }
}