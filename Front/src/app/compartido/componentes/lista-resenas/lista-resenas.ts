import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalificacionComponent } from '../calificacion/calificacion';
import { ReviewService, Review } from '../../servicios/review.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-resenas',
  standalone: true,
  imports: [CommonModule, CalificacionComponent],
  templateUrl: './lista-resenas.html',
  styleUrl: './lista-resenas.scss'
})
export class ListaResenasComponent implements OnInit, OnDestroy {
  @Input() productId: string = '';

  reviews: Review[] = [];
  filteredReviews: Review[] = [];
  averageRating: number = 0;
  totalReviews: number = 0;
  ratingDistribution: { [key: number]: number } = {};
  
  filterRating: number = 0; // 0 = todas
  sortBy: 'recent' | 'helpful' | 'highest' | 'lowest' = 'recent';

  private reviewSubscription?: Subscription;

  constructor(private reviewService: ReviewService) {}

  ngOnInit() {
    this.loadReviews();
    // Recargar reviews cada 2 segundos para detectar nuevas reseñas
    this.reviewSubscription = setInterval(() => {
      this.loadReviews();
    }, 2000) as any;
  }

  ngOnDestroy() {
    if (this.reviewSubscription) {
      clearInterval(this.reviewSubscription as any);
    }
  }

  loadReviews() {
    this.reviews = this.reviewService.getReviewsByProduct(this.productId);
    this.totalReviews = this.reviews.length;
    this.averageRating = this.reviewService.getAverageRating(this.productId);
    this.ratingDistribution = this.reviewService.getRatingDistribution(this.productId);
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort() {
    // Filtrar por rating
    this.filteredReviews = this.filterRating > 0
      ? this.reviews.filter(r => r.rating === this.filterRating)
      : [...this.reviews];

    // Ordenar
    switch (this.sortBy) {
      case 'recent':
        this.filteredReviews.sort((a, b) => b.date.getTime() - a.date.getTime());
        break;
      case 'helpful':
        this.filteredReviews.sort((a, b) => b.helpful - a.helpful);
        break;
      case 'highest':
        this.filteredReviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        this.filteredReviews.sort((a, b) => a.rating - b.rating);
        break;
    }
  }

  onFilterChange(rating: number) {
    this.filterRating = rating;
    this.applyFiltersAndSort();
  }

  onSortChange(sort: 'recent' | 'helpful' | 'highest' | 'lowest') {
    this.sortBy = sort;
    this.applyFiltersAndSort();
  }

  markAsHelpful(reviewId: string) {
    this.reviewService.markHelpful(reviewId);
    this.loadReviews();
  }

  getRatingPercentage(rating: number): number {
    if (this.totalReviews === 0) return 0;
    return (this.ratingDistribution[rating] / this.totalReviews) * 100;
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
    return `Hace ${Math.floor(diffDays / 365)} años`;
  }

  getStarArray(count: number): number[] {
    return Array(count).fill(0);
  }
}
