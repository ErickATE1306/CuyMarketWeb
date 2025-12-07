import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-estado-vacio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './estado-vacio.html',
  styleUrl: './estado-vacio.scss'
})
export class EstadoVacioComponent {
  @Input() icon = '📭';
  @Input() title = 'No hay elementos';
  @Input() message = 'No hay elementos para mostrar';
  @Input() actionText = '';
  @Input() actionLink = '';
  @Output() onAction = new EventEmitter<void>();

  handleAction() {
    this.onAction.emit();
  }
}
