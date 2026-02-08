import { Component, ElementRef, QueryList, ViewChildren, ChangeDetectorRef, OnInit, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';
import { SafeHtmlPipe } from '../../pipe/safe-html.pipe';
import { SidebarWidgetComponent } from './app-sidebar-widget.component';
import { combineLatest, Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

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
    SidebarWidgetComponent
  ],
  templateUrl: './app-sidebar.component.html',
})
export class AppSidebarComponent implements OnInit, OnDestroy {

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
    this.loadNavItemsFromApi();

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
    }
    this.loadings = false; // ✅ sidebar ready
  },
  err => {
    console.error('Failed to load sidebar permissions', err);
    this.loadings = false;
  }
);

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
        // Menu with subMenu
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

    return Object.values(navMap);
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
