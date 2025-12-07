import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from '../servicios/i18n';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Reacciona a cambios de idioma
})
export class TranslatePipe implements PipeTransform {
  constructor(private i18n: I18nService) {}

  transform(key: string, params?: Record<string, string | number>): string {
    return this.i18n.translate(key, params);
  }
}
