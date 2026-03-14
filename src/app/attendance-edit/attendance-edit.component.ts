// attendance-edit.component.ts

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
  templateUrl: './attendance-edit.component.html'
})
export class AttendanceEditComponent implements OnInit {
  private apiUrl = `${environment.apiUrl}/Attendance`;
  loading: boolean = false;

  attendance: any = {}; // Initialize empty object

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchDetails(id);
    }
  }

  fetchDetails(id: string) {
    this.http.get<any>(`${this.apiUrl}/${id}`).subscribe({
      next: (res) => {
        // Date input format fix
        if (res.attendanceDate) {
          res.attendanceDate = res.attendanceDate.split('T')[0];
        }
        this.attendance = res;
      },
      error: (err) => console.error("Error fetching record", err)
    });
  }

  updateAttendance() {
    this.loading = true;
    // Backend PUT request usually needs the ID in URL and the body
    this.http.put(`${this.apiUrl}/${this.attendance.id}`, this.attendance).subscribe({
      next: () => {
        alert("Record Updated!");
        this.router.navigate(['/dashboard/attendance/list']);
      },
      error: (err) => {
        this.loading = false;
        console.error("Update error", err);
        alert("Update failed. Check if Backend allows PUT for this ID.");
      }
    });
  }

  cancel() { this.router.navigate(['/dashboard/attendance/list']); }
}