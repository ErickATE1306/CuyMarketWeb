import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService, Language } from '../../servicios/i18n';

@Component({
  selector: 'app-selector-idioma',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="language-selector">
      <button 
        class="language-button"
        (click)="toggleDropdown()"
        [attr.aria-label]="'Cambiar idioma. Idioma actual: ' + currentLanguageName()"
        aria-haspopup="true"
        [attr.aria-expanded]="showDropdown">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        <span>{{ currentLanguageCode() }}</span>
      </button>

      @if (showDropdown) {
        <div class="language-dropdown" role="menu" aria-label="Seleccionar idioma">
          @for (lang of languages; track lang.code) {
            <button
              class="language-option"
              [class.active]="lang.code === i18n.getCurrentLanguage()"
              (click)="selectLanguage(lang.code)"
              role="menuitem"
              [attr.aria-label]="lang.name"
              [attr.aria-current]="lang.code === i18n.getCurrentLanguage() ? 'true' : null">
              <span class="flag">{{ lang.flag }}</span>
              <span class="name">{{ lang.name }}</span>
              @if (lang.code === i18n.getCurrentLanguage()) {
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" class="check-icon" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              }
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .language-selector {
      position: relative;
    }

    .language-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: transparent;
      border: 1px solid var(--border, #e5e5e5);
      border-radius: 8px;
      color: var(--foreground, #0a0a0a);
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 500;

      &:hover {
        background: var(--muted, #f5f5f5);
        border-color: var(--primary, #28a745);
      }

      &:focus-visible {
        outline: 3px solid var(--primary, #28a745);
        outline-offset: 2px;
      }

      svg {
        flex-shrink: 0;
      }

      span {
        text-transform: uppercase;
        font-size: 0.875rem;
      }
    }

    .language-dropdown {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      background: var(--background-alt, white);
      border: 1px solid var(--border, #e5e5e5);
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      min-width: 200px;
      z-index: 1000;
      overflow: hidden;
    }

    .language-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.75rem 1rem;
      background: transparent;
      border: none;
      text-align: left;
      cursor: pointer;
      transition: background 0.2s;
      color: var(--foreground, #0a0a0a);

      &:hover {
        background: var(--muted, #f5f5f5);
      }

      &:focus-visible {
        outline: 2px solid var(--primary, #28a745);
        outline-offset: -2px;
      }

      &.active {
        background: rgba(40, 167, 69, 0.1);
        color: var(--primary, #28a745);
        font-weight: 600;
      }

      .flag {
        font-size: 1.5rem;
        line-height: 1;
      }

      .name {
        flex: 1;
        font-size: 0.875rem;
      }

      .check-icon {
        color: var(--primary, #28a745);
        flex-shrink: 0;
      }
    }
  `]
})
export class LanguageSelectorComponent {
  showDropdown = false;

  languages = [
    { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' }
  ];

  currentLanguageCode = computed(() => 
    this.i18n.getCurrentLanguage().toUpperCase()
  );

  currentLanguageName = computed(() => {
    const lang = this.languages.find(l => l.code === this.i18n.getCurrentLanguage());
    return lang?.name || '';
  });

  constructor(public i18n: I18nService) {
    // Cerrar dropdown al hacer click fuera
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.language-selector')) {
        this.showDropdown = false;
      }
    });
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  selectLanguage(lang: Language) {
    this.i18n.setLanguage(lang);
    this.showDropdown = false;
  }
}
