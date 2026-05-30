const { pool } = require('../config/database');

class Raktar {
  /**
   * Find all raktar entries with optional filters
   * @param {Object} options - Filter options
   * @returns {Promise<Array>}
   */
  static async findAll(options = {}) {
    const { sortField = 'datum', sortDirection = 'DESC', search = null, year = null, month = null } = options;
    
    let query = 'SELECT r.*, u.username as created_by_username FROM raktar r LEFT JOIN users u ON r.created_by = u.id';
    const params = [];
    const whereConditions = [];
    
    // Year and month filter
    if (year && month) {
      whereConditions.push('YEAR(r.datum) = ? AND MONTH(r.datum) = ?');
      params.push(year, month);
    }
    
    // Search filter
    if (search) {
      whereConditions.push('(r.megnevezes LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern);
    }
    
    // Add WHERE clause if there are conditions
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    const allowedSortFields = ['datum', 'megnevezes', 'created_at'];
    const validSortField = allowedSortFields.includes(sortField) ? sortField : 'datum';
    const validSortDirection = sortDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY r.${validSortField} ${validSortDirection}`;
    
    const [rows] = await pool.query(query, params);
    return rows;
  }

  /**
   * Find a raktar entry by ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT r.*, u.username as created_by_username FROM raktar r LEFT JOIN users u ON r.created_by = u.id WHERE r.id = ?',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Create a new raktar entry
   * @param {Object} data
   * @param {number} userId
   * @returns {Promise<Object>}
   */
  static async create(data, userId) {
    const { datum, megnevezes, szallitasi_koltseg } = data;
    
    // Convert empty string to null for cleaner database storage
    const cleanMegnevezes = megnevezes && megnevezes.trim() !== '' ? megnevezes : null;

    const [result] = await pool.query(
      `INSERT INTO raktar (datum, megnevezes, szallitasi_koltseg, created_by) VALUES (?, ?, ?, ?)`,
      [datum, cleanMegnevezes, szallitasi_koltseg, userId]
    );

    return this.findById(result.insertId);
  }

  /**
   * Update a raktar entry
   * @param {number} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  static async update(id, data) {
    // Build dynamic update query based on provided fields
    const allowedFields = ['datum', 'megnevezes', 'szallitasi_koltseg'];
    
    const updates = [];
    const values = [];
    
    // Only update fields that are provided in data
    allowedFields.forEach(field => {
      if (data.hasOwnProperty(field)) {
        updates.push(`${field} = ?`);
        values.push(data[field]);
      }
    });
    
    if (updates.length === 0) {
      // No fields to update
      return this.findById(id);
    }
    
    // Add id as the last parameter
    values.push(id);
    
    const query = `UPDATE raktar SET ${updates.join(', ')} WHERE id = ?`;
    
    await pool.query(query, values);

    return this.findById(id);
  }

  /**
   * Delete a raktar entry
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  static async deleteById(id) {
    const [result] = await pool.query('DELETE FROM raktar WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Raktar;
