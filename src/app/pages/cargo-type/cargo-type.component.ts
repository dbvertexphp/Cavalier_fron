import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cargo-type',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './cargo-type.component.html',
  styleUrl: './cargo-type.component.css',
})
export class CargoTypeComponent implements OnInit {
  // Aapki API URL
  private apiUrl = environment.apiUrl + '/CargoType';

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

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  // ngOnInit(): void {
  //   // Refresh hone par LocalStorage se data load karein
  //   const savedData = localStorage.getItem('myCommodityData');
  //   if (savedData) {
  //     this.rolesList = JSON.parse(savedData);
  //   } else {
  //     // Agar first time hai to default data set karein
  //     this.rolesList = [
  //       { id: 1, name: 'Loose', status: true },
  //       { id: 2, name: 'ULD', status: true },
       
  //     ];
      
  //   }
  // }
ngOnInit(): void {
  this.getCargoTypes();
}


// Ek helper function taaki baar-baar save na likhna pade

  // --- Helper: LocalStorage mein data save karne ke liye ---
  
  // --- 1. GET DATA FROM API ---
  getCargoTypes() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.rolesList = data;
        this.cdr.detectChanges(); // UI update trigger
      },
      error: (err) => console.error('Error fetching data:', err)
    });
  }

  saveRole() {
    if (this.newRole.name && this.newRole.name.trim()) {
      const upperName = this.newRole.name.trim().toUpperCase();
      
      const payload = {
        id: this.isEditMode ? this.newRole.id : 0,
        name: upperName,
        status: this.newRole.status
      };

      if (this.isEditMode) {
        this.http.put(`${this.apiUrl}/${this.newRole.id}`, payload).subscribe({
          next: () => this.handleSuccess(),
          error: (err) => console.error('Error updating cargo:', err)
        });
      } else {
        this.http.post(this.apiUrl, payload).subscribe({
          next: () => this.handleSuccess(),
          error: (err) => console.error('Error saving cargo:', err)
        });
      }
    }
  }

  handleSuccess() {
    this.getCargoTypes();
    this.closeModal();
    this.cdr.detectChanges();
  }

  confirmDelete() {
    if (this.roleIdToDelete !== null) {
      this.http.delete(`${this.apiUrl}/${this.roleIdToDelete}`).subscribe({
        next: () => {
          this.getCargoTypes();
          this.cancelDelete();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error deleting cargo:', err)
      });
    }
  }

  openModal() {
    this.isEditMode = false;
    this.newRole = { id: 0, name: '', status: true };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.newRole = { id: 0, name: '', status: true };
    this.cdr.detectChanges();
  }

  deleteRole(id: number) {
    this.roleIdToDelete = id;
    this.showPopup = true;
  }

  cancelDelete() {
    this.roleIdToDelete = null;
    this.showPopup = false;
  }

  editRole(role: any) {
    this.isEditMode = true;
    this.newRole = { ...role };
    this.isModalOpen = true;
  }
}