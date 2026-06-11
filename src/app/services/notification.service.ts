import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private messaging: any;
  
  // 🔥 CORE STREAM: Is pipeline se hi AppHeaderComponent ko live message runtime shift hoga
  public currentMessage = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {}

  // Trigger proxy method main.ts compilation fix validation mapping layer ke liye
  changeMessage(payload: any) {
    this.currentMessage.next(payload);
  }

  async init(): Promise<string | null> {
    try {
      console.log("🛠️ [FCM INIT]: Starting Firebase initialization...");
      const app = getApps().length ? getApp() : initializeApp(environment.firebase);
      this.messaging = getMessaging(app);

      console.log("🛠️ [FCM INIT]: Requesting browser notification permission...");
      const permission = await Notification.requestPermission();
      console.log("🛠️ [FCM INIT]: Permission status is:", permission);

      if (permission !== 'granted') {
        console.warn('⚠️ [FCM INIT]: Notification permission denied by user.');
        return null;
      }

      console.log("🛠️ [FCM INIT]: Checking Service Worker readiness state...");
      let registration = await navigator.serviceWorker.getRegistration();
      
      if (!registration) {
        console.log("🛠️ [FCM INIT]: SW not registered yet, registering now standard path...");
        registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      }

      await navigator.serviceWorker.ready;
      console.log("🛠️ [FCM INIT]: Service Worker is 100% READY:", registration);

      console.log("🛠️ [FCM INIT]: Attempting to fetch Token from Firebase Cloud Messaging...");
      const fcmToken = await getToken(this.messaging, {
        vapidKey: environment.vapidKey,
        serviceWorkerRegistration: registration
      });

      if (fcmToken) {
        console.log('🚀 [FCM INIT] SUCCESS -> TOKEN RETRIEVED:', fcmToken);
        
        this.sendFcmToken(fcmToken).subscribe({
          next: (res) => {
            console.log('💾 [FCM BACKEND]: Token successfully updated in database table layer:', res);
          },
          error: (err) => {
            console.error('❌ [FCM BACKEND]: Token save request rejected by server:', err);
          }
        });
        
        return fcmToken;
      } else {
        console.warn('⚠️ [FCM INIT]: Token generated as empty string or null value.');
        return null;
      }

    } catch (err) {
      console.error('❌ [FCM INIT] CRITICAL EXCEPTION DROPPED:', err);
      return null;
    }
  }

  sendFcmToken(fcmToken: string): Observable<any> {
    const jwtToken = localStorage.getItem('cavalier_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(
      `${environment.apiUrl}/UserFcmToken/save-token`,
      { fcmToken },
      { headers }
    );
  }

  listen() {
    if (!this.messaging) return;
    onMessage(this.messaging, (payload: any) => {
      console.log('📥 Live Foreground Message Intercepted:', payload);
      
      // 🔥 Push data to component stream mapping pipeline channel loop context
      this.changeMessage(payload);

      // Web Native notification window alert overlay fallback hook
      // 🔥 FIX TS4111: Index signature structure handling strictly explicitly parsed here
      const title = payload.notification?.title || (payload.data ? payload.data['title'] : '') || 'Cavalier Update';
      const body = payload.notification?.body || (payload.data ? payload.data['body'] : '') || '';

      new Notification(title, { body, icon: '/favicon.ico' });
    });
  }
}