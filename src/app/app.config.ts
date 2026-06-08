import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

// 🔥 HttpClient aur Interceptor imports
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';

// Chart.js global providers
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

// 🔥 REALTIME TOASTR CONFIGURATION IMPORTS
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // Yahan provideHttpClient ke andar interceptor registered hai
    provideHttpClient(withInterceptors([authInterceptor])),

    // Register Chart.js components globally
    provideCharts(withDefaultRegisterables()),

    // 🔥 REALTIME NOTIFICATION TOASTER CONFIGURATION LAYER
    provideAnimations(), // System elements ke slide/fade transitions ke liye
    provideToastr({
      timeOut: 4500,                    // Message display duration (4.5 seconds)
      positionClass: 'toast-top-right', // Screen position layout
      preventDuplicates: true,          // Same messages spam blocking protection
      progressBar: true,                // Premium aesthetic timing bar layout loader
      closeButton: true,                // Manual clear cross button active
      enableHtml: true                  // HTML layout structures ko parse karne ke liye
    })
  ]
};