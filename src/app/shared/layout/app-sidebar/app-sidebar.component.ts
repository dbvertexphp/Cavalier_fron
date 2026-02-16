import { Component, ElementRef, QueryList, ViewChildren, ChangeDetectorRef, OnInit, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';
import { SafeHtmlPipe } from '../../pipe/safe-html.pipe';
import { SidebarWidgetComponent } from './app-sidebar-widget.component';
import { combineLatest, Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
//import { StorageWidgetComponent } from '../../components/storage-widget/storage-widget.component';

type NavItem = {
  name: string;
  icon?: string;
  path?: string;
  new?: boolean;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SafeHtmlPipe,
    SidebarWidgetComponent,
    //StorageWidgetComponent
  ],
  templateUrl: './app-sidebar.component.html',
})
export class AppSidebarComponent implements OnInit, OnDestroy {
accessType: string = '';
  loadings: boolean = true;
  navItems: NavItem[] = [];
  othersItems: NavItem[] = [];
  openSubmenu: string | null | number = null;
  subMenuHeights: { [key: string]: number } = {};
  @ViewChildren('subMenu') subMenuRefs!: QueryList<ElementRef>;

  readonly isExpanded$;
  readonly isMobileOpen$;
  readonly isHovered$;

  private subscription: Subscription = new Subscription();

  constructor(
    public sidebarService: SidebarService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {
    this.isExpanded$ = this.sidebarService.isExpanded$;
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
    this.isHovered$ = this.sidebarService.isHovered$;
  }

  ngOnInit() {
    this.accessType = localStorage.getItem('accessType') || '';
    this.loadNavItemsFromApi();
    this.cdr.detectChanges();

    this.subscription.add(
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.setActiveMenuFromRoute(this.router.url);
        }
      })
    );

    this.subscription.add(
      combineLatest([this.isExpanded$, this.isMobileOpen$, this.isHovered$]).subscribe(() => {
          this.cdr.detectChanges();
      })
    );

    this.setActiveMenuFromRoute(this.router.url);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  /** API call to fetch permissions and build navItems */
  private loadNavItemsFromApi() {
    const token = localStorage.getItem('cavalier_token') || '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.get<any>(`${environment.apiUrl}/Permissions/get`, { headers }).subscribe(
  res => {
    if (res.permissions) {
      this.navItems = this.buildNav(res.permissions);
      this.cdr.detectChanges();
    }
    this.loadings = false; // ✅ sidebar ready
  },
  err => {
    console.error('Failed to load sidebar permissions', err);
    this.loadings = false;
  }
);

  }
  goToAccessController() {

  const accessType = 'system';

  const token = localStorage.getItem('cavalier_token') || '';

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  this.http.post<any>(
    `${environment.apiUrl}/Auth/set-access-type`,
    { accessType },
    { headers }
  ).subscribe({

    next: (res) => {

      // ✅ Save new token + access type
      localStorage.setItem('cavalier_token', res.token);
      localStorage.setItem('accessType', res.accessType);

      // 🔥 IMPORTANT: reload sidebar permissions
      this.loadings = true;
      this.cdr.detectChanges();
      this.loadNavItemsFromApi();
      

    },

    error: (err) => {
      console.error('Access switch failed', err);
      alert('Something went wrong!');
    }

  });
}
goToDirectory(){
  alert('fdfdf');
}

  /** Build nested navItems from permissions */
  private buildNav(permissions: any[]): NavItem[] {
    const navMap: { [key: string]: NavItem } = {};

    permissions.forEach(p => {
      if (!p.subMenu) {
        // Top-level menu without subMenu
        if (p.route === '#' || p.route === '') {
          navMap[p.menu] = {
            name: p.menu,
            icon: p.icon || undefined,
            subItems: []
          };
        } else {
          navMap[p.menu] = {
            name: p.menu,
            icon: p.icon || undefined,
            path: p.route
          };
        }
      } else {
    
        if (!navMap[p.menu]) {
          navMap[p.menu] = {
            name: p.menu,
            icon: p.icon || undefined,
            subItems: []
          };
        }  
        navMap[p.menu].subItems!.push({
          name: p.subMenu,
          path: p.route,
          new: false
        });
      }
    });
        

    // Convert map to array
    const finalNav = Object.values(navMap);
// ✅ Added Cargo Type
// ✅ Access Type Check: Sirf 'system' hone par hi push hoga
    const accessType = localStorage.getItem('accessType'); 

    if (accessType === 'system') {
      // 1. Adding Cargo Type
      finalNav.push({
        name: 'Cargo Type',
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>`,
        path: '/dashboard/cargotype'
      });

      // 2. Adding Commodity Type
      finalNav.push({
        name: 'Commodity Type',
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>`,
        path: '/dashboard/commoditytype'
      });
        finalNav.push({
        name: 'Party Role',
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
        path: '/dashboard/partyrole'
      });
          finalNav.push({
        name: 'Origin',
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
  <circle cx="12" cy="10" r="3"></circle>
</svg>`,
        path: '/dashboard/origin'
      });
       finalNav.push({
        name: 'Port of Loading',
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 22V8"></path>
  <path d="M5 12H2a10 10 0 0 0 20 0h-3"></path>
  <circle cx="12" cy="5" r="3"></circle>
</svg>`,
        path: '/dashboard/port-of-loading'
      });
             finalNav.push({
        name: 'Port of Discharge',
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M2 17h20l-2 4H4l-2-4z"></path>
  <path d="M6 17V9"></path>
  <path d="M10 17V9"></path>
  <path d="M18 13l-3 3-3-3"></path>
  <path d="M15 4v12"></path>
</svg>`,
        path: '/dashboard/port-of-discharge'
      });
 
             finalNav.push({
        name: 'List Of Units',
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 6H20M4 6C2.89543 6 2 6.89543 2 8V9C2 10.1046 2.89543 11 4 11H20C21.1046 11 22 10.1046 22 9V8C22 6.89543 21.1046 6 20 6M4 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  
  <path d="M4 13H20M4 13C2.89543 13 2 13.8954 2 15V16C2 17.1046 2.89543 18 4 18H20C21.1046 18 22 17.1046 22 16V15C22 13.8954 21.1046 13 20 13M4 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  
  <circle cx="7" cy="8.5" r="1" fill="currentColor"/>
  <circle cx="7" cy="15.5" r="1" fill="currentColor"/>
</svg>`,
        path: '/dashboard/list-of-units'
      });

    }
    
    // ✅ Manually adding Storage Utilization at the end (Normal Link, No Dropdown)
    // finalNav.push({
    //   name: 'Storage Utilization',
    //   icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
    //   path: '/dashboard/storage-utilization'
    // });
    // buildNav function ke andar
    // finalNav.push({
    // name: 'Port Setup',
    // icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>`,
    // path: '/dashboard/port-setup'
    // });
    // finalNav.push({
    //    name: 'Company Details',
    //     icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M3 7v1a3 3 0 006 0V5a2 2 0 012-2h2a2 2 0 012 2v2a3 3 0 006 0V7a2 2 0 00-2-2H5a2 2 0 00-2 2zM17 21V11M7 21V11M12 21V16"></path></svg>`,
    //   path: '/dashboard/company-details'
    // });
    // finalNav.push({
    //   name: 'Registrations',
    //   icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    //   path: '/dashboard/registrations'
    // });
    return finalNav;
  }

  /** Check if any child is active */
  isAnyChildActive(nav: NavItem): boolean {
    if (!nav.subItems) return false;
    return nav.subItems.some(sub => this.router.url === sub.path);
  }

  /** Toggle submenu open/close */
  toggleSubmenu(section: string, index: number) {
    const key = `${section}-${index}`;
    if (this.openSubmenu === key) {
      this.openSubmenu = null;
      this.subMenuHeights[key] = 0;
    } else {
      this.openSubmenu = key;
      setTimeout(() => {
        const el = document.getElementById(key);
        if (el) {
          this.subMenuHeights[key] = el.scrollHeight;
          this.cdr.detectChanges(); 
        }
      });
    }
  }

  /** Sidebar hover behavior */
  onSidebarMouseEnter() {
    this.subscription.add(
      this.isExpanded$.subscribe(expanded => {
        if (!expanded) {
          this.sidebarService.setHovered(true);
        }
      })
    );
  }

  /** Set active menu based on current route */
  private setActiveMenuFromRoute(currentUrl: string) {
    const menuGroups = [{ items: this.navItems, prefix: 'main' }];
    menuGroups.forEach(group => {
      group.items.forEach((nav, i) => {
        if (nav.subItems) {
          nav.subItems.forEach(subItem => {
            if (currentUrl === subItem.path) {
              const key = `${group.prefix}-${i}`;
              this.openSubmenu = key;
              setTimeout(() => {
                const el = document.getElementById(key);
                if (el) {
                  this.subMenuHeights[key] = el.scrollHeight;
                  this.cdr.detectChanges();
                }
              });
            }
          });
        }
      });
    });
  }

  /** Close mobile sidebar on submenu click */
  onSubmenuClick() {
    this.subscription.add(
      this.isMobileOpen$.subscribe(isMobile => {
        if (isMobile) {
          this.sidebarService.setMobileOpen(false);
        }
      })
    );
  }   
}
