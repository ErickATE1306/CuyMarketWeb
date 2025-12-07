import { Injectable, signal } from '@angular/core';

export type Language = 'es' | 'en';

interface Translations {
  [key: string]: string | Translations;
}

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  currentLanguage = signal<Language>('es');
  
  private translations: Record<Language, Translations> = {
    es: {},
    en: {}
  };

  constructor() {
    // Cargar idioma guardado o detectar del navegador
    const savedLang = localStorage.getItem('language') as Language;
    const browserLang = navigator.language.split('-')[0] as Language;
    const defaultLang = savedLang || (browserLang === 'en' ? 'en' : 'es');
    
    this.setLanguage(defaultLang);
    this.loadTranslations();
  }

  async loadTranslations() {
    try {
      // Cargar archivos de traducción
      const esModule = await import('../../i18n/es.json');
      const enModule = await import('../../i18n/en.json');
      
      this.translations.es = esModule.default;
      this.translations.en = enModule.default;
    } catch (error) {
      console.error('Error loading translations:', error);
    }
  }

  setLanguage(lang: Language) {
    this.currentLanguage.set(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  }

  translate(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let value: any = this.translations[this.currentLanguage()];

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    // Reemplazar parámetros {variable}
    if (params && typeof value === 'string') {
      return value.replace(/\{(\w+)\}/g, (_, param) => 
        String(params[param] ?? `{${param}}`)
      );
    }

    return String(value);
  }

  // Shorthand
  t = (key: string, params?: Record<string, string | number>) => 
    this.translate(key, params);

  getAvailableLanguages(): Language[] {
    return ['es', 'en'];
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage();
  }
}
