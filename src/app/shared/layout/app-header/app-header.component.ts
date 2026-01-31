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

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ThemeToggleButtonComponent,
    NotificationDropdownComponent,
    UserDropdownComponent,
  ],
  templateUrl: './app-header.component.html',
})
export class AppHeaderComponent implements OnInit, OnDestroy {

  isApplicationMenuOpen = false;
  isFullScreen = false;

  readonly isMobileOpen$;

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(public sidebarService: SidebarService) {
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
  }

  // 🔥 FULLSCREEN STATE SYNC
  private fullScreenHandler = () => {
    const active = !!document.fullscreenElement;
    this.isFullScreen = active;
    localStorage.setItem('isFullScreen', String(active));
  };

  ngOnInit() {
    // icon state restore
    // this.isFullScreen = localStorage.getItem('isFullScreen') === 'true';

    // document.addEventListener('fullscreenchange', this.fullScreenHandler);
    // document.addEventListener('keydown', this.handleKeyDown);
  }

  ngOnDestroy() {
    document.removeEventListener('fullscreenchange', this.fullScreenHandler);
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  // ================= Sidebar =================
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

  // ================= Search Shortcut =================
  handleKeyDown = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.searchInput?.nativeElement.focus();
    }
  };

  // ================= FULLSCREEN =================
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
