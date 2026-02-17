import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-commodity-type',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './commodity-type.component.html',
  styleUrl: './commodity-type.component.css',
})
export class CommodityTypeComponent implements OnInit {
  private apiUrl = environment.apiUrl + '/CommodityType';

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
  this.fetchCommodities();
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
      // Logic: Save karne se pehle name ko Uppercase mein convert karein
      const upperName = this.newRole.name.trim().toUpperCase();

      if (this.isEditMode) {
        const payload = { 
          id: this.newRole.id, 
          name: upperName, 
          status: this.newRole.status 
        };
        // Edit API call
        this.http.put(`${this.apiUrl}/${this.newRole.id}`, payload).subscribe(() => {
          this.fetchCommodities();
          this.closeModal();
        });
      } else {
        const payload = { 
          name: upperName, 
          status: this.newRole.status 
        };
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
  editRole(role: any) { 
    this.isEditMode = true; 
    this.newRole = { ...role }; 
    this.isModalOpen = true; 
  }
}