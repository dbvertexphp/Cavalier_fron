import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-branch-designation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './branch-designation.component.html'
})
export class BranchDesignationComponent {
  designations = [
    { id: 1, name: 'MANAGER', level: 'L1' },
    { id: 2, name: 'DEVELOPER', level: 'L2' }
  ];

  isModalOpen = false;
  isEditMode = false;
  newDesig: any = { id: null, name: '', level: '' };

  openModal(desig?: any) {
    this.isEditMode = !!desig;
    this.newDesig = desig ? { ...desig } : { id: Date.now(), name: '', level: '' };
    this.isModalOpen = true;
  }

  closeModal() { this.isModalOpen = false; }

  saveDesignation() {
    if (this.isEditMode) {
      const index = this.designations.findIndex(d => d.id === this.newDesig.id);
      this.designations[index] = { ...this.newDesig };
    } else {
      this.designations.push({ ...this.newDesig });
    }
    this.closeModal();
  }

  deleteDesig(id: number) {
    if (confirm('Are you sure you want to delete this designation?')) {
      this.designations = this.designations.filter(d => d.id !== id);
    }
  }
}