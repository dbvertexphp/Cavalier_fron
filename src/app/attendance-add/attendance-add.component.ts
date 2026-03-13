import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-attendance-add',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './attendance-add.component.html',
})
export class AttendanceAddComponent implements OnInit {
  private userListApi = `${environment.apiUrl}/User/list?user_type=all`;
  private attendanceApi = `${environment.apiUrl}/Attendance`;

  employees: any[] = []; 
  filteredEmployees: any[] = [];
  selectedEmployee: any = null;
  employeeSearch: string = '';
  showCheckInTime: boolean = true; // Default true rakha hai manual ke liye
  loading: boolean = false;

  attendance: any = {
    attendanceDate: this.today(),
    attendanceMode: 'Manual',
    shift: 'Morning',
    checkInTime: this.currentTime(),
    attendanceStatus: 'Present',
    remark: ''
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadUsers(); 
  }

  loadUsers() {
    this.http.get<any[]>(this.userListApi).subscribe({
      next: (res) => {
        console.log("Users fetched:", res);
        // Agar response nested hai toh yahan data mapping check karlein
        this.employees = Array.isArray(res) ? res : [];
      },
      error: (err) => console.error("Fetch failed:", err)
    });
  }

  searchEmployee() {
    const q = this.employeeSearch ? this.employeeSearch.toLowerCase().trim() : '';
    if (!q) {
      this.filteredEmployees = [];
      return;
    }
    this.filteredEmployees = this.employees.filter(emp => {
      const fName = emp.firstName ? String(emp.firstName).toLowerCase() : '';
      const lName = emp.lastName ? String(emp.lastName).toLowerCase() : '';
      const code = emp.empCode ? String(emp.empCode).toLowerCase() : '';
      return fName.includes(q) || lName.includes(q) || code.includes(q);
    });
  }

  selectEmployee(emp: any) {
    this.selectedEmployee = emp;
    this.employeeSearch = `${emp.firstName} ${emp.lastName}`;
    this.filteredEmployees = [];
    this.showCheckInTime = true;
  }

  setMode(mode: string) {
    this.attendance.attendanceMode = mode;
    this.showCheckInTime = (mode === 'Manual' || mode === 'GPS');
  }

  submitAttendance() {
    if (!this.selectedEmployee) {
      alert("Please select an employee first");
      return;
    }
    this.loading = true;

    const payload = {
      empId: this.selectedEmployee.empCode || this.selectedEmployee.id.toString(),
      name: `${this.selectedEmployee.firstName} ${this.selectedEmployee.lastName}`,
      profile: this.selectedEmployee.photoPath || 'string',
      department: this.selectedEmployee.department || 'IT',
      designation: this.selectedEmployee.designation || 'Staff',
      branch: this.selectedEmployee.presCity || '',
      shift: this.attendance.shift,
      attendanceDate: new Date(this.attendance.attendanceDate).toISOString(),
      checkInTime: this.attendance.checkInTime,
      checkOutTime: "",
      workingHours: 0,
      attendanceStatus: this.attendance.attendanceStatus,
      lateStatus: "No",
      lateMinutes: 0,
      earlyExitStatus: "No",
      earlyExitMinutes: 0,
      overtimeHours: 0,
      overtimeApprovedBy: "No",
      attendanceMode: this.attendance.attendanceMode,
      remark: this.attendance.remark
    };

    this.http.post(this.attendanceApi, payload).subscribe({
      next: () => {
        this.loading = false;
        alert("Attendance Saved Successfully!");
        this.router.navigate(['/dashboard/attendance/list']);
      },
      error: (err) => {
        this.loading = false;
        console.error("Post Error:", err);
        alert("Error: " + (err.error?.message || "Server connection failed"));
      }
    });
  }

  cancel() { this.router.navigate(['/dashboard/attendance/list']); }
  currentTime(): string { return new Date().toTimeString().slice(0, 5); }
  today(): string { return new Date().toISOString().split('T')[0]; }
}