import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // API se check karo ki session zinda hai ya nahi
  return authService.checkSessionStatus().pipe(
    map((isSuccess) => {
      if (isSuccess) {
        // 🔥 Agar session ACTIVE hai, toh LocalStorage se accessType nikalo
        // (Dhyan rakhna ki login ke time tumne isko isi naam se save kiya ho)
        const accessType = localStorage.getItem('accessType'); 
        
        // Condition ke hisaab se route karo
        if (accessType === 'system') {
          router.navigate(['/dashboard/branch']); // System wale ko yahan bhejo
        } else {
          router.navigate(['/dashboard']); // Baaki sabko default yahan bhejo
        }
        
        return false; // Login page ka access block kar do
      } else {
        // Agar session nahi hai, toh aaram se Login page kholne do
        return true; 
      }
    })
  );
};