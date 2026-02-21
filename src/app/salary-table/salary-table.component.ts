import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-salary-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './salary-table.component.html'
})
export class SalaryTableComponent {
  // Navigation States
  activeTab: 'payroll' | 'training' | 'freelancing' | 'all' | 'none' = 'none';
  searchText: string = '';

  // Modal control variables
  showModal: boolean = false;
  selectedUser: any = null;

  // 1. Payroll Data (Static)
  payrollData = [
    { 
      name: 'Bharat Nandan Juyal', code: 'CAV/001', designation: 'Director', pan: 'AHAPJ5459K', doj: '1/16/2016', ctc: 195415, bonus: 0, paidDays: 28,
      monthly: { basic: 78166, hra: 39083, conv: 1600, spl: 68252, gross: 187101 },
      actual: { basic: 78166, hra: 39083, conv: 1600, spl: 68252, gross: 187101 },
      deductions: { esic: 0, epf: 1800, advance: 0, otherHold: 0, tds: 5000, total: 6800, arrearHold: 0, payable: 180301, bonusCalc: 0 }
    },
    { 
      name: 'Harsh Vardhan', code: 'CAV/002', designation: 'Manager', pan: 'BGPV8872L', doj: '05/12/2018', ctc: 95000, bonus: 5000, paidDays: 30,
      monthly: { basic: 40000, hra: 20000, conv: 1600, spl: 25000, gross: 86600 },
      actual: { basic: 40000, hra: 20000, conv: 1600, spl: 25000, gross: 86600 },
      deductions: { esic: 0, epf: 1800, advance: 0, otherHold: 0, tds: 2000, total: 3800, arrearHold: 0, payable: 82800, bonusCalc: 5000 }
    },
    { 
      name: 'Anjali Sharma', code: 'CAV/003', designation: 'Sr. Accountant', pan: 'CTRP9910M', doj: '10/01/2020', ctc: 65000, bonus: 0, paidDays: 25,
      monthly: { basic: 25000, hra: 12500, conv: 1600, spl: 15000, gross: 54100 },
      actual: { basic: 21000, hra: 10500, conv: 1300, spl: 12500, gross: 45300 },
      deductions: { esic: 340, epf: 1800, advance: 1000, otherHold: 0, tds: 0, total: 3140, arrearHold: 0, payable: 42160, bonusCalc: 0 }
    }
  ];

  // 2. Training Data (Static)
  trainingData = [
    { sNo: 1, name: 'Rahul Sharma', dob: '05/10/1998', doj: '01/02/2026', stipend: 15000, days: 26, totalAmount: 13000 },
    { sNo: 2, name: 'Priya Verma', dob: '12/08/1999', doj: '01/02/2026', stipend: 12000, days: 24, totalAmount: 9600 }
  ];

  // 3. Freelancing Data (Static)
  freelancingData = [
    { sNo: 1, name: 'Amit Verma', dob: '12/04/1995', doj: '10/02/2026', monthlyCharges: 25000, days: 15, totalAmount: 12500 },
    { sNo: 2, name: 'Sumit Negi', dob: '18/09/1993', doj: '12/02/2026', monthlyCharges: 40000, days: 10, totalAmount: 13333 }
  ];

  // Tab Switcher
  setTab(tabName: 'payroll' | 'training' | 'freelancing' | 'all') {
    this.activeTab = this.activeTab === tabName ? 'none' : tabName;
  }

  // Action Buttons Functions
  onImport() { console.log('Import triggered'); }
  onExport() { console.log('Export triggered'); }
  onPrint() { window.print(); }

  // Row Specific Actions
  onView(data: any) { 
    this.selectedUser = data;
    this.showModal = true;
    console.log('Viewing details for:', data.name);
  }

  closeModal() {
    this.showModal = false;
    this.selectedUser = null;
  }

  onDownload(data: any) { 
    console.log('Downloading slip for:', data.name);
    alert('Downloading slip for: ' + data.name);
  }
}