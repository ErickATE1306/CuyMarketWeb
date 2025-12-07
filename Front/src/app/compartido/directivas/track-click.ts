import { Directive, HostListener, Input } from '@angular/core';
import { AnalyticsService } from '../servicios/analiticas';

@Directive({
  selector: '[trackClick]',
  standalone: true
})
export class TrackClickDirective {
  @Input() trackClick: string = '';
  @Input() trackCategory: string = 'UI';
  @Input() trackLabel?: string;
  @Input() trackValue?: number;

  constructor(private analytics: AnalyticsService) {}

  @HostListener('click')
  onClick() {
    this.analytics.trackEvent({
      category: this.trackCategory,
      action: this.trackClick || 'Click',
      label: this.trackLabel,
      value: this.trackValue
    });
  }
}
