import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-origin',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './origin.component.html',
  styleUrl: './origin.component.css'
})
export class OriginComponent implements OnInit {
  constructor(private http: HttpClient) {}
  private apiUrl = environment.apiUrl + '/Origin';

  isModalOpen = false;
  isEditMode = false;
  showPopup = false;
  roleIdToDelete: number | null = null;
  
  rolesList: any[] = [];
  newRole = { id: 0, name: '', status: true };

 ngOnInit(): void {
  this.fetchOrigins();
}

  // 1. GET DATA
  fetchOrigins() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => this.rolesList = data,
      error: (err) => console.error('Error fetching origins:', err)
    });
  }

  // 2. SAVE (ADD / EDIT)
  saveRole() {
    if (this.newRole.name.trim()) {
      // Logic: Save karne se pehle hamesha Uppercase karein
      const upperName = this.newRole.name.trim().toUpperCase();

      if (this.isEditMode) {
        const payload = { 
          id: this.newRole.id, 
          name: upperName, 
          status: this.newRole.status 
        };
        
        this.http.put(`${this.apiUrl}/${this.newRole.id}`, payload).subscribe({
          next: () => {
            this.fetchOrigins();
            this.closeModal();
          },
          error: (err) => console.error('Error updating origin:', err)
        });
      } else {
        const payload = { 
          name: upperName, 
          status: this.newRole.status 
        };
        
        this.http.post(this.apiUrl, payload).subscribe({
          next: () => {
            this.fetchOrigins();
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
          this.fetchOrigins();
          this.showPopup = false;
          this.roleIdToDelete = null;
        }
      });
    }
  }

  // UI Helpers
  openModal() {
    this.isEditMode = false;
    this.newRole = { id: 0, name: '', status: true };
    this.isModalOpen = true;
  }
  closeModal() { this.isModalOpen = false; }
  editRole(role: any) { this.isEditMode = true; this.newRole = { ...role }; this.isModalOpen = true; }
  deleteRole(id: number) { this.roleIdToDelete = id; this.showPopup = true; }
  cancelDelete() { this.showPopup = false; }
}