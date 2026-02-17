import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-cargo-type',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './cargo-type.component.html',
  styleUrl: './cargo-type.component.css',
})
export class CargoTypeComponent implements OnInit {
  private apiUrl = 'http://localhost:5000/api/CargoType';

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

  ngOnInit(): void {
    this.getCargoTypes();
  }

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