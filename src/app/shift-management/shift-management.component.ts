import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  breakDuration?: string;
}
@Component({
  selector: 'app-shift-management',
  imports: [FormsModule,CommonModule],
  templateUrl: './shift-management.component.html',
  styleUrl: './shift-management.component.css',
})
export class ShiftManagementComponent {
 shiftList: Shift[] = [
    { id: 1, name: 'Morning', startTime: '09:00 AM', endTime: '05:00 PM', breakDuration: '1 hour' },
    { id: 2, name: 'Evening', startTime: '02:00 PM', endTime: '10:00 PM' },
  ];

  showModal = false;
  isEdit = false;
  currentShift: Shift = { id: 0, name: '', startTime: '', endTime: '', breakDuration: '' };

  addShift() {
    this.isEdit = false;
    this.currentShift = { id: 0, name: '', startTime: '', endTime: '', breakDuration: '' };
    this.showModal = true;
  }

  editShift(shift: Shift) {
    this.isEdit = true;
    this.currentShift = { ...shift };
    this.showModal = true;
  }

  saveShift() {
    if (this.isEdit) {
      const index = this.shiftList.findIndex(s => s.id === this.currentShift.id);
      if (index > -1) this.shiftList[index] = this.currentShift;
    } else {
      this.currentShift.id = Date.now(); // simple id
      this.shiftList.push(this.currentShift);
    }
    this.showModal = false;
  }

  deleteShift(id: number) {
    if (confirm('Do you want to delete this shift?')) {
      this.shiftList = this.shiftList.filter(s => s.id !== id);
    }
  }

  closeModal() {
    this.showModal = false;
  }
}
