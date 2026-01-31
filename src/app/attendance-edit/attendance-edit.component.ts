import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-attendance-edit',
  imports: [CommonModule,FormsModule],
  templateUrl: './attendance-edit.component.html',
  styleUrl: './attendance-edit.component.css',
})
export class AttendanceEditComponent {
 attendance: any = {
    checkIn: '',
    checkOut: '',
    status: 'Present',
    late: 'No',
    halfDay: 'No',
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

    // 🔥 API call yaha lagegi
    // this.attendanceService.getAttendanceById(id).subscribe(...)
  }

  updateAttendance() {
    console.log('Updated Attendance:', this.attendance);

    // 🔥 API call yaha lagegi
    // this.attendanceService.updateAttendance(id, this.attendance)

    alert('Attendance Updated Successfully');
    this.router.navigate(['/dashboard/attendance']);
  }

  cancel() {
    this.router.navigate(['/dashboard/attendance']);
  }
}
