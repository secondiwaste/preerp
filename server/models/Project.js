const { pool } = require('../config/database');

class Project {
  // Find project by ID
  static async findById(id) {
    try {
      const [rows] = await pool.query(
        `SELECT p.*, u.username as created_by_username 
         FROM project p 
         LEFT JOIN users u ON p.created_by = u.id 
         WHERE p.id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Find project by munkaszam
  static async findByMunkaszam(munkaszam) {
    try {
      const [rows] = await pool.query(
        `SELECT p.*, u.username as created_by_username 
         FROM project p 
         LEFT JOIN users u ON p.created_by = u.id 
         WHERE p.munkaszam = ?`,
        [munkaszam]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get all projects with optional filtering and sorting
  static async findAll(options = {}) {
    try {
      const { search = '', sortField = 'id', sortDirection = 'asc', closed = 'false' } = options;
      
      // Validate sortField to prevent SQL injection
      const allowedSortFields = ['id', 'munkaszam', 'munka_megnevezes', 'megrendelo_neve', 'created_at', 'updated_at'];
      const field = allowedSortFields.includes(sortField) ? sortField : 'id';
      
      // Validate sortDirection
      const direction = sortDirection.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
      
      let query = `SELECT p.*, u.username as created_by_username 
                   FROM project p 
                   LEFT JOIN users u ON p.created_by = u.id`;
      const params = [];
      const conditions = [];
      
      // Filter by closed status
      if (closed === 'true') {
        conditions.push('p.closed = TRUE');
      } else if (closed === 'false') {
        conditions.push('p.closed = FALSE');
      }
      // If closed === 'all', don't add any filter
      
      if (search) {
        conditions.push('(p.munkaszam LIKE ? OR p.munka_megnevezes LIKE ? OR p.megrendelo_neve LIKE ?)');
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }
      
      query += ` ORDER BY p.${field} ${direction}`;
      
      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Create new project
  static async create(projectData, userId) {
    try {
      const {
        munkaszam,
        munka_megnevezes,
        reszletek = null,
        megrendelo_neve = null,
        megrendelo_adatai = null,
        szallitasi_cim = null
      } = projectData;

      const [result] = await pool.query(
        `INSERT INTO project 
         (munkaszam, munka_megnevezes, reszletek, megrendelo_neve, megrendelo_adatai, szallitasi_cim, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [munkaszam, munka_megnevezes, reszletek, megrendelo_neve, megrendelo_adatai, szallitasi_cim, userId]
      );

      return {
        id: result.insertId,
        munkaszam,
        munka_megnevezes,
        reszletek,
        megrendelo_neve,
        megrendelo_adatai,
        szallitasi_cim,
        created_by: userId
      };
    } catch (error) {
      throw error;
    }
  }

  // Update project
  static async update(id, projectData) {
    try {
      const {
        munkaszam,
        munka_megnevezes,
        reszletek,
        megrendelo_neve,
        megrendelo_adatai,
        szallitasi_cim
      } = projectData;

      const [result] = await pool.query(
        `UPDATE project 
         SET munkaszam = ?, munka_megnevezes = ?, reszletek = ?, 
             megrendelo_neve = ?, megrendelo_adatai = ?, szallitasi_cim = ?
         WHERE id = ?`,
        [munkaszam, munka_megnevezes, reszletek, megrendelo_neve, megrendelo_adatai, szallitasi_cim, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete project by ID
  static async deleteById(id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM project WHERE id = ?',
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Toggle closed status
  static async toggleClosed(id, closed) {
    try {
      const [result] = await pool.query(
        'UPDATE project SET closed = ? WHERE id = ?',
        [closed, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Project;
