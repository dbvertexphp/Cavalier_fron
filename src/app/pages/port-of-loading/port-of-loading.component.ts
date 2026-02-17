import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-port-of-loading',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './port-of-loading.component.html',
  styleUrl: './port-of-loading.component.css',
})
export class PortOfLoadingComponent implements OnInit {
  private apiUrl = 'http://localhost:5000/api/PortOfLoading';

  isModalOpen = false;
  isEditMode = false;
  showPopup = false;
  selectedId: number | null = null;
  
  rolesList: any[] = []; 
  newRole = { id: 0, name: '', status: true };

<<<<<<< HEAD
ngOnInit(): void {
  const savedData = localStorage.getItem('polData');
  
  if (savedData) {
    const parsedData = JSON.parse(savedData);
    // LocalStorage se data nikalte hi use uppercase mein convert kar rahe hain
    this.rolesList = parsedData.map((item: any) => ({
      ...item,
      name: item.name ? item.name.toUpperCase() : ''
    }));
  } else {
    // Default Data ko uppercase mein set kiya hai
    this.rolesList = [
      { id: 1, name: 'NHAVA SHEVA (INNSA)', status: true },
      { id: 2, name: 'MUNDRA (INMUN)', status: true }
    ];
    this.saveToStorage();
  }
}
  saveToStorage() {
    localStorage.setItem('polData', JSON.stringify(this.rolesList));
=======
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchPorts();
  }

  // 1. GET ALL PORTS
  fetchPorts() {
    this.http.get<any[]>(this.apiUrl).subscribe(res => {
      this.rolesList = res;
    });
>>>>>>> 621835e844dbe242b940aab1ab2dd49df73b2e16
  }

  // 2. SAVE (ADD)
  saveRole() {
    if (this.newRole.name.trim()) {
      if (this.isEditMode) {
        // Edit functionality ignored as per current request
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