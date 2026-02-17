import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-party-role',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './party-role.component.html',
  styleUrl: './party-role.component.css',
})
export class PartyRoleComponent implements OnInit {
  private apiUrl = environment.apiUrl + '/PartyRole';

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

  // ChangeDetectorRef ko inject kiya gaya hai
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
  this.fetchRoles();
}

  // 1. GET ALL ROLES
  fetchRoles() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (res) => {
        this.rolesList = res;
        this.cdr.detectChanges(); // UI Update
      },
      error: (err) => console.error('Error fetching roles:', err)
    });
  }

  // 2. SAVE (ADD / EDIT)
  saveRole() {
    if (this.newRole.name.trim()) {
      const upperName = this.newRole.name.trim().toUpperCase();

      const payload = { 
        id: this.isEditMode ? this.newRole.id : 0, 
        name: upperName, 
        status: this.newRole.status 
      };

      if (this.isEditMode) {
        this.http.put(`${this.apiUrl}/${this.newRole.id}`, payload).subscribe({
          next: () => this.handleSuccess(),
          error: (err) => console.error('Error updating role:', err)
        });
      } else {
        this.http.post(this.apiUrl, payload).subscribe({
          next: () => this.handleSuccess(),
          error: (err) => console.error('Error adding role:', err)
        });
      }
    }
  }

  private handleSuccess() {
    this.fetchRoles();
    this.closeModal();
    this.cdr.detectChanges();
  }

  // 3. DELETE
  confirmDelete() {
    if (this.roleIdToDelete !== null) {
      this.http.delete(`${this.apiUrl}/${this.roleIdToDelete}`).subscribe({
        next: () => {
          this.fetchRoles();
          this.cancelDelete();
          this.cdr.detectChanges();
        }
      });
    }
  }

  // --- UI Helpers ---
  openModal() {
    this.isEditMode = false;
    this.newRole = { id: 0, name: '', status: true };
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  closeModal() { 
    this.isModalOpen = false; 
    this.cdr.detectChanges();
  }

  deleteRole(id: number) { 
    this.roleIdToDelete = id; 
    this.showPopup = true; 
    this.cdr.detectChanges();
  }

  cancelDelete() { 
    this.showPopup = false; 
    this.cdr.detectChanges();
  }

  editRole(role: any) { 
    this.isEditMode = true; 
    this.newRole = { ...role }; 
    this.isModalOpen = true; 
    this.cdr.detectChanges();
  }
}