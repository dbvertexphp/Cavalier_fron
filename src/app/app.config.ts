import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // Http client integration with auth interceptors
    provideHttpClient(withInterceptors([authInterceptor])),

    // Ng2-charts configuration layer
    provideCharts(withDefaultRegisterables()),

    // Realtime Toastr setup animations bundle
    provideAnimations(),
    provideToastr({
      timeOut: 4500,                    
      positionClass: 'toast-top-right', 
      preventDuplicates: true,          
      progressBar: true,                
      closeButton: true,                
      enableHtml: true                  
    })
  ]
};