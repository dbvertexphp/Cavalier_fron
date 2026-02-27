import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http'; 
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-organization-add',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule], 
  templateUrl: './organization-add.component.html',
  styleUrl: './organization-add.component.css',
})
export class OrganizationAddComponent implements OnInit {
  activeTab: string = 'general';
  selectedRoles: string[] = [];
  organizations: any[] = [];

  // Form Variables
  searchQuery: string = ''; // Search box ke liye variable
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
    const url = `${environment.apiUrl}/Organization/list`;
    
    this.http.get(url).subscribe({
      next: (data: any) => { 
        this.organizations = data; 
        console.log('Data fetched successfully');
      },
      error: (err) => {
        console.error('List fetch error:', err);
        alert('Could not load organizations. Please check your connection.');
      }
    });
  }

  // --- Contact Row Functions ---
  addContactRow() {
    this.contactList.push({
      name: '', designation: '', department: '', mobile: '', whatsapp: '', email: ''
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
    const url = `${environment.apiUrl}/Organization/save`;

    // .NET Model properties matching (OrgName, Alias, etc.)
    const payload = {
      OrgName: this.orgName,
      Alias: this.alias,
      BranchName: this.selectedBranch?.name || '',
      Address: this.address,
      Country: this.country,
      City: this.city,
      Telephone: this.telephone,
      Email: this.email,
      StateProvince: this.stateProvince,
      Website: this.website,
      PostalCode: this.postalCode,
      WhatsAppNumber: this.whatsAppNumber,
      SalesPerson: this.salesPerson,
      CollectionExec: this.collectionExec,
      SelectedRoles: this.selectedRoles.join(','),
      // Backend ko Contacts key chahiye jaisa model mein hai
      Contacts: this.contacts.map(c => ({
        ContactName: c.contactName,
        Mobile: c.mobile,
        Whatsapp: c.whatsapp,
        Email: c.email
      }))
    };

    this.http.post(url, payload).subscribe({
      next: () => {
        alert('Saved Successfully!');
        this.getOrgList(); 
        this.isFormOpen = false; 
      },
      error: (err) => {
        console.error('Save Error:', err);
        alert('Error saving data.');
      }
    });
  }

  changeTab(tab: string) { this.activeTab = tab; }
  selectBranch(branch: any) { this.selectedBranch = branch; }
  
  cancel() {
    if (this.isFormOpen) {
      this.isFormOpen = false;
      this.getOrgList(); // Reset karne ke bajaye list reload karo
    } else {
      this.location.back();
    }
  }

  // --- NAYA CODE ADDED BELOW AS REQUESTED ---
  contacts: any[] = [
    { contactName: '', designation: '', department: '', mobile: '', whatsapp: '', email: '' }
  ];

  addContact() {
    this.contacts.push({
      contactName: '', designation: '', department: '', mobile: '', whatsapp: '', email: ''
    });
  }

  removeContact(index: number) {
    if (this.contacts.length > 1) {
      this.contacts.splice(index, 1);
    }
  }

  editOrg(org: any) {
    console.log('Editing:', org);
    this.isFormOpen = true;
  }

  isFormOpen: boolean = false; 

  openForm() {
    this.isFormOpen = true;
  }

  closeForm() {
    this.isFormOpen = false;
  }

  toggleForm() {
    this.isFormOpen = !this.isFormOpen;
  }   

  // Naya Search Function
searchOrganization() {
  const query = this.searchQuery ? this.searchQuery.trim() : '';

  if (!query) {
    this.organizations = [];
    return;
  }

  const url = `${environment.apiUrl}/Organization/search?orgName=${query}`;
  
  this.http.get(url).subscribe({
    next: (data: any) => {
      // Agar data milta hai toh array update hoga aur "Not Found" apne aap hat jayega
      this.organizations = data || [];
    },
    error: (err) => {
      console.error('Search error:', err);
      this.organizations = []; 
    }
  });
}

// 4. List click handler (Optional but recommended)
onOrgSelect(org: any) {
  this.searchQuery = org.orgName;
  this.organizations = [org]; // Sirf selected wala dikhao ya clear kar do
}
  deleteOrg(id: any) {
    if (confirm('Are you sure?')) {
      this.http.delete(`${environment.apiUrl}/Organization/delete/${id}`).subscribe({
        next: () => {
          alert('Deleted!');
          this.getOrgList();
        },
        error: (err) => console.error(err)
      });
    }
  }
}