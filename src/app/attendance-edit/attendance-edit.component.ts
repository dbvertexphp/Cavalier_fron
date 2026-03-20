import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-attendance-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './attendance-edit.component.html',
})
export class AttendanceEditComponent implements OnInit {
  private apiUrl = `${environment.apiUrl}/Attendance`;
  loading: boolean = false;

  attendance: any = {
    id: 0, empId: '', name: '', department: '', designation: '', branch: '',
    shift: 'Morning', attendanceDate: '', checkInTime: '', checkOutTime: '',
    workingHours: 0, attendanceStatus: 'Present', attendanceMode: 'Manual'
  };

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.fetchAttendance(id);
  }

  fetchAttendance(id: string) {
    this.http.get<any>(`${this.apiUrl}/${id}`).subscribe({
      next: (res) => {
        if (res.attendanceDate) res.attendanceDate = res.attendanceDate.split('T')[0];
        this.attendance = res;
      },
      error: (err) => console.error(err)
    });
  }

  updateAttendance() {
    this.loading = true;
    this.http.put(`${this.apiUrl}/${this.attendance.id}`, this.attendance).subscribe({
      next: () => { alert('Updated!'); this.router.navigate(['/dashboard/attendance/list']); },
      error: (err) => { this.loading = false; console.error(err); }
    });
  }

  cancel() { this.router.navigate(['/dashboard/attendance/list']); }
}