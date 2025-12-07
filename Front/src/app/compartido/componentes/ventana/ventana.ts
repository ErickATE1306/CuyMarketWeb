import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ventana',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ventana.html',
  styleUrl: './ventana.scss'
})
export class VentanaComponent {
  @Input() title = '';
  @Output() close = new EventEmitter<void>();

  cerrar() {
    this.close.emit();
  }
}
