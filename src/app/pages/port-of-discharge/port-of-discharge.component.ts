import { Component, OnInit } from '@angular/core';
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

  // 2. SAVE (ADD)
  saveRole() {
    if (this.newRole.name.trim()) {
      if (this.isEditMode) {
        // Edit logic abhi skip kar rahe hain as per requirement
        this.closeModal();
      } else {
        const payload = { name: this.newRole.name, status: this.newRole.status };
        this.http.post(this.apiUrl, payload).subscribe(() => {
          this.fetchPorts();
          this.closeModal();
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
  editRole(role: any) { this.isEditMode = true; this.newRole = { ...role }; this.isModalOpen = true; }
  deleteRole(id: number) { this.selectedId = id; this.showPopup = true; }
  cancelDelete() { this.showPopup = false; }
}