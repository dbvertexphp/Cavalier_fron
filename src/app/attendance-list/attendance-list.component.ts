import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-attendance-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance-list.component.html',
})
export class AttendanceListComponent {
  constructor(private router: Router) {}
  
  filterText: string = '';
  fromDate: string = '';
  toDate: string = '';
  selectedMonth: string = (new Date().getMonth() + 1).toString().padStart(2, '0');
  selectedYear: string = '2026';

  attendance = [
    {
      empId: 'EMP101', name: 'Rahul Sharma', profile: 'https://i.pravatar.cc/40?img=11',
      department: 'IT', designation: 'Sr. Developer', branch: 'Indore', shift: 'Morning',
      attendanceDate: '2026-03-01', day: 'Sunday', month: '03', year: '2026',
      checkInTime: '09:05', checkOutTime: '18:15', workingHours: 9.1,
      attendanceStatus: 'Present', lateArrival: 'Yes', lateMinutes: 5, 
      earlyExit: 'No', earlyExitMinutes: 0, overtimeHours: 1.1, 
      overtimeApprovedBy: 'Manager-A', attendanceMode: 'Biometric', remark: 'System login'
    },
    {
      empId: 'EMP102', name: 'Anita Verma', profile: 'https://i.pravatar.cc/40?img=5',
      department: 'HR', designation: 'Manager', branch: 'Mumbai', shift: 'Morning',
      attendanceDate: '2026-03-02', day: 'Monday', month: '03', year: '2026',
      checkInTime: '10:00', checkOutTime: '16:00', workingHours: 6.0,
      attendanceStatus: 'Half Day', lateArrival: 'Yes', lateMinutes: 60, 
      earlyExit: 'Yes', earlyExitMinutes: 120, overtimeHours: 0, 
      overtimeApprovedBy: 'N/A', attendanceMode: 'GPS Checkin', remark: 'Doctor visit'
    },
    {
      empId: 'EMP103', name: 'Vikram Singh', profile: 'https://i.pravatar.cc/40?img=12',
      department: 'Sales', designation: 'Executive', branch: 'Delhi', shift: 'Evening',
      attendanceDate: '2026-03-03', day: 'Tuesday', month: '03', year: '2026',
      checkInTime: '14:00', checkOutTime: '23:00', workingHours: 9.0,
      attendanceStatus: 'Present', lateArrival: 'No', lateMinutes: 0, 
      earlyExit: 'No', earlyExitMinutes: 0, overtimeHours: 0, 
      overtimeApprovedBy: 'N/A', attendanceMode: 'Mobile App', remark: 'Client site'
    },
    {
      empId: 'EMP104', name: 'Sneha Rao', profile: 'https://i.pravatar.cc/40?img=20',
      department: 'Finance', designation: 'Analyst', branch: 'Indore', shift: 'Morning',
      attendanceDate: '2026-03-04', day: 'Wednesday', month: '03', year: '2026',
      checkInTime: '', checkOutTime: '', workingHours: 0,
      attendanceStatus: 'Absent', lateArrival: 'No', lateMinutes: 0, 
      earlyExit: 'No', earlyExitMinutes: 0, overtimeHours: 0, 
      overtimeApprovedBy: 'N/A', attendanceMode: 'N/A', remark: 'Uninformed'
    }
  ];

  addAttendance() { this.router.navigate(['/dashboard/attendance/add']); }
  
  editAttendance(id: string) { 
    this.router.navigate(['/dashboard/attendance/edit', id]); 
  }

  get filteredAttendance() {
    let filtered = this.attendance;
    if (this.filterText) {
      const search = this.filterText.toLowerCase();
      filtered = filtered.filter(att =>
        att.empId.toLowerCase().includes(search) ||
        att.name.toLowerCase().includes(search) ||
        att.department.toLowerCase().includes(search)
      );
    }
    return filtered;
  }

  // Live Stats Logic for Search
  get stats() {
    const list = this.filteredAttendance;
    return {
      present: list.filter(a => a.attendanceStatus === 'Present').length,
      absent: list.filter(a => a.attendanceStatus === 'Absent').length,
      halfDay: list.filter(a => a.attendanceStatus === 'Half Day').length,
      total: list.length
    };
  }

  exportToExcel() { console.log('Exporting to Excel...'); }
  exportToPDF() { console.log('Generating PDF...'); }
}