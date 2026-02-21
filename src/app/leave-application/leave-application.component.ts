import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-leave-application',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-application.component.html',
  styleUrls: ['./leave-application.component.css']
})
export class LeaveApplicationComponent {
  // Excel (image_d36c87.png) ke mutabik data
  empInfo = {
    name: 'Mohit Rawat',
    code: 'CAV/061',
    desig: 'Executive',
    dept: 'Operations- Sea Import',
    doj: '5/1/2023'
  };

  // Leave Balance Section
  balances = { pl: 22, cl: 6, sl: 6 };

  newLeave = {
    dateApplied: new Date().toISOString().split('T')[0],
    from: '',
    to: '',
    days: 0,
    type: '',
    reason: '',
    initials: 'MR'
  };

  submitLeave() {
    alert('Leave Application Form Submitted Successfully!');
  }
}