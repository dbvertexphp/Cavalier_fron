import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-branch-department',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './branch-department.component.html'
})
export class BranchDepartmentComponent {
  departments = [
    { id: 1, name: 'SALES & MARKETING', count: 12 },
    { id: 2, name: 'HUMAN RESOURCES', count: 4 }
  ];

  isModalOpen = false;
  isEditMode = false;
  newDept: any = { id: null, name: '', count: 0 };

  openModal(dept?: any) {
    this.isEditMode = !!dept;
    this.newDept = dept ? { ...dept } : { id: Date.now(), name: '', count: 0 };
    this.isModalOpen = true;
  }

  closeModal() { this.isModalOpen = false; }

  saveDepartment() {
    if (this.isEditMode) {
      const index = this.departments.findIndex(d => d.id === this.newDept.id);
      this.departments[index] = { ...this.newDept };
    } else {
      this.departments.push({ ...this.newDept });
    }
    this.closeModal();
  }

  deleteDept(id: number) {
    if (confirm('Delete this department?')) {
      this.departments = this.departments.filter(d => d.id !== id);
    }
  }
}