import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-role-permisions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-permisions.component.html',
  styleUrl: './role-permisions.component.css',
})
export class RolePermisionsComponent implements OnInit {
  userId: string | null = null;
  selectedEmployee: any = null;
  rolesList: any[] = [];
  permissionsList: any[] = [];
  
  selectedEmployeeEmail = '';
  selectedEmployeePassword = '';
  selectedRole: number | null = null;
  selectedBranchId: number | null = null;
  isAccountActive: boolean = true;
  isPasswordVisible: boolean = false;

  // Ise any[] kiya taaki hum "101_v", "101_e" jaisi strings temporarily rakh saken
  selectedPermissionIds: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.loadRoles();
    this.loadPermissions();
    if (this.userId) {
      this.fetchUserDetails(this.userId);
    }
  }

  fetchUserDetails(id: string) {
    this.http.get<any>(`${environment.apiUrl}/User/${id}`).subscribe({
      next: (emp) => {
        this.selectedEmployee = emp;
        this.selectedEmployeeEmail = emp.email;
        this.selectedRole = emp.roleId ?? null;
        this.isAccountActive = emp.isActive !== false;
        this.selectedBranchId = emp.userBranches?.[0]?.branchId ?? null;
        this.selectedPermissionIds = emp.permissions?.map((p: any) => p.permissionID) || [];
      }
    });
  }

  loadRoles() {
    this.http.get<any[]>(`${environment.apiUrl}/User/roles`).subscribe(res => this.rolesList = res);
  }

  loadPermissions() {
    this.http.get<any[]>(`${environment.apiUrl}/Permissions/list`).subscribe(res => {
      this.permissionsList = res.filter(p => p.subMenu);
    });
  }

  // 1. Main Permission Toggle
  togglePermission(id: any) {
    this.toggleLogic(id);
  }

  // 2. View Toggle
  toggleView(id: any) {
    this.toggleLogic(id + '_v');
  }

  // 3. Edit Toggle
  toggleEdit(id: any) {
    this.toggleLogic(id + '_e');
  }

  // 4. Delete Toggle
  toggleDelete(id: any) {
    this.toggleLogic(id + '_d');
  }

  // Common Logic for all toggles
  private toggleLogic(key: any) {
    const index = this.selectedPermissionIds.indexOf(key);
    if (index > -1) {
      this.selectedPermissionIds.splice(index, 1);
    } else {
      this.selectedPermissionIds.push(key);
    }
  }

 // 1. Pehle variable declare karein (top par)
isSaving: boolean = false;

// 2. Updated saveSettings function
saveSettings() {
  // Agar pehle se saving chal rahi hai toh ruk jao
  if (this.isSaving) return;

  // Loading indicator on karo
  this.isSaving = true;

  // API ko bhejne se pehle sab "v, e, d" ko hata kar sirf Number ID nikalna
  const cleanIds = this.selectedPermissionIds.map(item => {
    if (typeof item === 'string') {
      // "101_v" -> 101, "101_e" -> 101, etc.
      const id = item.split('_')[0];
      return parseInt(id, 10); 
    }
    return item;
  });

  // Duplicates hatana (Set use karke)
  const finalPayloadIds = [...new Set(cleanIds)];

  const payload = {
    userId: this.userId,
    roleId: this.selectedRole,
    password: this.selectedEmployeePassword || null,
    isActive: this.isAccountActive,
    branchId: this.selectedBranchId,
    permissionIds: finalPayloadIds // Backend ko clean numbers milenge
  };

  // API Call
  this.http.put(`${environment.apiUrl}/Permissions/assign-role`, payload).subscribe({
    next: () => {
      this.isSaving = false; // Stop loading
      alert("Settings updated successfully!");
      this.goBack();
    },
    error: (err) => {
      this.isSaving = false; // Stop loading
      console.error("Update failed", err);
      alert("Update failed! Please check your connection or try again.");
    }
  });
}

  generateRandomPassword() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    this.selectedEmployeePassword = Array(10).fill(0).map(x => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  goBack() {
    this.router.navigate(['/dashboard/Employee']);
  }
}