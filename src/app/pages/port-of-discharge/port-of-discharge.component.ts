import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-port-of-discharge',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './port-of-discharge.component.html',
  styleUrl: './port-of-discharge.component.css',
})
export class PortOfDischargeComponent implements OnInit {
  private apiUrl = 'http://localhost:5000/api/PortOfDischarge';

  isModalOpen = false;
  isEditMode = false;
  showPopup = false;
  selectedId: number | null = null;
  
  rolesList: any[] = []; 
  newRole = { id: 0, name: '', status: true };

  // ChangeDetectorRef ko inject kiya gaya hai
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchPorts();
  }

  // 1. GET ALL PORTS
  fetchPorts() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (res) => {
        this.rolesList = res;
        this.cdr.detectChanges(); // UI refresh
      },
      error: (err) => console.error('Error fetching PODs:', err)
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
          error: (err) => console.error('Error updating POD:', err)
        });
      } else {
        this.http.post(this.apiUrl, payload).subscribe({
          next: () => this.handleSuccess(),
          error: (err) => console.error('Error adding POD:', err)
        });
      }
    }
  }

  private handleSuccess() {
    this.fetchPorts();
    this.closeModal();
    this.cdr.detectChanges();
  }

  // 3. DELETE
  confirmDelete() {
    if (this.selectedId !== null) {
      this.http.delete(`${this.apiUrl}/${this.selectedId}`).subscribe({
        next: () => {
          this.fetchPorts();
          this.showPopup = false;
          this.selectedId = null;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error deleting POD:', err)
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
    this.selectedId = id; 
    this.showPopup = true; 
    this.cdr.detectChanges();
  }

  cancelDelete() { 
    this.showPopup = false; 
    this.cdr.detectChanges();
  }
}