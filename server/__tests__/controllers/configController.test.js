const { getConfig } = require('../../controllers/configController');

// Mock dependencies
jest.mock('../../config/i18n', () => ({
  defaultLocale: 'en',
  getSupportedLocales: () => ['en', 'hu', 'de'],
  tReq: (req, key) => key
}));

jest.mock('../../utils/logger', () => ({
  debug: jest.fn(),
  error: jest.fn()
}));

const i18n = require('../../config/i18n');
const Logger = require('../../utils/logger');

describe('Config Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('getConfig', () => {
    it('should return configuration successfully', () => {
      getConfig(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          defaultLocale: 'en',
          supportedLocales: ['en', 'hu', 'de'],
          environment: 'test'
        }
      });
      expect(Logger.debug).toHaveBeenCalledWith(
        'CONFIG',
        'Configuration requested',
        { consoleOnly: true }
      );
    });

    it('should handle errors gracefully', () => {
      jest.spyOn(i18n, 'getSupportedLocales').mockImplementation(() => {
        throw new Error('Config error');
      });

      getConfig(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to retrieve configuration'
      });
      expect(Logger.error).toHaveBeenCalled();
    });
  });
});
