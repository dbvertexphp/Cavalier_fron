import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { BranchService } from '../../services/branch.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import{environment} from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';




export interface Employee {
  id: string;
  empCode: string;
  userType: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  department: string;
  designation: string;
  hod?: { id: number; name: string };
team?: { id: number; teamName: string };
roleId?: number;
password?: string;
  dob?: string;
  gender?: string;
  branchId?: number;
  mobile?: string;
  telephone?: string;
  functionalArea?: string;
  role?: string;
  branch?: string;
  isActive?: boolean;
  bloodGroup?: string;
  maritalStatus?: string;

  paN_No?: string;
  aadhaarNo?: string;

  // ✅ Profile
  profileImage?: string;

  // ✅ Job & Salary
  joiningDate?: string;
  ctc?: number;
  monthlySalary?: number;

  // ✅ Bank Details
bankDetails?: {
    accountHolderName?: string;
    bankName?: string;
    branchName?: string;
    ifscCode?: string;
    accountType?: string;
    accountNumber?: string;
  };
  // ✅ Address
  correspondenceAddress?: string;
  permanentAddress?: string;

  // ✅ Emergency
  emergencyName?: string;
  emergencyRelationship?: string;
  emergencyContactNo?: string;

  // ✅ Education
  graduationPercentage?: number;
  twelfthPercentage?: number;
  tenthPercentage?: number;
  // Education Fields
  tenthYear?: string;
  tenthDoc?: string;
  twelfthYear?: string;
  twelfthDoc?: string;
  graduationYear?: string;
  graduationDoc?: string;
  pgYear?: string;
  pgPercentage?: string;
  pgDoc?: string;

  // Emergency Contact Fields
  emergencyContactName?: string;
  relation?: string;
  emergencyMobile?: string;
  
  // Index Signature (Gallery error fix karne ke liye)
  [key: string]: any;

  // ✅ Documents
  offerLetter?: string;
  appointmentLetter?: string;
  invitationLetter?: string;
  relievingLetter?: string;
  fAndFLetter?: string;
// Nayi Correspondence Address fields
  c_HouseNo?: string;
  c_BuildingName?: string;
  c_FloorNo?: string;
  c_Block?: string;
  c_Street?: string;
  c_Landmark?: string;
  c_Area?: string;
  c_City?: string;
  c_District?: string;
  c_State?: string;
  c_Pincode?: string;

  // Nayi Permanent Address fields
  p_HouseNo?: string;
  p_BuildingName?: string;
  p_FloorNo?: string;
  p_Block?: string;
  p_Street?: string;
  p_Landmark?: string;
  p_Area?: string;
  p_City?: string;
  p_District?: string;
  p_State?: string;
  p_Pincode?: string;
  // 🔥 ADD THIS (Missing tha)
  educationMarksheets?: string;
userBranches?: {
  id: number;
  userId: number;
  branchId: number;
  branch?: {
    id: number;
    branchName: string;
  };
}[];
  // ✅ Experience
  experiences?: any[];
}
export interface Permission {
  permissionID: number;
  name: string;
  menu: string;
  subMenu?: string | null;
  route: string;
  icon?: string | null;
  access: string;
}
@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css',
})
export class EmployeeComponent implements OnInit {
  permissionsList: Permission[] = [];
selectedPermissionIds: number[] = [];
  searchText: string = '';
  isFormOpen: boolean = false;
  editingEmpId: string | null = null;
  leadForm: FormGroup; 
  selectedBranch: string = '';
  selectedEmployeeEmail = '';
  selectedEmployeePassword = '';
  isAccountActive: boolean = true; 
  permissions = {
    canEdit: false,
    canDelete: false,
    canExport: false,
    isAdmin: false
  }
isPasswordVisible: boolean = false;
  employees: Employee[] = [
  ];

  filteredEmployees: Employee[] = [];
  rolesList: any[] = [];
  branchesList: any[] = []; 

  constructor( private http: HttpClient ,private router:Router, private userService: UserService, private branchServices: BranchService) {
    this.leadForm = new FormGroup({
      empCode: new FormControl(''),
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      email: new FormControl(''),
      userType: new FormControl(''),
      department: new FormControl(''),
      designation: new FormControl(''),
      hod: new FormControl(''),
      team: new FormControl('')
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    this.loadBranches(); 
     this.getAllUsers(); 
     this.loadPermissions();
    this.filteredEmployees = [...this.employees];
    console.log('Initial Employees:', this.filteredEmployees);
  }

  loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (data) => {
        this.rolesList = data; 
      },
      error: (err) => {
        console.error("API fail ho gayi:", err);
      }
    });
  }
togglePermission(id: number): void {
  if (this.selectedPermissionIds.includes(id)) {
    this.selectedPermissionIds =
      this.selectedPermissionIds.filter(pid => pid !== id);
  } else {
    this.selectedPermissionIds.push(id);
  }

  console.log("Selected Permission IDs:", this.selectedPermissionIds);
}
  loadBranches(): void {
    this.branchServices.getBranches().subscribe({
      next: (data) => {
        this.branchesList = data;
        console.log('Branches loaded:', this.branchesList);
      },
      error: (err) => {
        console.error('Branch load karne mein error:', err);
      }
    });
  }

  search(): void {
    const term = this.searchText.toLowerCase().trim();
    if (!term) {
      this.filteredEmployees = [...this.employees];
      return;
    }
    this.filteredEmployees = this.employees.filter(emp => 
      emp.firstName.toLowerCase().includes(term) ||
      emp.lastName.toLowerCase().includes(term) ||
      emp.empCode.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term)
    );
  }

  deleteEmployee(id: string): void {
    if (confirm('Do you want to delete this employee?')) {
      this.employees = this.employees.filter(emp => emp.id !== id);
      this.search(); 
    }
  }

  editEmployee(emp: Employee): void {
    this.router.navigate(['/dashboard/register-user'], { 
      state: { employeeData: emp } 
    });
  }

  openRoleModal(emp: Employee): void {
    const newRole = prompt('Assign Role for ' + emp.firstName, emp.userType);
    if (newRole) {
      emp.userType = newRole;
      alert('Role assigned successfully!');
      this.search();
    }
  }

  toggleForm(): void {
    this.router.navigate(['/dashboard/register-user'], { 
      state: { employeeData: null } 
    });
  }
selectedBranchId: number | null = null;
  isRoleModalOpen: boolean = false;
  selectedEmployee: Employee | null = null;
selectedRole: number | null = null;
roleId?: number;
  RoleModal(emp: Employee): void {
    this.selectedEmployee = emp;
    this.selectedEmployeeEmail = emp.email;
    this.selectedEmployeePassword = ''; 
this.selectedRole = emp.roleId ?? null;    this.isAccountActive = emp.isActive !== false; 
    this.isRoleModalOpen = true;
   this.selectedBranchId = emp.userBranches?.[0]?.branchId ?? null;

  console.log("Stored BranchId:", this.selectedBranchId);
  }

  closeRoleModal(): void {
    this.isRoleModalOpen = false;
    this.selectedEmployee = null;
  }

 saveRole(): void {
  if (!this.selectedEmployee) return;

  const payload = {
    userId: this.selectedEmployee.id,
    roleId: this.selectedRole ?? null,
    password: this.selectedEmployeePassword?.trim() || null,
    isActive: this.isAccountActive,
       branchId: this.selectedBranchId,
    permissionIds: this.selectedPermissionIds
  };

  console.log("Sending Payload:", payload);

  this.http.put(`${environment.apiUrl}/Permissions/assign-role`, payload)
    .subscribe({
      next: (res: any) => {
        console.log("API Success:", res);
        this.closeRoleModal();
        this.getAllUsers();
      },
      error: (err) => {
        console.error("API Error:", err);
      }
    });
}

  isViewModalOpen: boolean = false;

  openViewModal(emp: Employee): void {
    this.selectedEmployee = emp;
    this.isViewModalOpen = true;
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.selectedEmployee = null;
  }

  viewProfile(emp: Employee) {
    this.selectedEmployee = emp;
    this.isViewModalOpen = true;
  }

  closeModal() {
    this.isViewModalOpen = false;
    this.selectedEmployee = null;
  }
  generateRandomPassword() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Input field ko update karne ke liye
  this.selectedEmployeePassword = password;
}
openPreview(imageUrl: string | undefined): void {
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    } else {
      alert('Document image not available');
    }
  }
getAllUsers(): void {
  const url = `${environment.apiUrl}/User/list?user_type=all`;

  this.http.get<Employee[]>(url).subscribe({
    next: (res: Employee[]) => {
      console.log("🔥 USER LIST API RESPONSE:", res);

      // ✅ API data save ho raha hai
      this.employees = res;

      // ✅ Table ke liye copy
      this.filteredEmployees = [...this.employees];
    },
    error: (err) => {
      console.error("❌ API ERROR:", err);
    }
  });
}
  // Inside export class EmployeeComponent { ... }
loadPermissions(): void {
  const url = `${environment.apiUrl}/Permissions/list`;

  this.http.get<Permission[]>(url).subscribe({
    next: (res) => {
      console.log("🔥 PERMISSION API:", res);

      // ✅ Sirf jisme subMenu hai wahi dikhenge
      this.permissionsList = res.filter(p => p.subMenu);

    },
    error: (err) => {
      console.error("❌ Permission API Error:", err);
    }
  });
}
toggleRemoteStatus(emp: any) {
  // ngModel already changed the value of emp.isActive
  // You just need to handle the API call or logic here
  console.log('Employee:', emp.name, 'is now:', emp.isActive);
  
  // Example: if you have a service, call it here
  // this.employeeService.updateStatus(emp.id, emp.isActive).subscribe();
}
  
  // downoad pdf code.............................................................idhar se hai  
  async downloadProfile() {
  const data = document.getElementById('profileCard');
  if (!data) return;

  try {
    // Scroll temporarily disable for correct height capture
    const originalOverflow = data.style.overflow;
    data.style.overflow = 'visible';

    const canvas = await html2canvas(data, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: -window.scrollY,
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight
    });

    data.style.overflow = originalOverflow;

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add extra pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`${this.selectedEmployee?.firstName || 'Employee'}_Profile.pdf`);

  } catch (error) {
    console.error("PDF Error:", error);
  }
}
}