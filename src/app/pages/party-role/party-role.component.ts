import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-party-role',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './party-role.component.html',
  styleUrl: './party-role.component.css',
})
export class PartyRoleComponent implements OnInit {
  private apiUrl = 'http://localhost:5000/api/PartyRole';

  isModalOpen = false;
  isEditMode = false;
  rolesList: any[] = [];

  newRole = {
    id: 0,
    name: '',
    status: true
  };

  showPopup = false;
  roleIdToDelete: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchRoles();
  }

  // 1. GET ALL ROLES
  fetchRoles() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (res) => this.rolesList = res,
      error: (err) => console.error('Error fetching roles:', err)
    });
  }

  // 2. SAVE (ADD)
  saveRole() {
    if (this.newRole.name.trim()) {
      if (this.isEditMode) {
        // Edit logic skipped as per requirement
        this.closeModal();
      } else {
        const payload = { name: this.newRole.name, status: this.newRole.status };
        this.http.post(this.apiUrl, payload).subscribe({
          next: () => {
            this.fetchRoles();
            this.closeModal();
          }
        });
      }
    }
  }

  // 3. DELETE
  confirmDelete() {
    if (this.roleIdToDelete !== null) {
      this.http.delete(`${this.apiUrl}/${this.roleIdToDelete}`).subscribe({
        next: () => {
          this.fetchRoles();
          this.cancelDelete();
        }
      });
    }
  }

  // --- UI Helpers ---
  openModal() {
    this.isEditMode = false;
    this.newRole = { id: 0, name: '', status: true };
    this.isModalOpen = true;
  }
  closeModal() { this.isModalOpen = false; }
  deleteRole(id: number) { this.roleIdToDelete = id; this.showPopup = true; }
  cancelDelete() { this.showPopup = false; }
  editRole(role: any) { this.isEditMode = true; this.newRole = { ...role }; this.isModalOpen = true; }
}