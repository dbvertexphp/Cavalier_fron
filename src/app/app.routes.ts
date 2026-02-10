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

import { RolesComponent } from './dashboard/roles/roles.component';
import { DepartmentsComponent } from './dashboard/departments/departments.component';
import { DesignationsComponent } from './dashboard/designations/designations.component';

// Naya component jo humne banaya hai use yahan import kiya
import { BranchFormComponent } from './components/branch-form/branch-form.component';

import { BranchDashboardComponent } from './pages/branch-dashboard/branch-dashboard.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { EmployeeAddComponent } from './employee-add/employee-add.component';
import { EmployeeEditComponent } from './employee-edit/employee-edit.component';
import { AttendanceListComponent } from './attendance-list/attendance-list.component';
import { AttendanceAddComponent } from './attendance-add/attendance-add.component';
import { AttendanceEditComponent } from './attendance-edit/attendance-edit.component';
import { ShiftManagementComponent } from './shift-management/shift-management.component';
import { QuotationFormComponent } from './pages/quotation-form/quotation-form.component';
// Sabse upar ye line add karein
import { OrganizationAddComponent } from './pages/organization-add/organization-add.component';
import { PermissionComponent } from './permission/permission.component';
import { ActivityComponent } from './activity/activity.component';
import { EmailComponent } from './logs/email/email.component';
import { SmsComponent } from './logs/sms/sms.component';
//import { StorageWidgetComponent } from './shared/components/storage-widget/storage-widget.component';
import { StorageWidgetComponent } from './shared/components/storage-widget/storage-widget.component';
import { PortSetupComponent } from './pages/port-setup/port-setup.component';
import { CompanyDetailsComponent } from './pages/company-details/company-details.component';
import { RegistrationsComponent } from './pages/registrations/registrations.component';
import { LeadFormComponent } from './pages/lead-form/lead-form.component';
import { InquiryComponent } from './pages/inquiry/inquiry.component';

// Phir routes array mein isko add ka
export const routes: Routes = [

  // 1. AUTH & ROLE SELECTION (Root Pages)
  { 
    path: '', 
    component: LoginComponent, 
    title: 'Welcome to Cavalier | Login' 
  },
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
      path: 'salecrm/qoutation', 
      component: QuotationFormComponent 
      },
      {
         path: 'salescrm/lead', 
      component: LeadFormComponent 
      },
        {
         path: 'salescrm/inquiry', 
      component: InquiryComponent 
      },
      { path: 'organization-add', 
        component: OrganizationAddComponent },
      { path: 'roles', 
        component: RolesComponent 
      },
      { path: 'departments', 
        component: DepartmentsComponent
       },
      { path: 'designations', 
        component: DesignationsComponent

       },
      { path: 'permissions', 
        component: PermissionComponent

       },
      { 
        path: 'storage-utilization', 
        component: StorageWidgetComponent,
        title: 'Storage Utilization | Cavalier' 
      },
      {
        path: 'port-setup', // ✅ Sidebar path se match karta hai
        component: PortSetupComponent   // ✅ Direct component use ho raha hai
      },
      {
        path: 'branch',
        component: BranchComponent,
        title: 'Branch Management'
      },
      {
        path: 'company-details',
        component: CompanyDetailsComponent
      },
      {
        path: 'registrations',
        component: RegistrationsComponent
      },
      { 
        path: 'branch-form', 
        component: BranchFormComponent, // Yahan BranchFormComponent use karein UserForm ki jagah
        title: 'Branch Registration' 
      },
      {
        path: 'hr/employee-master',
        component: UserComponent,
        title: 'Employee Masters'
      },
      {
        path: 'register-user',
        component: UserFormComponent,
        title: 'Register New User'
      },
      
      {
        path: 'profile',
        component: ProfileComponent,
        title: 'Profile'
      },
      {
        path: 'employee/list',
        component: EmployeeListComponent,
        title: 'Employee List'
      },
      {
        path: 'employee/add',
        component: EmployeeAddComponent,
        title: 'Add Employee'
      },
      {
        path: 'employee/edit',
        component: EmployeeEditComponent,
        title: 'Edit Employee'
      },
      {
        path: 'attendance/list',
        component: AttendanceListComponent,
        title: 'Attendance List'
      },
      {
        path: 'attendance/add',
        component: AttendanceAddComponent,
        title: 'Add Attendance'
      },
      {
        path: 'attendance/edit',
        component: AttendanceEditComponent,
        title: 'Edit Attendance'
      },
      {
        path: 'shift/list',
        component: ShiftManagementComponent,
        title: 'Shift List'
      },
      {
        path: 'logs/activity',
        component: ActivityComponent,
        title: 'Activity Logs'
      },
      {
        path: 'logs/email',
        component: EmailComponent,
        title: 'Email Logs'
      },
      {
        path: 'logs/sms',
        component: SmsComponent,
        title: 'SMS Logs'
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