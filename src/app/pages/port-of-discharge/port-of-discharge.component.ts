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
<<<<<<< HEAD
  const savedData = localStorage.getItem('podData');
  
  if (savedData) {
    const parsedData = JSON.parse(savedData);
    // Purane data ko load karte waqt uppercase mein convert kar rahe hain
    this.rolesList = parsedData.map((item: any) => ({
      ...item,
      name: item.name ? item.name.toUpperCase() : ''
    }));
  } else {
    // Default POD Data ko uppercase mein set kiya hai
    this.rolesList = [
      { id: 1, name: 'PORT OF HAMBURG, GERMANY', status: true },
      { id: 2, name: 'PORT OF ROTTERDAM, NETHERLANDS', status: true }
    ];
    this.saveToStorage();
=======
    this.fetchPorts();
>>>>>>> 621835e844dbe242b940aab1ab2dd49df73b2e16
  }
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