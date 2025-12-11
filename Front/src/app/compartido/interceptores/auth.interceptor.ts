import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const token = localStorage.getItem('token');

    let authReq = req;

    if (token) {
        authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });

        // Debug: Verificar que se está adjuntando el token
        // console.log('Interceptor: Adjuntando token', token.substring(0, 10) + '...');
    }

    return next(authReq).pipe(
        catchError((error) => {
            if (error.status === 401 || error.status === 403) {
                // Solo redirigir al login si había un token (token expirado)
                // Si no había token, el usuario simplemente no está logueado (caso normal)
                if (token) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    router.navigate(['/auth/login']);
                }
            }
            return throwError(() => error);
        })
    );
};
