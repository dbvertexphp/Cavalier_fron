import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-attendance-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance-edit.component.html',
  styleUrl: './attendance-edit.component.css',
})
export class AttendanceEditComponent implements OnInit {
  // Initial structure for attendance to prevent undefined errors
  attendance: any = {
    empId: '',
    name: '',
    profile: 'assets/default-profile.png', // Default image placeholder
    department: '',
    designation: '',
    date: '',
    checkIn: '',
    checkOut: '',
    status: 'Present',
    late: 'No',
    halfDay: 'No',
    workingHours: 0,
    overtime: 0,
    mode: 'manual',
    remark: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Editing Attendance ID:', id);

    // 🔥 API call yaha lagegi data fetch karne ke liye
    // Example: this.attendanceService.getAttendanceById(id).subscribe(data => this.attendance = data);
  }

  updateAttendance() {
    console.log('Updated Attendance Data:', this.attendance);

    // 🔥 API call yaha lagegi update karne ke liye
    // this.attendanceService.updateAttendance(this.attendance).subscribe(...)

    alert('Attendance Updated Successfully');
    this.router.navigate(['/dashboard/attendance']);
  }

  cancel() {
    this.router.navigate(['/dashboard/attendance']);
  }
}