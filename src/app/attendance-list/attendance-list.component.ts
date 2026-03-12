import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-attendance-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './attendance-list.component.html',
})
export class AttendanceListComponent implements OnInit {
  attendanceList: any[] = [];
  filterText: string = '';
  selectedMonth: string = (new Date().getMonth() + 1).toString().padStart(2, '0');
  selectedYear: string = '2026';
  fromDate: string = '';
  toDate: string = '';
  loading: boolean = false;

  private apiUrl = `${environment.apiUrl}/Attendance`;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadAttendance();
  }

  loadAttendance() {
    this.loading = true;
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (res) => {
        this.attendanceList = res;
        this.loading = false;
      },
      error: (err) => {
        console.error("Error fetching attendance:", err);
        this.loading = false;
      }
    });
  }

  get filteredAttendance() {
    return this.attendanceList.filter(att => {
      if (!att.attendanceDate) return false;

      const attDate = new Date(att.attendanceDate);
      const m = (attDate.getMonth() + 1).toString().padStart(2, '0');
      const y = attDate.getFullYear().toString();

      // 1. Search Filter (Name, ID, Dept)
      const matchesSearch = !this.filterText || 
        att.name?.toLowerCase().includes(this.filterText.toLowerCase()) ||
        att.empId?.toLowerCase().includes(this.filterText.toLowerCase()) ||
        att.department?.toLowerCase().includes(this.filterText.toLowerCase());

      // 2. Month/Year Filter
      const matchesMonthYear = m === this.selectedMonth && y === this.selectedYear;

      // 3. Date Range Filter
      let matchesRange = true;
      if (this.fromDate && this.toDate) {
        const d = att.attendanceDate.split('T')[0];
        matchesRange = d >= this.fromDate && d <= this.toDate;
      }

      return matchesSearch && matchesMonthYear && matchesRange;
    });
  }

  get stats() {
    const list = this.filteredAttendance;
    return {
      total: list.length,
      present: list.filter(a => a.attendanceStatus === 'Present').length,
      absent: list.filter(a => a.attendanceStatus === 'Absent').length,
      halfDay: list.filter(a => a.attendanceStatus === 'Half Day').length
    };
  }

  addAttendance() { 
    this.router.navigate(['/dashboard/attendance/add']); 
  }

  editAttendance(id: number) { 
    this.router.navigate(['/dashboard/attendance/edit', id]); 
  }
}