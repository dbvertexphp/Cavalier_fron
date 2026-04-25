import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { map } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 🔥 DIRECT API CALL (No local token check logic here)
  return authService.checkSessionStatus().pipe(
    map((isSuccess) => {
      if (isSuccess) {
        return true; // Session active hai, dashboard kholne do
      } else {
        // ❌ Session timeout ya invalid
        alert('Your session is timeout or account deactivated. Please login again.');
        
        // Kachra saaf karo
        localStorage.removeItem('cavalier_token'); 
        localStorage.removeItem('user');
        
        // Seedha Login page pe bhej do (Agar tumhara login page '/' ya '/signin' hai)
        router.navigate(['/']); 
        return false;
      }
    })
  );
};