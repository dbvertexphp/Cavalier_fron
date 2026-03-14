import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
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
  showCheckInTime: boolean = true;
  loading: boolean = false;

  attendance: any = {
    attendanceDate: new Date().toISOString().split('T')[0],
    attendanceMode: 'Manual',
    shift: 'Morning',
    checkInTime: new Date().toTimeString().slice(0, 5),
    attendanceStatus: 'Present',
    remark: ''
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() { 
    this.loadUsers(); 
  }

  // 401 Unauthorized error se bachne ke liye token headers
  private getHeaders() {
    const token = localStorage.getItem('token'); 
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

 // 1. Pehle users load karne wali API (Yeh ngOnInit mein call hogi)
loadUsers() {
  const token = localStorage.getItem('token'); // Application tab mein jo token hai use uthayega
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  this.http.get<any>(this.userListApi, { headers }).subscribe({
    next: (res) => {
      // Backend agar { data: [...] } bhej raha hai toh res.data lein
      this.employees = Array.isArray(res) ? res : (res.data || []);
      console.log("Employees loaded successfully");
    },
    error: (err) => {
      console.error("401 Error: Token missing or invalid", err);
    }
  });
}

// 2. Search logic jo employees array ko filter karega
searchEmployee() {
  const q = this.employeeSearch.toLowerCase().trim();
  if (!q) { 
    this.filteredEmployees = []; 
    return; 
  }
  this.filteredEmployees = this.employees.filter(emp => 
    emp.firstName?.toLowerCase().includes(q) || 
    emp.empCode?.toString().toLowerCase().includes(q)
  );
}

// 3. User click kare toh ye function chalega (Isme API nahi aati)
selectEmployee(emp: any) {
  this.selectedEmployee = emp; // Yahan pura employee object save hota hai
  this.employeeSearch = `${emp.firstName} ${emp.lastName || ''}`; // Input mein naam dikhayega
  this.filteredEmployees = []; // Dropdown band kar dega
}

  // HTML buttons ke liye mode toggle function
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
    const headers = this.getHeaders();
    
    const payload = {
      empId: this.selectedEmployee.empCode,
      name: `${this.selectedEmployee.firstName} ${this.selectedEmployee.lastName || ''}`,
      department: this.selectedEmployee.department || 'General',
      designation: this.selectedEmployee.designation || 'Staff',
      branch: this.selectedEmployee.branch || 'Head Office',
      shift: this.attendance.shift,
      attendanceDate: this.attendance.attendanceDate,
      checkInTime: this.attendance.checkInTime,
      attendanceStatus: this.attendance.attendanceStatus,
      attendanceMode: this.attendance.attendanceMode,
      checkOutTime: "", 
      workingHours: 0
    };

    this.http.post(this.attendanceApi, payload, { headers }).subscribe({
      next: () => { 
        alert("Attendance Saved!"); 
        this.router.navigate(['/dashboard/attendance/list']); 
      },
      error: (err) => { 
        this.loading = false; 
        console.error("Save failed:", err);
        alert("Error saving attendance");
      }
    });
  }

  cancel() { this.router.navigate(['/dashboard/attendance/list']); }
}