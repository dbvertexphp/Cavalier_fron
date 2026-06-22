import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy
} from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeToggleButtonComponent } from '../../components/common/theme-toggle/theme-toggle-button.component';
import { NotificationDropdownComponent } from '../../components/header/notification-dropdown/notification-dropdown.component';
import { UserDropdownComponent } from '../../components/header/user-dropdown/user-dropdown.component';
import { NotificationService } from '../../../services/notification.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NotificationDropdownComponent,
    UserDropdownComponent,
    ThemeToggleButtonComponent 
  ],
  templateUrl: './app-header.component.html',
})
export class AppHeaderComponent implements OnInit, OnDestroy {

  isApplicationMenuOpen = false;
  isFullScreen = false;
  readonly isMobileOpen$;
  
  private fcmSubscription!: Subscription;

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(
    public sidebarService: SidebarService,
    private notificationService: NotificationService,
    private toastr: ToastrService
  ) {
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
  }

  private fullScreenHandler = () => {
    const active = !!document.fullscreenElement;
    this.isFullScreen = active;
    localStorage.setItem('isFullScreen', String(active));
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.searchInput?.nativeElement.focus();
    }
  };

  ngOnInit() {
    this.isFullScreen = localStorage.getItem('isFullScreen') === 'true';
    document.addEventListener('fullscreenchange', this.fullScreenHandler);
    document.addEventListener('keydown', this.handleKeyDown);

    this.initializeNotificationSystem();

    // 🔥 100% UNIFIED REALTIME PIPELINE SUBSCRIPTION
    this.fcmSubscription = this.notificationService.currentMessage.subscribe((msg) => {
      if (msg) {
        console.log("📥 [HEADER TRIGGERED SUCCESS]: Event caught inside header subscription pipeline:", msg);
        console.log("🎉 Toaster Pipeline Triggered with data:", msg);
        console.log("🎯 Header intercepted foreground payload banner request:", msg);
        
        // 🔔 1. Play Ringtone Sound Safely
        this.playNotificationSound();

        // 2. Payload extraction safely fallback mapping parameters
        const title = msg.data?.title || msg.notification?.title || 'Cavalier Update';
        const body = msg.data?.body || msg.notification?.body || '';

        // 3. Toastr invocation trigger
        this.toastr.info(body, title, {
          timeOut: 4500,
          progressBar: true,
          positionClass: 'toast-top-right',
          closeButton: true,
          enableHtml: true
        });
      }
    });
  }

  // 🔥 Helper method to trigger the audio alert ringtone from public directory root location
  private playNotificationSound() {
    try {
      const audio = new Audio('/notification.mp3');
      audio.load();
      audio.play().catch(error => {
        console.warn('⚠️ Audio play blocked by browser autoplay policy constraints:', error);
      });
    } catch (err) {
      console.error('❌ Failed to instantiate audio asset stream driver context:', err);
    }
  }

  async initializeNotificationSystem() {
    const token = await this.notificationService.init();
    if (token) {
      console.log('✅ [FCM COMPONENT]: Token captured, activating foreground tracking loops...');
      this.notificationService.listen();
    } else {
      console.warn('⚠️ [FCM COMPONENT]: System init returned null token. Verification rejected.');
    }
  }

  ngOnDestroy() {
    document.removeEventListener('fullscreenchange', this.fullScreenHandler);
    document.removeEventListener('keydown', this.handleKeyDown);
    
    if (this.fcmSubscription) {
      this.fcmSubscription.unsubscribe();
    }
  }

  handleToggle() {
    if (window.innerWidth >= 1280) {
      this.sidebarService.toggleExpanded();
    } else {
      this.sidebarService.toggleMobileOpen();
    }
  }

  toggleApplicationMenu() {
    this.isApplicationMenuOpen = !this.isApplicationMenuOpen;
  }

  toggleFullScreen() {
    if (!document.fullscreenElement) {
      this.enterFullScreen();
    } else {
      this.exitFullScreen();
    }
  }

  enterFullScreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => console.log('Fullscreen error:', err));
    }
  }

  exitFullScreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.log('Exit fullscreen error:', err));
    }
  }
}