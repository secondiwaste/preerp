import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  let service: TranslationService;
  let httpMock: HttpTestingController;

  const mockEnTranslations = {
    common: {
      welcome: 'Welcome',
      logout: 'Logout'
    },
    auth: {
      login: 'Login',
      register: 'Register'
    }
  };

  const mockHuTranslations = {
    common: {
      welcome: 'Üdvözöljük',
      logout: 'Kijelentkezés'
    },
    auth: {
      login: 'Bejelentkezés',
      register: 'Regisztráció'
    }
  };

  const mockConfig = {
    success: true,
    data: {
      defaultLocale: 'en',
      supportedLocales: ['en', 'hu', 'de']
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TranslationService]
    });

    service = TestBed.inject(TranslationService);
    httpMock = TestBed.inject(HttpTestingController);
    // Don't reset automatically - let tests that need it reset explicitly
  });

  afterEach(() => {
    httpMock.verify();
    // Clean up any pending requests
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialize', () => {
    beforeEach(() => {
      // Reset service state for initialization tests only
      service.resetForTesting();
    });

    it('should fetch server config and load default translations', (done) => {
      const initPromise = service.initialize();

      // Handle config request
      const configReq = httpMock.expectOne('/api/config');
      expect(configReq.request.method).toBe('GET');
      configReq.flush(mockConfig);

      // Wait for async function to continue to next line
      Promise.resolve().then(() => {
        const translationsReq = httpMock.expectOne('/assets/i18n/en.json');
        expect(translationsReq.request.method).toBe('GET');
        translationsReq.flush(mockEnTranslations);

        initPromise.then(() => {
          expect(service.getCurrentLanguage()).toBe('en');
          expect(service.getServerDefaultLocale()).toBe('en');
          done();
        });
      });
    });

    it('should handle config fetch failure and use fallback', (done) => {
      const initPromise = service.initialize();

      const configReq = httpMock.expectOne('/api/config');
      configReq.error(new ProgressEvent('error'));

      Promise.resolve().then(() => {
        const translationsReq = httpMock.expectOne('/assets/i18n/en.json');
        translationsReq.flush(mockEnTranslations);

        initPromise.then(() => {
          expect(service.getCurrentLanguage()).toBe('en');
          done();
        });
      });
    });

    it('should not initialize twice', (done) => {
      const initPromise1 = service.initialize();
      
      const configReq = httpMock.expectOne('/api/config');
      configReq.flush(mockConfig);
      
      Promise.resolve().then(() => {
        const translationsReq = httpMock.expectOne('/assets/i18n/en.json');
        translationsReq.flush(mockEnTranslations);

        initPromise1.then(() => {
          // Second initialization should not make HTTP requests
          service.initialize().then(() => {
            httpMock.expectNone('/api/config');
            httpMock.expectNone('/assets/i18n/en.json');
            done();
          });
        });
      });
    });
  });

  describe('loadTranslations', () => {
    it('should load translations for specified language', (done) => {
      service.loadTranslations('hu').subscribe(() => {
        expect(service.getCurrentLanguage()).toBe('hu');
        expect(service.translate('common.welcome')).toBe('Üdvözöljük');
        done();
      });

      const req = httpMock.expectOne('/assets/i18n/hu.json');
      expect(req.request.method).toBe('GET');
      req.flush(mockHuTranslations);
    });

    it('should fallback to English on translation load error', (done) => {
      service.loadTranslations('de').subscribe(() => {
        expect(service.getCurrentLanguage()).toBe('en');
        done();
      });

      // Fail German translations
      const deReq = httpMock.expectOne('/assets/i18n/de.json');
      deReq.error(new ProgressEvent('error'));

      // Expect fallback to English
      const enReq = httpMock.expectOne('/assets/i18n/en.json');
      enReq.flush(mockEnTranslations);
    });

    it('should update currentLang observable', (done) => {
      service.currentLang$.subscribe(lang => {
        if (lang === 'hu') {
          done();
        }
      });

      service.loadTranslations('hu').subscribe();

      const req = httpMock.expectOne('/assets/i18n/hu.json');
      req.flush(mockHuTranslations);
    });
  });

  describe('translate', () => {
    beforeEach(() => {
      service['translations'] = mockEnTranslations;
    });

    it('should translate simple key', () => {
      expect(service.translate('auth.login')).toBe('Login');
    });

    it('should translate nested key', () => {
      expect(service.translate('common.welcome')).toBe('Welcome');
    });

    it('should return key if translation not found', () => {
      expect(service.translate('nonexistent.key')).toBe('nonexistent.key');
    });

    it('should return key if partial path not found', () => {
      expect(service.translate('auth.nonexistent.deep')).toBe('auth.nonexistent.deep');
    });

    it('should handle empty translations object', () => {
      service['translations'] = {};
      expect(service.translate('any.key')).toBe('any.key');
    });

    it('should handle deeply nested keys', () => {
      service['translations'] = {
        level1: {
          level2: {
            level3: {
              message: 'Deep message'
            }
          }
        }
      };

      expect(service.translate('level1.level2.level3.message')).toBe('Deep message');
    });
  });

  describe('setLanguage', () => {
    it('should load translations for new language', () => {
      service.setLanguage('hu');

      const req = httpMock.expectOne('/assets/i18n/hu.json');
      expect(req.request.method).toBe('GET');
      req.flush(mockHuTranslations);
    });

    it('should update current language', (done) => {
      service.setLanguage('hu');

      service.currentLang$.subscribe(lang => {
        if (lang === 'hu') {
          done();
        }
      });

      const req = httpMock.expectOne('/assets/i18n/hu.json');
      req.flush(mockHuTranslations);
    });
  });

  describe('getCurrentLanguage', () => {
    it('should return default language initially', () => {
      expect(service.getCurrentLanguage()).toBe('en');
    });

    it('should return current language after loading', (done) => {
      service.loadTranslations('hu').subscribe(() => {
        expect(service.getCurrentLanguage()).toBe('hu');
        done();
      });

      const req = httpMock.expectOne('/assets/i18n/hu.json');
      req.flush(mockHuTranslations);
    });
  });

  describe('getServerDefaultLocale', () => {
    it('should return English as initial default', () => {
      expect(service.getServerDefaultLocale()).toBe('en');
    });

    it('should return server configured locale after initialization', (done) => {
      const initPromise = service.initialize();

      const configReq = httpMock.expectOne('/api/config');
      configReq.flush({
        success: true,
        data: { defaultLocale: 'hu' }
      });

      Promise.resolve().then(() => {
        const translationsReq = httpMock.expectOne('/assets/i18n/hu.json');
        translationsReq.flush(mockHuTranslations);

        initPromise.then(() => {
          expect(service.getServerDefaultLocale()).toBe('hu');
          done();
        });
      });
    });
  });

  describe('getSupportedLanguages', () => {
    it('should return list of supported languages', () => {
      const languages = service.getSupportedLanguages();

      expect(languages).toEqual([
        { code: 'en', name: 'English' },
        { code: 'hu', name: 'Magyar' },
        { code: 'de', name: 'Deutsch' }
      ]);
    });

    it('should return array with 3 languages', () => {
      const languages = service.getSupportedLanguages();
      expect(languages.length).toBe(3);
    });
  });

  describe('currentLang$ observable', () => {
    it('should emit language changes', (done) => {
      const emittedLangs: string[] = [];

      service.currentLang$.subscribe(lang => {
        emittedLangs.push(lang);
        if (emittedLangs.length === 2) {
          expect(emittedLangs).toEqual(['en', 'hu']);
          done();
        }
      });

      service.loadTranslations('hu').subscribe();

      const req = httpMock.expectOne('/assets/i18n/hu.json');
      req.flush(mockHuTranslations);
    });
  });
});
