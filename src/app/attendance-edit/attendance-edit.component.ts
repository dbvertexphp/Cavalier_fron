import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-attendance-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance-edit.component.html',
  styleUrl: './attendance-edit.component.css',
})
export class AttendanceEditComponent implements OnInit {
  
  // Saare 10 points yahan professional structure mein hain
  attendance: any = {
    empId: '',
    name: '',
    profile: 'assets/default-profile.png',
    department: '',
    designation: '',
    branch: '',
    shift: 'Morning',
    date: '',
    checkIn: '',
    checkOut: '',
    workingHours: 0,
    status: 'Present',
    lateMinutes: 0,
    earlyExitMinutes: 0,
    overtime: 0,
    overtimeBy: '',
    mode: 'manual',
    remark: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // URL se ID nikalne ka sahi tarika
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.attendance.empId = id;
      console.log('Fetching Attendance for:', id);
      // Yahan API call aayegi: 
      // this.service.getById(id).subscribe(data => this.attendance = data);
    } else {
      console.error('No ID found in URL!');
    }
  }

  updateAttendance() {
    console.log('Saving Data:', this.attendance);
    // API Call logic yahan aayegi
    alert('Attendance Record Updated Successfully!');
    this.router.navigate(['/dashboard/attendance/list']);
  }

  cancel() {
    this.router.navigate(['/dashboard/attendance/list']);
  }
}