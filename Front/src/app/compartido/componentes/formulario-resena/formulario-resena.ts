import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalificacionComponent } from '../calificacion/calificacion';
import { ReviewService } from '../../servicios/review.service';
import { ToastService } from '../../servicios/toast.service';
import { StorageService } from '../../servicios/storage.service';

@Component({
  selector: 'app-formulario-resena',
  standalone: true,
  imports: [CommonModule, FormsModule, CalificacionComponent],
  templateUrl: './formulario-resena.html',
  styleUrl: './formulario-resena.scss'
})
export class FormularioResenaComponent {
  @Input() productId: string = '';
  @Output() reviewSubmitted = new EventEmitter<void>();

  rating: number = 0;
  title: string = '';
  comment: string = '';
  isSubmitting: boolean = false;

  constructor(
    private reviewService: ReviewService,
    private toastService: ToastService,
    private storageService: StorageService
  ) {}

  onRatingChange(newRating: number) {
    this.rating = newRating;
  }

  canSubmit(): boolean {
    return this.rating > 0 && 
           this.title.trim().length > 0 && 
           this.comment.trim().length >= 10;
  }

  submitReview() {
    if (!this.canSubmit()) {
      this.toastService.show('error', 'Por favor completa todos los campos');
      return;
    }

    const user = this.storageService.getUser();
    if (!user) {
      this.toastService.show('error', 'Debes iniciar sesión para dejar una reseña');
      return;
    }

    if (!this.reviewService.canUserReview(this.productId, user.id)) {
      this.toastService.show('info', 'Ya has dejado una reseña para este producto');
      return;
    }

    if (!this.reviewService.hasUserPurchased(this.productId, user.id)) {
      this.toastService.show('info', 'Solo puedes reseñar productos que hayas comprado');
      return;
    }

    this.isSubmitting = true;

    try {
      this.reviewService.addReview({
        productId: this.productId,
        userId: user.id,
        userName: user.nombre,
        rating: this.rating,
        title: this.title.trim(),
        comment: this.comment.trim(),
        verified: true,
        images: []
      });

      this.toastService.show('success', '¡Reseña publicada con éxito!');
      this.resetForm();
      this.reviewSubmitted.emit();
    } catch (error) {
      this.toastService.show('error', 'Error al publicar la reseña');
    } finally {
      this.isSubmitting = false;
    }
  }

  resetForm() {
    this.rating = 0;
    this.title = '';
    this.comment = '';
  }

  getCharacterCount(): number {
    return this.comment.length;
  }

  isCharacterCountValid(): boolean {
    const count = this.getCharacterCount();
    return count >= 10 && count <= 500;
  }
}
