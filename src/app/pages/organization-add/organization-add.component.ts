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

  saveOrg() { alert('Organization Saved Successfully!'); }
  cancel() { this.location.back(); }
}


// import { Component } from '@angular/core';
// import { CommonModule, Location } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-organization-add',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './organization-add.component.html',
//   styleUrl: './organization-add.component.css',
// })
// export class OrganizationAddComponent {
//   // Logic for toggling View
//   isFormOpen: boolean = false;
  
//   // List Data
//   organizations: any[] = [
//     { id: 1, name: 'Sample Organization', alias: 'SO', country: 'India', roles: ['shipper'] }
//   ];

//   // Form Data (to be bound via ngModel in HTML)
//   newOrg: any = {
//     name: '',
//     alias: '',
//     country: '',
//     city: '',
//     email: ''
//   };

//   activeTab: string = 'general';
//   selectedRoles: string[] = []; 
  
//   // Dynamic Branch List
//   branches = [
//     { id: 1, name: 'Branch 01', isDefault: true },
//     { id: 2, name: 'Branch 02', isDefault: false }
//   ];
//   selectedBranch: any = this.branches[0];

//   constructor(private location: Location) {}

//   // --- YOUR ORIGINAL LOGIC (UNTOUCHED) ---

//   toggleRole(role: string) {
//     const index = this.selectedRoles.indexOf(role);
//     if (index > -1) {
//       this.selectedRoles.splice(index, 1);
//       if (this.selectedRoles.length === 0 && !['account', 'billing', 'reg', 'IATA', 'integrations', 'general'].includes(this.activeTab)) {
//         this.activeTab = 'general';
//       }
//     } else {
//       this.selectedRoles.push(role);
//       this.activeTab = role;
//     }
//   }

//   isRoleSelected(role: string): boolean {
//     return this.selectedRoles.includes(role);
//   }

//   changeTab(tabName: string) {
//     this.activeTab = tabName;
//   }

//   selectBranch(branch: any) {
//     this.selectedBranch = branch;
//   }

//   // --- NEW METHODS FOR LIST MANAGEMENT ---

//   toggleForm() {
//     this.isFormOpen = !this.isFormOpen;
//     if (!this.isFormOpen) {
//       this.resetForm();
//     }
//   }

//   saveOrg() {
//     // Adding the content from the form to the table
//     const entry = {
//       id: this.organizations.length + 1,
//       name: this.newOrg.name || 'N/A',
//       alias: this.newOrg.alias || 'N/A',
//       country: this.newOrg.country || 'N/A',
//       roles: [...this.selectedRoles]
//     };
    
//     this.organizations.push(entry);
//     alert('Organization Saved Successfully!');
//     this.isFormOpen = false; // Close form and show list
//     this.resetForm();
//   }

//   resetForm() {
//     this.newOrg = { name: '', alias: '', country: '', city: '', email: '' };
//     this.selectedRoles = [];
//     this.activeTab = 'general';
//   }

//   editOrg(org: any) {
//     // Logic for editing can be added here
//     this.newOrg = { ...org };
//     this.selectedRoles = [...org.roles];
//     this.isFormOpen = true;
//   }

//   deleteOrg(id: number) {
//     this.organizations = this.organizations.filter(o => o.id !== id);
//   }

//   cancel() { 
//     if (this.isFormOpen) {
//       this.isFormOpen = false;
//     } else {
//       this.location.back(); 
//     }
//   }
// }