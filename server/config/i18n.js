const fs = require('fs');
const path = require('path');
require('dotenv').config();

class I18n {
  constructor(defaultLocale = 'en') {
    this.defaultLocale = defaultLocale;
    this.currentLocale = defaultLocale;
    this.translations = {};
    this.loadTranslations();
  }

  loadTranslations() {
    const localesDir = path.join(__dirname, '..', 'locales');
    
    try {
      const files = fs.readdirSync(localesDir);
      files.forEach(file => {
        if (file.endsWith('.json')) {
          const locale = file.replace('.json', '');
          const filePath = path.join(localesDir, file);
          this.translations[locale] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
      });
      console.log('[I18N] Loaded locales:', Object.keys(this.translations).join(', '));
    } catch (error) {
      console.error('[ERROR] [I18N] Failed to load translations:', error.message);
    }
  }

  setLocale(locale) {
    if (this.translations[locale]) {
      this.currentLocale = locale;
      return true;
    }
    console.warn(`[WARN] [I18N] Locale '${locale}' not found, using '${this.defaultLocale}'`);
    return false;
  }

  t(key, locale = null) {
    const lang = locale || this.currentLocale;
    const translation = this.translations[lang];
    
    if (!translation) {
      return key;
    }

    const keys = key.split('.');
    let value = translation;
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return value || key;
  }

  // Get translation from request - always uses server default locale
  tReq(req, key) {
    return this.t(key, this.defaultLocale);
  }

  getLocaleFromRequest(req) {
    // Always use server default locale (ignore request preferences)
    return this.defaultLocale;
  }

  getSupportedLocales() {
    return Object.keys(this.translations);
  }

  getDefaultLocale() {
    return this.defaultLocale;
  }
}

// Create singleton instance
const i18n = new I18n(process.env.DEFAULT_LOCALE || 'en');

module.exports = i18n;
