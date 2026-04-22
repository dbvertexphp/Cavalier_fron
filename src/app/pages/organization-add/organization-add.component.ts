import { Permission } from './../employee/employee.component';
import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http'; 
import { environment } from '../../../environments/environment';
import { any } from '@amcharts/amcharts5/.internal/core/util/Array';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { moveItemInArray, transferArrayItem, CdkDragDrop } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop'; // 👈 Ye zaroori hai // Ye import ensure kar lena
import { CheckPermissionService } from '../../services/check-permission.service';

@Component({
  selector: 'app-organization-add',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule,DragDropModule], 
  templateUrl: './organization-add.component.html',
  styleUrl: './organization-add.component.css',
})
export class OrganizationAddComponent implements OnInit {
  lineOfBusinessList: any[] = [];
selectedLineOfBusiness: any[] = [];        // Multiple select ke liye array
showLobDropdown: boolean = false;
  isEditMode: boolean = false;
  hasSavedOrg: boolean = false;
  PermissionID:any;
selectedBranchIndex: number = -1;
@ViewChild('lobDropdownContainer', { static: false }) lobDropdownContainer!: ElementRef;
searchFilters: any = {
  orgCode: '',
  orgName: '',
  city: '',
  branchName: '',
  orgGroup: '',
  orgType: '',
  status: 'Active' // 👈 Default 'Active' rakha hai
};
// Isse TypeScript ko pata chal jayega ki ye variable exist karta hai
editingBranchId: any = null;
department:any=[];
designation:any=[];
// ==================== NEW BUTTON - UPDATED VERSION ====================
// Current branch ko validate karne ke liye
toggleLobDropdown(event: Event) {
  event.stopPropagation();           // Bahut important
  this.showLobDropdown = !this.showLobDropdown;
}

isLobSelected(item: any): boolean {
  return this.selectedLineOfBusiness.some(sel => sel.id === item.id);
}

toggleLobSelection(item: any) {
  const index = this.selectedLineOfBusiness.findIndex(sel => sel.id === item.id);

  if (index > -1) {
    this.selectedLineOfBusiness.splice(index, 1);
  } else {
    this.selectedLineOfBusiness.push(item);
  }
  this.cdr.detectChanges();
}

// Already hai tumhare code mein
removeLob(index: number, event: Event) {
  event.stopPropagation();
  this.selectedLineOfBusiness.splice(index, 1);
  this.cdr.detectChanges();
}

// Naya function add karo (Clear All ke liye)
clearAllLob(event: Event) {
  event.stopPropagation();
  this.selectedLineOfBusiness = [];
  this.cdr.detectChanges();
}
validateCurrentBranch(): boolean {

  if (!this.branchName?.trim()) {
    alert("❌ Please fill Branch Name before adding new branch!");
    return false;
  }

  if (!this.country?.trim()) {
    alert("❌ Please fill Country before adding new branch!");
    return false;
  }

  if (!this.stateProvince?.trim()) {
    alert("❌ Please fill State/Province before adding new branch!");
    return false;
  }

  if (!this.city?.trim()) {
    alert("❌ Please fill City before adding new branch!");
    return false;
  }

  const firstContact = this.contacts?.[0];
  if (!firstContact?.DepartmentId) {
    alert("❌ Please select Department before adding new branch!");
    return false;
  }

  if (!firstContact?.DesignationId) {
    alert("❌ Please select Designation before adding new branch!");
    return false;
  }

  return true;   // Sab theek hai
}
onNewBranch() {

  // 🔥 Pehle check karo ki current branch valid hai ya nahi
  if (this.selectedBranchIndex >= 0) {
    const isCurrentValid = this.validateCurrentBranch();
    if (!isCurrentValid) {
      return;   // Agar invalid hai toh New nahi allow karenge
    }
  }

  // Agar valid hai ya koi branch selected nahi hai, tab naya branch create karo
  this.isEditMode = true;
  this.selectedBranchIndex = -1;

  this.resetBranchFormOnly();

  const newBlankBranch = {
    id: 0,
    branchName: 'Default',
    address: '',
    country: '',
    stateProvince: '',
    city: '',
    postalCode: '',
    area: '',
    landmark: '',
    telephone: '',
    fax: '',
    website: '',
    email: '',
    lineOfBusiness: null,
    isDefault: this.branchList.length === 0,
    organizationId: this.selectedOrgId || 0,
    designationId: 0,
    departmentId: 0,
    contactName: '',
    mobile: '',
    whatsapp: '',
    emailId: ''
  };

  this.branchList.push(newBlankBranch);

  const newIndex = this.branchList.length - 1;
  this.selectedBranchIndex = newIndex;

  this.cdr.detectChanges();
}
// Button ka text decide karega
getActionButtonText(): string {
  if (this.hasSavedOrg) {
    return this.isEditMode ? 'New' : 'New';
  } else {
    return this.isEditMode ? 'New' : 'New';
  }
}
getSelectedLobNames(): string {
  if (!this.selectedLineOfBusiness || this.selectedLineOfBusiness.length === 0) {
    return 'Select Line of Business';
  }
  return this.selectedLineOfBusiness
             .map(item => item?.serviceName || '')
             .filter(name => name)           // empty names hatao
             .join(', ');
}
// ==================== DELETE SELECTED BRANCH ====================
deleteSelectedBranch() {
  if (this.selectedBranchIndex < 0) {
    alert("Please Select a Branch First!");
    return;
  }

 
    
    // Branch list se delete kar do
    this.branchList.splice(this.selectedBranchIndex, 1);

    // Form reset kar do
    this.resetBranchFormOnly();

    // Selection clear kar do
    this.selectedBranchIndex = -1;
    this.isEditMode = false;

    this.cdr.detectChanges();

   
}
// Button click ka logic
// Button click ka sahi logic
onActionButtonClick() {
  if (this.hasSavedOrg) {
    // Update ke baad "New" button dikhta hai
    this.onNewBranch();
  } else {
    // Pehli organization save nahi hui
    if (this.isEditMode) {
      this.onCancel();
    } else {
      this.onNewBranch();
    }
  }
}
onCancel() {
  this.isEditMode = false;
  this.selectedBranchIndex = -1;
  // Form reset nahi kar rahe — user chahe to manually New click karega
}
// ==================== BRANCH SELECT KARNE PAR FORM FILL HO (UPDATED) ====================
// ==================== SELECT BRANCH FOR EDIT ====================
selectBranch(branch: any, index: number) {
  this.isEditMode = true;
  this.selectedBranchIndex = index;

  this.branchName     = branch.branchName || '';
  this.address        = branch.address || '';
  this.area           = branch.area || '';
  this.landmark       = branch.landmark || '';
  this.country        = branch.country || '';
  this.stateProvince  = branch.stateProvince || '';
  this.city           = branch.city || '';
  this.postalCode     = branch.postalCode || '';
  this.telephone      = branch.telephone || '';
  this.fax            = branch.fax || '';
  this.website        = branch.website || '';
  this.email          = branch.email || branch.emailAddress || '';
this.isDefault = branch.isDefault || false;
  // selectBranch method ke andar
this.selectedLineOfBusiness = [];

if (branch.lobIdsList && Array.isArray(branch.lobIdsList) && branch.lobIdsList.length > 0) {
  // Yeh code [18, 1002] ko use karke tumhari master list se asli objects nikalega
  this.selectedLineOfBusiness = this.lineOfBusinessList.filter(lob => 
    branch.lobIdsList.includes(lob.id)
  );
}   // Agar array aa raha hai
// ya agar sirf ID aa raha hai toh alag logic likhna padega

  this.contacts = [{
    contactName: branch.contactName || '',
    DesignationId: branch.designationId ?? null,
    DepartmentId: branch.departmentId ?? null,
    mobile: branch.mobile || '',
    whatsapp: branch.whatsapp || '',
    email: branch.emailId || branch.email || ''
  }];

  this.cdr.detectChanges();
}
public branchList: any[] = []; // Temporary branches yahan rahengi
public branchName: string = ''; // Input field ke liye
public isDefault: boolean = false;
// 1. Dropdown lists (Data Sources)
private apiUrl = 'https://countriesnow.space/api/v0.1/countries/states';
public countryMasterList: any[] = [];    // Sabhi countries ki original list
public stateLookupList: any[] = [];
selectedBranch: any = { id: 0, name: '', isDefault: false, isActive: true };
branches: any[] = []; 

// Is line ko variables section mein add karein
lineOfBusiness: number | null = null; 

// Aur aapki list pehle se hi hogi:
// lineOfBusinessList: any[] = [];
 // ... baki variables ke niche
showColumnModal = false;
availableColumns: string[] = []; // Ye wo columns jo table mein nahi hain
selectedOrgId: number | null = null; 
isOrgEditMode: boolean = false;// Edit ke liye ID store karne ko

// Label to Property Mapping (Taki table auto-render ho sake)
// columnFieldMap: any = {
//   'Org ID': 'id',
//   'Org Name': 'orgName',
//   'Alias': 'alias',
//   'Type': 'selectedRoles',
//   'Location': 'city',
//   'Branch': 'branchName',
//   'Organization ID': 'organizationId', 
//   'Address': 'address',
//   'Country': 'country',
//   'City': 'city',
//   'Telephone': 'telephone',
//   'Email': 'email',
//   'State/Province': 'stateProvince',
//   'Website': 'website',
//   'Postal Code': 'postalCode',
//   'WhatsApp': 'whatsAppNumber',
//   'Sales Person': 'salesPerson',
//   'Collection Exec': 'collectionExec'
// };

// // Default columns jo shuru mein dikhenge
// selectedColumns: string[] = [
//   'Org ID', 
//   'Org Name', 
//   'Alias', 
//   'Type', 
//   'Country', 
//   'City', 
//   'Organization ID',
//   'Location', 
//   'Branch', 
//   'Address',
//   'Email', 
//   'Telephone', 
//   'WhatsApp',
//   'Sales Person', 
//   'Collection Exec',
//   'Website', 
//   'Postal Code', 
//   'State/Province'
// ];
columnFieldMap: any = {
  'Org ID': 'id',
  'Org Name': 'orgName',
  'Alias': 'alias',
  'Type': 'selectedRoles',

  'Total Branches': 'branchName',
  'Organization ID': 'organizationId', 

  'Sales Person': 'salesPerson',
  'Collection Exec': 'collectionExec'
};

// Default columns jo shuru mein dikhenge
selectedColumns: string[] = [
  'Org ID', 
  'Org Name', 
  'Alias', 
  'Type', 
  'Total Branches',
  'Organization ID',


  'Sales Person', 
  'Collection Exec',

];
  // Suggestions store karne ke liye arrays
  filteredOrgCodes: any[] = [];
  filteredBranches: any[] = [];
filteredOrgNames: any[] = [];
filteredCities: string[] = [];
  activeTab: string = 'general';
  selectedRoles: string[] = [];
  organizations: any[] = [];
cities: any[] = [];
  // Form Variables
  searchQuery: string = ''; 
  orgName: string = '';
  alias: string = '';
  address: string = '';
  country: string = '';
  city: string = '';
  telephone: string = '';
area: string = '';
landmark: string = '';
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

//   branches :any [] =[];
//   selectedBranch: any = null

  constructor(private location: Location, private http: HttpClient,private cdr: ChangeDetectorRef,private router:Router,private elementRef: ElementRef,public CheckPermissionService: CheckPermissionService) {}
@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {
  if (this.lobDropdownContainer && 
      !this.lobDropdownContainer.nativeElement.contains(event.target as Node)) {
    this.showLobDropdown = false;
    this.cdr.detectChanges();
  }
   if (!(event.target as HTMLElement).closest('.relative')) {
      this.isExportOpen = false;
this.organizationsList = [];
    }
}
 ngOnInit() {
  const state = history.state;           // ya this.router.lastSuccessfulNavigation?.extras?.state

    if (state && state.isFormOpen === true) {
      this.isFormOpen = true;
    }
    this.PermissionID = Number(localStorage.getItem('permissionID'));
  this.loaddepartment();
  this.loadestination();
  this.loadColumnSettings();
    this.getOrgList();
//     this.fetchNextBranch();
this.loadCountriesFromApi();
this.getLineOfBusiness();
this.loadBranchess()

  }
// Agent Section Properties
agentBranchName: string = '';
agentLineOfBusiness: any = '';
agentIsDefault: boolean = false;
agentIsDeactive: boolean = false;

agentAddress: string = '';
agentArea: string = '';
agentLandmark: string = '';

agentCountry: string = '';
agentState: string = '';
agentCity: string = '';
agentPostalCode: string = '';

agentTelephone: string = '';
agentFax: string = '';
agentWebsite: string = '';
agentEmail: string = '';

// Contact Details Array
agentContacts: any[] = [
  {
    contactName: '',
    designationId: '',
    departmentId: '',
    mobile: '',
    whatsapp: '',
    email: ''
  }
];

// Methods (example)
agentaddContact() {
  this.agentContacts.push({
    contactName: '',
    designationId: '',
    departmentId: '',
    mobile: '',
    whatsapp: '',
    email: ''
  });
}

agentremoveContact(index: number) {
  if (this.agentContacts.length > 1) {
    this.agentContacts.splice(index, 1);
  }
}
getOrgList() {
  const url = `${environment.apiUrl}/Organization/list`;
  
  this.http.get(url).subscribe({
    next: (data: any) => { 
      this.organizations = data; 

      // --- Naya logic bina existing code chhode ---
      if (data && Array.isArray(data)) {
        // Purani organizations se unique branches nikaalo
        const uniqueNames = [...new Set(data.map(org => org.branchName).filter(n => n))];
        
        // Inhe branches array mein bhar do taaki refresh par na jayein
        this.branches = uniqueNames.map(name => ({ id: 0, name: name, isDefault: false }));
        
        // Ab next branch fetch karo taaki suggestion bhi isi list mein jud jaye

      }
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('List fetch error:', err);
    }
  });
}


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

  isRoleSelected(role: string): boolean {
    return this.selectedRoles.includes(role);
  }

  // toggleRole(role: string) {
  //   const index = this.selectedRoles.indexOf(role);
  //   if (index > -1) {
  //     this.selectedRoles.splice(index, 1);
  //   } else {
  //     this.selectedRoles.push(role);
  //     this.activeTab = role;
  //   }
  // }
// selectedRoles array ko track karne ke liye logic
// Jab Update button click ho (saveOrg se call hota hai)
// ==================== VALIDATION BEFORE ADDING BRANCH ====================
addCurrentBranchIfValid(): boolean {

  if (!this.branchName?.trim()) {
    alert("❌ Branch Name is required!");
    return false;
  }
  if (!this.country?.trim() || !this.stateProvince?.trim() || !this.city?.trim()) {
    alert("❌ Country, State & City are required!");
    return false;
  }

  const firstContact = this.contacts?.[0];
  if (!firstContact?.DepartmentId || !firstContact?.DesignationId) {
    alert("❌ Department and Designation are required!");
    return false;
  }

  const branchData = {
    // Purana ID preserve karo
    id: this.selectedBranchIndex >= 0 ? this.branchList[this.selectedBranchIndex].id : 0,

    branchName: this.branchName.trim(),
    address: this.address || '',
    area: this.area || '',
    landmark: this.landmark || '',
    country: this.country || '',
    stateProvince: this.stateProvince || '',
    city: this.city || '',
    postalCode: this.postalCode || '',
    telephone: this.telephone || '',
    fax: this.fax || '',
    website: this.website || '',
    email: this.email || '',

    // 🔥 IMPORTANT CHANGE: LobId ki jagah LobIds bhejo aur array ko string mein convert karo
   LobIds: this.selectedLineOfBusiness.length > 0 
        ? this.selectedLineOfBusiness.map(item => item.id).join(',') 
        : null,

    contactName: firstContact.contactName || '',
    mobile: firstContact.mobile || '',
    whatsapp: firstContact.whatsapp || '',
    emailId: firstContact.email || '',

    designationId: firstContact.DesignationId ?? null,
    departmentId: firstContact.DepartmentId ?? null,

    isDefault: this.branchList.length === 0 ? true : this.isDefault,
    organizationId: this.selectedOrgId || 0
  };

  if (this.selectedBranchIndex >= 0) {
    // Existing branch update
    this.branchList[this.selectedBranchIndex] = { 
      ...this.branchList[this.selectedBranchIndex], 
      ...branchData 
    };
    console.log("✅ Existing Branch Updated | Index:", this.selectedBranchIndex, "| ID:", branchData.id);
  } else {
    // New branch
    this.branchList.push(branchData);
    console.log("✅ New Branch Added");
  }

  this.cdr.detectChanges();
  return true;
}
toggleRole(role: string) {
  const index = this.selectedRoles.indexOf(role);
  
  if (index > -1) {
    // Agar role pehle se selected hai, toh use remove karo
    this.selectedRoles.splice(index, 1);
    
    // YAHAN BADLAV: Agar role remove ho raha hai, tab bhi hum 'general' par hi rahenge
    // Agar aap chahte ho ki tab na badle, toh niche wali line ko comment/remove kar do
    // this.activeTab = 'general'; 
    
  } else {
    // Naya role add karo
    this.selectedRoles.push(role);
    
    // YAHAN FIX: 'activeTab = role' ko hata kar 'general' rakho
    // Isse checkbox click karne par selection toh hoga, par tab nahi badlega
    this.activeTab = 'general'; 

    // Debugging ke liye console log
    if (role === 'shipper') {
      console.log("Shipper added to selected roles, staying on General tab.");
    }
    if (role === 'consignee') {
      console.log("Consignee added to selected roles, staying on General tab.");
    }
  }
}

// Ye function tab switch karne ke liye (Manual click par)
setActiveTab(tabName: string) {
  this.activeTab = tabName;
}

// HTML mein condition check karne ke liye helper
isShipperSelected(): boolean {
  return this.selectedRoles.includes('shipper');
}
// ==================== UPDATED saveOrg() - NO API CALL ON UPDATE ====================
saveOrg() {
  const isValid = this.addCurrentBranchIfValid();

  if (!isValid) {
    return;   // Stop if validation fails
  }

  this.hasSavedOrg = true;

  
  this.cdr.detectChanges();
}

 
onSaveBranch() {
  this.addCurrentBranchIfValid(); // sirf valid branch add hogi
}
// ==================== SAVE ALL BRANCHES (Add + Update) ====================
// ==================== SAVE ALL BRANCHES (Add + Update) - FIXED ====================
// ==================== SAVE ALL BRANCHES (Add + Update) ====================
// ==================== SAVE ALL BRANCHES (Add + Update) ====================
saveAllLocalBranches(orgId: number) {
  const validBranches = this.branchList.filter(b => b.branchName?.trim());

  validBranches.forEach((branch) => {
    
    // ✅ Har branch ka apna LOB nikalne ka logic
    let finalLobIds = branch.LobIds || branch.lobIds || null;

    // ✅ Agar loop wali branch wahi hai jo abhi screen par open hai, 
    // toh screen wala (selectedLineOfBusiness) data lo
    const actualIndexInList = this.branchList.indexOf(branch);
    if (actualIndexInList === this.selectedBranchIndex) {
      finalLobIds = this.selectedLineOfBusiness.length > 0 
        ? this.selectedLineOfBusiness.map(item => item.id).join(',') 
        : null;
    }

    const payload = {
      Id: branch.id || 0,
      BranchName: branch.branchName?.trim(),
      OrganizationId: orgId,

      // 🔥 FIX: Ab har branch apna alag LOB save karegi
      LobIds: finalLobIds,

      Address: branch.address?.trim(),
      Area: branch.area?.trim(),
      Landmark: branch.landmark?.trim(),
      Country: branch.country?.trim(),
      StateProvince: branch.stateProvince?.trim(),
      City: branch.city?.trim(),
      PostalCode: branch.postalCode?.trim(),

      Telephone: branch.telephone?.trim(),
      Fax: branch.fax?.trim(),
      WebSite: branch.website?.trim(),
      EmailAddress: branch.email?.trim() || branch.emailAddress?.trim(),
      EmailId: branch.emailId?.trim() || branch.email?.trim(),

      ContactName: branch.contactName?.trim(),
      Mobile: branch.mobile?.trim(),
      Whatsapp: branch.whatsapp?.trim(),

      DesignationId: branch.designationId ?? null,
      DepartmentId: branch.departmentId ?? null,

       isDefault : branch.isDefault || false,
      IsDeactivated: false,
      IsManager: false,
      IsHOD: false,
      IsSales: false,
      IsMarketing: false
    };

    console.log(`→ Saving Branch: "${branch.branchName}" | LobIds = ${payload.LobIds}`);

    this.http.post(`${environment.apiUrl}/OrgBranch/SaveBranch`, payload)
      .subscribe({
        next: (res) => console.log(`✅ Branch "${branch.branchName}" saved successfully`),
        error: (err) => {
          console.error(`❌ Failed to save branch "${branch.branchName}"`, err);
          console.log("Full error:", err.error);
        }
      });
  });
}
// Ek chota sa helper function saare fields khali karne ke liye
resetFormFields() {
  this.orgName = '';
  this.alias = '';
  this.address = '';
  this.city = '';
  this.telephone = '';
  this.email = '';
  this.website = '';
  this.contacts = [{ contactName: '', designation: '', department: '', mobile: '', whatsapp: '', email: '' }];
  this.selectedRoles = [];
}

  changeTab(tab: string) { this.activeTab = tab; }
// selectBranch(branch: any) {
//   console.log("Branch selected for edit:", branch);

//   // 1. Input field mein naam populate karo
//   // Kyunki aapka input [(ngModel)]="branchName" se juda hai, wahan naam turant dikhne lagega
//   this.branchName = branch.branchName;

//   // 2. Is branch ki ID save kar lo (Nayi branch ke liye ye 0 ya null hogi, purani ke liye DB wali ID)
//   this.editingBranchId = branch.id || branch.Id;

//   this.cdr.detectChanges();
// }
  
  cancel() {
    if (this.isFormOpen) {
      this.isFormOpen = false;
      this.getOrgList();
    } else {
      this.location.back();
    }
  }

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
loaddepartment(){
  this.http.get(`${environment.apiUrl}/User/departments`).subscribe({
    next: (data: any) => {
      this.department = data || [];
      console.log('Departments loaded:', this.department);
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Error loading departments:', err);
      this.department = [];
      this.cdr.detectChanges();
    }

});
};
// ==================== FINAL SAVE - COMPLETE ORGANIZATION ====================
// ==================== SAVE COMPLETE ORGANIZATION WITH PROPER VALIDATION ====================
saveCompleteOrganization() {

  // 1. Organization Name check
  if (!this.orgName?.trim()) {
    alert("❌ Organization Name is required!");
    return;
  }

  // 2. At least one branch should exist
  if (this.branchList.length === 0) {
    alert("❌ Please add at least one branch!");
    return;
  }

  // 3. Check every branch - kam se kam ek branch mein ye sab fields hone chahiye
  let hasValidBranch = false;

  for (let branch of this.branchList) {
    if (
      branch.branchName && branch.branchName.trim() !== '' &&
      branch.lineOfBusiness &&
      branch.country && branch.country.trim() !== '' &&
      branch.stateProvince && branch.stateProvince.trim() !== '' &&
      branch.city && branch.city.trim() !== '' &&
      branch.departmentId &&
      branch.designationId
    ) {
      hasValidBranch = true;
      break;
    }
  }

  if (!hasValidBranch) {
    alert("❌ At least one branch must have:\n• Branch Name\n• Line of Business\n• Country\n• State/Province\n• City\n• Department\n• Designation");
    return;
  }

  // Agar sab validation pass ho gaye, tab API call karo
  const payload = {
    Id: this.selectedOrgId || 0,
    OrgName: this.orgName.trim(),
    Alias: this.alias || '',
    SelectedRoles: this.selectedRoles.join(',')
  };

  this.http.post(`${environment.apiUrl}/Organization/save`, payload).subscribe({
    next: (res: any) => {
      const finalOrgId = res?.data?.id || res?.id || this.selectedOrgId || 0;

      if (finalOrgId) {
        this.selectedOrgId = finalOrgId;

        // Saare branches ko database mein save karo
        if (this.branchList.length > 0) {
          this.saveAllLocalBranches(finalOrgId);
        }

        alert("✅ Organization + All Branches Saved Successfully in Database!");
      }
    },
    error: (err) => {
      console.error("Save Organization Error:", err);
      alert("❌ Failed to save Organization. Please try again.");
    }
  });
}
loadestination(){
  this.http.get(`${environment.apiUrl}/User/get-designations`).subscribe({
    next: (data: any) => {
      this.designation = data || [];
      console.log('Designations loaded:', this.designation);
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Error loading designations:', err);
      this.designation = [];
      this.cdr.detectChanges();
    }

});
};

saveOrganization() {
  if (!this.orgName?.trim()) {
    alert("❌ Organization Name is required!");
    return;
  }

  // 🔥 NAYA LOGIC: Agar branch ka naam likha hai par Save Data click nahi kiya
  if (this.branchName && this.branchName.trim() !== '') {
    const isBranchValid = this.addCurrentBranchIfValid();
    if (!isBranchValid) {
      return; 
    }
  }

  if (this.branchList.length === 0) {
    alert("❌ Please add at least one branch!");
    return;
  }

  const payload = {
    Id: this.selectedOrgId || 0,
    OrgName: this.orgName.trim(),
    Alias: this.alias || '',
    SelectedRoles: this.selectedRoles.join(',')
  };

  const apiUrl = this.isOrgEditMode && this.selectedOrgId 
    ? `${environment.apiUrl}/Organization/update` 
    : `${environment.apiUrl}/Organization/save`;

  this.http.post(apiUrl, payload).subscribe({
    next: (res: any) => {
      const finalOrgId = res?.id || res?.data?.id || res?.Id || this.selectedOrgId || 0;

      if (finalOrgId > 0) {
        this.selectedOrgId = finalOrgId;

        // AGENT aur BRANCHES save karo
        this.saveAgentWithOrganisation(finalOrgId);
        this.saveAllLocalBranches(finalOrgId); 

        alert(this.isOrgEditMode 
          ? "✅ Organization Updated Successfully!" 
          : "✅ Organization + Branches Saved Successfully!");
      }
    },
    error: (err) => {
      console.error("Organization Save/Update Error:", err);
      alert(this.isOrgEditMode ? "❌ Failed to Update Organization" : "❌ Failed to Save Organization");
    }
  });
}
// ==================== SAVE AGENT WITH ORGANISATION ID ====================
saveAgentWithOrganisation(orgId: number) {

  if (!this.agentBranchName?.trim()) {
    console.warn("⚠️ Agent Branch Name is empty, skipping agent save");
    return;
  }

  const agentPayload = {
    organisationId: orgId,                    // ← Dynamic OrganisationId
    lineOfBusinessId: this.agentLineOfBusiness,
    branchName: this.agentBranchName.trim(),
    isDefault: this.agentIsDefault,
    isDeactive: this.agentIsDeactive,

    address: this.agentAddress?.trim() || '',
    area: this.agentArea?.trim() || '',
    landmark: this.agentLandmark?.trim() || '',
    country: this.agentCountry?.trim() || '',
    state: this.agentState?.trim() || '',
    city: this.agentCity?.trim() || '',
    postalCode: this.agentPostalCode?.trim() || '',

    telephone: this.agentTelephone?.trim() || '',
    fax: this.agentFax?.trim() || '',
    website: this.agentWebsite?.trim() || '',
    email: this.agentEmail?.trim() || '',

    contacts: this.agentContacts.map(contact => ({
      contactName: contact.contactName?.trim() || '',
      designationId: contact.designationId || '',
      departmentId: contact.departmentId || '',
      mobile: contact.mobile?.trim() || '',
      whatsapp: contact.whatsapp?.trim() || '',
      email: contact.email?.trim() || ''
    }))
  };

  console.log("🔥 Sending Agent Payload with OrgId:", agentPayload);

  this.http.post(`${environment.apiUrl}/OrganisationAgent/SaveAgent`, agentPayload)
    .subscribe({
      next: (res) => {
        console.log("✅ Agent + Contacts Saved Successfully!", res);
      },
      error: (err) => {
        console.error("❌ Failed to save Agent:", err);
        // alert("Organization saved but Agent save failed!"); // optional
      }
    });
}
editOrg(org: any) {
  console.log('Editing Organization:', org);

  this.isFormOpen = true;
  this.isOrgEditMode = true;           // ← Ye line add karo
  this.isEditMode = false;

  this.selectedOrgId = org.id || org.Id; 

  // Basic Organization Fields
  this.orgName = org.orgName || '';
  this.alias = org.alias || '';
  this.selectedRoles = org.selectedRoles 
    ? (typeof org.selectedRoles === 'string' ? org.selectedRoles.split(',').map((r: string) => r.trim()) : org.selectedRoles)
    : [];

  // Address & Other fields (agar organization level pe hain)
  this.address = org.address || '';
  this.country = org.country || '';
  this.stateProvince = org.stateProvince || '';
  this.city = org.city || '';
  this.telephone = org.telephone || '';
  this.email = org.email || '';
  this.website = org.website || '';
  this.postalCode = org.postalCode || '';

  // Branches load karo
  if (this.selectedOrgId) {
    this.getBranchesByOrg(this.selectedOrgId);
  }

  this.cdr.detectChanges();
}

// Ye function alag se niche add kar dena
// ==================== GET BRANCHES BY ORGANIZATION (FULL MAPPING) ====================
// ==================== GET BRANCHES BY ORGANIZATION (FULL MAPPING) ====================
getBranchesByOrg(orgId: number) {
  const url = `${environment.apiUrl}/OrgBranch/GetByOrg/${orgId}`;

  console.log("Fetching branches from URL:", url);

  this.http.get<any[]>(url).subscribe({
    next: (res) => {
      console.log("✅ Raw branches received from API:", res);

      if (res && Array.isArray(res) && res.length > 0) {
        
        this.branchList = res.map((b: any) => ({
          id: b.id,                                  
          branchName: b.branchName || '',

          organizationId: b.organizationId,

          address: b.address || '',
          area: b.area || '',
          landmark: b.landmark || '',
          country: b.country || '',
          stateProvince: b.stateProvince || '',
          city: b.city || '',
          postalCode: b.postalCode || '',

          telephone: b.telephone || '',
          fax: b.fax || '',
          website: b.webSite || b.website || '',
          email: b.emailAddress || b.email || '',

          contactName: b.contactName || '',
          mobile: b.mobile || '',
          whatsapp: b.whatsapp || '',
          emailId: b.emailId || b.emailAddress || '',

          lobIds: b.lobIds || null,
  
          lobIdsList: b.lobIds 
            ? b.lobIds.split(',').map((id: string) => parseInt(id.trim(), 10)).filter((id: number) => !isNaN(id))
            : [],
            
          designationId: b.designationId || null,
          departmentId: b.departmentId || null,

          isDefault: b.isDefault || false,
          isDeactivated: b.isDeactivated || false,
          isManager: b.isManager || false,
          isHOD: b.isHOD || false,
          isSales: b.isSales || false,
          isMarketing: b.isMarketing || false,

          organization: b.organization,
          designation: b.designation,
          department: b.department,
          companyService: b.companyService
        }))
        // Default branch ko top (index 0) par laane ke liye
        .sort((a, b) => (b.isDefault === a.isDefault ? 0 : b.isDefault ? 1 : -1));

        console.log("✅ branchList ready for sidebar (Sorted by Default):", this.branchList);

        // 🔥 YAHAN NAYA LOGIC LAGA HAI: AUTO-SELECT DEFAULT BRANCH 🔥
        // Kyunki sort karne ke baad default branch index 0 par aa chuki hai,
        // hum direct index 0 wali branch ko form mein fill karwa denge.
        if (this.branchList.length > 0) {
          this.selectBranch(this.branchList[0], 0);
        }

      } else {
        this.branchList = [];
        console.log("No branches found.");
        
        // Agar koi branch nahi hai, toh form ko clear aur disable kar do
        this.resetBranchFormOnly();
        this.isEditMode = false;
      }

      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error("❌ Error loading branches:", err);
      this.branchList = [];
      this.resetBranchFormOnly();
      this.isEditMode = false;
      this.cdr.detectChanges();
    }
  });
}
isExportOpen = false;

  @ViewChild('tableToExport') tableToExport!: ElementRef;

  toggleExportMenu() {
    this.isExportOpen = !this.isExportOpen;
  }

  // Click outside menu to close
  
  

  // Pure data printing via Iframe (No sidebar/filters)
printData() {
  this.isExportOpen = false;
  
  // Hum organizations array se sirf pehli 20 entries ka content nikalenge
  // Agar aapko saari entries chahiye toh slice hata dena
  const printData = this.organizations.slice(0, 20);
  
  // Table rows build karna manually taaki formatting control mein rahe
  let tableRows = '';
  printData.forEach(org => {
    tableRows += `
      <tr>
        <td>${org.id}</td>
        <td class="text-blue-700">${org.orgName}</td>
        <td>${org.alias || ''}</td>
        <td><span class="badge">${org.selectedRoles || ''}</span></td>
        <td>${org.city || ''}</td>
      </tr>
    `;
  });

  const windowPrt = window.open('', '', 'width=1000,height=900');
  
  if (windowPrt) {
    windowPrt.document.write(`
      <html>
        <head>
          <title>Organization Records</title>
          <style>
            @page { size: A4; margin: 10mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; }
            
            h2 { text-align: center; color: #4a3f3f; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; }
            
            /* Full Width Table Design */
            table { 
              width: 100%; 
              border-collapse: collapse; 
              table-layout: fixed; /* Isse columns barabar bante hain */
            }
            
            th, td { 
              border: 1px solid #ccc; 
              padding: 12px 8px; 
              text-align: left; 
              font-size: 13px; 
              word-wrap: break-word; 
            }
            
            th { 
              background-color: #f3f4f6; 
              color: #374151; 
              text-transform: uppercase; 
              font-weight: bold; 
            }
            
            /* 20 entries ko ek page par fit karne ke liye row height */
            tr { height: 40px; } 

            .text-blue-700 { color: #1d4ed8; font-weight: bold; }
            
            .badge { 
              background-color: #dbeafe; 
              color: #1e40af; 
              padding: 2px 8px; 
              border-radius: 9999px; 
              font-size: 11px; 
              font-weight: bold;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <h2>Organization Records List</h2>
          <table>
            <thead>
              <tr>
                <th style="width: 10%;">ID</th>
                <th style="width: 30%;">Org Name</th>
                <th style="width: 20%;">Alias</th>
                <th style="width: 25%;">Type</th>
                <th style="width: 15%;">Location</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `);
    windowPrt.document.close();
  }
}

async downloadPDF() {
  this.isExportOpen = false;
  const element = this.tableToExport.nativeElement;

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High quality ke liye
      useCORS: true,
      // 🔥 YE LINE PDF SE ACTION COLUMN HATAYEGI
      ignoreElements: (el) => el.classList.contains('no-export')
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Margin dene ke liye thoda space chhoda hai (5, 5)
    pdf.addImage(imgData, 'PNG', 5, 5, pdfWidth - 10, pdfHeight - 10);
    pdf.save('Organization_Records.pdf');
  } catch (error) {
    console.error("PDF Generate karne mein error:", error);
    alert("PDF download nahi ho paya!");
  }
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

  // searchOrganization() {
  //   const query = this.searchQuery ? this.searchQuery.trim() : '';
  //   if (!query) {
  //     this.getOrgList();
  //     return;
  //   }
  //   const url = `${environment.apiUrl}/Organization/search?orgName=${query}`;
  //   this.http.get(url).subscribe({
  //     next: (data: any) => {
  //       this.organizations = data || [];  
  //       console.log('Data mila:', this.organizations);

  //       this.cdr.detectChanges();
  //     }
  //   });
  // }

  // onOrgSelect(org: any) {
  //   this.searchQuery = org.orgName;
  //   this.organizations = [org];
   
  // }
  

// searchFilters: any = {
//     orgName: '',
//     orgCode: '',
//     orgType: '',
//     city: '', // Ye city search ke liye zaroori hai
//     orgGroup: '',
//     status: 'Active',
//     branch: 'DELHI',
//     createdDate: ''
//   };

//   ///city search
// // 1. City (address) list store karne ke liye variable


// // 2. City search function (Address field ke basis par)
// searchCity() {
//   const query = this.searchFilters.city ? this.searchFilters.city.trim() : '';
  
//   // Agar query khali hai toh dropdown clear karein
//   if (!query) {
//     this.cities = [];
//     return;
//   }

//   // API call to search for city based on 'address'
// const url =  `${environment.apiUrl}/Organization/search?address=${query}`;;
  
//   this.http.get(url).subscribe({
//     next: (data: any) => {
//       // API se aaya data cities ar
//       // ray mein daalein
//       console.log('API se data mila:', data); // <--- YAHAN CHECK KAREIN
//       this.cities = data || [];
//     },
//     error: (err) => {
//       console.error('Error searching address', err);
//       this.cities = [];
//        this.cdr.detectChanges();
//     }
//   });
// }

// // 3. City Selection Logic
// onCitySelect(city: any) {
//   // 1. Input field ko select kiye gaye city se update karein
//   this.searchFilters.city = city.address; 
  
//   // 2. Cities array ko khali karein taaki dropdown band ho jaye
//   this.cities = []; // <--- SEHI: Dropdown band karne ke liye array empty karein
  
//   // 3. TABLE REFRESH KAREIN: Select hone ke baad data reload karein
//   this.searchOrganization(); // <--- ADDED: Table update karein
  
//   console.log('City selected and table refresh called:', this.searchFilters.city);
// }
getApiSuggestions(field: string, query: string) {
  // 1. Min length define karein
  const minLength = (field === 'orgcode') ? 2 : 4;

  // 2. Strict Check: Agar query chhoti hai toh sab clear karke wahi se laut jao (Return)
  if (!query || query.trim().length < minLength) {
    this.filteredOrgCodes = [];
    this.filteredOrgNames = [];
    this.filteredCities = [];
    this.filteredBranches = [];
    return; // 👈 Ye zaroori hai, taaki niche wali API call na chale
  }

  let searchParams: any = {};
  const cleanQuery = query.trim();

  // 3. Mapping: Backend parameter check karein
  if (field === 'orgcode') {
    // Agar backend 'id' dhoond raha hai toh id bhejo
    searchParams.id = cleanQuery; 
  } else if (field === 'orgname') {
    searchParams.orgName = cleanQuery;
  } else if (field === 'city') {
    searchParams.city = cleanQuery;
  } else if (field === 'branchname') {
    searchParams.branchName = cleanQuery;
  }

  // 4. API Call tabhi hogi jab upar wala filter pass hoga
  this.http.get<any[]>(`${environment.apiUrl}/Organization/search`, {
    params: searchParams
  }).subscribe({
    next: (res) => {
      // Pehle list clear karein taaki purana data na dikhe
      if (field === 'orgcode') {
        // Sirf wahi dikhao jo search se match kare (Frontend safety filter)
        this.filteredOrgCodes = res ? res.filter(x => x.id.toString().includes(cleanQuery)) : [];
      } 
      else if (field === 'orgname') {
        this.filteredOrgNames = res || [];
      } 
      else if (field === 'city') {
        const allCities = res.map(item => item.city ? item.city.trim() : item.trim());
        this.filteredCities = [...new Set(allCities)];
      }
      else if (field === 'branchname') {
        const allBranches = res.map(item => item.branchName ? item.branchName.trim() : item.trim());
        this.filteredBranches = [...new Set(allBranches)];
      }
      this.cdr.detectChanges();
    }
  });
}
// 👈 Ye selection function bhi add kar lena
selectOrgCodeSuggestion(item: any) {
  // Database ki ID ko hi model mein daal rahe hain
  this.searchFilters.orgCode = item.id; 
  this.filteredOrgCodes = []; // List turant band
  this.cdr.detectChanges();
}

// 👈 Ye function bhi add kar lena selection ke liye
selectBranchSuggestion(item: any) {
  // Kyunki humne getApiSuggestions mein pehle hi .map karke 
  // sirf naam nikale hain, isliye 'item' ab khud ek string hai.
  this.searchFilters.branchName = (typeof item === 'object' && item !== null) 
                                  ? item.branchName 
                                  : item;

  this.filteredBranches = []; // Dropdown band karein
  this.cdr.detectChanges();
}

// Org Selection (Aapka existing method)
selectOrgSuggestion(item: any) {
  if (typeof item === 'object' && item !== null) {
    this.searchFilters.orgName = item.orgName;
  } else {
    this.searchFilters.orgName = item;
  }
  this.filteredOrgNames = [];
  this.cdr.detectChanges();
}

// 3. City Selection (Naya method bina kuch hataye)
selectCitySuggestion(item: any) {
  if (typeof item === 'object' && item !== null) {
    this.searchFilters.city = item.city; // DB mein 'city' column hai
  } else {
    this.searchFilters.city = item;
  }
  this.filteredCities = []; // City dropdown band
  this.cdr.detectChanges();
}
onSearch() {
  let finalFilters: any = {};

  // 1. Payload ready karo
  Object.entries(this.searchFilters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined && value !== 'Any') {
      finalFilters[key] = value;
    }
  });

  // 2. Priority Logic: Agar ID hai toh baaki filter ignore
  if (finalFilters.orgCode) {
    finalFilters = { id: finalFilters.orgCode };
  }

  // Check: Agar kuch bhi nahi bhara
  if (Object.keys(finalFilters).length === 0) {
    alert("Bhai, kam se kam ek filter to bharo!");
    return;
  }

  this.http.get<any[]>(`${environment.apiUrl}/Organization/search`, { params: finalFilters })
    .subscribe({
      next: (response) => {
        let resData = response || [];

        // 3. Filter Logic
        if (finalFilters.id) {
          const searchId = finalFilters.id.toString().trim();
          this.organizations = resData.filter(org => 
            org.id.toString() === searchId
          );
        } else {
          this.organizations = resData;
        }

        // 🔥 CHANGE DETECTOR: Angular ko force karo UI update karne ke liye
        this.cdr.detectChanges(); 
        
        console.log("✅ Data updated on UI:", this.organizations.length, "records");
      },
      error: (err) => {
        console.error("❌ Search failed:", err);
        // Error ke waqt bhi detect changes karna safe rehta hai agar loader stop karna ho
        this.cdr.detectChanges();
      }
    });
}
resetFilters() {
  this.searchFilters = {
    orgCode: '',
    orgName: '',
    city: '',
    branchName: '',
    orgGroup: '',
    orgType: '',
    status: 'Active'
  };
  this.getOrgList(); // Poori list load hogi
  this.cdr.detectChanges(); // 👈 Yahan bhi lagao taaki filter boxes turant khali dikhein
}
  deleteOrg(id: any) {
    if (confirm('Are you sure?')) {
      this.http.delete(`${environment.apiUrl}/Organization/delete/${id}`).subscribe({
        next: () => {
          alert('Deleted!');
          this.getOrgList();
        }
      });
    }
  }
  // 1. Keyboard se sirf 0-9 allow karega
onlyNumbers(event: any) {
  const pattern = /[0-9]/;
  const inputChar = String.fromCharCode(event.charCode);
  if (!pattern.test(inputChar)) {
    event.preventDefault();
  }
}

// 2. Indian Mobile Number Pattern Check
validateIndianNo(contact: any) {
  const val = contact.whatsapp;
  if (val && val.length > 0) {
    // Regex: Start with 6-9, followed by 9 digits
    const pattern = /^[6-9][0-9]{9}$/;
    
    // Agar 10 digit hain aur pattern match nahi hua, toh error dikhao
    if (val.length === 10 && !pattern.test(val)) {
      contact.isInvalidNo = true;
    } 
    // Agar 10 se kam hain aur galat start hua
    else if (val.length > 0 && !['6','7','8','9'].includes(val[0])) {
      contact.isInvalidNo = true;
    }
    else {
      contact.isInvalidNo = false;
    }
  } else {
    contact.isInvalidNo = false;
  }
}
checkEmail(contact: any) {
  const emailVal = contact.email;
  if (emailVal && emailVal.length > 0) {
    // Standard Email Regex
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    
    // Agar pattern match nahi hua toh invalid mark karo
    contact.isEmailInvalid = !pattern.test(emailVal);
  } else {
    // Agar khali hai toh error hata do (agar email optional hai)
    contact.isEmailInvalid = false;
  }
}
isWebsiteInvalid: boolean = false;

validateWebsite() {
  const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;

  if (this.website && this.website.trim().length > 0) {
    const trimmedUrl = this.website.trim();
    
    // 'i' flag add kiya hai → Case-insensitive ban gaya
    this.isWebsiteInvalid = !urlPattern.test(trimmedUrl);
  } else {
    this.isWebsiteInvalid = false;
  }
}
// Main email ke liye alag flag
isMainEmailInvalid: boolean = false;

checkMainEmail() {
  const emailVal = this.email ? this.email.trim() : '';
  
  if (emailVal.length > 0) {
    // Strict Regex for standard email format
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    // Check match
    this.isMainEmailInvalid = !pattern.test(emailVal);
  } else {
    this.isMainEmailInvalid = false;
  }
}

downloadExcel() {
  this.isExportOpen = false;

  if (!this.organizations || this.organizations.length === 0) {
    alert("Excel ke liye data nahi hai!");
    return;
  }

  // 1. Data prepare karein (Keys wahi rakhi hain jo aapke getOrgList me aati hain)
  const excelData = this.organizations.map(org => {
    return {
      'ID': org.id || '-',
      'Organization Name': org.orgName || '-',
      'Alias': org.alias || '-',
      'Branch': org.branchName || '-',
      'Roles/Type': org.selectedRoles || '-',
      'City/Location': org.city || '-', // city field check karein
      'Email': org.email || '-',
      'Telephone': org.telephone || '-', // telephone field check karein
      'Sales Person': org.salesPerson || '-'
    };
  });

  // 2. Worksheet banayein
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

  // 3. Worksheet ki styling (Optional: Column width set karna)
  const colWidths = [
    { wch: 10 }, // ID
    { wch: 30 }, // Name
    { wch: 15 }, // Alias
    { wch: 15 }, // Branch
    { wch: 20 }, // Roles
    { wch: 15 }, // City
    { wch: 25 }, // Email
    { wch: 15 }, // Telephone
    { wch: 20 }  // Sales Person
  ];
  ws['!cols'] = colWidths;

  // 4. Workbook banayein aur file save karein
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Organization Records');

  XLSX.writeFile(wb, `Organization_Records_${new Date().getTime()}.xlsx`);
}
// --- Pagination Variables ---
currentPage: number = 1;
pageSize: number = 10; // Ek page par 10 records dikhenge
protected readonly Math = Math; // Template mein Math use karne ke liye

// Ye computed property table ko slice karke data degi
get paginatedOrganizations(): any[] {
  const startIndex = (this.currentPage - 1) * this.pageSize;
  return this.organizations.slice(startIndex, startIndex + this.pageSize);
}

get totalPages(): number {
  return Math.ceil(this.organizations.length / this.pageSize) || 1;
}

setPage(page: number) {
  if (page < 1 || page > this.totalPages) return;
  this.currentPage = page;
}
// Modal Control
// Modal Control
openColumnModal() { 
  console.log("Modal opening..."); // Debugging ke liye
  this.showColumnModal = true; 
  this.cdr.detectChanges(); // Force UI update
}

closeColumnModal() { 
  this.showColumnModal = false; 
  this.cdr.detectChanges();
}

// Settings Load karna (OnInit mein call karna)
loadColumnSettings() {
  this.http.get<any>(`${environment.apiUrl}/OrganizationColumnSettings`).subscribe({
    next: (res) => {
      const allPossibleColumns = Object.keys(this.columnFieldMap);

      if (res && res.selectedColumns) {
        // 1. DB se purani list lo
        const savedSelected = JSON.parse(res.selectedColumns);
        const savedAvailable = JSON.parse(res.availableColumns);

        // 2. CHECK: Kya koi naya column code mein add hua hai jo DB mein nahi hai?
        // Hum saare columns ko filter karenge jo na 'selected' mein hain na 'available' mein
        const newMissingColumns = allPossibleColumns.filter(
          col => !savedSelected.includes(col) && !savedAvailable.includes(col)
        );

        this.selectedColumns = savedSelected;
        // 3. Naye columns ko 'Available' list ke aage jod do
        this.availableColumns = [...savedAvailable, ...newMissingColumns];

      } else {
        // Default Logic agar DB khali hai
        this.selectedColumns = ['Org ID', 'Org Name', 'Type', 'Location'];
        this.availableColumns = allPossibleColumns.filter(c => !this.selectedColumns.includes(c));
      }
      
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error("Settings load error:", err);
      // Failover: Agar API fail ho jaye toh kam se kam code wala default dikhao
      this.selectedColumns = Object.keys(this.columnFieldMap).slice(0, 6);
      this.availableColumns = Object.keys(this.columnFieldMap).filter(c => !this.selectedColumns.includes(c));
    }
  });
}
/// Modal Control functions
  toggleColumnModal() {
    this.showColumnModal = !this.showColumnModal;
  }

  // Column Drag & Drop Logic
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    const payload = {
      availableColumns: JSON.stringify(this.availableColumns),
      selectedColumns: JSON.stringify(this.selectedColumns)
    };
    this.http.post(`${environment.apiUrl}/OrganizationColumnSettings/save`, payload).subscribe();
  }

  // Row Drag & Drop Logic (Yahi error de raha tha)
  dropRow(event: CdkDragDrop<any[]>) {
    const prevIndex = (this.currentPage - 1) * this.pageSize + event.previousIndex;
    const currIndex = (this.currentPage - 1) * this.pageSize + event.currentIndex;

    moveItemInArray(this.organizations, prevIndex, currIndex);
    this.cdr.detectChanges();
  }
  // organization-add.component.ts ke andar:
// Variables ke section mein:
showOrgDatePicker: boolean = false;

setOrgQuickDate(type: string) {
  const today = new Date();
  let targetDate = new Date();

  switch (type) {
    case 'tomorrow': targetDate.setDate(today.getDate() + 1); break;
    case 'yesterday': targetDate.setDate(today.getDate() - 1); break;
    case 'nextWeek': targetDate.setDate(today.getDate() + 7); break;
    case 'lastWeek': targetDate.setDate(today.getDate() - 7); break;
    default: targetDate = today; // Today
  }

  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;

  // Yahan 'as any' lagane se 'string is not assignable to null' wala error khatam ho jayega
  if (this.searchFilters) {
    (this.searchFilters as any).createdDate = formattedDate; 
  }

  this.showOrgDatePicker = false;
  this.cdr.detectChanges(); // UI refresh ke liye
}// 1. Initial State (Make sure these are at the top of your class)
// selectedBranch: any = { id: 0, name: '', isDefault: false, isActive: true };
// branches: any[] = []; 

/**
 * NEW BUTTON: Yeh pichli branch se link poori tarah tod dega.
 */


/**
 * SAVE BRANCH BUTTON: Jo aap baar-baar click karke branches add karna chahte ho.
 */

filteredCountries: any[] = [];

// 1. Load API (Same as before)
loadCountriesFromApi() {
  this.http.get(this.apiUrl).subscribe({
    next: (response: any) => {
      if (response && response.data) {
        this.countryMasterList = response.data;
      }
    },
    error: (err) => console.error('API Error:', err)
  });
}

// 2. Search Logic (3 characters check)
onCountrySearch(event: any) {
  const val = (event.target.value || '').toUpperCase().trim();

  event.target.value = val;   // Input box mein uppercase dikhe

  if (val.length >= 3) {
    this.filteredCountries = this.countryMasterList.filter(item =>
      item.name.toLowerCase().includes(val.toLowerCase())
    );
  } else {
    this.filteredCountries = [];
  }
}

// 3. Selection Logic
selectCountry(countryName: string) {
  this.country = countryName;
  this.filteredCountries = []; // List gayab karne ke liye
  this.onCountrySelectionChange(); // States load karne ke liye
}

// 4. States Load Logic (Same as before)
onCountrySelectionChange() {
  this.stateProvince = ''; 
  const selectedObj = this.countryMasterList.find(c => 
    c.name.toLowerCase() === this.country.trim().toLowerCase()
  );

  if (selectedObj && selectedObj.states) {
    this.stateLookupList = selectedObj.states.map((s: any) => s.name);
  } else {
    this.stateLookupList = [];
  }
}
organizationsList: any[] = [];
activeDropdown: string = ''; 

allOrgSearch(type: string) {
  const url = `${environment.apiUrl}/Organization/list`;
  this.http.get(url).subscribe({
    next: (res: any) => {
      const data = Array.isArray(res) ? res : res.data;
      if (data) {
        // Dropdown type pehle set karo (Important!)
        this.activeDropdown = type; 
        
        this.organizationsList = data.map((item: any) => ({
          orgId: item.id || item.organizationId,
          orgName: item.orgName
        }));
      }
    },
    error: (err) => console.error("API Error:", err)
  });
}

// Select karte waqt hum check karenge ki kis dropdown se click hua hai
selectOrg(org: any) {
  if (this.activeDropdown === 'name') {
    this.searchFilters.orgName = org.orgName;
  } else if (this.activeDropdown === 'id') {
    // Agar ID wale input ka variable orgCode hai toh wahan fill karo
    this.searchFilters.orgCode = org.orgId; 
  }

  // Selection ke baad sab clear kar do
  this.organizationsList = [];
  this.activeDropdown = '';
}
cityList: any[] = []; // Full list ke liye

// City fetch karne ke liye (Aapke logic ke hisaab se)
allCitySearch(type: string) {
  const url = `${environment.apiUrl}/Organization/list`; // Check your API endpoint
  this.http.get(url).subscribe({
    next: (res: any) => {
      const data = Array.isArray(res) ? res : res.data;
      if (data) {
        this.activeDropdown = type; // 'city' set karega
        this.cityList = data.map((item: any) => ({
          cityId: item.id || item.cityId,
          cityName: item.cityName || item.city
        }));
        
        // Taaki suggestions aur dropdown ek saath na dikhen
        this.filteredCities = []; 
      }
    },
    error: (err) => console.error("City fetch error:", err)
  });
}

saveAgent() {
  const payload = {
    organisationId: this.selectedOrgId || 1,
    lineOfBusinessId: this.agentLineOfBusiness,     // string "18" bhi chalega (backend int? lega)
    branchName: this.agentBranchName?.trim() || '',
    isDefault: this.agentIsDefault,
    isDeactive: this.agentIsDeactive,

    address: this.agentAddress?.trim() || '',
    area: this.agentArea?.trim() || '',
    landmark: this.agentLandmark?.trim() || '',
    country: this.agentCountry?.trim() || '',
    state: this.agentState?.trim() || '',
    city: this.agentCity?.trim() || '',
    postalCode: this.agentPostalCode?.trim() || '',

    telephone: this.agentTelephone?.trim() || '',
    fax: this.agentFax?.trim() || '',
    website: this.agentWebsite?.trim() || '',
    email: this.agentEmail?.trim() || '',

    contacts: this.agentContacts || []
  };

  console.log("Sending Payload:", payload);   // Debug ke liye

  this.http.post(`${environment.apiUrl}/OrganisationAgent/SaveAgent`, payload)
    .subscribe({
      next: (res) => {
        console.log("✅ Success:", res);
        alert("Agent saved successfully!");
      },
      error: (err) => {
        console.error("❌ Full Error:", err);
        alert("Failed to save. Check console.");
      }
    });
}

// Item select karne par
selectCity(item: any) {
  this.searchFilters.city = item.cityName;
  // Agar ID bhi save karni ho: this.searchFilters.cityId = item.cityId;
  
  this.cityList = [];
  this.activeDropdown = '';
}


allBranchSearch(type: string) {
  // Pehle check karo ki Org select hui hai ya nahi
  const orgId = this.searchFilters.orgId; 
  
  if (!orgId) {
    alert("Please select an Organization first!");
    return;
  }

  const url = `${environment.apiUrl}/OrgBranch/GetByOrg/${orgId}`;
  this.http.get(url).subscribe({
    next: (res: any) => {
      const data = Array.isArray(res) ? res : res.data;
      if (data) {
        this.activeDropdown = type; // 'branch' set karega
        this.branchList = data.map((item: any) => ({
          branchId: item.id || item.branchId,
          branchName: item.branchName
        }));
        this.filteredBranches = []; // Purani suggestions band
      }
    },
    error: (err) => console.error("Branch fetch error:", err)
  });
}
getLineOfBusiness() {
  const url = `${environment.apiUrl}/CompanyService`; // Check karein agar endpoint 'GetLineOfBusiness' ya kuch aur hai
  this.http.get<any[]>(url).subscribe({
    next: (res) => {
      this.lineOfBusinessList = res;
      console.log("line of business",res)
    },
    error: (err) => {
      console.error("Error fetching Line of Business", err);
    }
  });
}
// Variables declare karein
filteredStates: string[] = [];

// 1. State Search Logic (Jab user type kare)
onStateSearch(event: any) {
  const val = event.target.value;
  
  if (val && val.length >= 3) {
    // stateLookupList mein se filter karega
    this.filteredStates = this.stateLookupList.filter(state => 
      state.toLowerCase().includes(val.toLowerCase())
    );
  } else {
    this.filteredStates = [];
  }
}

// 2. State Select Logic (Jab popup se click kare)
selectState(stateName: string) {
  this.stateProvince = stateName; // Input fill karega
  this.filteredStates = [];       // Popup band karega
}
// Aapke variables (Same to Same)

  allCountryData: any[] = [];
  isPopupOpen: boolean = false;
  regionalStateCollection: any[] = [];
  isStatePopupVisible: boolean = false;



  loadCountryList() {
    fetch('https://countriesnow.space/api/v0.1/countries/states')
      .then(response => response.json())
      .then(res => {
        this.allCountryData = res.data;
        this.cdr.detectChanges(); // Change detect karwayein
      })
      .catch(error => console.error("Error:", error));
  }

  handleSearchClick() {
    if (this.allCountryData.length === 0) {
      this.loadCountryList();
    }
    this.isPopupOpen = !this.isPopupOpen;
    this.cdr.detectChanges(); // UI Update
  }

  selectThisCountry(name: string) {
    this.country = name;
    this.isPopupOpen = false;
    this.stateProvince = ''; 
    this.cdr.detectChanges(); // Input fill hone ke baad update
  }

  fetchRegionalStates() {
    if (!this.country) {
      alert("Pehle country select karein!");
      return;
    }
    const payload = { country: this.country };
    fetch('https://countriesnow.space/api/v0.1/countries/states', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(result => {
        this.regionalStateCollection = result.data.states;
        this.isStatePopupVisible = !this.isStatePopupVisible;
        this.cdr.detectChanges(); // Change detect karwayein
      })
      .catch(err => console.error("State load karne mein error:", err));
  }

  assignSelectedState(stateName: string) {
    this.stateProvince = stateName;
    this.isStatePopupVisible = false;
    this.cdr.detectChanges(); // Input fill hone ke baad update
  }
resetBranchFormOnly() {
  this.branchName = '';
  this.isDefault = false;
  this.address = '';
  this.country = '';
  this.stateProvince = '';
  this.city = '';
  this.postalCode = '';
  this.area = '';
  this.landmark = '';
  this.telephone = '';
  this.fax = '';
  this.website = '';
  this.email = '';
  this.lineOfBusiness = null;

  this.contacts = [{
    contactName: '',
    DesignationId: null,
    DepartmentId: null,
    mobile: '',
    whatsapp: '',
    email: ''
  }];
}
onDefaultChange(currentIndex: number) {
  if (this.branchList[currentIndex].isDefault) {
    // 1. Baaki sabhi branches se default status hatao
    this.branchList.forEach((b, i) => {
      if (i !== currentIndex) b.isDefault = false;
    });
    
    // 2. (Optional) Agar tu chahta hai ki tick karte hi wo top par chali jaye:
    // const [target] = this.branchList.splice(currentIndex, 1);
    // this.branchList.unshift(target);
    // this.selectedBranchIndex = 0;
  }
  this.cdr.detectChanges();
}

// branchList: any[] = [];           
  filteredBranchSuggestions: any[] = []; 
  isBranchModalOpen: boolean = false;
  branchSearchText: string = '';
  loadBranchess() {
    // Yahan apna pura URL direct daal do (Environment se ya hardcoded check karne ke liye)
  const fullUrl = `${environment.apiUrl}/branch/list`;// <-- BHAI YAHAN APNA PURA URL DAAL DE

    this.http.get(fullUrl).subscribe({
      next: (res: any) => {
        console.log("API Success Response:", res);

        // API response format handle karna
        const data = Array.isArray(res) ? res : (res.data || res.result || []);
        
        // this.branchList = data.map((b: any) => ({ 
        //   ...b, 
        //   isSelected: false 
        // }));

        // this.filteredBranchSuggestions = [...this.branchList];
      },
      error: (err) => {
        console.error("Direct Call Failed! Error details:", err);
      }
    });
  }

  // Baki logic (Search, Toggle, Confirm) wahi rahega jo pehle tha...
  onBranchSearch() {
    const search = this.branchSearchText.toLowerCase().trim();
    this.filteredBranchSuggestions = this.branchList.filter(b => 
      b.branchName?.toLowerCase().includes(search)
    );
  }

  toggleBranchModal() { this.isBranchModalOpen = !this.isBranchModalOpen; }
  toggleBranchSelection(branch: any) { branch.isSelected = !branch.isSelected; }
  
  confirmSelection() {
    this.isBranchModalOpen = false;
    const selected = this.branchList.filter(b => b.isSelected);
    console.log("Final Selected Branches:", selected);
  }
  selectBranchFromDropdown(branch: any) {
  // Input field mein naam set kar do
  this.branchSearchText = branch.branchName;
  
  // Is branch ko toggle/select karo (jaise modal karta hai)
  this.toggleBranchSelection(branch);
  
  // Selection ke baad dropdown ko hide karne ke liye
  // Aap filter list ko reset ya text clear logic handle kar sakte hain
  // Filhal length 0 kar dete hain taaki dropdown chala jaye
  this.filteredBranchSuggestions = []; 
  
  // Reset search text if you want it to behave like a picker
  // this.branchSearchText = ''; 
}
  
showOrgModal = false;
// selectedOrgId: any = null;
selectedOrgData: any = null;

// Double click handle karne ke liye
handleOrgDblClick(org: any) {
  this.selectedOrgId = org.id;
  this.selectedOrgData = org;
  this.showOrgModal = true;
}

closeOrgModal() {
  this.showOrgModal = false;
  this.selectedOrgId = null;
  this.selectedOrgData = null;
}
} 