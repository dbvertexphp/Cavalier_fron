import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { register as registerSwiperElements } from 'swiper/element/bundle';
import { environment } from './environments/environment';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, onMessage } from 'firebase/messaging';
import { NotificationService } from './app/services/notification.service';

registerSwiperElements();

// Global single initialization
const firebaseApp = getApps().length ? getApp() : initializeApp(environment.firebase);
const messaging = getMessaging(firebaseApp);

bootstrapApplication(AppComponent, appConfig)
  .then((appRef) => {
    console.log('🎯 Angular application successfully bootstrapped!');

    const notificationService = appRef.injector.get(NotificationService);

    // 🔥 Stream straight into your changeMessage pipeline
    onMessage(messaging, (payload) => {
      console.log('📥 [main.ts Interceptor]: Raw payload caught:', payload);
      if (notificationService) {
        notificationService.changeMessage(payload);
      }
    });
  })
  .catch(err => console.error('❌ Critical bootstrap collapse:', err));