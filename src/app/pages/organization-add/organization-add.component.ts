import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-organization-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './organization-add.component.html',
  styleUrl: './organization-add.component.css',
})
export class OrganizationAddComponent {
  activeTab: string = 'general';
  selectedRoles: string[] = []; 
  organization = {
  organizationName: '',
  alias: '',
  branchName: ''
};

  // Dynamic Branch List
  branches = [
    { id: 1, name: 'Branch 01', isDefault: true },
    { id: 2, name: 'Branch 02', isDefault: false }
  ];
  selectedBranch: any = this.branches[0];

  constructor(private location: Location) {}

  toggleRole(role: string) {
    const index = this.selectedRoles.indexOf(role);
    if (index > -1) {
      this.selectedRoles.splice(index, 1);
      // Agar koi role select nahi hai aur tab role wala tha, to vapas general pe le jao
      if (this.selectedRoles.length === 0 && !['account', 'billing', 'reg', 'IATA', 'integrations', 'general'].includes(this.activeTab)) {
        this.activeTab = 'general';
      }
    } else {
      this.selectedRoles.push(role);
      this.activeTab = role;
    }
  }

  isRoleSelected(role: string): boolean {
    return this.selectedRoles.includes(role);
  }

  changeTab(tabName: string) {
    this.activeTab = tabName;
  }

  selectBranch(branch: any) {
    this.selectedBranch = branch;
  }

 saveOrg() {

  alert('changed now');
}

  cancel() { this.location.back(); }
}