import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Har request me automatic token bhejna hai toh yahan inject kar sakte hain,
  // lekin abhi hum sirf Error handling (Session expiration) par focus kar rahe hain.
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Agar backend se 401 Unauthorized ya 403 Forbidden aata hai (Session Timeout)
      if (error.status === 401 || error.status === 403) {
        
        // 1. Turant alert dikhao
        alert('Your session has expired or account deactivated. Please login again.');

        // 2. LocalStorage ka sara kachra saaf karo
        localStorage.removeItem('cavalier_token');
        localStorage.removeItem('user');

        // 3. Seedha Bina kisi deri ke Login page par redirect karo
        router.navigate(['/']);
      }

      return throwError(() => error);
    })
  );
};