import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-commodity-type',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './commodity-type.component.html',
  styleUrl: './commodity-type.component.css',
})
export class CommodityTypeComponent implements OnInit {
  private apiUrl = 'http://localhost:5000/api/CommodityType'; // Check your port

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
  // Refresh hone par LocalStorage se data load karein
  const savedData = localStorage.getItem('myCommodityData');
  
  if (savedData) {
    const parsedData = JSON.parse(savedData);
    // Purane data ko load karte waqt uppercase mein badal rahe hain
    this.rolesList = parsedData.map((item: any) => ({
      ...item,
      name: item.name ? item.name.toUpperCase() : ''
    }));
  } else {
    // Default data ko uppercase mein set kiya hai
    this.rolesList = [
      { id: 1, name: 'HAZARD', status: true },
      { id: 2, name: 'NON HAZARD', status: true },
      { id: 3, name: 'PERISHABLE', status: false },
      { id: 4, name: 'GENERAL', status: false },
      { id: 5, name: 'TEMPERATURE CONTROLLED', status: false }
    ];
    
    // Default data ko bhi LocalStorage mein save kar dete hain
    this.saveToLocalStorage();
  }
}

// Data save karne ka helper function (agar aapke paas pehle se nahi hai)
saveToLocalStorage() {
  localStorage.setItem('myCommodityData', JSON.stringify(this.rolesList));
}

  // API se data lana
  fetchCommodities() {
    this.http.get<any[]>(this.apiUrl).subscribe(res => {
      this.rolesList = res;
    });
  }

  // Save (Add logic)
  saveRole() {
    if (this.newRole.name.trim()) {
      if (this.isEditMode) {
        // Edit logic skipped as per requirement
        this.closeModal();
      } else {
        const payload = { name: this.newRole.name, status: this.newRole.status };
        this.http.post(this.apiUrl, payload).subscribe(() => {
          this.fetchCommodities();
          this.closeModal();
        });
      }
    }
  }

  // Delete logic
  confirmDelete() {
    if (this.roleIdToDelete !== null) {
      this.http.delete(`${this.apiUrl}/${this.roleIdToDelete}`).subscribe(() => {
        this.fetchCommodities();
        this.showPopup = false;
        this.roleIdToDelete = null;
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
  deleteRole(id: number) { this.roleIdToDelete = id; this.showPopup = true; }
  cancelDelete() { this.showPopup = false; }
  editRole(role: any) { this.isEditMode = true; this.newRole = { ...role }; this.isModalOpen = true; }
}