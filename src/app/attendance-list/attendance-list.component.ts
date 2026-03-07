import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-attendance-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance-list.component.html',
  styleUrls: ['./attendance-list.component.css'],
})
export class AttendanceListComponent implements OnInit {
  private apiUrl = `${environment.apiUrl}/Attendance`;
  attendance: any[] = [];
  filterText: string = '';
  fromDate: string = '';
  toDate: string = '';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.fetchAttendance();
  }

  fetchAttendance() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => this.attendance = data,
      error: (err) => console.error('Failed to load attendance', err)
    });
  }

  addAttendance() {
    this.router.navigate(['/dashboard/attendance/add']);
  }

  editAttendance(id: number) {
    this.router.navigate(['/dashboard/attendance/edit', id]);
  }

  get filteredAttendance() {
    let filtered = this.attendance;

    if (this.filterText) {
      const q = this.filterText.toLowerCase();
      filtered = filtered.filter(att =>
        att.empId?.toLowerCase().includes(q) ||
        att.name?.toLowerCase().includes(q) ||
        att.department?.toLowerCase().includes(q)
      );
    }

    if (this.fromDate || this.toDate) {
      filtered = filtered.filter(att => {
        if (!att.attendanceDate) return false;
        const recordDate = new Date(att.attendanceDate).setHours(0,0,0,0);
        const start = this.fromDate ? new Date(this.fromDate).setHours(0,0,0,0) : null;
        const end = this.toDate ? new Date(this.toDate).setHours(0,0,0,0) : null;

        if (start && end) return recordDate >= start && recordDate <= end;
        if (start) return recordDate >= start;
        if (end) return recordDate <= end;
        return true;
      });
    }

    return filtered;
  }
}