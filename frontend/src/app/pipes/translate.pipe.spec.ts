import { TestBed } from '@angular/core/testing';
import { TranslatePipe } from './translate.pipe';
import { TranslationService } from '../services/translation.service';

describe('TranslatePipe', () => {
  let pipe: TranslatePipe;
  let translationService: jasmine.SpyObj<TranslationService>;

  beforeEach(() => {
    translationService = jasmine.createSpyObj('TranslationService', ['translate']);

    TestBed.configureTestingModule({
      providers: [
        TranslatePipe,
        { provide: TranslationService, useValue: translationService }
      ]
    });

    pipe = TestBed.inject(TranslatePipe);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should call translation service with correct key', () => {
    translationService.translate.and.returnValue('Translated Text');

    const result = pipe.transform('common.welcome');

    expect(translationService.translate).toHaveBeenCalledWith('common.welcome');
    expect(result).toBe('Translated Text');
  });

  it('should return translated value', () => {
    translationService.translate.and.returnValue('Üdvözöljük');

    const result = pipe.transform('common.welcome');

    expect(result).toBe('Üdvözöljük');
  });

  it('should handle nested translation keys', () => {
    translationService.translate.and.returnValue('Login');

    const result = pipe.transform('auth.login.button');

    expect(translationService.translate).toHaveBeenCalledWith('auth.login.button');
    expect(result).toBe('Login');
  });

  it('should return original key if translation not found', () => {
    translationService.translate.and.returnValue('nonexistent.key');

    const result = pipe.transform('nonexistent.key');

    expect(result).toBe('nonexistent.key');
  });

  it('should handle empty string', () => {
    translationService.translate.and.returnValue('');

    const result = pipe.transform('');

    expect(translationService.translate).toHaveBeenCalledWith('');
    expect(result).toBe('');
  });

  it('should handle simple keys without dots', () => {
    translationService.translate.and.returnValue('Title');

    const result = pipe.transform('title');

    expect(translationService.translate).toHaveBeenCalledWith('title');
    expect(result).toBe('Title');
  });

  it('should be pure:false to update on language change', () => {
    // First call
    translationService.translate.and.returnValue('Welcome');
    const result1 = pipe.transform('common.welcome');
    expect(result1).toBe('Welcome');

    // Language changed - should call again
    translationService.translate.and.returnValue('Üdvözöljük');
    const result2 = pipe.transform('common.welcome');
    expect(result2).toBe('Üdvözöljük');

    expect(translationService.translate).toHaveBeenCalledTimes(2);
  });

  it('should handle deeply nested keys', () => {
    translationService.translate.and.returnValue('Deep Value');

    const result = pipe.transform('level1.level2.level3.level4');

    expect(translationService.translate).toHaveBeenCalledWith('level1.level2.level3.level4');
    expect(result).toBe('Deep Value');
  });

  it('should handle special characters in translation keys', () => {
    translationService.translate.and.returnValue('Special Text');

    const result = pipe.transform('auth.errors.invalid_credentials');

    expect(translationService.translate).toHaveBeenCalledWith('auth.errors.invalid_credentials');
    expect(result).toBe('Special Text');
  });

  describe('multiple transformations', () => {
    it('should handle multiple different keys', () => {
      translationService.translate.and.returnValues('Welcome', 'Login', 'Logout');

      const result1 = pipe.transform('common.welcome');
      const result2 = pipe.transform('auth.login');
      const result3 = pipe.transform('auth.logout');

      expect(result1).toBe('Welcome');
      expect(result2).toBe('Login');
      expect(result3).toBe('Logout');
      expect(translationService.translate).toHaveBeenCalledTimes(3);
    });

    it('should call service for each transformation', () => {
      translationService.translate.and.returnValue('Test');

      pipe.transform('key1');
      pipe.transform('key2');
      pipe.transform('key3');

      expect(translationService.translate).toHaveBeenCalledTimes(3);
    });
  });

  describe('edge cases', () => {
    it('should handle null translation result', () => {
      translationService.translate.and.returnValue(null as any);

      const result = pipe.transform('some.key');

      expect(result).toBeNull();
    });

    it('should handle undefined translation result', () => {
      translationService.translate.and.returnValue(undefined as any);

      const result = pipe.transform('some.key');

      expect(result).toBeUndefined();
    });

    it('should handle numeric values returned from service', () => {
      translationService.translate.and.returnValue('42' as any);

      const result = pipe.transform('number.key');

      expect(result).toBe('42');
    });
  });
});
