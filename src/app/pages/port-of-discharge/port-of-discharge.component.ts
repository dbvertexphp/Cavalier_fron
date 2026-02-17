import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-port-of-discharge',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './port-of-discharge.component.html',
  styleUrl: './port-of-discharge.component.css',
})
export class PortOfDischargeComponent implements OnInit {
  private apiUrl = environment.apiUrl + '/PortOfDischarge';

  isModalOpen = false;
  isEditMode = false;
  showPopup = false;
  selectedId: number | null = null;
  
  rolesList: any[] = []; 
  newRole = { id: 0, name: '', status: true };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchPorts();
  }

  // 1. GET ALL PORTS
  fetchPorts() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (res) => this.rolesList = res,
      error: (err) => console.error('Error fetching PODs:', err)
    });
  }

  // 2. SAVE (ADD / EDIT)
  saveRole() {
    if (this.newRole.name.trim()) {
      // Data entry consistency ke liye hamesha uppercase
      const upperName = this.newRole.name.trim().toUpperCase();

      if (this.isEditMode) {
        const payload = { 
          id: this.newRole.id, 
          name: upperName, 
          status: this.newRole.status 
        };
        
        this.http.put(`${this.apiUrl}/${this.newRole.id}`, payload).subscribe({
          next: () => {
            this.fetchPorts();
            this.closeModal();
          },
          error: (err) => console.error('Error updating POD:', err)
        });
      } else {
        const payload = { 
          name: upperName, 
          status: this.newRole.status 
        };
        
        this.http.post(this.apiUrl, payload).subscribe({
          next: () => {
            this.fetchPorts();
            this.closeModal();
          }
        });
      }
    }
  }

  // 3. DELETE
  confirmDelete() {
    if (this.selectedId !== null) {
      this.http.delete(`${this.apiUrl}/${this.selectedId}`).subscribe(() => {
        this.fetchPorts();
        this.showPopup = false;
        this.selectedId = null;
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
  editRole(role: any) { 
    this.isEditMode = true; 
    this.newRole = { ...role }; 
    this.isModalOpen = true; 
  }
  deleteRole(id: number) { this.selectedId = id; this.showPopup = true; }
  cancelDelete() { this.showPopup = false; }
}