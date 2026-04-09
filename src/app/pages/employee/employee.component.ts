import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { BranchService } from '../../services/branch.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import{environment} from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { CheckPermissionService } from '../../services/check-permission.service';
export interface UserEducation {
  id: number;
  userId: string;
  educationLevel: string; // e.g., "10th", "12th", "Graduation"
  passingYear: string;
  percentage: number;
  marksheetPath: string;
}
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
  status?: boolean; 
  bloodGroup?: string;
  maritalStatus?: string;

  paN_No?: string;
  aadhaarNo?: string;

  // ✅ Profile
  profilePicture?: string;

  // ✅ Job & Salary
  dateOfJoining?: string;
  ctC_Monthly?: number;
  monthlySalary?: number;

  // ✅ Bank Details

    accountHolderName?: string;
    bankName?: string;
    branchNameBank?: string;
    ifscCode?: string;
    accountType?: string;
    accountNumber?: string;

  // ✅ Address
  correspondenceAddress?: string;
  permanentAddress?: string;

  // ✅ Emergency
  emergencyName?: string;
  emergencyRelation?: string;
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
  offerLetterPath?: string;
  appointmentLetterPath?: string;
  invitationLetterPath?: string;
  relievingLetterPath?: string;
  fullAndFinalLetterPath?: string;
// --- ADDRESS: CORRESPONDENCE / PRESENT (API Names) ---
  presHouseNo?: string;
  presBuilding?: string;
  presFloor?: string;
  presBlock?: string;
  presStreet?: string;
  presLandmark?: string;
  presArea?: string;
  presCity?: string;
  presDistrict?: string;
  presState?: string;
  presPincode?: string;
  presCountry?: string;

  // --- ADDRESS: PERMANENT (API Names) ---
  permHouseNo?: string;
  permBuilding?: string;
  permFloor?: string;
  permBlock?: string;
  permStreet?: string;
  permLandmark?: string;
  permArea?: string;
  permCity?: string;
  permDistrict?: string;
  permState?: string;
  permPincode?: string;
  permCountry?: string;
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
PermissionID:any;
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
  employees: Employee[] =[];

  filteredEmployees: Employee[] = [];
  rolesList: any[] = [];
  branchesList: any[] = []; 

  constructor( private http: HttpClient ,private router:Router, private userService: UserService, private branchServices: BranchService,private cdr :ChangeDetectorRef,public CheckPermissionService:CheckPermissionService) {
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
  selectedPermissionIds: number[] = [];
activePermissionId: number | null = null;
permissionActions: any = {};
finalPermissions: any[] = [];




  ngOnInit(): void {
    this.PermissionID = Number(localStorage.getItem('permissionID'));
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
        console.error("API fails", err);
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

  this.activePermissionId = id;

}

actionChange(permissionId: number, action: string, event: any) {

  const checked = event.target.checked;

  if (!this.permissionActions[permissionId]) {
    this.permissionActions[permissionId] = [];
  }

  if (checked) {

    if (!this.permissionActions[permissionId].includes(action)) {
      this.permissionActions[permissionId].push(action);
    }

  } else {

    this.permissionActions[permissionId] =
      this.permissionActions[permissionId].filter((a: string) => a !== action);

  }

  this.finalPermissions = Object.keys(this.permissionActions).map(id => ({
    userId: this.selectedEmployee?.id,
    permission_id: Number(id),
    actions: this.permissionActions[id]
  }));

  console.log("Permission Structure:", this.finalPermissions);

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
  selectedEmployee: Employee | any;
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
    permissionIds: this.selectedPermissionIds,
     permissions: this.finalPermissions
  };
 const actionPayload = {
  userId: this.selectedEmployee.id,
  permissions: this.finalPermissions.map((p:any) => ({
    permissionId: p.permission_id,
    actions: p.actions
  }))
};



  console.log("Sending Payload for checking save:", actionPayload);
 this.http.post(`${environment.apiUrl}/action-permission/save`, actionPayload)
    .subscribe({
      next: (res: any) => {
        console.log("Action Permission Saved", res);
      },
      error: (err) => {
        console.error("Action Permission Error", err);
      }
    });
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
    console.log("🎯 View button clicked for ID:", emp.id); // Check karne ke liye
  
  this.selectedEmployee = { ...emp }; // Data set kiya
  this.isViewModalOpen = true;        // Modal khola

  if (emp.id) {
    this.getEducationDetails(emp.id.toString());
    this.getExperienceDetails(emp.id.toString()) // API call mari
  } else {
    console.warn("⚠️ Is employee ki ID missing hai!");
  }
  
    
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
  const url = `${environment.apiUrl}/User/adminlist?user_type=all`;
  const baseUrl = environment.apiUrl.replace('/api', '');

  this.http.get<Employee[]>(url).subscribe({
    next: (res: Employee[]) => {
      console.log("🔥 USER LIST API RESPONSE:", res);
      // ✅ Type casting (as Employee) use karke error solve hoga
      this.employees = res.map(emp => ({
        ...emp,
        profilePicture: emp.profilePicture ? `${baseUrl}${emp.profilePicture}` : '',
        offerLetterPath: emp.offerLetterPath ? `${baseUrl}${emp.offerLetterPath}` : '',
        appointmentLetterPath: emp.appointmentLetterPath ? `${baseUrl}${emp.appointmentLetterPath}` : '',
        invitationLetterPath: emp.invitationLetterPath ? `${baseUrl}${emp.invitationLetterPath}` : '',
        relievingLetterPath: emp.relievingLetterPath ? `${baseUrl}${emp.relievingLetterPath}` : '',
        fullAndFinalLetterPath: emp.fullAndFinalLetterPath ? `${baseUrl}${emp.fullAndFinalLetterPath}` : '',
        educationMarksheets: emp.educationMarksheets ? `${baseUrl}${emp.educationMarksheets}` : ''
      } as Employee)); // 👈 Ye 'as Employee' add karna zaroori hai

      console.log("✅ Processed Employees:", this.employees);
      this.filteredEmployees = [...this.employees];
      this.cdr.detectChanges();
    },
    error: (err) => console.error("❌ API ERROR:", err)
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
  console.log(`Employee: ${emp.id} is now: ${emp.status}`);

  this.userService.toggleUserStatus(emp.id, emp.status).subscribe({
    next: (res: any) => {
      console.log("✅ Status updated successfully:", res.message);
    },
    error: (err) => {
      console.error("❌ Failed to update status:", err);
      
      // Revert back if API fails
      emp.status = !emp.status;
      
      alert(`Failed to update status for Employee ${emp.id}`);
    }
  });
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
// --- EXPORT & PRINT LOGIC START ---

  // 1. EXCEL DOWNLOAD (Pura Data interface ke hisaab se)
  exportToExcel() {
    if (!this.filteredEmployees || this.filteredEmployees.length === 0) {
      alert("Niche table mein koi data nahi hai export karne ke liye!");
      return;
    }

    const dataToExport = this.filteredEmployees.map(u => ({
      'Emp Code': u.empCode || '-',
      'Full Name': `${u.firstName || ''} ${u.middleName || ''} ${u.lastName || ''}`.trim(),
      'Email': u.email || '-',
      'Phone': u.mobile || u.telephone || '-',
      'Designation': u.designation || '-',
      'Department': u.department || '-',
      'Functional Area': u.functionalArea || '-',
      'Branch/Location': u.branch || '-',
      'DOB': u.dob || '-',
      'Joining Date': u.dateOfJoining || '-',
      'Blood Group': u.bloodGroup || '-',
      'PAN No': u.paN_No || '-',
      'Aadhaar No': u.aadhaarNo || '-',
      'Monthly CTC': u.ctC_Monthly || 0,
      'Bank Name': u.bankName || '-',
      'A/C Number': u.accountNumber || '-',
      'IFSC Code': u.ifscCode || '-',
      'Present Address': `${u.presHouseNo || ''} ${u.presStreet || ''} ${u.presCity || ''} ${u.presState || ''} ${u.presPincode || ''}`.trim() || '-',
      'Emergency Contact': `${u.emergencyName || ''} (${u.emergencyContactNo || ''})`,
      'Education (10th/12th %)': `${u.tenthPercentage || 0}% / ${u.twelfthPercentage || 0}%`
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employee_Master_Data');
    
    XLSX.writeFile(wb, `Cavalier_Employee_Data_${new Date().getTime()}.xlsx`);
  }

  // 2. PDF DOWNLOAD (A3 Landscape for Professional Look)
  downloadFullPDF() {
    if (!this.filteredEmployees || this.filteredEmployees.length === 0) {
      alert("Download ke liye data nahi hai!");
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a3'); 
    doc.setFontSize(22);
    doc.setTextColor(74, 63, 63); 
    doc.text('CAVALIER EMPLOYEE MASTER DATABASE', 14, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Report Generated: ${new Date().toLocaleString()}`, 14, 22);

    // PDF Table Headers
    const head = [[
      'Code', 'Name', 'Designation/Dept', 'Contact/Email', 'Location', 'KYC (PAN/UID)', 'CTC', 'Bank Details', 'Address'
    ]];

    // PDF Table Body (Interface ke base par mapping)
    const data = this.filteredEmployees.map(u => [
      u.empCode || '-',
      `${u.firstName} ${u.lastName}`,
      `${u.designation}\n${u.department}`,
      `${u.mobile}\n${u.email}`,
      u.branch || '-',
      `PAN: ${u.paN_No || '-'}\nUID: ${u.aadhaarNo || '-'}`,
      u.ctC_Monthly || '0',
      `${u.bankName || '-'}\n${u.accountNumber || '-'}`,
      `${u.presCity || ''}, ${u.presState || ''}`
    ]);

    autoTable(doc, {
      head: head,
      body: data,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
      headStyles: { fillColor: [74, 63, 63], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        2: { cellWidth: 40 },
        3: { cellWidth: 50 },
        7: { cellWidth: 40 },
        8: { cellWidth: 60 }
      },
      margin: { top: 30, left: 10, right: 10 }
    });

    doc.save(`Cavalier_Master_Report_${new Date().getTime()}.pdf`);
  }

  // 3. PRINT TABLE (Jo table screen par dikh rahi hai wahi print hogi)
  printTable() {
    if (!this.filteredEmployees || this.filteredEmployees.length === 0) {
      alert("Print karne ke liye data nahi hai!");
      return;
    }

    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    let tableHtml = `
      <html>
        <head>
          <title>Employee Directory Print</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; }
            h2 { text-align: center; color: #4a3f3f; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 2px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: auto; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: left; font-size: 11px; }
            th { background-color: #4a3f3f; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .footer { margin-top: 20px; text-align: right; font-size: 10px; color: #888; }
            @page { size: landscape; margin: 1cm; }
          </style>
        </head>
        <body>
          <h2>Employee Records Master Report</h2>
          <table>
            <thead>
              <tr>
                <th>Emp Code</th>
                <th>Full Name</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Branch</th>
                <th>Aadhaar No</th>
              </tr>
            </thead>
            <tbody>
              ${this.filteredEmployees.map(u => `
                <tr>
                  <td>${u.empCode}</td>
                  <td>${u.firstName} ${u.lastName}</td>
                  <td>${u.designation}</td>
                  <td>${u.department}</td>
                  <td>${u.mobile || '-'}</td>
                  <td>${u.email}</td>
                  <td>${u.branch || '-'}</td>
                  <td>${u.aadhaarNo || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">Generated on: ${new Date().toLocaleString()}</div>
        </body>
      </html>
    `;

    printWindow?.document.write(tableHtml);
    printWindow?.document.close();
    
    setTimeout(() => {
      printWindow?.print();
      printWindow?.close();
    }, 700);
  }

// --- EXPORT & PRINT LOGIC END ---
// --- PAGINATION SETTINGS ---
currentPage: number = 1;
pageSize: number = 10;
protected readonly Math = Math;

// Table mein "filteredEmployees" ki jagah isko loop karna
get paginatedEmployees(): Employee[] {
  const startIndex = (this.currentPage - 1) * this.pageSize;
  return this.filteredEmployees.slice(startIndex, startIndex + this.pageSize);
}

get totalPages(): number {
  return Math.ceil(this.filteredEmployees.length / this.pageSize) || 1;
}

setPage(page: number) {
  if (page < 1 || page > this.totalPages) return;
  this.currentPage = page;
  this.cdr.detectChanges(); // UI refresh ke liye
}

onPageSizeChange() {
  this.currentPage = 1;
  this.cdr.detectChanges();
}
// Is line ko check karein:
navigateToAccess(emp: any): void {  // <--- 'number' ki jagah 'any' likh dein
  if (emp) {
    this.router.navigate(['dashboard/rolePermision', emp]);
  } else {
    console.error("Employee ID nahi mili!");
  }
}
// ✅ Education Details fetch karne ka function
getEducationDetails(userId: string): void {
  const url = `${environment.apiUrl}/UserEducation/user/${userId}`;

  this.http.get<any[]>(url).subscribe({
    next: (res) => {
      console.log("🎓 EDUCATION API RESPONSE:", res);
      
      if (this.selectedEmployee && res && res.length > 0) {
        res.forEach((edu: any) => {
          const qual = (edu.qualification || '').toLowerCase();
          
          // API se aane wala document path agar "/uploads/..." hai toh base URL lagana hoga
          const fullDocPath = edu.documentPath ? `${environment.apiUrl.replace('/api','')}${edu.documentPath}` : null;

          if (qual.includes('10th')) {
            // Mapping as per your API response (PassingYear and Percentage)
            this.selectedEmployee!['tenthYear'] = edu.passingYear; 
            this.selectedEmployee!['tenthPercentage'] = edu.percentage;
            this.selectedEmployee!['tenthDoc'] = fullDocPath;
          } 
          else if (qual.includes('12th')) {
            this.selectedEmployee!['twelfthYear'] = edu.passingYear;
            this.selectedEmployee!['twelfthPercentage'] = edu.percentage;
            this.selectedEmployee!['twelfthDoc'] = fullDocPath;
          }
          else if (qual.includes('graduation') && !qual.includes('post')) {
            this.selectedEmployee!['graduationYear'] = edu.passingYear;
            this.selectedEmployee!['graduationPercentage'] = edu.percentage;
            this.selectedEmployee!['graduationDoc'] = fullDocPath;
          }
          else if (qual.includes('post') || qual.includes('pg')) {
            this.selectedEmployee!['pgYear'] = edu.passingYear;
            this.selectedEmployee!['pgPercentage'] = edu.percentage;
            this.selectedEmployee!['pgDoc'] = fullDocPath;
          }
        });

        // Forcefully UI refresh karne ke liye
        this.cdr.detectChanges();
      }
    },
    error: (err) => {
      console.error("❌ Education API Error:", err);
    }
  });
}
getExperienceDetails(userId: string): void {
  const url = `${environment.apiUrl}/Experience/user/${userId}`;

  this.http.get<any[]>(url).subscribe({
    next: (res) => {
      console.log("💼 EXPERIENCE API RESPONSE:", res);
      
      if (this.selectedEmployee) {
        // API response ko selectedEmployee.experiences mein dalna
        // Backend se 'yearsOfExperience' aa raha hai, hum use 'totalYears' mein map kar sakte hain UI ke liye
        this.selectedEmployee.experiences = res.map(exp => ({
          ...exp,
          totalYears: exp.yearsOfExperience, // UI mapping
          isVerified: exp.verificationComplete // Backend mapping
        }));

        this.cdr.detectChanges(); // UI refresh
      }
    },
    error: (err) => {
      console.error("❌ Experience API Error:", err);
    }
  });
}
}