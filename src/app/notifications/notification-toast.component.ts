import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy } from "@angular/core";
import {
  NotificationService,
  NotificationItem,
} from "../services/notification.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-notification-toast",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="toast"
      class="fixed bottom-5 right-5 z-[99999] w-80 bg-white rounded-lg shadow-xl border-l-4 overflow-hidden animate-slide-in"
      style="border-left-color: #654E51;"
    >
      <div class="flex items-start gap-3 p-4">
        <div
          class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style="background-color: #654E51;"
        >
          <svg
            class="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-semibold text-gray-900 truncate">
            {{ toast.title }}
          </h4>
          <p class="text-xs text-gray-500 mt-0.5 line-clamp-2">
            {{ toast.message }}
          </p>
        </div>
        <button
          (click)="dismiss()"
          class="text-gray-400 hover:text-gray-600 shrink-0"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div class="h-1 bg-gray-100">
        <div
          class="h-full toast-progress"
          style="background-color: #654E51;"
        ></div>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes slideIn {
        from {
          transform: translateX(120%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      .animate-slide-in {
        animation: slideIn 0.35s ease-out;
      }
      @keyframes shrink {
        from {
          width: 100%;
        }
        to {
          width: 0%;
        }
      }
      .toast-progress {
        animation: shrink 5s linear forwards;
      }
    `,
  ],
})
export class NotificationToastComponent implements OnInit, OnDestroy {
  toast: NotificationItem | null = null;
  private sub!: Subscription;
  private timer: any;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.sub = this.notificationService.toast$.subscribe((item) => {
      if (item) {
        this.toast = item;
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.dismiss(), 5000); 
      }
    });
  }

  dismiss(): void {
    this.toast = null;
    this.notificationService.dismissToast();
    clearTimeout(this.timer);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    clearTimeout(this.timer);
  }
}
