import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Shift {
  id: number;
  shiftName: string; // New: Shift ka naam alag
  employeeName: string; // New: Employee ka naam alag
  code: string;
  description: string;
  startTime: string;
  endTime: string;
  workingHours: number;
  breakStart: string;
  breakEnd: string;
  breakMinutes: number;
  lateAllowed: number;
  earlyExitAllowed: number;
  halfDayAfter: number; 
  weekOff: string;
  secondOff: string;
  shiftType: 'Fixed' | 'Rotational' | 'Night';
  geoLock: boolean;
  userPhoto: string;
  department: string;
}

@Component({
  selector: 'app-shift-management',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './shift-management.component.html'
})
export class ShiftManagementComponent implements OnInit {
  showModal = false;
  isEdit = false;

  shiftList: Shift[] = [
    { 
      id: 1, shiftName: 'General Morning', employeeName: 'Rahul Sharma', code: 'MS01', description: 'Morning Shift for Tech Team',
      startTime: '09:00', endTime: '18:00', workingHours: 9,
      breakStart: '13:00', breakEnd: '13:30', breakMinutes: 30,
      lateAllowed: 10, earlyExitAllowed: 5, halfDayAfter: 4,
      weekOff: 'Sunday', secondOff: 'Saturday', shiftType: 'Fixed', geoLock: true,
      userPhoto: 'https://i.pravatar.cc/150?img=11', department: 'Software Engineering'
    },
    { 
      id: 2, shiftName: 'Operations Evening', employeeName: 'Anita Verma', code: 'ES02', description: 'Evening Shift for Operations',
      startTime: '14:00', endTime: '22:00', workingHours: 8,
      breakStart: '18:00', breakEnd: '18:30', breakMinutes: 30,
      lateAllowed: 15, earlyExitAllowed: 0, halfDayAfter: 4,
      weekOff: 'Sunday', secondOff: 'None', shiftType: 'Rotational', geoLock: true,
      userPhoto: 'https://i.pravatar.cc/150?img=5', department: 'HR & Admin'
    }
  ];

  currentShift: Shift = this.initShift();

  ngOnInit() {}

  initShift(): Shift {
    return { 
      id: 0, shiftName: '', employeeName: '', code: '', description: '', 
      startTime: '09:00', endTime: '18:00', workingHours: 9,
      breakStart: '13:00', breakEnd: '13:30', breakMinutes: 30,
      lateAllowed: 10, earlyExitAllowed: 0, halfDayAfter: 4,
      weekOff: 'Sunday', secondOff: 'None', shiftType: 'Fixed', geoLock: true,
      userPhoto: 'https://i.pravatar.cc/150?u=new', department: 'General'
    };
  }

  addShift() {
    this.isEdit = false;
    this.currentShift = this.initShift();
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
      this.currentShift.id = Date.now();
      this.shiftList.push(this.currentShift);
    }
    this.showModal = false;
  }

  deleteShift(id: number) {
    if (confirm('Are you sure you want to delete this shift?')) {
      this.shiftList = this.shiftList.filter(s => s.id !== id);
    }
  }

  closeModal() { this.showModal = false; }
}