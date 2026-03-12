import { Component, OnInit } from '@angular/core'; // OnInit add kiya
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // HttpClient add kiya
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-attendance-add',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule], // HttpClientModule zaroori hai
  templateUrl: './attendance-add.component.html',
})
export class AttendanceAddComponent implements OnInit {
  // URLs
  private attendanceApi = `${environment.apiUrl}/Attendance`;
  private employeeApi = `${environment.apiUrl}/Employees`; // Maan ke chal raha hoon ki Employees ki API hai

  employees: any[] = []; // Ab ye khali rahegi, API se bhari jayegi
  filteredEmployees: any[] = [];
  selectedEmployee: any = null;
  employeeSearch: string = '';
  showCheckInTime: boolean = false;
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
    this.loadEmployees(); // Page load hote hi employees le aao
  }

  // 1. Backend se Employees fetch karna
  loadEmployees() {
    // Agar aapke paas Employee Controller nahi hai, toh abhi purani list hi rakhein
    // Lekin production mein ye API se aayega
    this.http.get<any[]>(this.employeeApi).subscribe({
      next: (res) => this.employees = res,
      error: (err) => console.error("Employee fetch failed", err)
    });
  }

  searchEmployee() {
    const q = this.employeeSearch.toLowerCase().trim();
    if (!q) {
      this.filteredEmployees = [];
      return;
    }
    this.filteredEmployees = this.employees.filter(emp =>
      emp.name.toLowerCase().includes(q) || emp.empId.toLowerCase().includes(q)
    );
  }

  selectEmployee(emp: any) {
    this.selectedEmployee = emp;
    this.employeeSearch = emp.name;
    this.filteredEmployees = [];
    this.showCheckInTime = true;
  }

  setMode(mode: string) {
    this.attendance.attendanceMode = mode;
    this.showCheckInTime = (mode === 'Manual' || mode === 'GPS');
    if (this.showCheckInTime) {
      this.attendance.checkInTime = this.currentTime();
    }
  }

  // 2. Data ko sach mein Save karna (POST)
  submitAttendance() {
    if (!this.selectedEmployee) return;

    this.loading = true;

    // Payload banayein jo C# Model se match kare
    const payload = {
      empId: this.selectedEmployee.empId,
      name: this.selectedEmployee.name,
      profile: this.selectedEmployee.profile,
      department: this.selectedEmployee.department,
      designation: this.selectedEmployee.designation,
      branch: this.selectedEmployee.branch,
      shift: this.attendance.shift,
      attendanceDate: this.attendance.attendanceDate,
      checkInTime: this.attendance.checkInTime,
      attendanceStatus: this.attendance.attendanceStatus,
      attendanceMode: this.attendance.attendanceMode,
      remark: this.attendance.remark,
      // Nayi fields jo humne database mein dali thi unhe default bhej rahe hain
      checkOutTime: "",
      workingHours: 0,
      lateStatus: "No",
      lateMinutes: 0,
      earlyExitStatus: "No",
      earlyExitMinutes: 0,
      overtimeHours: 0,
      overtimeApprovedBy: "System"
    };

    this.http.post(this.attendanceApi, payload).subscribe({
      next: () => {
        this.loading = false;
        alert("Attendance Saved Successfully!");
        this.router.navigate(['/dashboard/attendance/list']);
      },
      error: (err) => {
        this.loading = false;
        console.error("Save Error:", err);
        alert("Error saving attendance. Check console.");
      }
    });
  }

  cancel() { this.router.navigate(['/dashboard/attendance/list']); }
  currentTime(): string { return new Date().toTimeString().slice(0, 5); }
  today(): string { return new Date().toISOString().split('T')[0]; }
}