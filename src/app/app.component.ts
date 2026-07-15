import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, Event, RouterOutlet } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div *ngIf="isRouteLoading" class="fixed inset-0 z-[999999] flex flex-col items-center justify-center backdrop-blur-[4px]">
      
      <div class="absolute top-0 left-0 right-0 h-[6px] bg-gray-950 overflow-hidden shadow-[0_3px_20px_rgba(239,68,68,0.45)]">
        <div class="h-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 dynamic-progress-bar"></div>
      </div>

      <div class="flex flex-col items-center gap-5 p-8 bg-gray-900/90 border border-gray-800/80 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] backdrop-blur-md max-w-xs w-full mx-4 animate-[fadeInUp_0.4s_ease-out]">
        
        <div class="relative w-14 h-14 flex items-center justify-center">
          <div class="absolute inset-0 border-4 border-t-red-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <div class="absolute w-10 h-10 border-4 border-b-yellow-500 border-t-transparent border-r-transparent border-l-transparent rounded-full animate-[spin_1s_linear_infinite_reverse]"></div>
          <div class="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse"></div>
        </div>

        <div class="flex flex-col items-center gap-1.5 text-center">
          <span class="text-[13px] font-black text-gray-100 uppercase tracking-[0.25em] animate-pulse">
            Cavalier Logistics Page Loading...
          </span>
          <span class="text-[10px] font-bold text-red-500 uppercase tracking-[0.15em] opacity-80">
            Securing Connection...
          </span>
        </div>

      </div>

      <div class="absolute bottom-6 right-6 bg-gray-900 border border-gray-800 px-4 py-2 rounded-lg shadow-2xl hidden md:flex items-center gap-2.5">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-[ping_1.4s_infinite]"></span>
        <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Engine Active</span>
      </div>

    </div>

    <router-outlet></router-outlet>
  `,
  styles: [`
    .dynamic-progress-bar {
      width: 100%;
      background-size: 200% 100%;
      animation: ultraGlowShift 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }

    @keyframes ultraGlowShift {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(15px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class AppComponent implements OnInit {
  isRouteLoading: boolean = false;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // 1. INITIAL BOOT SCREEN TIMELINE MANAGEMENT
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        const splash = document.getElementById('cavalier-splash');
        const appRoot = document.querySelector('app-root');

        if (splash) {
          splash.classList.add('fade-out');
          if (appRoot) {
            appRoot.classList.add('show-app');
          }
          setTimeout(() => {
            splash.remove();
          }, 800);
        }
      }, 2800); 
    }

    // 2. INTERNAL ROUTE SWITCH PROGRESS HANDLING
    this.router.events.subscribe((routerEvent: Event) => {
      if (routerEvent instanceof NavigationStart) {
        this.isRouteLoading = true;
      }
      if (
        routerEvent instanceof NavigationEnd || 
        routerEvent instanceof NavigationCancel || 
        routerEvent instanceof NavigationError
      ) {
        setTimeout(() => {
          this.isRouteLoading = false;
        }, 500); // 500ms stable display window
      }
    });
  }
}