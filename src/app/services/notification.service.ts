import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private messaging: any;

  constructor(private http: HttpClient) {}

  async init(): Promise<string | null> {
    try {
      const app = getApps().length ? getApp() : initializeApp(environment.firebase);
      this.messaging = getMessaging(app);

      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return null;
      }

      const registration = await navigator.serviceWorker.ready;

      const fcmToken = await getToken(this.messaging, {
        vapidKey: environment.vapidKey,
        serviceWorkerRegistration: registration
      });

      console.log('FCM TOKEN:', fcmToken);
      return fcmToken;
    } catch (err) {
      console.error('FCM error:', err);
      return null;
    }
  }

  sendFcmToken(fcmToken: string): Observable<any> {
    const jwtToken = localStorage.getItem('cavalier_token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${jwtToken}`
    });

    return this.http.post(
      `${environment.apiUrl}/UserFcmToken/save-token`,
      { fcmToken },
      { headers }
    );
  }

  listen() {
    if (!this.messaging) return;

    onMessage(this.messaging, (payload) => {
      console.log('Foreground message:', payload);

      const title = payload.notification?.title || 'Notification';
      const body = payload.notification?.body || '';

      new Notification(title, {
        body,
        icon: '/favicon.ico'
      });
    });
  }
}