import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

export interface EcommerceData {
  transactionId: string;
  affiliation?: string;
  revenue: number;
  shipping?: number;
  tax?: number;
  items: EcommerceItem[];
}

export interface EcommerceItem {
  id: string;
  name: string;
  category?: string;
  price: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private enabled = true;
  private debugMode = false;

  constructor(private router: Router) {
    this.initPageTracking();
  }

  /**
   * Inicializar tracking automático de páginas
   */
  private initPageTracking() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.pageView(event.urlAfterRedirects);
    });
  }

  /**
   * Track page view
   */
  pageView(path: string, title?: string) {
    if (!this.enabled) return;

    const data = {
      page_path: path,
      page_title: title || document.title,
      timestamp: new Date().toISOString()
    };

    this.send('page_view', data);
    this.log('Page View', data);
  }

  /**
   * Track custom event
   */
  trackEvent(event: AnalyticsEvent) {
    if (!this.enabled) return;

    const data = {
      event_category: event.category,
      event_action: event.action,
      event_label: event.label,
      event_value: event.value,
      timestamp: new Date().toISOString()
    };

    this.send('custom_event', data);
    this.log('Event', data);
  }

  /**
   * Track e-commerce transaction
   */
  trackPurchase(data: EcommerceData) {
    if (!this.enabled) return;

    const purchaseData = {
      transaction_id: data.transactionId,
      affiliation: data.affiliation || 'CuyMarket',
      value: data.revenue,
      shipping: data.shipping || 0,
      tax: data.tax || 0,
      currency: 'PEN',
      items: data.items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        quantity: item.quantity
      })),
      timestamp: new Date().toISOString()
    };

    this.send('purchase', purchaseData);
    this.log('Purchase', purchaseData);

    // Guardar en localStorage para análisis offline
    this.saveTransaction(purchaseData);
  }

  /**
   * Track product view
   */
  trackProductView(productId: string, productName: string, category?: string, price?: number) {
    this.trackEvent({
      category: 'Product',
      action: 'View',
      label: `${productName} (${productId})`,
      value: price
    });
  }

  /**
   * Track add to cart
   */
  trackAddToCart(productId: string, productName: string, price: number, quantity: number) {
    const data = {
      event_category: 'Ecommerce',
      event_action: 'Add to Cart',
      item_id: productId,
      item_name: productName,
      price: price,
      quantity: quantity,
      timestamp: new Date().toISOString()
    };

    this.send('add_to_cart', data);
    this.log('Add to Cart', data);
  }

  /**
   * Track remove from cart
   */
  trackRemoveFromCart(productId: string, productName: string) {
    this.trackEvent({
      category: 'Ecommerce',
      action: 'Remove from Cart',
      label: `${productName} (${productId})`
    });
  }

  /**
   * Track begin checkout
   */
  trackBeginCheckout(cartTotal: number, itemCount: number) {
    const data = {
      event_category: 'Ecommerce',
      event_action: 'Begin Checkout',
      value: cartTotal,
      items: itemCount,
      timestamp: new Date().toISOString()
    };

    this.send('begin_checkout', data);
    this.log('Begin Checkout', data);
  }

  /**
   * Track search
   */
  trackSearch(searchTerm: string, resultsCount?: number) {
    this.trackEvent({
      category: 'Search',
      action: 'Search',
      label: searchTerm,
      value: resultsCount
    });
  }

  /**
   * Track user interaction
   */
  trackInteraction(element: string, action: string, label?: string) {
    this.trackEvent({
      category: 'Interaction',
      action: action,
      label: label || element
    });
  }

  /**
   * Track form submission
   */
  trackFormSubmission(formName: string, success: boolean) {
    this.trackEvent({
      category: 'Form',
      action: success ? 'Submit Success' : 'Submit Error',
      label: formName
    });
  }

  /**
   * Track error
   */
  trackError(errorType: string, errorMessage: string, fatal = false) {
    const data = {
      event_category: 'Error',
      event_action: errorType,
      event_label: errorMessage,
      fatal: fatal,
      timestamp: new Date().toISOString()
    };

    this.send('error', data);
    this.log('Error', data);
  }

  /**
   * Track timing (performance)
   */
  trackTiming(category: string, variable: string, time: number, label?: string) {
    const data = {
      event_category: category,
      event_action: 'Timing',
      event_label: label || variable,
      value: Math.round(time),
      timestamp: new Date().toISOString()
    };

    this.send('timing', data);
    this.log('Timing', data);
  }

  /**
   * Set user properties
   */
  setUser(userId: string, properties?: Record<string, any>) {
    if (!this.enabled) return;

    const userData = {
      user_id: userId,
      ...properties,
      timestamp: new Date().toISOString()
    };

    this.send('set_user', userData);
    this.log('Set User', userData);

    // Guardar en localStorage
    localStorage.setItem('analytics_user', JSON.stringify(userData));
  }

  /**
   * Enviar datos al backend o servicio de analytics
   */
  private send(eventType: string, data: any) {
    // En producción, enviar a Google Analytics, Mixpanel, etc.
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventType, data);
    }

    // También enviar a tu propio backend
    this.sendToBackend(eventType, data);
  }

  /**
   * Enviar a backend propio para análisis
   */
  private async sendToBackend(eventType: string, data: any) {
    try {
      // En producción, descomentar y configurar endpoint
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ eventType, data })
      // });
      
      // Por ahora, solo guardar en localStorage
      this.saveToLocalStorage(eventType, data);
    } catch (error) {
      console.error('Analytics send error:', error);
    }
  }

  /**
   * Guardar evento en localStorage
   */
  private saveToLocalStorage(eventType: string, data: any) {
    try {
      const key = 'analytics_events';
      const events = JSON.parse(localStorage.getItem(key) || '[]');
      events.push({ eventType, data, savedAt: new Date().toISOString() });
      
      // Mantener solo últimos 100 eventos
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem(key, JSON.stringify(events));
    } catch (error) {
      console.error('Error saving analytics to localStorage:', error);
    }
  }

  /**
   * Guardar transacción
   */
  private saveTransaction(data: any) {
    try {
      const key = 'analytics_transactions';
      const transactions = JSON.parse(localStorage.getItem(key) || '[]');
      transactions.push(data);
      
      // Mantener solo últimas 50 transacciones
      if (transactions.length > 50) {
        transactions.splice(0, transactions.length - 50);
      }
      
      localStorage.setItem(key, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  }

  /**
   * Log para debugging
   */
  private log(type: string, data: any) {
    if (this.debugMode) {
      console.log(`[Analytics] ${type}:`, data);
    }
  }

  /**
   * Obtener eventos guardados
   */
  getStoredEvents(): any[] {
    try {
      return JSON.parse(localStorage.getItem('analytics_events') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Obtener transacciones guardadas
   */
  getStoredTransactions(): any[] {
    try {
      return JSON.parse(localStorage.getItem('analytics_transactions') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Limpiar datos almacenados
   */
  clearStoredData() {
    localStorage.removeItem('analytics_events');
    localStorage.removeItem('analytics_transactions');
  }

  /**
   * Habilitar/deshabilitar analytics
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    localStorage.setItem('analytics_enabled', String(enabled));
  }

  /**
   * Habilitar/deshabilitar debug mode
   */
  setDebugMode(debug: boolean) {
    this.debugMode = debug;
  }

  /**
   * Obtener estadísticas de uso
   */
  getStats() {
    const events = this.getStoredEvents();
    const transactions = this.getStoredTransactions();

    return {
      totalEvents: events.length,
      totalTransactions: transactions.length,
      totalRevenue: transactions.reduce((sum, t) => sum + (t.value || 0), 0),
      eventTypes: this.groupBy(events, 'eventType'),
      lastEvent: events[events.length - 1],
      lastTransaction: transactions[transactions.length - 1]
    };
  }

  /**
   * Agrupar por propiedad
   */
  private groupBy(array: any[], key: string) {
    return array.reduce((result, item) => {
      const group = item[key] || 'unknown';
      result[group] = (result[group] || 0) + 1;
      return result;
    }, {});
  }
}
