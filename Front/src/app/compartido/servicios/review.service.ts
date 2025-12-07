import { Injectable } from '@angular/core';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  date: Date;
  verified: boolean;
  helpful: number;
  images?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private reviews: Review[] = [];

  getReviewsByProduct(productId: string): Review[] {
    return this.reviews.filter(r => r.productId === productId);
  }

  getAverageRating(productId: string): number {
    const productReviews = this.getReviewsByProduct(productId);
    if (productReviews.length === 0) return 0;
    const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / productReviews.length;
  }

  getRatingDistribution(productId: string): { [key: number]: number } {
    const productReviews = this.getReviewsByProduct(productId);
    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    productReviews.forEach(r => {
      distribution[r.rating]++;
    });
    return distribution;
  }

  addReview(review: Omit<Review, 'id' | 'date' | 'helpful'>): void {
    const newReview: Review = {
      ...review,
      id: Date.now().toString(),
      date: new Date(),
      helpful: 0
    };
    this.reviews.push(newReview);
  }

  canUserReview(productId: string, userId: string): boolean {
    return !this.reviews.some(r => r.productId === productId && r.userId === userId);
  }

  hasUserPurchased(productId: string, userId: string): boolean {
    // Implementar lógica real
    return true;
  }

  markHelpful(reviewId: string): void {
    const review = this.reviews.find(r => r.id === reviewId);
    if (review) {
      review.helpful++;
    }
  }
}
