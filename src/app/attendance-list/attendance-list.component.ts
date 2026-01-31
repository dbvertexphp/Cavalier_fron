import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-attendance-list',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './attendance-list.component.html',
  styleUrls: ['./attendance-list.component.css'],
})
export class AttendanceListComponent {
  constructor(private router:Router){}
  filterText: string = ''; // <-- filter ke liye

  attendance = [
    {
      empId: 'EMP001',
      name: 'Rahul Sharma',
      profile: 'https://i.pravatar.cc/40?img=12',
      department: 'HR',
      designation: 'Manager',
      attendanceDate: '2026-01-31',
      checkInTime: '09:05',
      checkOutTime: '18:15',
      workingHours: 9.2,
      attendanceStatus: 'Present',
      shift: 'Morning',
      lateStatus: 'Yes',
      halfDayStatus: 'No',
      overtimeHours: 1.5,
      attendanceMode: 'manual',
      remark: 'On time',
    },
    {
      empId: 'EMP002',
      name: 'Anita Verma',
      profile: 'https://i.pravatar.cc/40?img=13',
      department: 'Finance',
      designation: 'Executive',
      attendanceDate: '2026-01-31',
      checkInTime: '10:00',
      checkOutTime: '16:00',
      workingHours: 6.0,
      attendanceStatus: 'Half Day',
        shift: 'Evening',
      lateStatus: 'Yes',
      halfDayStatus: 'Yes',
      overtimeHours: 0,
      attendanceMode: 'gps',
      remark: 'Left early for personal work',
    },
  ];

  addAttendance() {
    this.router.navigate(['/dashboard/attendance/add']);
  }
  editAttendance() {
    this.router.navigate(['/dashboard/attendance/edit']);
  }

  // Filter logic
  get filteredAttendance() {
    if (!this.filterText) return this.attendance;
    return this.attendance.filter(att =>
      att.empId.toLowerCase().includes(this.filterText.toLowerCase()) ||
      att.name.toLowerCase().includes(this.filterText.toLowerCase()) ||
      att.department.toLowerCase().includes(this.filterText.toLowerCase()) ||
      att.attendanceDate.includes(this.filterText)
    );
  }
}
