import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-party-role',
  imports: [CommonModule,FormsModule],
  templateUrl: './party-role.component.html',
  styleUrl: './party-role.component.css',
})
export class PartyRoleComponent {
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

  constructor() {}

  ngOnInit(): void {
    // Refresh hone par LocalStorage se data load karein
    const savedData = localStorage.getItem('myCommodityData');
    if (savedData) {
      this.rolesList = JSON.parse(savedData);
    } else {
      // Agar first time hai to default data set karein
      this.rolesList = [
        { id: 1, name: 'Shipper', status: true },
        { id: 2, name: 'Consignee', status: true },
        { id: 3, name: 'Dest. Agent', status: false },
        { id: 4, name: 'Origin Agent', status: false },
        { id: 5, name: 'Customer', status: false }
      ];
      
    }
  }

  // --- Helper: LocalStorage mein data save karne ke liye ---
 

  // --- 1. SAVE (Add or Update) ---
  saveRole() {
    if (this.newRole.name.trim()) {
      if (this.isEditMode) {
        const index = this.rolesList.findIndex(r => r.id === this.newRole.id);
        if (index !== -1) {
          this.rolesList[index] = { ...this.newRole };
        }
      } else {
        const newId = this.rolesList.length > 0 ? Math.max(...this.rolesList.map(r => r.id)) + 1 : 1;
        this.rolesList.push({
          id: newId,
          name: this.newRole.name,
          status: this.newRole.status
        });
      }
       // Array update hote hi save karein
      this.closeModal();
    }
  }

  // --- 2. DELETE ---
  confirmDelete() {
    if (this.roleIdToDelete !== null) {
      this.rolesList = this.rolesList.filter(r => r.id !== this.roleIdToDelete);
     // Delete ke baad storage update karein
      this.roleIdToDelete = null;
      this.showPopup = false;
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
    this.isEditMode = true;
    this.newRole = { ...role };
    this.isModalOpen = true;
  }
}
