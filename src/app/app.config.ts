import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

// 🔥 1. 'withInterceptors' ko import me add karo
import { provideHttpClient, withInterceptors } from '@angular/common/http';

// 1. Import the Chart providers
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { routes } from './app.routes';

// 🔥 2. Apne authInterceptor ko import karo 
// (Dhyan rakhna: Apne folder ka path sahi daalna jahan tumne interceptor banaya hai)
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // 🔥 3. Yahan provideHttpClient ke andar interceptor register karo
    provideHttpClient(withInterceptors([authInterceptor])),

    // 2. Add this line to register Chart.js components globally
    provideCharts(withDefaultRegisterables())
  ]
};