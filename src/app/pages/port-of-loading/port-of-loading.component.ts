import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-port-of-loading',
  imports: [CommonModule,FormsModule],
  templateUrl: './port-of-loading.component.html',
  styleUrl: './port-of-loading.component.css',
})
export class PortOfLoadingComponent {
isModalOpen = false;
  isEditMode = false;
  showPopup = false;
  selectedId: number | null = null;
  
  rolesList: any[] = []; 
  newRole = { id: 0, name: '', status: true };

  ngOnInit(): void {
    const savedData = localStorage.getItem('polData');
    if (savedData) {
      this.rolesList = JSON.parse(savedData);
    } else {
      this.rolesList = [
        { id: 1, name: 'Nhava Sheva (INNSA)', status: true },
        { id: 2, name: 'Mundra (INMUN)', status: true }
      ];
      this.saveToStorage();
    }
  }

  saveToStorage() {
    localStorage.setItem('polData', JSON.stringify(this.rolesList));
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
    if (this.selectedId !== null) {
      this.rolesList = this.rolesList.filter(r => r.id !== this.selectedId);
      this.saveToStorage();
      this.selectedId = null;
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
    this.selectedId = id;
    this.showPopup = true;
  }

  cancelDelete() {
    this.showPopup = false;
  }
}
