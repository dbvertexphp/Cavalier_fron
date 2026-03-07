import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-attendance-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance-edit.component.html',
})
export class AttendanceEditComponent implements OnInit {
  private apiUrl = `${environment.apiUrl}/Attendance`;
  
  attendance: any = {
    id: 0,
    empId: '',
    name: '',
    profile: '',
    department: '',
    designation: '',
    attendanceDate: '',
    checkInTime: '',
    checkOutTime: '',
    attendanceStatus: 'Present',
    lateStatus: 'No',
    halfDayStatus: 'No',
    workingHours: 0,
    overtimeHours: 0,
    attendanceMode: 'manual',
    remark: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get(`${this.apiUrl}/${id}`).subscribe({
        next: (data: any) => {
          this.attendance = data;
          // Date format fix for <input type="date">
          if(this.attendance.attendanceDate) {
            this.attendance.attendanceDate = this.attendance.attendanceDate.split('T')[0];
          }
        },
        error: (err) => alert('Error loading attendance data')
      });
    }
  }

  updateAttendance() {
    this.http.put(`${this.apiUrl}/${this.attendance.id}`, this.attendance).subscribe({
      next: () => {
        alert('Attendance Updated Successfully');
        this.router.navigate(['/dashboard/attendance/list']);
      },
      error: (err) => alert('Update failed: ' + err.message)
    });
  }

  cancel() {
    this.router.navigate(['/dashboard/attendance/list']); 
  }
}