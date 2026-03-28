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

@Component({
  selector: 'app-organization-add',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule,DragDropModule], 
  templateUrl: './organization-add.component.html',
  styleUrl: './organization-add.component.css',
})
export class OrganizationAddComponent implements OnInit {
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
public branchList: any[] = []; // Temporary branches yahan rahengi
public branchName: string = ''; // Input field ke liye
// 1. Dropdown lists (Data Sources)
private apiUrl = 'https://countriesnow.space/api/v0.1/countries/states';
public countryMasterList: any[] = [];    // Sabhi countries ki original list
public stateLookupList: any[] = [];
selectedBranch: any = { id: 0, name: '', isDefault: false, isActive: true };
branches: any[] = []; 
lineOfBusinessList: any[] = [];
selectedLineOfBusiness: any = null;
// Is line ko variables section mein add karein
lineOfBusiness: any = ''; 

// Aur aapki list pehle se hi hogi:
// lineOfBusinessList: any[] = [];
 // ... baki variables ke niche
showColumnModal = false;
availableColumns: string[] = []; // Ye wo columns jo table mein nahi hain
selectedOrgId: number | null = null; // Edit ke liye ID store karne ko

// Label to Property Mapping (Taki table auto-render ho sake)
columnFieldMap: any = {
  'Org ID': 'id',
  'Org Name': 'orgName',
  'Alias': 'alias',
  'Type': 'selectedRoles',
  'Location': 'city',
  'Branch': 'branchName',
  'Organization ID': 'organizationId', 
  'Address': 'address',
  'Country': 'country',
  'City': 'city',
  'Telephone': 'telephone',
  'Email': 'email',
  'State/Province': 'stateProvince',
  'Website': 'website',
  'Postal Code': 'postalCode',
  'WhatsApp': 'whatsAppNumber',
  'Sales Person': 'salesPerson',
  'Collection Exec': 'collectionExec'
};

// Default columns jo shuru mein dikhenge
selectedColumns: string[] = [
  'Org ID', 
  'Org Name', 
  'Alias', 
  'Type', 
  'Country', 
  'City', 
  'Organization ID',
  'Location', 
  'Branch', 
  'Address',
  'Email', 
  'Telephone', 
  'WhatsApp',
  'Sales Person', 
  'Collection Exec',
  'Website', 
  'Postal Code', 
  'State/Province'
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

  constructor(private location: Location, private http: HttpClient,private cdr: ChangeDetectorRef,private router:Router) {}
 ngOnInit() {
  this.loadColumnSettings();
    this.getOrgList();
//     this.fetchNextBranch();
this.loadCountriesFromApi();
this.getLineOfBusiness();

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
saveOrg() {
  // Website Validation Check
  if (this.website && this.website.length > 0 && this.isWebsiteInvalid) {
    alert("please enter a valid webite address! (e.g. www.domain.com)");
    return;
  }

  // Baki saare validation
  const telValue = this.telephone ? this.telephone.toString().trim() : '';
  const isTelInvalid = telValue.length > 0 && telValue.length < 5;
  if (isTelInvalid) {
    alert("telephoe must be 5 to 15 dig's");
    return;
  }

  const isFormInvalid = this.contacts.some(c => 
    (c.mobile && c.mobile.length > 0 && c.mobile.length < 10) || 
    (c.whatsapp && c.whatsapp.length > 0 && c.whatsapp.length < 10) ||
    (c.isEmailInvalid)
  );

  if (isFormInvalid) {
    alert("please fill the valid email or a mobile number!");
    return; 
  }

  if (!this.orgName || !this.alias || !this.country || !this.city) {
    alert('Please fill mandatory fields: Name, Alias, Country, and City');
    return;
  }

  const url = `${environment.apiUrl}/Organization/save`;

  // Payload preparation
  const payload = {
    Id: this.selectedOrgId || 0,
    OrgName: this.orgName,
    Alias: this.alias,
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
    Contacts: this.contacts.map(c => ({
      ContactName: c.contactName,
      Mobile: c.mobile,
      Whatsapp: c.whatsapp,
      Email: c.email,
      DesignationId: (c.DesignationId === 'Manager') ? 1 : (c.DesignationId === 'HOD' ? 2 : 0),
      DepartmentId: (c.DepartmentId === 'Sales') ? 1 : (c.DepartmentId === 'Marketing' ? 2 : 0)
    }))
  };

  // --- MAIN SAVE CALL ---
  this.http.post(url, payload).subscribe({
    next: (res: any) => { 
      console.log("Full Backend Response:", res); 
      
      // --- BRANCH SAVE LOGIC START (FIXED) ---
      let savedIdFromBackend = 0;

      // Aapka backend ID 'res.data.id' mein bhej raha hai
      if (res && res.data && (res.data.id || res.data.Id)) {
        savedIdFromBackend = res.data.id || res.data.Id;
      } else if (typeof res === 'number') {
        savedIdFromBackend = res;
      } else if (res && (res.id || res.Id)) {
        savedIdFromBackend = res.id || res.Id;
      }

      // Agar New Form hai toh backend ki ID lo, warna update ke liye purani ID
      const finalOrgId = savedIdFromBackend || this.selectedOrgId;

      console.log("Final ID for saving branches:", finalOrgId);

      // Agar ID mil gayi aur sidebar mein branches hain, toh loop chalao
      if (finalOrgId && finalOrgId !== 0 && this.branchList.length > 0) {
        console.log("Triggering branch save API...");
        this.saveAllLocalBranches(finalOrgId);
      } else {
        console.warn("Branch save nahi hui: ID missing ya list khali hai.");
      }
      // --- BRANCH SAVE LOGIC END ---

      alert(this.selectedOrgId ? 'Updated Successfully!' : 'Saved Successfully!');
      
      // Cleanup & UI Refresh
      this.getOrgList(); 
      this.isFormOpen = false;
      this.resetFormFields(); 
      this.branchList = []; 
      this.cdr.detectChanges(); 
    },
    error: (err) => {
      console.error('Save Error:', err);
      alert('Error saving data.');
    }
  });
}
 onSaveBranch() {
  if (!this.branchName || !this.branchName.trim()) {
    alert("Please enter a branch name");
    return;
  }

  // --- CHECK: Kya hum EDIT kar rahe hain ya NAYA add kar rahe hain? ---
  if (this.editingBranchId !== null) {
    
    // CASE 1: UPDATE EXISTING BRANCH (Local List mein)
    // List mein wahi branch dhoondo jiski ID hamare paas 'editingBranchId' mein hai
    const index = this.branchList.findIndex(b => (b.id || b.Id) === this.editingBranchId);

    if (index !== -1) {
      // Local list mein naam change kar do
      this.branchList[index].branchName = this.branchName.trim();
      console.log("Branch updated in local list:", this.branchList[index]);
    }

    // Edit mode khatam, ID reset kar do
    this.editingBranchId = null;

  } else {
    
    // CASE 2: ADD NEW BRANCH (Purana Logic)
    const newBranch = {
      branchName: this.branchName.trim(),
      id: 0, 
      organizationId: this.selectedOrgId || 0 
    };

    this.branchList.push(newBranch);
    console.log("New brancch added in local list");
  }

  // --- COMMON STEPS ---
  this.branchName = ''; // Input box khali kar do
  this.cdr.detectChanges(); // UI refresh
}
saveAllLocalBranches(orgId: number) {
  // Sirf wo branches loop karo jinki ID 0 hai (yani jo abhi tak DB mein nahi gayi)
  const unsavedBranches = this.branchList.filter(b => !b.id || b.id === 0);

  unsavedBranches.forEach(branch => {
    const branchPayload = {
      BranchName: branch.branchName,
      OrganizationId: orgId // Nayi Org ID jo Organization save hone ke baad mili
    };

    // DIRECT API URL
  this.http.post(`${environment.apiUrl}/OrgBranch/SaveBranch`, branchPayload).subscribe({
  next: (res) => {
    console.log(`Branch ${branch.branchName} linked to Org ${orgId} successfully!`);
  },
      error: (err) => {
        console.error("Branch Save Error:", err);
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
selectBranch(branch: any) {
  console.log("Branch selected for edit:", branch);

  // 1. Input field mein naam populate karo
  // Kyunki aapka input [(ngModel)]="branchName" se juda hai, wahan naam turant dikhne lagega
  this.branchName = branch.branchName;

  // 2. Is branch ki ID save kar lo (Nayi branch ke liye ye 0 ya null hogi, purani ke liye DB wali ID)
  this.editingBranchId = branch.id || branch.Id;

  this.cdr.detectChanges();
}
  
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

editOrg(org: any) {
  console.log('Editing:', org);
  
  // 1. Form ko open karo
  this.isFormOpen = true;

  // 2. ID store karo (Taaki saveOrg() ko pata chale ki Update karna hai, New Save nahi)
  this.selectedOrgId = org.id; 

  // 3. Basic Fields mapping (Backend keys ko frontend variables se match karo)
  this.orgName = org.orgName || '';
  this.alias = org.alias || '';
  this.address = org.address || '';
  this.country = org.country || '';
  this.city = org.city || '';
  this.telephone = org.telephone || '';
  this.email = org.email || '';
  this.stateProvince = org.stateProvince || '';
  this.website = org.website || '';
  this.postalCode = org.postalCode || '';
  this.whatsAppNumber = org.whatsAppNumber || '';
  this.salesPerson = org.salesPerson || '';
  this.collectionExec = org.collectionExec || '';

  // 4. Branch handle karna
  if (org.branchName) {
    this.selectedBranch = { id: 0, name: org.branchName };
  }

  // 5. Roles handle karna (Agar string comma separated hai toh array banao)
  if (org.selectedRoles) {
    this.selectedRoles = typeof org.selectedRoles === 'string' 
      ? org.selectedRoles.split(',').map((r: string) => r.trim()) 
      : org.selectedRoles;
  } else {
    this.selectedRoles = [];
  }

  // 6. Dynamic Contacts handle karna
  if (org.contacts && Array.isArray(org.contacts)) {
    this.contacts = org.contacts.map((c: any) => ({
      contactName: c.contactName || c.name || '',
      mobile: c.mobile || '',
      whatsapp: c.whatsapp || '',
      email: c.email || '',
      designation: c.designation || '',
      department: c.department || ''
    }));
  } else {
    this.contacts = [{ contactName: '', designation: '', department: '', mobile: '', whatsapp: '', email: '' }];
  }

  // --- NAYA CODE START (Bina kuch purana change kiye) ---
  // Isse sidebar mein branches load ho jayengi
  if (org.id) {
    this.getBranchesByOrg(org.id);
  }
  // --- NAYA CODE END ---

  // 7. UI update trigger karo
  this.cdr.detectChanges();
}

// Ye function alag se niche add kar dena
getBranchesByOrg(orgId: number) {
  // Direct localhost URL jo Swagger mein chal rahi hai
const url = `${environment.apiUrl}/OrgBranch/GetByOrg/${orgId}`;

  console.log("Fetching branches from:", url);

  this.http.get<any[]>(url).subscribe({
    next: (res) => {
      console.log("Branches received from DB:", res);
      
      if (res && res.length > 0) {
        // Backend se aayi hui list ko sidebar list mein map karo
        this.branchList = res.map(b => ({
          id: b.id || b.Id,
          branchName: b.branchName || b.BranchName,
          organizationId: b.organizationId || b.OrganizationId
        }));
      } else {
        this.branchList = [];
      }
      
      this.cdr.detectChanges(); // Sidebar update karne ke liye
    },
    error: (err) => {
      console.error("Branches load karne mein error:", err);
      this.branchList = []; 
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
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.relative')) {
      this.isExportOpen = false;
this.organizationsList = [];
    }
  }

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
  
  // --- SABSE ZAROORI LINE (Iske bina ID update nahi hogi) ---
  this.selectedOrgId = 0; 
  // ---------------------------------------------------------

  this.orgName = '';
  this.alias = '';
  this.address = '';
  this.city = '';
  this.country = '';
  this.telephone = '';
  this.email = '';
  this.website = '';
  this.postalCode = '';
  this.stateProvince = '';
  this.whatsAppNumber = '';
  this.salesPerson = '';
  this.collectionExec = '';
  this.selectedRoles = [];
  this.contacts = [{ 
    contactName: '', 
    mobile: '', 
    whatsapp: '', 
    email: '', 
    DesignationId: '', 
    DepartmentId: '' 
  }];
  this.branchList = []; // Sidebar saaf ho gaya
  this.branchName = ''; // Input box khali ho gaya
  
  this.cdr.detectChanges(); // UI refresh
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
  const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  
  if (this.website && this.website.trim().length > 0) {
    // Agar regex match nahi karta toh error true
    this.isWebsiteInvalid = !urlPattern.test(this.website.trim());
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
  const val = event.target.value;
  
  if (val && val.length >= 3) {
    this.filteredCountries = this.countryMasterList.filter(item => 
      item.name.toLowerCase().includes(val.toLowerCase())
    );
  } else {
    this.filteredCountries = []; // Agar 3 se kam hai toh list khali rakho
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

}