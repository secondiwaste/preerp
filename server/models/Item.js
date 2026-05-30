const { pool } = require('../config/database');

class Item {
  // Find item by ID
  static async findById(id) {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM project_item WHERE id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get all items for an elemcsoport
  static async findByElemcsoportId(elemcsoportId) {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM project_item WHERE elemcsoport_id = ? ORDER BY created_at ASC`,
        [elemcsoportId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Create new item
  static async create(itemData) {
    try {
      const {
        elemcsoport_id,
        elemjel = null,
        megjegyzes = null,
        keszul = null,
        szelesseg = null,
        hosszusag = null,
        magassag = null
      } = itemData;

      const [result] = await pool.query(
        `INSERT INTO project_item 
         (elemcsoport_id, elemjel, megjegyzes, keszul, szelesseg, hosszusag, magassag) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [elemcsoport_id, elemjel, megjegyzes, keszul, szelesseg, hosszusag, magassag]
      );

      return {
        id: result.insertId,
        elemcsoport_id,
        elemjel,
        megjegyzes,
        keszul,
        szelesseg,
        hosszusag,
        magassag
      };
    } catch (error) {
      throw error;
    }
  }

  // Update item
  static async update(id, itemData) {
    try {
      // Build dynamic update query based on provided fields
      const allowedFields = ['elemjel', 'megjegyzes', 'keszul', 'szelesseg', 'hosszusag', 'magassag'];
      const updates = [];
      const values = [];
      
      for (const field of allowedFields) {
        if (itemData.hasOwnProperty(field)) {
          updates.push(`${field} = ?`);
          values.push(itemData[field]);
        }
      }
      
      if (updates.length === 0) {
        // No fields to update, just return the current item
        return this.findById(id);
      }
      
      values.push(id); // Add ID for WHERE clause
      
      await pool.query(
        `UPDATE project_item SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      return this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // Delete item
  static async deleteById(id) {
    try {
      const [result] = await pool.query(
        `DELETE FROM project_item WHERE id = ?`,
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Item;
