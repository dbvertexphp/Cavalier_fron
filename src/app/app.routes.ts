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
import { CargoTypeComponent } from './pages/cargo-type/cargo-type.component';
import { CommodityTypeComponent } from './pages/commodity-type/commodity-type.component';
import { PartyRoleComponent } from './pages/party-role/party-role.component';
import { OriginComponent } from './pages/origin/origin.component';
import { PortOfLoadingComponent } from './pages/port-of-loading/port-of-loading.component';
import { PortOfDischargeComponent } from './pages/port-of-discharge/port-of-discharge.component';
import { ListOfUnitComponent } from './pages/list-of-unit/list-of-unit.component';
import { CompanyServiceComponent } from './pages/company-service/company-service.component';
import { HodComponent } from './pages/hod/hod.component';
import { TeamsComponent } from './pages/teams/teams.component';
import { SalaryTableComponent } from './salary-table/salary-table.component';
import { LeaveApplicationComponent } from './leave-application/leave-application.component';
import { EmployeeComponent } from './pages/employee/employee.component';
import { ShipperComponent } from './pages/shipper/shipper.component';
import { ConsigneeComponent } from './pages/consignee/consignee.component';
import { RolePermisionsComponent } from './pages/role-permisions/role-permisions.component';
import { TranportModeComponent } from './pages/tranport-mode/tranport-mode.component';
import { ShipmentTypeComponent } from './pages/shipment-type/shipment-type.component';
import { IncoTermComponent } from './pages/inco-term/inco-term.component';
import { MovementTypeComponent } from './pages/movement-type/movement-type.component';
import { LeadOwnerComponent } from './pages/lead-owner/lead-owner.component';
import { SalesCoordinatorComponent } from './pages/sales-coordinator/sales-coordinator.component';
import { ReportingManagerComponent } from './pages/reporting-manager/reporting-manager.component';
import { SalesProcessComponent } from './pages/sales-process/sales-process.component';
import { LeadSourceComponent } from './lead-source/lead-source.component';
import { SalesStageComponent } from './sales-stage/sales-stage.component';
import { PriceComponent } from './pages/price/price.component';
import { authGuard } from './auth.guard';
import { loginGuard } from './guards/login.guard';

export const routes: Routes = [

  // 1. AUTH & ROLE SELECTION (Root Pages)
  {
    path: '',
    component: LoginComponent,
    canActivate: [loginGuard],
    title: 'Welcome to Cavalier | Login'
  },
  {
    path: 'dashboard',
    component: AppLayoutComponent,
canActivate: [authGuard],
    children: [
      {
        path: '',
        component: EcommerceComponent,
        canActivate: [authGuard],
        pathMatch: 'full',
        title: 'Cavalier Logistics Dashboard',
      },
      {
        path: 'salecrm/qoutation',
        component: QuotationFormComponent,
        canActivate: [authGuard],
      },
      {
        path: 'salescrm/lead',
        component: LeadFormComponent,
        canActivate: [authGuard],
      },
      {
        path: 'salescrm/inquiry',
        component: InquiryComponent,
        canActivate: [authGuard],
      },
      {
        path: 'transport-mode',
        component: TranportModeComponent,
        canActivate: [authGuard],
      },
      {
        path: 'shipment-type',
        component: ShipmentTypeComponent,
        canActivate: [authGuard],
      },
        {
          path: 'incoterms',
          component: IncoTermComponent,
          canActivate: [authGuard],
        },
        {
          path: 'movement-type',
          component: MovementTypeComponent,
          canActivate: [authGuard],
        },
        {
          path: 'lead-owners',
          component: LeadOwnerComponent,
          canActivate: [authGuard],
        },
        {
          path: 'Lead-Source',
          component: LeadSourceComponent,
          canActivate: [authGuard],
        },
        {
          path: 'sales-stage',
          component: SalesStageComponent,
          canActivate: [authGuard],
        },
        {
          path: 'sales-coordinators',
          component: SalesCoordinatorComponent,
          canActivate: [authGuard],
        },
        {
          path: 'reporting-manager',
          component: ReportingManagerComponent,
          canActivate: [authGuard],
        },
      {
        path: 'sale-process',
        component: SalesProcessComponent,
        canActivate: [authGuard],
      },
      {
        path: 'roles',
        component: RolesComponent,
        canActivate: [authGuard],
      },
      {
        path: 'cargotype',
        component: CargoTypeComponent ,
        canActivate: [authGuard],        //cargo type
      },
      {
        path: 'commoditytype',
        component: CommodityTypeComponent,
        canActivate: [authGuard],          //CommodityType
      },
      {
        path: 'partyrole',
        component: PartyRoleComponent,
        canActivate: [authGuard],         //Party role
      },
      {
        path: 'origin',
        component: OriginComponent,
        canActivate: [authGuard],         //Origin
      },
               { path: 'port-of-loading', 
        component: PortOfLoadingComponent ,canActivate: [authGuard],  },      //Port Setup
       { path: 'port-of-discharge', 
        component: PortOfDischargeComponent,canActivate: [authGuard],   }, 
         { path: 'list-of-units',                          //list of unit
        component: ListOfUnitComponent,canActivate: [authGuard],   }, 
            { path: 'Employee',                          //list of unit
        component: EmployeeComponent,canActivate: [authGuard],   }, 
          { path: 'shipper',                          //list of unit
        component:ShipperComponent,canActivate: [authGuard],   }, 
          { path: 'Consignee',                          //list of unit
        component:ConsigneeComponent,canActivate: [authGuard],  }, 
           { path: 'Price',                          //list of unit
        component:PriceComponent,canActivate: [authGuard],   }, 
        
    
      {
        path: 'port-of-loading',
        component: PortOfLoadingComponent,
        canActivate: [authGuard],
      },      //Port Setup
      {
        path: 'port-of-discharge',
        component: PortOfDischargeComponent,
        canActivate: [authGuard],
      },
      {
        path: 'company-service',
        component: CompanyServiceComponent,
        canActivate: [authGuard],
      },
      {
        path: 'hod',
        component: HodComponent,
        canActivate: [authGuard],
  
      },
      {
        path: 'teams',
        component: TeamsComponent,
        canActivate: [authGuard],
    
      },
      {
        path: 'departments',
        component: DepartmentsComponent,
        canActivate: [authGuard],
      },
      {
        path: 'designations',
        component: DesignationsComponent,
        canActivate: [authGuard],

      },
      {
        path: 'permissions',
        component: PermissionComponent,
        canActivate: [authGuard],

      },
      { 
       path: 'salary-table', 
       component: SalaryTableComponent ,
       canActivate: [authGuard],
      },
      { 
      path: 'leave-application', 
      component: LeaveApplicationComponent ,
      canActivate: [authGuard],
      },
      {
        path: 'storage-utilization',
        component: StorageWidgetComponent,
        canActivate: [authGuard],
        title: 'Storage Utilization | Cavalier'
      },
      {
        path: 'port-setup', // ✅ Sidebar path se match karta hai
        component: PortSetupComponent ,
        canActivate: [authGuard],  // ✅ Direct component use ho raha hai
      },
       {
        path: 'organization-add',
        component: OrganizationAddComponent,
        canActivate: [authGuard],
      },
      {
        path: 'branch',
        component: BranchComponent,
        canActivate: [authGuard],
        title: 'Branch Management'
      },
      {
        path: 'company-details',
        component: CompanyDetailsComponent,
        canActivate: [authGuard],
      },
      {
        path: 'registrations',
        component: RegistrationsComponent,
        canActivate: [authGuard],
      },
      {
        path: 'branch-form',
        component: BranchFormComponent,
        canActivate: [authGuard], // Yahan BranchFormComponent use karein UserForm ki jagah
        title: 'Branch Registration'
      },
      {
        path: 'hr/employee-master',
        component: UserComponent,
        canActivate: [authGuard],
        title: 'Employee Masters'
      },
      {
          path: 'rolePermision',
        component: RolePermisionsComponent,
        canActivate: [authGuard],
       
      },
      {
        path: 'register-user',
        component: UserFormComponent,
        canActivate: [authGuard],
        title: 'Register New Employee'
      },

      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [authGuard],
        title: 'Profile'
      },
      {
        path: 'employee/list',
        component: EmployeeListComponent,
        canActivate: [authGuard],
        title: 'Employee List'
      },
      {
        path: 'employee/add',
        component: EmployeeAddComponent,
        canActivate: [authGuard],
        title: 'Add Employee'
      },
      {
        path: 'employee/edit',
        component: EmployeeEditComponent,
        canActivate: [authGuard],
        title: 'Edit Employee'
      },
      {
        path: 'attendance/list',
        component: AttendanceListComponent,
        canActivate: [authGuard],
        title: 'Attendance List'
      },
      {
        path: 'attendance/add',
        component: AttendanceAddComponent,
        canActivate: [authGuard],
        title: 'Add Attendance'
      },
      { 
        path: 'attendance/edit/:id', 
        component: AttendanceEditComponent, 
        canActivate: [authGuard],
        title: 'Edit Attendance' 
      },
      {
        path: 'shift/list',
        component: ShiftManagementComponent,
        canActivate: [authGuard],
        title: 'Shift List'
      },
      {
        path: 'logs/activity',
        component: ActivityComponent,
        canActivate: [authGuard],
        title: 'Activity Logs'
      },
      {
        path: 'logs/email',
        component: EmailComponent,
        canActivate: [authGuard],
        title: 'Email Logs'
      },
      {
        path: 'logs/sms',
        component: SmsComponent,
        canActivate: [authGuard],
        title: 'SMS Logs'
      },

    ]
  },


  // 3. SEPARATE BRANCH DASHBOARD
  {
    path: 'branchdashboard',
    component: BranchDashboardComponent,
    canActivate: [authGuard],
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