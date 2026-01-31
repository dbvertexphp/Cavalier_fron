import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-attendance-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance-add.component.html',
})
export class AttendanceAddComponent {

  employeeSearch: string = '';
  filteredEmployees: any[] = [];
  selectedEmployee: any = null;

  showCheckInTime: boolean = false;

  attendance: any = {
    attendanceDate: this.today(),
    attendanceMode: '',
    checkInTime: '',
    checkInRemark: ''
  };

  employees = [
    {
      empId: 'EMP001',
      name: 'John Doe',
      department: 'HR',
      designation: 'Manager',
      profile: 'https://i.pravatar.cc/100?img=1'
    },
    {
      empId: 'EMP002',
      name: 'Jane Smith',
      department: 'IT',
      designation: 'Developer',
      profile: 'https://i.pravatar.cc/100?img=2'
    },
    {
      empId: 'EMP003',
      name: 'Alice Johnson',
      department: 'Finance',
      designation: 'Analyst',
      profile: 'https://i.pravatar.cc/100?img=3'
    },
    {
      empId: 'EMP004',
      name: 'Bob Brown',
      department: 'Sales',
      designation: 'Executive',
      profile: 'https://i.pravatar.cc/100?img=4'
    }
  ];

  searchEmployee() {
    const q = this.employeeSearch.toLowerCase().trim();

    if (!q) {
      this.filteredEmployees = [];
      return;
    }

    this.filteredEmployees = this.employees.filter(emp =>
      emp.name.toLowerCase().includes(q) ||
      emp.empId.toLowerCase().includes(q)
    );
  }

  selectEmployee(emp: any) {
    this.selectedEmployee = emp;
    this.employeeSearch = emp.name;
    this.filteredEmployees = [];
  }

  onModeChange() {
    if (this.attendance.attendanceMode === 'Manual') {
      this.showCheckInTime = true;
      this.attendance.checkInTime = this.currentTime();
    } else {
      this.showCheckInTime = false;
      this.attendance.checkInTime = '';
    }
  }

  submitAttendance() {
    if (!this.selectedEmployee) {
      alert('Please select employee');
      return;
    }

    const payload = {
      empId: this.selectedEmployee.empId,
      name: this.selectedEmployee.name,
      department: this.selectedEmployee.department,
      designation: this.selectedEmployee.designation,
      ...this.attendance
    };

    console.log('Attendance Saved:', payload);
    alert('Attendance saved successfully!');

    // RESET
    this.employeeSearch = '';
    this.selectedEmployee = null;
    this.filteredEmployees = [];
    this.showCheckInTime = false;

    this.attendance = {
      attendanceDate: this.today(),
      attendanceMode: '',
      checkInTime: '',
      checkInRemark: ''
    };
  }

  currentTime(): string {
    return new Date().toTimeString().slice(0, 5);
  }

  today(): string {
    return new Date().toISOString().split('T')[0];
  }
}
