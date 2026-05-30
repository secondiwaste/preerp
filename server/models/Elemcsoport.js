const { pool } = require('../config/database');

class Elemcsoport {
  // Find elemcsoport by ID
  static async findById(id) {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM project_elemcsoport WHERE id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get all elemcsoport for a project
  static async findByProjectId(projectId) {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM project_elemcsoport WHERE project_id = ? ORDER BY created_at ASC`,
        [projectId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Create new elemcsoport
  static async create(elemcsoportData) {
    try {
      const {
        project_id,
        nev
      } = elemcsoportData;

      const [result] = await pool.query(
        `INSERT INTO project_elemcsoport 
         (project_id, nev) 
         VALUES (?, ?)`,
        [project_id, nev]
      );

      return {
        id: result.insertId,
        project_id,
        nev
      };
    } catch (error) {
      throw error;
    }
  }

  // Update elemcsoport
  static async update(id, elemcsoportData) {
    try {
      const {
        nev
      } = elemcsoportData;

      await pool.query(
        `UPDATE project_elemcsoport 
         SET nev = ?
         WHERE id = ?`,
        [nev, id]
      );

      return this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // Delete elemcsoport
  static async deleteById(id) {
    try {
      const [result] = await pool.query(
        `DELETE FROM project_elemcsoport WHERE id = ?`,
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Elemcsoport;
