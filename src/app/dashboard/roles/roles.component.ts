import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Role {
  id?: number;
  name: string;
  perms?: string[];
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css'], // fixed typo: styleUrls
})
export class RolesComponent {
  isModalOpen = false;
  rolesList: Role[] = [];
  newRole: Role = { name: '' };

  showPopup = false;
  roleIndexToDelete: number | null = null;

  constructor(private http: HttpClient) {
    this.loadRoles(); // Load roles on init
  }

  // Load roles from API
  loadRoles() {
    this.http.get<Role[]>(`${environment.apiUrl}/Role`).subscribe({
      next: (res) => this.rolesList = res,
      error: (err) => console.error('Error loading roles:', err)
    });
  }

  // Open modal
  openModal() {
    this.isModalOpen = true;
  }

  // Close modal & reset
  closeModal() {
    this.isModalOpen = false;
    this.newRole.name = '';
  }

  // Add a new role
  addRole() {
    if (!this.newRole.name.trim()) {
      alert("Enter Role Name!");
      return;
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.post<Role>(`${environment.apiUrl}/Role`, this.newRole, { headers })
      .subscribe({
        next: (res) => {
          this.rolesList.unshift(res); // Add role to local list
           this.isModalOpen = false;
        },
        error: (err) => console.error('Error creating role:', err)
      });
  }

  // Edit role (optional, can open modal for editing)
  editRole(role: Role) {
    alert('Editing: ' + role.name);
    // Could open modal prefilled with role.name if needed
  }

  // Delete Role
  deleteRole(index: number) {
    this.roleIndexToDelete = index;
    this.showPopup = true;
  }

  confirmDelete() {
    if (this.roleIndexToDelete !== null) {
      const roleToDelete = this.rolesList[this.roleIndexToDelete];
      this.http.delete(`${environment.apiUrl}/Role/${roleToDelete.id}`)
        .subscribe({
          next: () => {
            this.rolesList.splice(this.roleIndexToDelete!, 1);
            this.roleIndexToDelete = null;
            this.showPopup = false;
          },
          error: (err) => console.error('Error deleting role:', err)
        });
    } else {
      this.showPopup = false;
    }
  }

  cancelDelete() {
    this.roleIndexToDelete = null;
    this.showPopup = false;
  }
}
