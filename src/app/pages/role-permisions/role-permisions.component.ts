import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
//gfgfg
@Component({
  selector: 'app-role-permisions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-permisions.component.html',
  styleUrl: './role-permisions.component.css',
})
export class RolePermisionsComponent implements OnInit {

  // ===============================
  // VARIABLES
  // ===============================

  userId: string | null = null;

  selectedEmployee: any = null;

  rolesList: any[] = [];
  permissionsList: any[] = [];

  branchesList: any[] = [];

  selectedBranchIds: number[] = [];

  selectedPermissionIds: any[] = [];

  branchPermissions: { [branchId: number]: any[] } = {};
  isPasswordVisible: boolean = false;
  selectedEmployeeEmail = '';
  selectedEmployeePassword = '';

  selectedRole: number | null = null;

  isAccountActive = true;

  isSaving = false;

  selectedBranchPermission: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  // ===============================
  // INIT
  // ===============================

  ngOnInit(): void {

    this.userId = this.route.snapshot.paramMap.get('id');

    this.loadBranches();
    this.loadRoles();
    this.loadPermissions();

    if (this.userId) {

      this.fetchUserDetails(this.userId);

     

    }

  }
loadUserPermissions() {

  if (!this.userId) return;

  this.http.get<any>(
    `${environment.apiUrl}/action-permission/getuserpermission?userId=${this.userId}`
  ).subscribe({

    next: (res) => {

      this.branchPermissions = {};

      res.permissions.forEach((p: any) => {

        const branchId = p.branchId;

        if (!this.branchPermissions[branchId]) {
          this.branchPermissions[branchId] = [];
        }

        // base permission
        this.branchPermissions[branchId].push(p.permissionId);

        // actions
        if (p.actions.includes("View")) {
          this.branchPermissions[branchId].push(p.permissionId + "_v");
        }

        if (p.actions.includes("Edit")) {
          this.branchPermissions[branchId].push(p.permissionId + "_e");
        }

        if (p.actions.includes("Delete")) {
          this.branchPermissions[branchId].push(p.permissionId + "_d");
        }

      });

      // 🔥 first branch auto select
      const firstBranchId = Object.keys(this.branchPermissions)[0];

      if (firstBranchId) {

        const branch = this.branchesList.find(b => b.id == firstBranchId);

        if (branch) {
          this.selectedBranchPermission = branch;
          const branchIdNum = Number(firstBranchId);

this.selectedPermissionIds = [...this.branchPermissions[branchIdNum]];
        }

      }

    }

  });

}
  // ===============================
  // LOAD BRANCHES
  // ===============================

 loadBranches() {
  this.http.get<any[]>(`${environment.apiUrl}/Branch/list`)
  .subscribe({

    next: (res) => {

      this.branchesList = res.map(b => ({
        id: b.id,
        name: b.branchName,
        isDefault: false
      }));

      // 🔥 YAHI ADD KAR
      this.loadUserPermissions();

    }

  });
}

  // ===============================
  // USER DETAILS
  // ===============================

  fetchUserDetails(id: string) {

    this.http.get<any>(`${environment.apiUrl}/User/${id}`)
    .subscribe({

      next: (emp) => {

        this.selectedEmployee = emp;

        this.selectedEmployeeEmail = emp.email;

        this.selectedRole = emp.roleId ?? null;

        this.selectedEmployeePassword = emp.password ?? null;

        this.isAccountActive = emp.status !== false;

        this.selectedBranchIds =
          emp.userBranches?.map((b: any) => b.branch.id) || [];

      }

    });

  }

  // ===============================
  // ROLES
  // ===============================

  loadRoles() {

    this.http.get<any[]>(`${environment.apiUrl}/User/roles`)
    .subscribe(res => this.rolesList = res);

  }
onRoleChange(roleId: any) {
  if (roleId === null || roleId === undefined || roleId === 'null') {
    this.resetPermissionsUI(); // Manual/Null pe clear karo
    return;
  }

  const numericRoleId = Number(roleId);
  if (isNaN(numericRoleId)) return;

  console.log("Fetching permissions for Role ID:", numericRoleId);

  this.http.get<any[]>(`${environment.apiUrl}/role-permission/by-role/${numericRoleId}`)
    .subscribe({
      next: (res) => {
        console.log("API Response Success:", res);
        this.applyRolePermissionsToUI(res);
      },
      error: (err) => {
        // 🔥 YAHAN HAI FIX: Jab 404 (No Permissions) aaye, toh UI clear kar do
        console.warn("No permissions for this role or API error:", err);
        this.resetPermissionsUI(); 
      }
    });
}

// Ek helper function bana lo reset karne ke liye
resetPermissionsUI() {
  if (this.selectedBranchPermission) {
    const branchId = this.selectedBranchPermission.id;
    this.branchPermissions[branchId] = []; // Branch ka data khali karo
  }
  this.selectedPermissionIds = []; // UI ke checkboxes khali karo
  this.cdr.detectChanges(); // Force Refresh
  console.log("UI Reset: Permissions Cleared");
}

applyRolePermissionsToUI(apiData: any[]) {
  // 1. Agar branch select nahi hai toh pehli branch uthao
  if (!this.selectedBranchPermission) {
    if (this.selectedBranchIds.length > 0) {
      const firstBranchId = this.selectedBranchIds[0];
      this.selectedBranchPermission = this.branchesList.find(b => b.id === Number(firstBranchId));
    } else {
      alert("Pehle left side se Branch select karo bhai!");
      return;
    }
  }

  const branchId = this.selectedBranchPermission.id;

  // 🔥 STEP 1: Pehle empty array declare karo (Taki agar apiData empty ho toh UI reset ho jaye)
  const newPermissions: any[] = [];

  // 🔥 STEP 2: Agar API se data aaya hai tabhi loop chalao
  if (apiData && apiData.length > 0) {
    apiData.forEach(p => {
      newPermissions.push(p.permissionId);
      if (p.actions && Array.isArray(p.actions)) {
        if (p.actions.includes("View"))   newPermissions.push(p.permissionId + "_v");
        if (p.actions.includes("Edit"))   newPermissions.push(p.permissionId + "_e");
        if (p.actions.includes("Delete")) newPermissions.push(p.permissionId + "_d");
      }
    });
  }

  // 🔥 STEP 3: Sabse important - Is branch ka data update karo (Empty ho ya filled)
  this.branchPermissions[branchId] = [...newPermissions];

  // 🔥 STEP 4: UI ko batana ki data change ho gaya hai
  this.selectedPermissionIds = [...newPermissions];

  // 🔥 STEP 5: Force Angular to detect changes
  this.cdr.detectChanges(); 

  console.log("UI Updated! Current Data:", this.selectedPermissionIds);
}
  // ===============================
  // PERMISSIONS
  // ===============================

  loadPermissions() {

    this.http.get<any[]>(`${environment.apiUrl}/Permissions/list`)
    .subscribe(res => {

      this.permissionsList = res.filter(p => p.subMenu);

    });

  }

  // ===============================
  // BRANCH TOGGLE
  // ===============================

  toggleBranch(id: number) {

    if (this.selectedBranchIds.includes(id)) {

      this.selectedBranchIds =
        this.selectedBranchIds.filter(x => x !== id);

    } else {

      this.selectedBranchIds.push(id);

    }

  }

  // ===============================
  // PERMISSION TOGGLES
  // ===============================

  togglePermission(id: any) {
    this.toggleLogic(id);
  }

  toggleView(id: any) {
    this.toggleLogic(id + "_v");
  }

  toggleEdit(id: any) {
    this.toggleLogic(id + "_e");
  }

  toggleDelete(id: any) {
    this.toggleLogic(id + "_d");
  }

 private toggleLogic(key: any) {

  // agar branch select nahi hai to first selected branch use karo
  if (!this.selectedBranchPermission) {

    if (this.selectedBranchIds.length === 0) {
      alert("Please select a branch first");
      return;
    }

    const firstBranch = this.branchesList.find(
      b => b.id === this.selectedBranchIds[0]
    );

    this.selectedBranchPermission = firstBranch;
  }

  const branchId = this.selectedBranchPermission.id;

  if (!this.branchPermissions[branchId]) {
    this.branchPermissions[branchId] = [];
  }

  const permissions = this.branchPermissions[branchId];

  const index = permissions.indexOf(key);

  if (index > -1) {
    permissions.splice(index, 1);
  } else {
    permissions.push(key);
  }

  this.selectedPermissionIds = [...permissions];

  console.log("Updated BranchPermissions:", this.branchPermissions);
}

  // ===============================
  // SAVE SETTINGS
  // ===============================

saveSettings() {

  if (this.isSaving) return;

  this.isSaving = true;

  const cleanIds = this.selectedPermissionIds.map(item => {

    if (typeof item === "string") {
      return parseInt(item.split("_")[0], 10);
    }

    return item;

  });

  const finalPayloadIds = [...new Set(cleanIds)];

  const rolePayload = {

    userId: this.userId,

    roleId: this.selectedRole,

    password: this.selectedEmployeePassword || null,

    isActive: this.isAccountActive,

    branchIds: this.selectedBranchIds,

    permissionIds: finalPayloadIds

  };

  // =============================
  // BUILD BRANCH PERMISSION DATA
  // =============================

  const branchPermissionsPayload: any[] = [];

  Object.keys(this.branchPermissions).forEach(branchId => {

    const permissionsArray = this.branchPermissions[Number(branchId)];

    const permissionMap: any = {};

    permissionsArray.forEach((p:any)=>{

      if(typeof p === "number"){

        if(!permissionMap[p]){
          permissionMap[p] = [];
        }

      }

      if(typeof p === "string"){

        const parts = p.split("_");

        const permId = parseInt(parts[0]);
        const action = parts[1];

        if(!permissionMap[permId]){
          permissionMap[permId] = [];
        }

        if(action === "v") permissionMap[permId].push("View");
        if(action === "e") permissionMap[permId].push("Edit");
        if(action === "d") permissionMap[permId].push("Delete");

      }

    });

    const permissions = Object.keys(permissionMap).map(id => ({
      permissionId: Number(id),
      actions: permissionMap[id]
    }));

    branchPermissionsPayload.push({
      branchId: Number(branchId),
      permissions: permissions
    });

  });

  const finalBranchPayload = {
    userId: Number(this.userId),
    branchPermissions: branchPermissionsPayload
  };

  console.log("FINAL BRANCH PAYLOAD", finalBranchPayload);

  // =============================
  // API CALLS
  // =============================

  this.http.put(`${environment.apiUrl}/Permissions/assign-role`, rolePayload)
  .subscribe({

    next: () => {

      // 🔥 IMPORTANT: send branch payload
      this.http.post(`${environment.apiUrl}/action-permission/save`, finalBranchPayload)
      .subscribe({

        next: () => {

          console.log("Permissions saved successfully");

          this.isSaving = false;

          this.goBack();

        },

        error: () => {

          this.isSaving = false;

          alert("Role saved but branch permissions failed.");

        }

      });

    },

    error: () => {

      this.isSaving = false;

      alert("Failed to update role settings.");

    }

  });

}

  // ===============================
  // PASSWORD GENERATOR
  // ===============================

  generateRandomPassword() {

    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

    this.selectedEmployeePassword =
      Array(10)
        .fill(0)
        .map(() => chars[Math.floor(Math.random() * chars.length)])
        .join("");

  }

  // ===============================
  // OPEN BRANCH PERMISSION
  // ===============================

  openBranchPermission(branch: any) {

  this.selectedBranchPermission = branch;

  const branchId = branch.id;

  if (!this.branchPermissions[branchId]) {
    this.branchPermissions[branchId] = [];
  }

  this.selectedPermissionIds = [...this.branchPermissions[branchId]];

  console.log("Branch Selected:", branchId);
}

  // ===============================
  // BACK
  // ===============================

  goBack() {
    this.router.navigate(['/dashboard/Employee']);
  }

}