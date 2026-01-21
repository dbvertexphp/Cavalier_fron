import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-branch',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './branch.component.html',
  styleUrl: './branch.component.css',
})
export class BranchComponent{

  // branches: any[] = [];
  // loading = true;

  // constructor(private http: HttpClient) {}

  // ngOnInit(): void {
  //   this.getBranches();
  // }

  // getBranches() {
  //   this.http.get<any>('http://api.cavalierlogistic.graphicsvolume.com/api/branch/list')
  //     .subscribe({
  //       next: (res) => {
  //         // agar API direct array bhej rahi hai
  //         this.branches = res;
  //         this.loading = false;
  //         console.log(this.branches);
  //       },
  //       error: (err) => {
  //         console.error(err);
  //         this.loading = false;
  //       }
  //     });
  // }
  loading = false;

  branches = [
    {
      companyName: 'Alpha Corp',
      branchName: 'Alpha Main',
      city: 'Mumbai',
      state: 'Maharashtra',
      gstin: '27AAAAA0000A1Z5',
      isActive: 1,
      companyAlias: 'AC',
      contactNo: '9876543210',
      country: 'India',
      email: 'contact@alphacorp.com',
      faxNumber: '022-123456',
      gstCategory: 'Regular',
      postalCode: '400001',
      timeZone: 'IST'
    },
    {
      companyName: 'Beta Ltd',
      branchName: 'Beta HQ',
      city: 'Delhi',
      state: 'Delhi',
      gstin: '07BBBBB1111B1Z6',
      isActive: 0,
      companyAlias: 'BL',
      contactNo: '9123456780',
      country: 'India',
      email: 'info@betaltd.com',
      faxNumber: '011-987654',
      gstCategory: 'Composition',
      postalCode: '110001',
      timeZone: 'IST'
    },
    {
      companyName: 'Gamma Pvt',
      branchName: 'Gamma East',
      city: 'Kolkata',
      state: 'West Bengal',
      gstin: '19CCCCC2222C1Z7',
      isActive: 1,
      companyAlias: 'GP',
      contactNo: '9876501234',
      country: 'India',
      email: 'support@gammapvt.com',
      faxNumber: '033-234567',
      gstCategory: 'Regular',
      postalCode: '700001',
      timeZone: 'IST'
    },
    {
      companyName: 'Delta Inc',
      branchName: 'Delta North',
      city: 'Chennai',
      state: 'Tamil Nadu',
      gstin: '33DDDDD3333D1Z8',
      isActive: 1,
      companyAlias: 'DI',
      contactNo: '9876123456',
      country: 'India',
      email: 'hello@deltainc.com',
      faxNumber: '044-345678',
      gstCategory: 'Composition',
      postalCode: '600001',
      timeZone: 'IST'
    },
    {
      companyName: 'Epsilon Co',
      branchName: 'Epsilon West',
      city: 'Bengaluru',
      state: 'Karnataka',
      gstin: '29EEEEE4444E1Z9',
      isActive: 0,
      companyAlias: 'EC',
      contactNo: '9988776655',
      country: 'India',
      email: 'contact@epsilonco.com',
      faxNumber: '080-456789',
      gstCategory: 'Regular',
      postalCode: '560001',
      timeZone: 'IST'
    },
    {
      companyName: 'Gamma Pvt',
      branchName: 'Gamma East',
      city: 'Kolkata',
      state: 'West Bengal',
      gstin: '19CCCCC2222C1Z7',
      isActive: 1,
      companyAlias: 'GP',
      contactNo: '9876501234',
      country: 'India',
      email: 'support@gammapvt.com',
      faxNumber: '033-234567',
      gstCategory: 'Regular',
      postalCode: '700001',
      timeZone: 'IST'
    },
    {
      companyName: 'Delta Inc',
      branchName: 'Delta North',
      city: 'Chennai',
      state: 'Tamil Nadu',
      gstin: '33DDDDD3333D1Z8',
      isActive: 1,
      companyAlias: 'DI',
      contactNo: '9876123456',
      country: 'India',
      email: 'hello@deltainc.com',
      faxNumber: '044-345678',
      gstCategory: 'Composition',
      postalCode: '600001',
      timeZone: 'IST'
    },
    {
      companyName: 'Epsilon Co',
      branchName: 'Epsilon West',
      city: 'Bengaluru',
      state: 'Karnataka',
      gstin: '29EEEEE4444E1Z9',
      isActive: 0,
      companyAlias: 'EC',
      contactNo: '9988776655',
      country: 'India',
      email: 'contact@epsilonco.com',
      faxNumber: '080-456789',
      gstCategory: 'Regular',
      postalCode: '560001',
      timeZone: 'IST'
    }
  ];
  showCheckbox = false;
  selectionType: 'checkbox' | 'radio' | null = null;
  selectedUser: any = null; // for modify radio selection
  selectedUsers: any[] = []; // for delete checkbox selection

  addBranch() {
    alert('Working, please wait for some time…');
  }

  deleteBranch() {
    this.showCheckbox = true;
    this.selectionType = 'checkbox';
  }

  modifyBranch() {
    this.showCheckbox = true;
    this.selectionType = 'radio';
  }

  toggleSelection(user: any, event: any) {
    if (this.selectionType === 'checkbox') {
      if (event.target.checked) {
        this.selectedUsers.push(user);
      } else {
        this.selectedUsers = this.selectedUsers.filter(u => u !== user);
      }
    } else if (this.selectionType === 'radio') {
      this.selectedUser = user;
    }
  }

}
