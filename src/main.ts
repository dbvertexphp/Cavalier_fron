import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config'; // 🔥 Saare clean providers yahan se aayenge
import { register as registerSwiperElements } from 'swiper/element/bundle';
import { environment } from './environments/environment';

// 👇 Firebase SDK Core imports
import { initializeApp } from 'firebase/app';
import { getMessaging, onMessage } from 'firebase/messaging';
import { NotificationService } from './app/services/notification.service';

console.log('🚀 Current Environment API URL:', environment.apiUrl);

// Swiper Elements ko register kiya
registerSwiperElements();

// 🔥 1. Initialize Firebase App globally for Foreground Tracking
const firebaseApp = initializeApp(environment.firebase);
const messaging = getMessaging(firebaseApp);

// 🔥 2. Application Bootstrap loop using central appConfig
bootstrapApplication(AppComponent, appConfig)
  .then((appRef) => {
    console.log('🎯 Angular application successfully bootstrapped!');

    // 🔥 3. App injector se NotificationService instance ko pull kiya
    const notificationService = appRef.injector.get(NotificationService);

    // 🔥 4. FOREGROUND LIVE MESSAGING INTERCEPTOR HOOK
    onMessage(messaging, (payload) => {
      console.log('🎯 [main.ts] Intercepted raw foreground payload bundle:', payload);
      
      // Data stream channel pipeline ko push trigger pass kiya
      if (notificationService && typeof notificationService.changeMessage === 'function') {
        notificationService.changeMessage(payload);
      } else if (notificationService && notificationService.currentMessage) {
        // Fallback backup if direct subject mapping hook execution is targeted
        (notificationService.currentMessage as any).next(payload);
      }
    });
  })
  .catch(err => console.error('❌ Critical bootstrap configuration collapse:', err));