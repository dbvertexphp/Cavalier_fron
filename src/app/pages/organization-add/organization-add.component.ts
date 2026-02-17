import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http'; 

@Component({
  selector: 'app-organization-add',
  standalone: true,
  imports: [CommonModule, FormsModule,ReactiveFormsModule, HttpClientModule], 
  templateUrl: './organization-add.component.html',
  styleUrl: './organization-add.component.css',
})
export class OrganizationAddComponent implements OnInit {
  activeTab: string = 'general';
  selectedRoles: string[] = [];
  orgList: any[] = []; // List store karne ke liye

  // Form Variables
  orgName: string = '';
  alias: string = '';
  address: string = '';
  country: string = '';
  city: string = '';
  telephone: string = '';
  email: string = '';
  stateProvince: string = '';
  website: string = '';
  phoneNumber: string = '';
  postalCode: string = '';
  altPhoneNumber: string = '';
  fax: string = '';
  whatsAppNumber: string = '';
  salesPerson: string = '';
  collectionExec: string = '';

  // --- Dynamic Contact Detail Array ---
  contactList: any[] = [
    { name: '', designation: '', department: '', mobile: '', whatsapp: '', email: '' }
  ];

  branches = [
    { id: 1, name: 'Branch 01', isDefault: true },
    { id: 2, name: 'Branch 02', isDefault: false }
  ];
  selectedBranch: any = this.branches[0];

  constructor(private location: Location, private http: HttpClient) {}

  ngOnInit() {
    this.getOrgList(); // Load hote hi list mangao
  }

  // GET API Call
  getOrgList() {
    this.http.get('http://localhost:5000/api/Organization/list').subscribe({
      next: (data: any) => { this.orgList = data; },
      error: (err) => console.error('List fetch error:', err)
    });
  }

  // --- Contact Row Functions ---
  addContactRow() {
    this.contactList.push({
      name: '',
      designation: '',
      department: '',
      mobile: '',
      whatsapp: '',
      email: ''
    });
  }

  removeContactRow(index: number) {
    if (this.contactList.length > 1) {
      this.contactList.splice(index, 1);
    }
  }

  // --- Helper Functions ---
  isRoleSelected(role: string): boolean {
    return this.selectedRoles.includes(role);
  }

  toggleRole(role: string) {
    const index = this.selectedRoles.indexOf(role);
    if (index > -1) {
      this.selectedRoles.splice(index, 1);
    } else {
      this.selectedRoles.push(role);
      this.activeTab = role;
    }
  }

  saveOrg() {
    const payload = {
      orgName: this.orgName,
      alias: this.alias,
      branchName: this.selectedBranch?.name || '',
      address: this.address,
      country: this.country,
      city: this.city,
      telephone: this.telephone,
      email: this.email,
      stateProvince: this.stateProvince,
      website: this.website,
      phoneNumber: this.phoneNumber,
      postalCode: this.postalCode,
      altPhoneNumber: this.altPhoneNumber,
      fax: this.fax,
      whatsAppNumber: this.whatsAppNumber,
      salesPerson: this.salesPerson,
      collectionExec: this.collectionExec,
      contacts: this.contactList // Sending dynamic contact list to API
    };

    this.http.post('http://localhost:5000/api/Organization/save', payload).subscribe({
      next: () => {
        alert('Saved Successfully!');
        this.getOrgList(); // List refresh karo
      },
      error: (err) => alert('Error saving data')
    });
  }

  changeTab(tab: string) { this.activeTab = tab; }
  selectBranch(branch: any) { this.selectedBranch = branch; }
  cancel() { this.location.back(); }
  // --- ISKE NEECHE NAYA CODE ADD KAREIN (Existing code ko bina chede) ---

  // Nayi Row ke liye array
  contacts: any[] = [
    { contactName: '', designation: '', department: '', mobile: '', whatsapp: '', email: '' }
  ];

  // Nayi row add karne ka function
  addContact() {
    this.contacts.push({
      contactName: '',
      designation: '',
      department: '',
      mobile: '',
      whatsapp: '',
      email: ''
    });
  }

  // Row delete karne ka function (Optional but helpful)
  removeContact(index: number) {
    if (this.contacts.length > 1) {
      this.contacts.splice(index, 1);
    }
  }
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