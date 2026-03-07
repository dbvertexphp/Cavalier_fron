import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-attendance-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance-add.component.html',
})
export class AttendanceAddComponent implements OnInit {
  private apiUrl = `${environment.apiUrl}/Attendance`;
  private empApiUrl = `${environment.apiUrl}/Employee`; // Employee API path

  employeeSearch: string = '';
  filteredEmployees: any[] = [];
  selectedEmployee: any = null;
  showCheckInTime: boolean = false;
  employees: any[] = []; 

  attendance: any = {
    attendanceDate: this.today(),
    attendanceMode: '',
    checkInTime: '',
    checkInRemark: '',
    shift: ''
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    // Sabse pehle Employees load karein taaki search kaam kare
    this.loadEmployees();
  }

  loadEmployees() {
    this.http.get<any[]>(this.empApiUrl).subscribe({
      next: (res) => {
        this.employees = res;
        console.log('Employees Loaded:', this.employees);
      },
      error: (err) => console.error('Error loading employees', err)
    });
  }

  searchEmployee() {
    const q = this.employeeSearch.toLowerCase().trim();
    if (!q) { 
      this.filteredEmployees = []; 
      return; 
    }
    // Employee name ya empId se search karein
    this.filteredEmployees = this.employees.filter(emp =>
      (emp.name && emp.name.toLowerCase().includes(q)) || 
      (emp.empId && emp.empId.toString().toLowerCase().includes(q))
    );
  }

  selectEmployee(emp: any) {
    this.selectedEmployee = emp;
    this.employeeSearch = emp.name;
    this.filteredEmployees = [];
  }

  onModeChange() {
    if (this.attendance.attendanceMode === 'Manual') {
      this.showCheckInTime = true;
      this.attendance.checkInTime = this.currentTime();
    } else {
      this.showCheckInTime = false;
      this.attendance.checkInTime = '';
    }
  }

  submitAttendance() {
    if (!this.selectedEmployee) { 
      alert('Please select an employee first!'); 
      return; 
    }

    // Backend DTO ke hisab se payload tyyar karein
    const payload = {
      empId: this.selectedEmployee.empId,
      name: this.selectedEmployee.name,
      department: this.selectedEmployee.department,
      designation: this.selectedEmployee.designation,
      profile: this.selectedEmployee.profile,
      attendanceDate: this.attendance.attendanceDate,
      attendanceMode: this.attendance.attendanceMode,
      checkInTime: this.attendance.checkInTime,
      remark: this.attendance.checkInRemark,
      shift: this.attendance.shift,
      attendanceStatus: 'Present' // Default status
    };

    this.http.post(this.apiUrl, payload).subscribe({
      next: () => {
        alert('Attendance saved successfully!');
        // ✅ Corrected navigation path
        this.router.navigate(['/dashboard/attendance/list']);
      },
      error: (err) => {
        console.error('Save Error:', err);
        alert('Error saving attendance: ' + (err.error?.message || err.message));
      }
    });
  }

  // ✅ Cancel button function
  cancel() {
    this.router.navigate(['/dashboard/attendance/list']);
  }

  currentTime(): string { return new Date().toTimeString().slice(0, 5); }
  today(): string { return new Date().toISOString().split('T')[0]; }
}