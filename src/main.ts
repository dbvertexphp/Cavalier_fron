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

// 👇 Firebase imports foreground notifications handling ke liye
import { initializeApp } from 'firebase/app';
import { getMessaging, onMessage } from 'firebase/messaging';
import { NotificationService } from './app/services/notification.service'; // Ensure strict valid path here

console.log('Current Environment:', environment.apiUrl);
registerSwiperElements();

// 🔥 1. Initialize Firebase App for Foreground Listening context channel
const firebaseApp = initializeApp(environment.firebase);
const messaging = getMessaging(firebaseApp);

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
})
.then((appRef) => {
  // 🔥 2. App successfully bootstrap hone ke baad injector se NotificationService nikalna
  const notificationService = appRef.injector.get(NotificationService);

  // 🔥 3. FOREGROUND MESSAGING LISTENER TRACE HOOK
  onMessage(messaging, (payload) => {
    console.log('🎯 main.ts intercepted raw foreground payload bundle:', payload);
    
    // Aapke notification service ke BehaviorSubject/Subject ka channel stream pass logic
    // Yeh method aapke common pipeline me data push karega jisse header read karega
    if (notificationService && typeof notificationService.changeMessage === 'function') {
      notificationService.changeMessage(payload);
    } else if (notificationService && notificationService.currentMessage) {
      // Alternate custom setup checking parameter wrapper logic logic
      // Agar direct subject access handle hota hai toh data trace trigger
      (notificationService.currentMessage as any).next(payload);
    }
  });
})
.catch(err => console.error(err));