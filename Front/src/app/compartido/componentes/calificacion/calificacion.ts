import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calificacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calificacion.html',
  styleUrl: './calificacion.scss'
})
export class CalificacionComponent {
  @Input() calificacion = 0;
  @Input() editable = true;
  @Output() calificacionCambiada = new EventEmitter<number>();

  establecerCalificacion(valor: number) {
    if (this.editable) {
      this.calificacion = valor;
      this.calificacionCambiada.emit(valor);
    }
  }
}
