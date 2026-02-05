import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service'; // Path sahi kar lena

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css',
})
export class RolesComponent implements OnInit {
  isModalOpen = false;
  isLoading = false;
  isEditMode = false; // Edit track karne ke liye
  rolesList: any[] = []; // Ab ye API se bharega

  // Form Model matching your Backend 'Role' class
  newRole = {
    id: 0,
    name: '',
    status: true
  };

  showPopup = false;
  roleIdToDelete: number | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  // --- 1. GET ROLES ---
  loadRoles() {
    this.userService.getRoles().subscribe({
      next: (data: any) => {
        this.rolesList = data;
      },
      error: (err) => console.error("Roles load nahi hue:", err)
    });
  }

  // --- 2. SAVE ROLE (Add or Update) ---
  saveRole() {
    if (this.newRole.name.trim()) {
      this.isLoading = true;
      
      // Logic decide karega add karna hai ya update
      const request = this.isEditMode 
        ? this.userService.updateRole(this.newRole) 
        : this.userService.addRole({ name: this.newRole.name });

      request.subscribe({
        next: (res) => {
          this.loadRoles(); // List refresh karein
          this.closeModal();
          this.isLoading = false;
        },
        error: (err) => {
          console.error("Role save nahi hua:", err);
          this.isLoading = false;
          alert("Error saving role!");
        }
      });
    } else {
      alert("Role ka naam likhna zaroori hai!");
    }
  }

  // --- 3. DELETE ROLE ---
  deleteRole(id: number) {
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
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.newRole = { id: 0, name: '', status: true };
  }

  cancelDelete() {
    this.roleIdToDelete = null;
    this.showPopup = false;
  }

  editRole(role: any) {
    this.isEditMode = true;
    // Data populate kar rahe hain modal mein
    this.newRole = { 
      id: role.id, 
      name: role.name, 
      status: role.status 
    };
    this.isModalOpen = true;
  }
}