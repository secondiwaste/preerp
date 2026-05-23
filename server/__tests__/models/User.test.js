const User = require('../../models/User');

// Mock the database pool
jest.mock('../../config/database', () => ({
  pool: {
    query: jest.fn()
  }
}));

const { pool } = require('../../config/database');

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return user without password', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        user_level: 'user',
        disabled: false,
        created_at: new Date()
      };

      pool.query.mockResolvedValue([[mockUser]]);

      const result = await User.findById(1);

      expect(result).toEqual(mockUser);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT id, username, user_level, disabled, created_at FROM users WHERE id = ?',
        [1]
      );
    });

    it('should return null if user not found', async () => {
      pool.query.mockResolvedValue([[]]);

      const result = await User.findById(999);

      expect(result).toBeUndefined();
    });

    it('should throw error on database failure', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await expect(User.findById(1)).rejects.toThrow('Database error');
    });
  });

  describe('findByIdWithPassword', () => {
    it('should return user with password', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        user_level: 'user',
        disabled: false,
        created_at: new Date()
      };

      pool.query.mockResolvedValue([[mockUser]]);

      const result = await User.findByIdWithPassword(1);

      expect(result).toEqual(mockUser);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT id, username, password, user_level, disabled, created_at FROM users WHERE id = ?',
        [1]
      );
    });
  });

  describe('findByUsername', () => {
    it('should return user by username', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        user_level: 'user',
        created_at: new Date()
      };

      pool.query.mockResolvedValue([[mockUser]]);

      const result = await User.findByUsername('testuser');

      expect(result).toEqual(mockUser);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE username = ?',
        ['testuser']
      );
    });
  });

  // Note: findByEmail doesn't exist in the actual User model, removed test

  describe('create', () => {
    it('should create new user and return user object', async () => {
      pool.query.mockResolvedValue([{ insertId: 1 }]);

      const result = await User.create('testuser', 'password123', 'user');

      expect(result).toEqual({
        id: 1,
        username: 'testuser',
        user_level: 'user'
      });
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO users (username, password, user_level) VALUES (?, ?, ?)',
        expect.arrayContaining(['testuser', expect.any(String), 'user'])
      );
    });
  });

  describe('updatePassword', () => {
    it('should update user password with hashing', async () => {
      pool.query.mockResolvedValue([{ affectedRows: 1 }]);

      const result = await User.updatePassword(1, 'newpassword123');

      expect(result).toBe(true);
      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE users SET password = ? WHERE id = ?',
        expect.arrayContaining([expect.any(String), 1])
      );
    });
  });

  describe('findAll', () => {
    it('should return all users without password and disabled field', async () => {
      const mockUsers = [
        { id: 1, username: 'user1', user_level: 'user', disabled: false, created_at: new Date() },
        { id: 2, username: 'user2', user_level: 'moderator', disabled: false, created_at: new Date() }
      ];

      pool.query.mockResolvedValue([mockUsers]);

      const result = await User.findAll();

      expect(result).toEqual(mockUsers);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT id, username, user_level, disabled, created_at FROM users ORDER BY id ASC',
        []
      );
    });

    it('should filter users by search query', async () => {
      const mockUsers = [
        { id: 1, username: 'admin', user_level: 'administrator', disabled: false, created_at: new Date() }
      ];

      pool.query.mockResolvedValue([mockUsers]);

      const result = await User.findAll({ search: 'admin' });

      expect(result).toEqual(mockUsers);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT id, username, user_level, disabled, created_at FROM users WHERE username LIKE ? ORDER BY id ASC',
        ['%admin%']
      );
    });

    it('should sort users by specified field and direction', async () => {
      const mockUsers = [
        { id: 2, username: 'user2', user_level: 'moderator', disabled: false, created_at: new Date() },
        { id: 1, username: 'user1', user_level: 'user', disabled: false, created_at: new Date() }
      ];

      pool.query.mockResolvedValue([mockUsers]);

      const result = await User.findAll({ sortField: 'username', sortDirection: 'desc' });

      expect(result).toEqual(mockUsers);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT id, username, user_level, disabled, created_at FROM users ORDER BY username DESC',
        []
      );
    });

    it('should combine search and sort', async () => {
      const mockUsers = [
        { id: 1, username: 'admin1', user_level: 'administrator', disabled: false, created_at: new Date() }
      ];

      pool.query.mockResolvedValue([mockUsers]);

      const result = await User.findAll({ search: 'admin', sortField: 'created_at', sortDirection: 'desc' });

      expect(result).toEqual(mockUsers);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT id, username, user_level, disabled, created_at FROM users WHERE username LIKE ? ORDER BY created_at DESC',
        ['%admin%']
      );
    });

    it('should use default values for invalid sort field', async () => {
      const mockUsers = [];

      pool.query.mockResolvedValue([mockUsers]);

      await User.findAll({ sortField: 'invalid_field', sortDirection: 'asc' });

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT id, username, user_level, disabled, created_at FROM users ORDER BY id ASC',
        []
      );
    });
  });

  describe('updateUserLevel', () => {
    it('should update user level with valid string level', async () => {
      pool.query.mockResolvedValue([{ affectedRows: 1 }]);

      const result = await User.updateUserLevel(1, 'moderator');

      expect(result).toBe(true);
      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE users SET user_level = ? WHERE id = ?',
        ['moderator', 1]
      );
    });
  });

  describe('deleteById', () => {
    it('should delete user by id', async () => {
      pool.query.mockResolvedValue([{ affectedRows: 1 }]);

      await User.deleteById(1);

      expect(pool.query).toHaveBeenCalledWith(
        'DELETE FROM users WHERE id = ?',
        [1]
      );
    });
  });
});
