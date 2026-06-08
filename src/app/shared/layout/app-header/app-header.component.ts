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
  
  // 🔥 Live communication memory snapshot trace stream mapping
  private fcmSubscription!: Subscription;

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(
    public sidebarService: SidebarService,
    private notificationService: NotificationService,
    private toastr: ToastrService // 👈 Service injected properly
  ) {
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
  }

  // 🔥 FULLSCREEN STATE SYNC
  private fullScreenHandler = () => {
    const active = !!document.fullscreenElement;
    this.isFullScreen = active;
    localStorage.setItem('isFullScreen', String(active));
  };

  // ================= Search Shortcut Key Handler =================
  private handleKeyDown = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.searchInput?.nativeElement.focus();
    }
  };

  ngOnInit() {
    // Icon state restore handling tracking sequence
    this.isFullScreen = localStorage.getItem('isFullScreen') === 'true';
    document.addEventListener('fullscreenchange', this.fullScreenHandler);
    document.addEventListener('keydown', this.handleKeyDown);

    // 🔥 REALTIME TOASTER STREAM TRIGGER: Shared notification pipeline channel context hook
    this.fcmSubscription = this.notificationService.currentMessage.subscribe((msg) => {
      if (msg && msg.notification) {
        console.log("🎯 Header intercepted foreground payload banner request:", msg);
        
        const title = msg.notification.title || 'Cavalier Update Link';
        const body = msg.notification.body || '';

        // 🔥 Dynamic custom parameters runtime overrides (Aapne jo config di thi)
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

  ngOnDestroy() {
    // Remove listeners to avoid memory leaks
    document.removeEventListener('fullscreenchange', this.fullScreenHandler);
    document.removeEventListener('keydown', this.handleKeyDown);
    
    // 🔒 Memory Leak Safeguard context loop stream flush
    if (this.fcmSubscription) {
      this.fcmSubscription.unsubscribe();
    }
  }

  // ================= Sidebar Control =================
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

  // ================= FULLSCREEN ACTIONS =================
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
      elem.requestFullscreen().catch(err =>
        console.log('Fullscreen error:', err)
      );
    }
  }

  exitFullScreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err =>
        console.log('Exit fullscreen error:', err)
      );
    }
  }
}