import { Permission } from './../../pages/employee/employee.component';
import { CheckPermissionService } from '../../services/check-permission.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service'; // Path sahi kar lena
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css'], // fixed typo: styleUrls
})
export class RolesComponent implements OnInit {
  isModalOpen = false;
  isLoading = false;
  isEditMode = false; // Edit track karne ke liye
  rolesList: any[] = []; // Ab ye API se bharega

  permissionsList: any[] = []; // Modules list
  selectedPermissionIds: any[] = [];

  // Form Model matching your Backend 'Role' class
  newRole = {
    id: 0,
    name: '',
    status: true // Default Active Set kar diya hai
  };

  showPopup = false;
  roleIdToDelete: number | null = null;
  PermissionID:any;
  constructor(private userService: UserService,public CheckPermissionService:CheckPermissionService,private cdr: ChangeDetectorRef,private http: HttpClient) {}

  ngOnInit(): void {
    
    this.PermissionID = Number(localStorage.getItem('permissionID'));
    
    this.loadRoles();
    this.loadPermissions();
  }

  // // --- 1. GET ROLES ---
  // loadRoles() {
  //   this.userService.getRoles().subscribe({
  //     next: (data: any) => {
  //       this.rolesList = data;
  //     },
  //     error: (err) => console.error("Roles load nahi hue:", err)
  //   });
  // }
loadRoles() {
  
  this.userService.getRoles().subscribe({
    
    next: (data: any) => {
      // Har role ko upper case mein convert kar raha hoon
      this.rolesList = data.map((role: any) => ({
        ...role,
        name: role.name.toUpperCase() // Maan lete hain property ka naam 'name' hai
        
        
      }));
      this.cdr.detectChanges(); // Force UI update after data load
    },
    error: (err) => console.error("Roles load nahi hue:", err)
  });
}
loadPermissions() {
    this.http.get<any[]>(`${environment.apiUrl}/Permissions/list`).subscribe(res => {
      this.permissionsList = res.filter(p => p.subMenu);
    });
  }
  // --- 2. SAVE ROLE (Add or Update) ---
 saveRole() {
  if (!this.newRole.name.trim()) {
    return;
  }

  this.isLoading = true;

  // 1. Permission Mapping (Wahi logic jo aapne likha tha)
  const permissionMap: any = {};
  this.selectedPermissionIds.forEach((p: any) => {
    const isString = typeof p === 'string';
    const permId = isString ? parseInt(p.split('_')[0]) : p;
    const actionKey = isString ? p.split('_')[1] : null;

    if (!permissionMap[permId]) {
      permissionMap[permId] = [];
    }

    if (actionKey === "v") permissionMap[permId].push("View");
    if (actionKey === "e") permissionMap[permId].push("Edit");
    if (actionKey === "d") permissionMap[permId].push("Delete");
    if (actionKey === "a") permissionMap[permId].push("Add");
    
  });

  const finalPermissions = Object.keys(permissionMap).map(id => ({
    permissionId: Number(id),
    actions: permissionMap[id] // Ye array backend ko jayega [ "View", "Delete" ]
  }));

  // 2. Final Payload (Dono Add aur Update ke liye ek hi structure rakho)
  const finalPayload = {
    id: this.newRole.id, // Add ke time ye 0 hoga, Edit ke time actual ID
    name: this.newRole.name,
    status: this.newRole.status,
    permissions: finalPermissions
  };

  console.log("🚀 SENDING TO BACKEND:", finalPayload);

  // 3. API Call
  const request = this.isEditMode
    ? this.userService.updateRole(finalPayload) // Yahan bhi finalPayload bhejo
    : this.userService.addRole(finalPayload);

  request.subscribe({
    next: (res) => {
      this.loadRoles(); 
      this.closeModal();
      this.isLoading = false;
      
    },
    error: (err) => {
      this.isLoading = false;
      alert("Error saving role!");
    }
  });
}
toggleAdd(id: any) {
  this.toggleLogic(id + "_a");
}
togglePermission(id: any) { this.toggleLogic(id); }
  toggleView(id: any) { this.toggleLogic(id + "_v"); }
  toggleEdit(id: any) { this.toggleLogic(id + "_e"); }
  toggleDelete(id: any) { this.toggleLogic(id + "_d"); }

  private toggleLogic(key: any) {
    const index = this.selectedPermissionIds.indexOf(key);
    if (index > -1) {
      this.selectedPermissionIds.splice(index, 1);
    } else {
      this.selectedPermissionIds.push(key);
    }
    this.selectedPermissionIds = [...this.selectedPermissionIds];
    console.log("Current Selection:", this.selectedPermissionIds);
  }
  // --- 3. DELETE ROLE ---
  deleteRole(id: number) {
    console.log("Delete Role ID:", id);
    console.log('this is pemission',this.CheckPermissionService.permissions);
    this.roleIdToDelete = id;
    this.showPopup = true;
  }

  confirmDelete() {
    if (this.roleIdToDelete !== null) {
      this.userService.deleteRole(this.roleIdToDelete).subscribe({
        next: () => {
          this.loadRoles();
          this.roleIdToDelete = null;
          this.showPopup = false;
        },
        error: (err) => alert("Delete fail ho gaya!")
      });
    }
  }

  // --- UI Helpers ---
  openModal() {
  this.isEditMode = false;
  this.newRole = { id: 0, name: '', status: true };
  this.selectedPermissionIds = [];   // ← Important: Clear selections
  this.isModalOpen = true;
}

  closeModal() {
  this.isModalOpen = false;
  this.isEditMode = false;
  this.newRole = { id: 0, name: '', status: true };
  this.selectedPermissionIds = [];   // Clear
}

  cancelDelete() {
    this.roleIdToDelete = null;
    this.showPopup = false;
  }
// In user.service.ts
getRolePermissions(roleId: number) {
  return this.http.get<any[]>(`${environment.apiUrl}/role-permission/by-role/${roleId}`);
}
 editRole(role: any) {
  this.isEditMode = true;

  this.newRole = {
    id: role.id,
    name: role.name,
    status: role.status
  };

  this.selectedPermissionIds = [];

  // Open modal immediately for better UX
  this.isModalOpen = true;

  this.getRolePermissions(role.id).subscribe({
    next: (rolePerms: any[]) => {
      this.selectedPermissionIds = [];

      rolePerms.forEach(rp => {
        const pid = Number(rp.permissionId);   // Ensure it's number

        if (rp.actions && Array.isArray(rp.actions) && rp.actions.length > 0) {
          
          // ✅ MAIN PERMISSION CHECKBOX - Select if ANY action exists
          this.selectedPermissionIds.push(pid);

          // Select individual action checkboxes
          rp.actions.forEach((action: string) => {
            const act = action.toLowerCase().trim();

            if (act === 'add' || act === 'a') {
              this.selectedPermissionIds.push(pid + '_a');
            } 
            else if (act === 'view' || act === 'v') {
              this.selectedPermissionIds.push(pid + '_v');
            } 
            else if (act === 'edit' || act === 'e') {
              this.selectedPermissionIds.push(pid + '_e');
            } 
            else if (act === 'delete' || act === 'd') {
              this.selectedPermissionIds.push(pid + '_d');
            }
          });
        }
      });

      // Force update
      this.selectedPermissionIds = [...this.selectedPermissionIds];
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error("Failed to load role permissions:", err);
      this.cdr.detectChanges();
    }
  });
}
}
