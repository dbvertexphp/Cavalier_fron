import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
export interface LeaveRequest {
  employeeName: string;
  type: string;
  fromDate: string;
  toDate: string;
  reason: string;
  initials: ''
  status: 'Pending' | 'Approved' | 'Rejected';
  hrComment?: string;
}
@Component({
  selector: 'app-leave-application',
  standalone: true,
  imports: [CommonModule, FormsModule,ReactiveFormsModule],
  templateUrl: './leave-application.component.html',
  styles: []
})

export class LeaveApplicationComponent {
// Test karne ke liye isko true ya false karein
  isHR: boolean = true; // true for HR view, false for Employee view BHAI SAMAJO TRU HAI TO HR VIEW HOGA FALSE HAI TO EMPLOYEE VIEW HOGA SAMAJ GAY HARSH BHAI 

  // Static Data (Jo backend se aayega)
  leaveForm = {
    employeeName: 'Mohit Rawat',
    designation: 'Executive',
    dept: 'Operations - Sea Import',
    empCode: 'CAV/061',
    joiningDate: '05/01/2023',
    leaveType: 'P/L (Privilege Leave)',
    fromDate: '',
    toDate: '',
    totalDays: 0,
    reason: '',
    initials: '',
    granted: null, // 'yes' or 'no'
    rejectionReason: ''
  };

  onSubmit() {
    console.log('Final Data:', this.leaveForm);
    alert(this.isHR ? 'Status Updated by HR' : 'Request Submitted by Employee');
  }
  // Print function
  printForm() {
    window.print();
  }
}