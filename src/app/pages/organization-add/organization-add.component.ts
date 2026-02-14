import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http'; 

@Component({
  selector: 'app-organization-add',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule], 
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

  // --- YE FUNCTION ADD KAREIN (Errors hatane ke liye) ---
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
      collectionExec: this.collectionExec
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
}