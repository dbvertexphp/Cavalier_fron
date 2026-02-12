import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-origin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './origin.component.html',
  styleUrl: './origin.component.css'
})
export class OriginComponent implements OnInit {
  isModalOpen = false;
  isEditMode = false;
  showPopup = false;
  roleIdToDelete: number | null = null;
  
  rolesList: any[] = [];
  newRole = { id: 0, name: '', status: true };

  ngOnInit(): void {
    const savedData = localStorage.getItem('originData');
    if (savedData) {
      this.rolesList = JSON.parse(savedData);
    } else {
      // Default Data
      this.rolesList = [
        { id: 1, name: 'Mumbai, India', status: true },
        { id: 2, name: 'Dubai, UAE', status: true }
      ];
      this.saveToStorage();
    }
  }

  saveToStorage() {
    localStorage.setItem('originData', JSON.stringify(this.rolesList));
  }

  saveRole() {
    if (this.newRole.name.trim()) {
      if (this.isEditMode) {
        const index = this.rolesList.findIndex(r => r.id === this.newRole.id);
        if (index !== -1) this.rolesList[index] = { ...this.newRole };
      } else {
        const newId = this.rolesList.length > 0 ? Math.max(...this.rolesList.map(r => r.id)) + 1 : 1;
        this.rolesList.push({ ...this.newRole, id: newId });
      }
      this.saveToStorage();
      this.closeModal();
    }
  }

  confirmDelete() {
    if (this.roleIdToDelete !== null) {
      this.rolesList = this.rolesList.filter(r => r.id !== this.roleIdToDelete);
      this.saveToStorage();
      this.roleIdToDelete = null;
      this.showPopup = false;
    }
  }

  openModal() {
    this.isEditMode = false;
    this.newRole = { id: 0, name: '', status: true };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  editRole(role: any) {
    this.isEditMode = true;
    this.newRole = { ...role };
    this.isModalOpen = true;
  }

  deleteRole(id: number) {
    this.roleIdToDelete = id;
    this.showPopup = true;
  }

  cancelDelete() {
    this.showPopup = false;
  }
}