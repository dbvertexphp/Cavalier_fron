import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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

  // ===============================
  // VARIABLES
  // ===============================

  userId: string | null = null;
  isLoading: boolean = true;
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
          if (p.actions.includes("Add")) {
            this.branchPermissions[branchId].push(p.permissionId + "_a");
          }
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

        // 🔥 Fix: Branch data load hone ke baad UI array ko update karna zaroori hai
        if (this.selectedBranchPermission) {
           const currentId = this.selectedBranchPermission.id;
           if (this.branchPermissions[currentId]) {
             this.selectedPermissionIds = [...this.branchPermissions[currentId]];
           }
        } else {
           const firstBranchId = Object.keys(this.branchPermissions)[0];
           if (firstBranchId) {
             const branch = this.branchesList.find(b => b.id == firstBranchId);
             if (branch) {
               this.selectedBranchPermission = branch;
               this.selectedPermissionIds = [...this.branchPermissions[Number(firstBranchId)]];
             }
           }
        }
        this.cdr.detectChanges();
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
        this.selectedBranchIds = emp.userBranches?.map((b: any) => b.branch.id) || [];
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
      this.resetPermissionsUI();
      return;
    }

    const numericRoleId = Number(roleId);
    if (isNaN(numericRoleId)) return;

    this.http.get<any[]>(`${environment.apiUrl}/role-permission/by-role/${numericRoleId}`)
      .subscribe({
        next: (res) => {
          this.applyRolePermissionsToUI(res);
        },
        error: (err) => {
          this.resetPermissionsUI(); 
        }
      });
  }

  resetPermissionsUI() {
    if (this.selectedBranchPermission) {
      const branchId = this.selectedBranchPermission.id;
      this.branchPermissions[branchId] = [];
    }
    this.selectedPermissionIds = [];
    this.cdr.detectChanges();
  }

  applyRolePermissionsToUI(apiData: any[]) {
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
    const newPermissions: any[] = [];

    if (apiData && apiData.length > 0) {
      apiData.forEach(p => {
        newPermissions.push(p.permissionId);
        if (p.actions && Array.isArray(p.actions)) {
          if (p.actions.includes("Add"))   newPermissions.push(p.permissionId + "_a");
          if (p.actions.includes("View"))   newPermissions.push(p.permissionId + "_v");
          if (p.actions.includes("Edit"))   newPermissions.push(p.permissionId + "_e");
          if (p.actions.includes("Delete")) newPermissions.push(p.permissionId + "_d");
        }
      });
    }

    this.branchPermissions[branchId] = [...newPermissions];
    this.selectedPermissionIds = [...newPermissions];
    this.cdr.detectChanges(); 
  }

  // ===============================
  // PERMISSIONS
  // ===============================

  getPermissionDisplayName(perm: any): string {
    if (!perm) return 'N/A';
    if (perm.subMenu && perm.subMenu.toString().trim() !== '') {
      return perm.subMenu.trim();
    }
    if (perm.menu && perm.menu.toString().trim() !== '') {
      return perm.menu.trim();
    }
    return 'Unnamed';
  }

  loadPermissions() {
    this.isLoading = true;
    this.http.get<any[]>(`${environment.apiUrl}/Permissions/list`).subscribe({
      next: (res) => {
        this.permissionsList = res.filter(p => {
          if (!p || !p.menu || p.menu.toString().trim() === '') {
            return false;
          }
          this.isLoading = false;
          const excluded = ['dashboard', 'port of loading', 'port of discharge'];
          const menuLower = p.menu.toString().toLowerCase().trim();
          const subMenuLower = p.subMenu ? p.subMenu.toString().toLowerCase().trim() : '';
          if (excluded.includes(menuLower) || excluded.includes(subMenuLower)) {
            return false;
          }
          this.cdr.detectChanges();
          return true;
        });
      },
      error: (err) => {
        this.isLoading = false;
      }
    });
  }

  // ===============================
  // BRANCH TOGGLE
  // ===============================

  toggleBranch(id: number) {
    if (this.selectedBranchIds.includes(id)) {
      this.selectedBranchIds = this.selectedBranchIds.filter(x => x !== id);
    } else {
      this.selectedBranchIds.push(id);
    }
  }

  // ===============================
  // PERMISSION TOGGLES (MODIFIED FOR ALL)
  // ===============================

  togglePermission(permID: any) {
    const suffixes = ['_a', '_v', '_e', '_d'];
    const subPerms = suffixes.map(s => permID + s);
    const allChecked = subPerms.every(id => this.selectedPermissionIds.includes(id));

    if (allChecked) {
      if(this.selectedPermissionIds.includes(permID)) this.toggleLogic(permID);
      suffixes.forEach(s => {
        if(this.selectedPermissionIds.includes(permID + s)) {
          this.toggleLogic(permID + s);
        }
      });
    } else {
      if(!this.selectedPermissionIds.includes(permID)) this.toggleLogic(permID);
      suffixes.forEach(s => {
        if(!this.selectedPermissionIds.includes(permID + s)) {
          this.toggleLogic(permID + s);
        }
      });
    }
  }

  isModuleFullyChecked(permID: any): boolean {
    const suffixes = ['_a', '_v', '_e', '_d'];
    // Saare actions checked hone chahiye tabhi "All" wala tick hoga
    return suffixes.every(s => this.selectedPermissionIds.includes(permID + s));
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

  toggleAdd(id: any) {
    this.toggleLogic(id + "_a");
  }

  private toggleLogic(key: any) {
    if (!this.selectedBranchPermission) {
      if (this.selectedBranchIds.length === 0) {
        alert("Please select a branch first");
        return;
      }
      const firstBranch = this.branchesList.find(b => b.id === this.selectedBranchIds[0]);
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
    this.cdr.detectChanges();
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
      isAuthenticated: true,
      isActive: this.isAccountActive,
      branchIds: this.selectedBranchIds,
      permissionIds: finalPayloadIds
    };

    const branchPermissionsPayload: any[] = [];

    Object.keys(this.branchPermissions).forEach(branchId => {
      const permissionsArray = this.branchPermissions[Number(branchId)];
      const permissionMap: any = {};

      permissionsArray.forEach((p: any) => {
        if (typeof p === "number") {
          if (!permissionMap[p]) permissionMap[p] = [];
        }
        if (typeof p === "string") {
          const parts = p.split("_");
          const permId = parseInt(parts[0]);
          const action = parts[1];
          if (!permissionMap[permId]) permissionMap[permId] = [];
          if (action === "v") permissionMap[permId].push("View");
          if (action === "a") permissionMap[permId].push("Add");
          if (action === "e") permissionMap[permId].push("Edit");
          if (action === "d") permissionMap[permId].push("Delete");
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

    this.http.put(`${environment.apiUrl}/Permissions/assign-role`, rolePayload)
    .subscribe({
      next: () => {
        this.http.post(`${environment.apiUrl}/action-permission/save`, finalBranchPayload)
        .subscribe({
          next: () => {
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
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    this.selectedEmployeePassword = Array(10).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join("");
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
    this.cdr.detectChanges();
  }

  // ===============================
  // BACK
  // ===============================

  goBack() {
    this.router.navigate(['/dashboard/Employee']);
  }
}