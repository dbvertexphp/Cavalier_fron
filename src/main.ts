import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations'; // 🔥 Realtime Toastr animations ke liye compulsory hai
import { provideToastr } from 'ngx-toastr'; // 🔥 Global Notification setup configuration layer

import { routes } from './app/app.routes';
// import { authInterceptor } from './app/interceptors/auth.interceptor';

import { register as registerSwiperElements } from 'swiper/element/bundle';
import { environment } from './environments/environment';

console.log('Current Environment:', environment.apiUrl);
registerSwiperElements();

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    
    provideHttpClient(
      // withInterceptors([authInterceptor])
    ),

    // 🔥 REALTIME NOTIFICATION TOASTER CONFIGURATION LAYER
    provideAnimations(), // System elements slide/fade transitions active kiya
    provideToastr({
      timeOut: 4500,               // Message display duration (4.5 seconds)
      positionClass: 'toast-top-right', // Screen position logic tracking layout
      preventDuplicates: true,      // Same messages spam blocking protection check
      progressBar: true,           // Premium aesthetic timing bar layout loader
      closeButton: true            // Standard user explicit manually clear cross active
    })
  ]
}).catch(err => console.error(err));