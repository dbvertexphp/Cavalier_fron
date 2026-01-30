import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class EmployeeListComponent {
  constructor(private router: Router) {}

  // Static Employee Data
  employees = [
    {
      empId: 'EMP001',
      name: 'Rohit Sharma',
      profile: 'https://i.pravatar.cc/40?img=12',
      department: 'HR',
      designation: 'HR Manager',
      gender: 'Male',
      dob: '15 Jan 1990',
      location: 'Mumbai HO',
      mobile: '9876543210',
      status: 'Active',
      joiningDate: '12 Sep 2024',
      documents: {
        idProof: 'ID123.pdf',
        offerLetter: 'OfferLetter.pdf',
        certificates: ['Cert1.pdf', 'Cert2.pdf']
      }
    },
    {
      empId: 'EMP002',
      name: 'Amit Verma',
      profile: 'https://i.pravatar.cc/40?img=32',
      department: 'Operations',
      designation: 'Supervisor',
      gender: 'Male',
      dob: '15 Jan 1992',
      location: 'Delhi Branch',
      mobile: '9123456789',
      status: 'On Probation',
      joiningDate: '01 Oct 2024',
      documents: {
        idProof: 'ID456.pdf',
        offerLetter: 'OfferLetter.pdf',
        certificates: ['CertA.pdf']
      }
    }
  ];

  // Modals
  selectedEmployee: any = null;
  showViewModal = false;
  showDocsModal = false;

  // Router function
  goToAddEmployee() {
    this.router.navigate(['/dashboard/employee/add']);
  }

  // Open View Modal
  viewEmployee(emp: any) {
    this.selectedEmployee = emp;
    this.showViewModal = true;
  }

  // Open Check Docs Modal
  checkDocs(emp: any) {
    this.selectedEmployee = emp;
    this.showDocsModal = true;
  }

  // Close Modals
  closeModal() {
    this.selectedEmployee = null;
    this.showViewModal = false;
    this.showDocsModal = false;
  }
}
