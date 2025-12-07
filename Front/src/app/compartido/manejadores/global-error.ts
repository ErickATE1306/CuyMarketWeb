import { ErrorHandler, Injectable } from '@angular/core';
import { ToastService } from '../servicios/toast.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private toastService: ToastService) {}

  handleError(error: Error): void {
    // Log del error en consola para desarrollo
    console.error('Error capturado por GlobalErrorHandler:', error);

    // Mensajes personalizados según el tipo de error
    let userMessage = 'Ha ocurrido un error inesperado';

    if (error.message.includes('fetch')) {
      userMessage = 'Error de conexión. Verifica tu internet';
    } else if (error.message.includes('timeout')) {
      userMessage = 'La solicitud tardó demasiado. Intenta nuevamente';
    } else if (error.message.includes('404')) {
      userMessage = 'Recurso no encontrado';
    } else if (error.message.includes('401') || error.message.includes('403')) {
      userMessage = 'No tienes permisos para esta acción';
    } else if (error.message.includes('500')) {
      userMessage = 'Error del servidor. Intenta más tarde';
    }

    // Mostrar toast al usuario
    this.toastService.error(userMessage);

    // Aquí podrías enviar el error a un servicio de logging externo
    // como Sentry, LogRocket, etc.
    // this.logErrorToService(error);
  }

  private logErrorToService(error: Error): void {
    // Implementación futura para enviar errores a servicio externo
    // Ejemplo: Sentry.captureException(error);
  }
}
