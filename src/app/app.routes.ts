import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { EcommerceComponent } from './pages/dashboard/ecommerce/ecommerce.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FormElementsComponent } from './pages/forms/form-elements/form-elements.component';
import { BasicTablesComponent } from './pages/tables/basic-tables/basic-tables.component';
import { BlankComponent } from './pages/blank/blank.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { LineChartComponent } from './pages/charts/line-chart/line-chart.component';
import { BarChartComponent } from './pages/charts/bar-chart/bar-chart.component';
import { AlertsComponent } from './pages/ui-elements/alerts/alerts.component';
import { AvatarElementComponent } from './pages/ui-elements/avatar-element/avatar-element.component';
import { BadgesComponent } from './pages/ui-elements/badges/badges.component';
import { ButtonsComponent } from './pages/ui-elements/buttons/buttons.component';
import { ImagesComponent } from './pages/ui-elements/images/images.component';
import { VideosComponent } from './pages/ui-elements/videos/videos.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';
import { CalenderComponent } from './pages/calender/calender.component';
import { UserComponent } from './user/user.component';
import { BranchComponent } from './branch/branch.component';
import { UserFormComponent } from './components/user-form/user-form.component'; 
import { BranchDashboardComponent } from './pages/branch-dashboard/branch-dashboard.component';

// Naya component jo humne banaya hai use yahan import kiya
import { RoleSelectionComponent } from './components/role-selection/role-selection.component';
import { BranchFormComponent } from './components/branch-form/branch-form.component';

export const routes: Routes = [

  // 1. AUTH & ROLE SELECTION (Root Pages)
  { 
    path: '', 
    component: LoginComponent, 
    title: 'Welcome to Cavalier | Login' 
  },
  { 
    path: 'select-role', 
    component: RoleSelectionComponent, 
    title: 'Select System Type' 
  },

  // 2. MAIN DASHBOARD LAYOUT (All Sidebar Routes)
  {
    path: 'dashboard',
    component: AppLayoutComponent,
    children: [
      {
        path: '',
        component: EcommerceComponent,
        pathMatch: 'full',
        title: 'Cavalier Logistics Dashboard',
      },
      {
        path: 'branch',
        component: BranchComponent,
        title: 'Branch Management'
      },
      { 
        path: 'branch-form', 
        component: BranchFormComponent, // Yahan BranchFormComponent use karein UserForm ki jagah
        title: 'Branch Registration' 
      },
      {
        path: 'users',
        component: UserComponent,
        title: 'User Management'
      },
      {
        path: 'register-user',
        component: UserFormComponent,
        title: 'Register New User'
      },
      {
        path: 'calendar',
        component: CalenderComponent,
        title: 'Angular Calender'
      },
      {
        path: 'form-elements',
        component: FormElementsComponent,
        title: 'Form Elements'
      },
      {
        path: 'basic-tables',
        component: BasicTablesComponent,
        title: 'Basic Tables'
      },
      {
        path: 'blank',
        component: BlankComponent,
        title: 'Blank Page'
      },
      {
        path: 'invoice',
        component: InvoicesComponent,
        title: 'Invoice Details'
      },
      {
        path: 'line-chart',
        component: LineChartComponent,
        title: 'Line Chart'
      },
      {
        path: 'bar-chart',
        component: BarChartComponent,
        title: 'Bar Chart'
      },
      {
        path: 'alerts',
        component: AlertsComponent,
        title: 'Alerts'
      },
      {
        path: 'avatars',
        component: AvatarElementComponent,
        title: 'Avatars'
      },
      {
        path: 'badge',
        component: BadgesComponent,
        title: 'Badges'
      },
      {
        path: 'buttons',
        component: ButtonsComponent,
        title: 'Buttons'
      },
      {
        path: 'images',
        component: ImagesComponent,
        title: 'Images'
      },
      {
        path: 'videos',
        component: VideosComponent,
        title: 'Videos'
      },
      {
        path: 'profile',
        component: ProfileComponent,
        title: 'Profile'
      },
    ]
  },

  // 3. SEPARATE BRANCH DASHBOARD
  {
    path: 'branchdashboard',
    component: BranchDashboardComponent,
    title: 'Branch Administrator Dashboard'
  },

  // 4. AUTH PAGES (Stand-alone)
  {
    path: 'signin',
    component: SignInComponent,
    title: 'Sign In'
  },
  {
    path: 'signup',
    component: SignUpComponent,
    title: 'Sign Up'
  },

  // 5. ERROR PAGES
  {
    path: '**',
    component: NotFoundComponent,
    title: '404 Not Found'
  },
];