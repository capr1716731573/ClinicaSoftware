import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';

export const TokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  const token = localStorage.getItem('_token');

  const reqWithToken = token
    ? req.clone({
        setHeaders: {
          token: token
        }
      })
    : req;

  return next(reqWithToken).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el token está caducado o es inválido (401)
      if (error.status === 401) {
        // Limpia el token si es necesario
        localStorage.removeItem('_token');

        // Redirige al login
        router.navigate(['/login']);
      }

      // Propaga el error
      return throwError(() => error);
    })
  );
};

/*import { HttpInterceptorFn } from '@angular/common/http';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export const TokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const token = localStorage.getItem('_token');

  const reqWithToken = token
    ? req.clone({
        setHeaders: {
          token: token
        }
      })
    : req;

  return next(reqWithToken);
};*/
