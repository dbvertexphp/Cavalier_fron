import { Component, OnInit } from '@angular/core';
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
  // Aapki API URL
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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getCargoTypes();
  }

  // --- 1. GET DATA FROM API ---
  getCargoTypes() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.rolesList = data;
      },
      error: (err) => console.error('Error fetching data:', err)
    });
  }

  // --- 2. SAVE / ADD DATA ---
  saveRole() {
    if (this.newRole.name.trim()) {
      if (this.isEditMode) {
        // Edit logic (Abhi sirf UI button hai as per your request)
        console.log("Edit Mode is active, but logic is skipped.");
        this.closeModal();
      } else {
        // Dynamic Add Logic
        const payload = {
          name: this.newRole.name,
          status: this.newRole.status
        };

        this.http.post(this.apiUrl, payload).subscribe({
          next: () => {
            this.getCargoTypes(); // Table refresh karein
            this.closeModal();
          },
          error: (err) => console.error('Error saving cargo:', err)
        });
      }
    }
  }

  // --- 3. DELETE DATA ---
  confirmDelete() {
    if (this.roleIdToDelete !== null) {
      this.http.delete(`${this.apiUrl}/${this.roleIdToDelete}`).subscribe({
        next: () => {
          this.getCargoTypes(); // Table refresh karein
          this.cancelDelete();
        },
        error: (err) => console.error('Error deleting cargo:', err)
      });
    }
  }

  // --- UI Helpers ---
  openModal() {
    this.isEditMode = false;
    this.newRole = { id: 0, name: '', status: true };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.newRole = { id: 0, name: '', status: true };
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
    // Sirf modal khulega, edit functionality static rakhi hai
    this.isEditMode = true;
    this.newRole = { ...role };
    this.isModalOpen = true;
  }
}