import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-port-of-discharge',
  imports: [CommonModule,FormsModule],
  templateUrl: './port-of-discharge.component.html',
  styleUrl: './port-of-discharge.component.css',
})
export class PortOfDischargeComponent {
isModalOpen = false;
  isEditMode = false;
  showPopup = false;
  selectedId: number | null = null;
  
  rolesList: any[] = []; 
  newRole = { id: 0, name: '', status: true };

  ngOnInit(): void {
  const savedData = localStorage.getItem('podData');
  
  if (savedData) {
    const parsedData = JSON.parse(savedData);
    // Purane data ko load karte waqt uppercase mein convert kar rahe hain
    this.rolesList = parsedData.map((item: any) => ({
      ...item,
      name: item.name ? item.name.toUpperCase() : ''
    }));
  } else {
    // Default POD Data ko uppercase mein set kiya hai
    this.rolesList = [
      { id: 1, name: 'PORT OF HAMBURG, GERMANY', status: true },
      { id: 2, name: 'PORT OF ROTTERDAM, NETHERLANDS', status: true }
    ];
    this.saveToStorage();
  }
}

  saveToStorage() {
    localStorage.setItem('podData', JSON.stringify(this.rolesList));
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
