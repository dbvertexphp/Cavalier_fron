import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-leave-application',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-application.component.html'
})
export class LeaveApplicationComponent {
  // Excel (image_5c2d08.png) Header Fields
  empInfo = {
    name: 'Harsh rajput',
    designation: 'Executive',
    department: 'Operations- Sea Import',
    code: 'CAV/061',
    doj: '5/1/2023',
    year: '2025-26'
  };

  // Excel Leave Tables
  carryOver = { year: '2024-25', pl: 10 };
  currentYear = { year: '2025-26', pl: 12, cl: 6, sl: 6 };
  leaveBalance = { pl: 22, cl: 6, sl: 6 };

  // Form Fields (Grid Columns in Excel)
  leaveForm = {
    dateApplied: new Date().toISOString().split('T')[0],
    from: '',
    to: '',
    noOfDays: null,
    natureOfLeave: '',
    reason: '',
    employeeInitials: 'MR',
    leaveGranted: '', // Yes/No
    leaveNotGrantedReason: '',
    deptHeadSign: '',
    hrSign: ''
  };

  submitForm() {
    console.log("Final Leave Data:", this.leaveForm);
    alert("Application for " + this.empInfo.name + " submitted successfully!");
  }
}