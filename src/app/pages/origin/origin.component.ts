import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-origin',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './origin.component.html',
  styleUrl: './origin.component.css'
})
export class OriginComponent implements OnInit {
  private apiUrl = 'http://localhost:5000/api/Origin'; 

  isModalOpen = false;
  isEditMode = false;
  showPopup = false;
  roleIdToDelete: number | null = null;
  
  rolesList: any[] = [];
  newRole = { id: 0, name: '', status: true };

  // ChangeDetectorRef inject kiya gaya hai
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchOrigins();
  }

  // 1. GET DATA
  fetchOrigins() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.rolesList = data;
        this.cdr.detectChanges(); // Table refresh ke liye
      },
      error: (err) => console.error('Error fetching origins:', err)
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
          error: (err) => console.error('Error updating origin:', err)
        });
      } else {
        this.http.post(this.apiUrl, payload).subscribe({
          next: () => this.handleSuccess(),
          error: (err) => console.error('Error adding origin:', err)
        });
      }
    }
  }

  // Helper function for common logic
  private handleSuccess() {
    this.fetchOrigins();
    this.closeModal();
    this.cdr.detectChanges();
  }

  // 3. DELETE
  confirmDelete() {
    if (this.roleIdToDelete !== null) {
      this.http.delete(`${this.apiUrl}/${this.roleIdToDelete}`).subscribe({
        next: () => {
          this.fetchOrigins();
          this.showPopup = false;
          this.roleIdToDelete = null;
          this.cdr.detectChanges();
        }
      });
    }
  }

  // UI Helpers
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

  editRole(role: any) { 
    this.isEditMode = true; 
    this.newRole = { ...role }; 
    this.isModalOpen = true; 
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
}