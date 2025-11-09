import { getConnection } from '../config/database.js';

export class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
    this.db = getConnection();
  }

  async findById(id) {
    try {
      const [rows] = await this.db.execute(
        `SELECT * FROM ${this.tableName} WHERE id_${this.tableName.slice(0, -1)} = ?`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding by ID: ${error.message}`);
    }
  }

  async findAll(conditions = {}, limit = 100, offset = 0) {
    try {
      let whereClause = '';
      const params = [];
      
      if (Object.keys(conditions).length > 0) {
        whereClause = 'WHERE ' + Object.keys(conditions)
          .map(key => {
            params.push(conditions[key]);
            return `${key} = ?`;
          })
          .join(' AND ');
      }

      const [rows] = await this.db.execute(
        `SELECT * FROM ${this.tableName} ${whereClause} LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );
      
      return rows;
    } catch (error) {
      throw new Error(`Error finding all: ${error.message}`);
    }
  }

  async create(data) {
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map(() => '?').join(', ');
      
      const [result] = await this.db.execute(
        `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`,
        values
      );
      
      return this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Error creating: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const setClause = keys.map(key => `${key} = ?`).join(', ');
      
      await this.db.execute(
        `UPDATE ${this.tableName} SET ${setClause} WHERE id_${this.tableName.slice(0, -1)} = ?`,
        [...values, id]
      );
      
      return this.findById(id);
    } catch (error) {
      throw new Error(`Error updating: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const [result] = await this.db.execute(
        `DELETE FROM ${this.tableName} WHERE id_${this.tableName.slice(0, -1)} = ?`,
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting: ${error.message}`);
    }
  }
}

export default BaseModel;