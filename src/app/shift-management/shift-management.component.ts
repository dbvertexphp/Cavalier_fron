import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface Shift {
  id: number;
  shiftName: string;
  employeeName: string;
  employeeId: number; // API ke liye zaroori hai
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
  userPhoto?: string;
  department?: string;
}

@Component({
  selector: 'app-shift-management',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './shift-management.component.html'
})
export class ShiftManagementComponent implements OnInit {
  private shiftApi = 'http://localhost:5000/api/Shifts';
  private userApi = 'http://localhost:5000/api/User/adminlist?user_type=all';

  showModal = false;
  isEdit = false;
  shiftList: Shift[] = [];
  
  // Employee Selection logic
  employees: any[] = [];
  filteredEmployees: any[] = [];
  employeeSearch: string = '';

  currentShift: Shift = this.initShift();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchShifts();
    this.fetchEmployees();
  }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  fetchShifts() {
    this.http.get<Shift[]>(this.shiftApi, { headers: this.getHeaders() }).subscribe({
      next: (res) => this.shiftList = res,
      error: (err) => console.error("Shift load error", err)
    });
  }

  fetchEmployees() {
    this.http.get<any>(this.userApi, { headers: this.getHeaders() }).subscribe({
      next: (res) => this.employees = Array.isArray(res) ? res : (res.data || []),
      error: (err) => console.error("Employee load error", err)
    });
  }

  searchEmployee() {
    const q = this.employeeSearch.toLowerCase().trim();
    if (!q) { this.filteredEmployees = []; return; }
    this.filteredEmployees = this.employees.filter(emp => 
      emp.firstName?.toLowerCase().includes(q) || emp.empCode?.toString().includes(q)
    );
  }

  selectEmployee(emp: any) {
    this.currentShift.employeeName = `${emp.firstName} ${emp.lastName || ''}`;
    this.currentShift.employeeId = emp.id;
    this.currentShift.department = emp.departmentName || 'General';
    this.employeeSearch = this.currentShift.employeeName;
    this.filteredEmployees = [];
  }

  initShift(): Shift {
    return { 
      id: 0, shiftName: '', employeeName: '', employeeId: 0, code: '', description: '', 
      startTime: '09:00', endTime: '18:00', workingHours: 9,
      breakStart: '13:00', breakEnd: '13:30', breakMinutes: 30,
      lateAllowed: 10, earlyExitAllowed: 0, halfDayAfter: 4,
      weekOff: 'Sunday', secondOff: 'None', shiftType: 'Fixed', geoLock: true,
      department: 'General'
    };
  }

  addShift() {
    this.isEdit = false;
    this.currentShift = this.initShift();
    this.employeeSearch = '';
    this.showModal = true;
  }

  editShift(shift: Shift) {
    this.isEdit = true;
    this.currentShift = { ...shift };
    this.employeeSearch = shift.employeeName;
    this.showModal = true;
  }
// ... baki imports same rahenge

saveShift() {
  const token = localStorage.getItem('cavalier_token');
  if (!token) {
    alert("Session expired. Please login again.");
    return;
  }

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  // Backend validation fix:
  // 1. 'shiftName' ko 'name' mein map kiya hai
  // 2. 'code' field ko ensure kiya hai
  const payload: any = { 
    ...this.currentShift,
    name: this.currentShift.shiftName, // Mapper for 'Name' error
    code: this.currentShift.code || "SFT01", // Default code agar khali ho
    employeeId: Number(this.currentShift.employeeId),
    workingHours: Number(this.currentShift.workingHours),
    breakMinutes: Number(this.currentShift.breakMinutes),
    lateAllowed: Number(this.currentShift.lateAllowed),
    earlyExitAllowed: Number(this.currentShift.earlyExitAllowed),
    halfDayAfter: Number(this.currentShift.halfDayAfter),
    shiftType: this.currentShift.shiftType || 'Fixed'
  };

  if (!this.isEdit) {
    delete payload.id; 
  }

  if (this.isEdit) {
    this.http.put(`${this.shiftApi}/${payload.id}`, payload, { headers }).subscribe({
      next: () => { this.fetchShifts(); this.closeModal(); alert("Shift Updated!"); },
      error: (err) => { console.error("Edit Error:", err.error); }
    });
  } else {
    this.http.post(this.shiftApi, payload, { headers }).subscribe({
      next: () => { this.fetchShifts(); this.closeModal(); alert("Shift Saved!"); },
      error: (err) => { 
        // Agar abhi bhi error aaye toh console khol kar object check karein
        console.log("Detailed Validation Errors:", err.error.errors);
        alert("Validation Failed. Please check Shift Code and Shift Name.");
      }
    });
  }
}
  deleteShift(id: number) {
    if (confirm('Are you sure?')) {
      this.http.delete(`${this.shiftApi}/${id}`, { headers: this.getHeaders() }).subscribe(() => this.fetchShifts());
    }
  }

  closeModal() { this.showModal = false; }
}