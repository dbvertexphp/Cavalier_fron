import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-attendance-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance-add.component.html',
})
export class AttendanceAddComponent {
  constructor(private router: Router) {}

  employeeSearch: string = '';
  filteredEmployees: any[] = [];
  selectedEmployee: any = null;
  showCheckInTime: boolean = false;

  attendance: any = {
    attendanceDate: this.today(),
    attendanceMode: 'Manual',
    shift: 'Morning',
    checkInTime: this.currentTime(),
    attendanceStatus: 'Present',
    remark: ''
  };

  // List of employees (Including Rahul Sharma)
  employees = [
    { empId: 'EMP101', name: 'Rahul Sharma', profile: 'https://i.pravatar.cc/40?img=11', department: 'IT', designation: 'Sr. Developer', branch: 'Indore' },
    { empId: 'EMP102', name: 'Anita Verma', profile: 'https://i.pravatar.cc/40?img=5', department: 'HR', designation: 'Manager', branch: 'Mumbai' },
    { empId: 'EMP103', name: 'Vikram Singh', profile: 'https://i.pravatar.cc/40?img=12', department: 'Sales', designation: 'Executive', branch: 'Delhi' },
    { empId: 'EMP104', name: 'Sneha Rao', profile: 'https://i.pravatar.cc/40?img=20', department: 'Finance', designation: 'Analyst', branch: 'Indore' }
  ];

  searchEmployee() {
    const q = this.employeeSearch.toLowerCase().trim();
    if (!q) {
      this.filteredEmployees = [];
      return;
    }
    this.filteredEmployees = this.employees.filter(emp =>
      emp.name.toLowerCase().includes(q) || emp.empId.toLowerCase().includes(q)
    );
  }

  selectEmployee(emp: any) {
    this.selectedEmployee = emp;
    this.employeeSearch = emp.name;
    this.filteredEmployees = [];
    this.showCheckInTime = true; 
  }

  setMode(mode: string) {
    this.attendance.attendanceMode = mode;
    this.showCheckInTime = (mode === 'Manual' || mode === 'GPS');
    if (this.showCheckInTime) {
      this.attendance.checkInTime = this.currentTime();
    }
  }

  submitAttendance() {
    if (!this.selectedEmployee) return;

    const payload = {
      ...this.selectedEmployee,
      ...this.attendance
    };

    console.log('Final Payload Saved:', payload);
    alert(`Attendance for ${this.selectedEmployee.name} saved successfully!`);
    
    // Redirecting back to List page after Save
    this.router.navigate(['/dashboard/attendance']);
  }

  cancel() {
    // Corrected Path: 404 Fix
    this.router.navigate(['/dashboard/attendance/list']);
  }

  currentTime(): string {
    return new Date().toTimeString().slice(0, 5);
  }

  today(): string {
    return new Date().toISOString().split('T')[0];
  }
}