import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NotificationService, NotificationItem } from '../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
  imports: [CommonModule]
})
export class NotificationsComponent implements OnInit {
  notifications: NotificationItem[] = [];
  totalCount = 0;
  page = 1;
  pageSize = 20;
  totalPages = 0;
  loading = false;
  errorMessage = '';

  showModal = false;
  selectedNotification: NotificationItem | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(notifs => {
      this.notifications = notifs;
    });

    this.notificationService.totalCount$.subscribe(count => {
      this.totalCount = count;
      this.totalPages = Math.ceil(count / this.pageSize);
    });

    this.notificationService.loading$.subscribe(loading => {
      this.loading = loading;
    });

    this.notificationService.fetchNotifications(this.page, this.pageSize);
    this.notificationService.startPolling(30000); 
  }

  viewNotification(notif: NotificationItem): void {
    this.selectedNotification = notif;
    this.showModal = true;

    if (!notif.isRead) {
      this.notificationService.markAsRead(notif);
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedNotification = null;
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.notificationService.refresh(this.page, this.pageSize);
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.notificationService.refresh(this.page, this.pageSize);
    }
  }

  refresh(): void {
    this.page = 1;
    this.notificationService.refresh(this.page, this.pageSize);
  }

  timeAgo(dateString: string): string {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
}