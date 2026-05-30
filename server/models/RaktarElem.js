const { pool } = require('../config/database');

class RaktarElem {
  /**
   * Find all elements for a raktar entry
   * @param {number} raktarId
   * @returns {Promise<Array>}
   */
  static async findByRaktarId(raktarId) {
    const [rows] = await pool.query(
      'SELECT * FROM raktar_elem WHERE raktar_id = ? ORDER BY id ASC',
      [raktarId]
    );
    return rows;
  }

  /**
   * Find a raktar element by ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM raktar_elem WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Create a new raktar element
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  static async create(data) {
    const { raktar_id, megnevezes, mennyiseg, mertekegyseg, netto_egysegar } = data;

    const [result] = await pool.query(
      `INSERT INTO raktar_elem (raktar_id, megnevezes, mennyiseg, mertekegyseg, netto_egysegar) 
       VALUES (?, ?, ?, ?, ?)`,
      [raktar_id, megnevezes, mennyiseg, mertekegyseg, netto_egysegar]
    );

    return this.findById(result.insertId);
  }

  /**
   * Update a raktar element
   * @param {number} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  static async update(id, data) {
    // Build dynamic update query based on provided fields
    const allowedFields = ['megnevezes', 'mennyiseg', 'mertekegyseg', 'netto_egysegar'];
    
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
    
    const query = `UPDATE raktar_elem SET ${updates.join(', ')} WHERE id = ?`;
    
    await pool.query(query, values);

    return this.findById(id);
  }

  /**
   * Delete a raktar element
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  static async deleteById(id) {
    const [result] = await pool.query('DELETE FROM raktar_elem WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = RaktarElem;
