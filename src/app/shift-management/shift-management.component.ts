import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Shift {
  id: number;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  breakDuration: string;
  isOvertimeAllowed: boolean;
  gracePeriod: number; // minutes
  geoLock: boolean;
}

@Component({
  selector: 'app-shift-management',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './shift-management.component.html'
})
export class ShiftManagementComponent implements OnInit {
  // Views
  activeTab: 'list' | 'ai-insights' | 'rotation' = 'list';
  showModal = false;
  isEdit = false;

  // Master List with 10+ Demo Entries
  shiftList: Shift[] = [
    { id: 1, code: 'MOR-01', name: 'General Morning', startTime: '09:00', endTime: '18:00', breakDuration: '60', isOvertimeAllowed: true, gracePeriod: 15, geoLock: true },
    { id: 2, code: 'EVE-02', name: 'Evening Support', startTime: '14:00', endTime: '22:00', breakDuration: '45', isOvertimeAllowed: true, gracePeriod: 10, geoLock: true },
    { id: 3, code: 'NIT-03', name: 'Night Logistics', startTime: '22:00', endTime: '06:00', breakDuration: '30', isOvertimeAllowed: false, gracePeriod: 5, geoLock: true },
    { id: 4, code: 'FLX-04', name: 'Flexible Admin', startTime: '10:00', endTime: '19:00', breakDuration: '60', isOvertimeAllowed: true, gracePeriod: 30, geoLock: false },
    { id: 5, code: 'WKD-05', name: 'Weekend Special', startTime: '09:00', endTime: '21:00', breakDuration: '90', isOvertimeAllowed: true, gracePeriod: 10, geoLock: true }
  ];

  // AI Insights Data
  aiInsights = {
    shortageRisk: 'High (Night Shift)',
    burnoutAlert: '3 Employees (Finance)',
    fatiguePattern: 'Increasing in Night Shift',
    recommendedStaff: 5
  };

  currentShift: Shift = this.initShift();

  ngOnInit() {
    // Current User Context
    console.log('Shift Management Initialized for admin@cavalierlogistic.in');
  }

  initShift(): Shift {
    return { id: 0, code: '', name: '', startTime: '', endTime: '', breakDuration: '', isOvertimeAllowed: false, gracePeriod: 10, geoLock: true };
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
    if (confirm('AI Warning: Deleting this shift may affect 15+ schedules. Proceed?')) {
      this.shiftList = this.shiftList.filter(s => s.id !== id);
    }
  }

  closeModal() { this.showModal = false; }
}