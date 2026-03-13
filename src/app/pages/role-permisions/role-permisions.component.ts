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

  if (this.isSaving) return;
  this.isSaving = true;

  // -------------------------
  // 1️⃣ CLEAN PERMISSION IDS
  // -------------------------
  const cleanIds = this.selectedPermissionIds.map(item => {
    if (typeof item === 'string') {
      const id = item.split('_')[0];
      return parseInt(id, 10);
    }
    return item;
  });

  const finalPayloadIds = [...new Set(cleanIds)];

  // -------------------------
  // 2️⃣ ROLE ASSIGN PAYLOAD
  // -------------------------
  const rolePayload = {
    userId: this.userId,
    roleId: this.selectedRole,
    password: this.selectedEmployeePassword || null,
    isActive: this.isAccountActive,
    branchId: this.selectedBranchId,
    permissionIds: finalPayloadIds
  };

  // -------------------------
  // 3️⃣ ACTION PERMISSION MAP
  // -------------------------
  const permissionMap: any = {};

  this.selectedPermissionIds.forEach(item => {

    if (typeof item === 'number') {
      if (!permissionMap[item]) {
        permissionMap[item] = [];
      }
    }

    if (typeof item === 'string') {

      const parts = item.split('_');
      const id = parseInt(parts[0], 10);
      const actionKey = parts[1];

      if (!permissionMap[id]) {
        permissionMap[id] = [];
      }

      if (actionKey === 'v') permissionMap[id].push("View");
      if (actionKey === 'e') permissionMap[id].push("Edit");
      if (actionKey === 'd') permissionMap[id].push("Delete");
    }

  });

  const permissions = Object.keys(permissionMap).map(id => ({
    permissionId: parseInt(id),
    actions: permissionMap[id]
  }));

  const actionPayload = {
    userId: parseInt(this.userId!),
    permissions: permissions
  };

  // -------------------------
  // 4️⃣ FIRST API CALL
  // -------------------------
  this.http.put(`${environment.apiUrl}/Permissions/assign-role`, rolePayload)
    .subscribe({

      next: () => {

        // -------------------------
        // 5️⃣ SECOND API CALL
        // -------------------------
        this.http.post(`${environment.apiUrl}/action-permission/save`, actionPayload)
          .subscribe({

            next: () => {
              this.isSaving = false;
              alert("Settings updated successfully!");
              this.goBack();
            },

            error: (err) => {
              this.isSaving = false;
              console.error("Action permission error", err);
              alert("Role saved but action permission failed.");
            }

          });

      },

      error: (err) => {
        this.isSaving = false;
        console.error("Role assign error", err);
        alert("Failed to update role settings.");
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