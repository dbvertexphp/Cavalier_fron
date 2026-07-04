import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { NotificationService, NotificationItem } from '../../../../services/notification.service';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  templateUrl: './notification-dropdown.component.html',
  imports: [CommonModule, RouterModule, DropdownComponent]
})
export class NotificationDropdownComponent implements OnInit {
  isOpen = false;
  notifying = false;
  notifications: NotificationItem[] = [];
  loading = false;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationService.notifications$.subscribe(notifs => {
      this.notifications = notifs;
      this.notifying = notifs.some(n => !n.isRead);
    });

    this.notificationService.loading$.subscribe(loading => {
      this.loading = loading;
    });

    this.notificationService.fetchNotifications(1, 5);
    this.notificationService.startPolling(30000); 
  }

  openNotification(notif: NotificationItem) {
    this.notificationService.markAsRead(notif);
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
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