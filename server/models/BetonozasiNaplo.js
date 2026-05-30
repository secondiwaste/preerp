const { pool } = require('../config/database');

class BetonozasiNaplo {
  /**
   * Find all betonozasi naplo entries with optional filters
   * @param {Object} options - Filter options
   * @returns {Promise<Array>}
   */
  static async findAll(options = {}) {
    const { sortField = 'datum', sortDirection = 'DESC', search = null, year = null, month = null } = options;
    
    let query = 'SELECT bn.*, u.username as created_by_username FROM betonozasi_naplo bn LEFT JOIN users u ON bn.created_by = u.id';
    const params = [];
    const whereConditions = [];
    
    // Year and month filter
    if (year && month) {
      whereConditions.push('YEAR(bn.datum) = ? AND MONTH(bn.datum) = ?');
      params.push(year, month);
    }
    
    // Search filter
    if (search) {
      whereConditions.push('(bn.rendszam LIKE ? OR bn.szallitolevel_szama LIKE ? OR bn.betonuzem LIKE ? OR bn.betonminoseg LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }
    
    // Add WHERE clause if there are conditions
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    const allowedSortFields = ['datum', 'rendszam', 'betonuzem', 'betonminoseg', 'created_at'];
    const validSortField = allowedSortFields.includes(sortField) ? sortField : 'datum';
    const validSortDirection = sortDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY bn.${validSortField} ${validSortDirection}`;
    
    const [rows] = await pool.query(query, params);
    return rows;
  }

  /**
   * Find a betonozasi naplo entry by ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT bn.*, u.username as created_by_username FROM betonozasi_naplo bn LEFT JOIN users u ON bn.created_by = u.id WHERE bn.id = ?',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Create a new betonozasi naplo entry
   * @param {Object} data
   * @param {number} userId
   * @returns {Promise<Object>}
   */
  static async create(data, userId) {
    const {
      datum,
      rendszam,
      szallitolevel_szama,
      betonuzem,
      betonminoseg,
      kiteti_osztalyok,
      maximalis_szemnagysag,
      cementfajta,
      receptszam,
      levego_beton_homerseklete,
      keveres_kezdete,
      keveres_vege,
      erkezes_ideje,
      terules,
      urites_kezdete,
      urites_vege,
      idon_tuli_varakozas,
      elmeleti_mennyiseg,
      kert_mennyiseg,
      adalekszerek,
      formalevalaszto,
      megjegyzes
    } = data;

    const [result] = await pool.query(
      `INSERT INTO betonozasi_naplo (
        datum, rendszam, szallitolevel_szama, betonuzem, betonminoseg,
        kiteti_osztalyok, maximalis_szemnagysag, cementfajta, receptszam,
        levego_beton_homerseklete, keveres_kezdete, keveres_vege, erkezes_ideje,
        terules, urites_kezdete, urites_vege, idon_tuli_varakozas,
        elmeleti_mennyiseg, kert_mennyiseg, adalekszerek, formalevalaszto,
        megjegyzes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        datum, rendszam, szallitolevel_szama, betonuzem, betonminoseg,
        kiteti_osztalyok, maximalis_szemnagysag, cementfajta, receptszam,
        levego_beton_homerseklete, keveres_kezdete, keveres_vege, erkezes_ideje,
        terules, urites_kezdete, urites_vege, idon_tuli_varakozas,
        elmeleti_mennyiseg, kert_mennyiseg, adalekszerek, formalevalaszto,
        megjegyzes, userId
      ]
    );

    return this.findById(result.insertId);
  }

  /**
   * Update a betonozasi naplo entry
   * @param {number} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  static async update(id, data) {
    // Build dynamic update query based on provided fields
    const allowedFields = [
      'datum', 'rendszam', 'szallitolevel_szama', 'betonuzem', 'betonminoseg',
      'kiteti_osztalyok', 'maximalis_szemnagysag', 'cementfajta', 'receptszam',
      'levego_beton_homerseklete', 'keveres_kezdete', 'keveres_vege', 'erkezes_ideje',
      'terules', 'urites_kezdete', 'urites_vege', 'idon_tuli_varakozas',
      'elmeleti_mennyiseg', 'kert_mennyiseg', 'adalekszerek', 'formalevalaszto', 'megjegyzes'
    ];
    
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
    
    const query = `UPDATE betonozasi_naplo SET ${updates.join(', ')} WHERE id = ?`;
    
    await pool.query(query, values);

    return this.findById(id);
  }

  /**
   * Delete a betonozasi naplo entry
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  static async deleteById(id) {
    const [result] = await pool.query('DELETE FROM betonozasi_naplo WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  /**
   * Get unique rendszam values for autocomplete
   * @returns {Promise<Array<string>>}
   */
  static async getUniqueRendszamok() {
    const [rows] = await pool.query(
      'SELECT DISTINCT rendszam FROM betonozasi_naplo WHERE rendszam IS NOT NULL AND rendszam != "" ORDER BY rendszam'
    );
    return rows.map(row => row.rendszam);
  }
}

module.exports = BetonozasiNaplo;
