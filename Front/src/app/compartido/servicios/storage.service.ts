import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  setItem(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getItem(key: string): any {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }

  getUser(): any {
    return this.getItem('user');
  }

  setUser(user: any): void {
    this.setItem('user', user);
  }

  // Alias methods for compatibility
  get(key: string): any {
    return this.getItem(key);
  }

  set(key: string, value: any): void {
    this.setItem(key, value);
  }

  remove(key: string): void {
    this.removeItem(key);
  }

  // Wishlist methods
  getWishlist(): string[] {
    return this.getItem('wishlist') || [];
  }

  addToWishlist(productId: string): void {
    const wishlist = this.getWishlist();
    if (!wishlist.includes(productId)) {
      wishlist.push(productId);
      this.setItem('wishlist', wishlist);
    }
  }

  removeFromWishlist(productId: string): void {
    const wishlist = this.getWishlist();
    const index = wishlist.indexOf(productId);
    if (index > -1) {
      wishlist.splice(index, 1);
      this.setItem('wishlist', wishlist);
    }
  }

  isInWishlist(productId: string): boolean {
    return this.getWishlist().includes(productId);
  }

  // Search history
  addToSearchHistory(term: string): void {
    const history = this.getItem('searchHistory') || [];
    if (!history.includes(term)) {
      history.unshift(term);
      if (history.length > 10) history.pop();
      this.setItem('searchHistory', history);
    }
  }
}
