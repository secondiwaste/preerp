import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translations: any = {};
  private currentLang = new BehaviorSubject<string>('en');
  public currentLang$ = this.currentLang.asObservable();
  private serverDefaultLocale: string = 'en';
  private apiUrl = '/api';
  private initialized = false;

  constructor(private http: HttpClient) {}

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Fetch server configuration
      const config = await firstValueFrom(
        this.http.get<any>(`${this.apiUrl}/config`)
      );
      
      if (config.success && config.data.defaultLocale) {
        this.serverDefaultLocale = config.data.defaultLocale;
        console.log('[I18N] Server default locale:', this.serverDefaultLocale);
      }
    } catch (error) {
      console.warn('[I18N] Failed to fetch server config, using default:', error);
    }

    // Always use server default locale (ignore localStorage)
    await firstValueFrom(this.loadTranslations(this.serverDefaultLocale));
    
    this.initialized = true;
  }

  loadTranslations(lang: string): Observable<any> {
    return this.http.get(`/assets/i18n/${lang}.json`).pipe(
      tap((translations) => {
        this.translations = translations;
        this.currentLang.next(lang);
        console.log('[I18N] Loaded translations for:', lang);
      }),
      catchError((error) => {
        console.error('[I18N] Failed to load translations for', lang, error);
        // Fallback to English
        if (lang !== 'en') {
          return this.loadTranslations('en');
        }
        throw error;
      })
    );
  }

  translate(key: string): string {
    const keys = key.split('.');
    let value = this.translations;

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }

    return value || key;
  }

  setLanguage(lang: string): void {
    this.loadTranslations(lang).subscribe();
  }

  getCurrentLanguage(): string {
    return this.currentLang.value;
  }

  getServerDefaultLocale(): string {
    return this.serverDefaultLocale;
  }

  getSupportedLanguages(): { code: string; name: string }[] {
    return [
      { code: 'en', name: 'English' },
      { code: 'hu', name: 'Magyar' },
      { code: 'de', name: 'Deutsch' }
    ];
  }

  // For testing purposes - reset initialization state
  resetForTesting(): void {
    this.initialized = false;
    this.translations = {};
    this.currentLang.next('en');
    this.serverDefaultLocale = 'en';
  }
}
