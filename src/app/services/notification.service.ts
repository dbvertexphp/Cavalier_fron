import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject, interval, Subscription } from 'rxjs';

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  branchId: number | null;
  createdAt: string;
  isRead: boolean;
}

export interface NotificationResponse {
  success: boolean;
  userId: number;
  totalCount: number;
  page: number;
  pageSize: number;
  notifications: NotificationItem[];
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private messaging: any;
  public currentMessage = new BehaviorSubject<any>(null);

  private notificationsSubject = new BehaviorSubject<NotificationItem[]>([]);
  notifications$: Observable<NotificationItem[]> = this.notificationsSubject.asObservable();

  private totalCountSubject = new BehaviorSubject<number>(0);
  totalCount$: Observable<number> = this.totalCountSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  private hasFetchedOnce = false;
  private pollingSub: Subscription | null = null;

  constructor(private http: HttpClient) {}

  changeMessage(payload: any) {
    this.currentMessage.next(payload);
  }

  async init(): Promise<string | null> {
    try {
      const app = getApps().length ? getApp() : initializeApp(environment.firebase);
      this.messaging = getMessaging(app);

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('⚠️ [FCM INIT]: Notification permission denied by user.');
        return null;
      }

      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      }
      await navigator.serviceWorker.ready;

      const fcmToken = await getToken(this.messaging, {
        vapidKey: environment.vapidKey,
        serviceWorkerRegistration: registration
      });

      if (fcmToken) {
        this.sendFcmToken(fcmToken).subscribe({
          next: (res) => console.log('💾 [FCM BACKEND]: Token saved:', res),
          error: (err) => console.error('❌ [FCM BACKEND]: Token save failed:', err)
        });

        // 🔥 Token milte hi notification fetch shuru karo aur polling bhi start kardo
        this.fetchNotifications(1, 5, true);
        this.startPolling();

        return fcmToken;
      }
      return null;
    } catch (err) {
      console.error('❌ [FCM INIT] CRITICAL EXCEPTION:', err);
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
      this.changeMessage(payload);

      const title = payload.notification?.title || (payload.data ? payload.data['title'] : '') || 'Cavalier Update';
      const body = payload.notification?.body || (payload.data ? payload.data['body'] : '') || '';

      new Notification(title, { body, icon: '/favicon.ico' });

      // 🔥 Naya push aate hi list turant refresh
      this.fetchNotifications(1, 5, true);
    });
  }

  private getAuthHeaders(): HttpHeaders | null {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('cavalier_token')
      : null;

    if (!token) return null;
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  fetchNotifications(page: number = 1, pageSize: number = 20, force: boolean = false): void {
    const headers = this.getAuthHeaders();
    if (!headers) return;

    const apiUrl = `${environment.apiUrl}/Notification/my-notifications?page=${page}&pageSize=${pageSize}`;

    if (!this.hasFetchedOnce) {
      this.loadingSubject.next(true);
    }

    this.http.get<NotificationResponse>(apiUrl, { headers }).subscribe({
      next: (res) => {
        if (res.success) {
          this.notificationsSubject.next(res.notifications || []);
          this.totalCountSubject.next(res.totalCount);
        }
        this.hasFetchedOnce = true;
        this.loadingSubject.next(false);
      },
      error: (err) => {
        console.error('Notification fetch error:', err);
        this.loadingSubject.next(false);
      }
    });
  }

  // 🔥 NAYA — har 30 second mein automatic background refresh
  startPolling(intervalMs: number = 30000): void {
    if (this.pollingSub) return; // already chal raha hai to dubara start mat karo

    this.pollingSub = interval(intervalMs).subscribe(() => {
      const headers = this.getAuthHeaders();
      if (headers) {
        this.fetchNotifications(1, 20, true);
      }
    });
  }

  stopPolling(): void {
    this.pollingSub?.unsubscribe();
    this.pollingSub = null;
  }

  markAsRead(notif: NotificationItem): void {
    if (notif.isRead) return;

    const headers = this.getAuthHeaders();
    if (!headers) return;

    const apiUrl = `${environment.apiUrl}/Notification/mark-read/${notif.id}`;

    this.http.put<any>(apiUrl, {}, { headers }).subscribe({
      next: () => {
        notif.isRead = true;
        this.notificationsSubject.next([...this.notificationsSubject.value]);
      },
      error: (err) => console.error('Mark as read error:', err)
    });
  }

  markAllAsRead(): void {
    const headers = this.getAuthHeaders();
    if (!headers) return;

    const apiUrl = `${environment.apiUrl}/Notification/mark-all-read`;

    this.http.put<any>(apiUrl, {}, { headers }).subscribe({
      next: () => {
        const updated = this.notificationsSubject.value.map(n => ({ ...n, isRead: true }));
        this.notificationsSubject.next(updated);
      },
      error: (err) => console.error('Mark all as read error:', err)
    });
  }

  getCurrentNotifications(): NotificationItem[] {
    return this.notificationsSubject.value;
  }

  refresh(page: number = 1, pageSize: number = 20): void {
    this.fetchNotifications(page, pageSize, true);
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}