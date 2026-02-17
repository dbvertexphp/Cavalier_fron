import { Component, OnInit } from '@angular/core';
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
  private apiUrl = 'http://localhost:5000/api/Origin'; // Apne backend ka port check kar lena

  isModalOpen = false;
  isEditMode = false;
  showPopup = false;
  roleIdToDelete: number | null = null;
  
  rolesList: any[] = [];
  newRole = { id: 0, name: '', status: true };

<<<<<<< HEAD
 ngOnInit(): void {
  const savedData = localStorage.getItem('originData');
  
  if (savedData) {
    const parsedData = JSON.parse(savedData);
    // Purane saved data ko uppercase mein convert kar rahe hain
    this.rolesList = parsedData.map((item: any) => ({
      ...item,
      name: item.name ? item.name.toUpperCase() : ''
    }));
  } else {
    // Default Data ko uppercase mein set kiya hai
    this.rolesList = [
      { id: 1, name: 'MUMBAI, INDIA', status: true },
      { id: 2, name: 'DUBAI, UAE', status: true }
    ];
    this.saveToStorage();
=======
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchOrigins();
>>>>>>> 621835e844dbe242b940aab1ab2dd49df73b2e16
  }
}

  // 1. GET DATA
  fetchOrigins() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => this.rolesList = data,
      error: (err) => console.error('Error fetching origins:', err)
    });
  }

  // 2. SAVE (ADD)
  saveRole() {
    if (this.newRole.name.trim()) {
      if (this.isEditMode) {
        // Edit logic abhi skip hai
        this.closeModal();
      } else {
        const payload = { name: this.newRole.name, status: this.newRole.status };
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