import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-salary-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './salary-table.component.html',
  styleUrls: ['./salary-table.component.css']
})
export class SalaryTableComponent {
  salaryMonth = "February-2026";
  
  payrollData = [
    {
      code: 'CAV/073',
      name: 'Harsh', // Name changed
      designation: 'Coordinator',
      pan: 'CYNPG1929D',
      doj: '7/1/2024',
      payable: 22202,
      bonus: 850,
      monthlyBreakdown: { basic: 15000, hra: 5000, conv: 2202 },
      employerShare: { esi: 0, eps: 850, epf: 374, admin: 51 }
    },
    {
      code: 'CAV/075',
      name: 'Dilip', // Name changed
      designation: 'Executive- Accounts',
      pan: 'IDJPK9862E',
      doj: '7/15/2024',
      payable: 23508,
      bonus: 900,
      monthlyBreakdown: { basic: 16000, hra: 5500, conv: 2008 },
      employerShare: { esi: 0, eps: 900, epf: 396, admin: 54 }
    }
  ];
}