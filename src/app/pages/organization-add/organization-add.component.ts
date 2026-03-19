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
// 1. Dropdown lists (Data Sources)
private apiUrl = 'https://countriesnow.space/api/v0.1/countries/states';
public countryMasterList: any[] = [];    // Sabhi countries ki original list
public stateLookupList: any[] = [];
selectedBranch: any = { id: 0, name: '', isDefault: false, isActive: true };
branches: any[] = []; 
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
  'Email': 'email',
  'Telephone': 'telephone',
  'Sales Person': 'salesPerson',
  'Website': 'website'
};

// Default columns jo shuru mein dikhenge
selectedColumns: string[] = ['Org ID', 'Org Name', 'Alias', 'Type', 'Location'];
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
    this.fetchNextBranch();
this.loadCountriesFromApi();

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
        this.fetchNextBranch();
      }
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('List fetch error:', err);
    }
  });
}

fetchNextBranch() {
  const url = `${environment.apiUrl}/Organization/next-branch-name`;
  this.http.get<{nextName: string}>(url).subscribe({
    next: (res) => {

      // 1. Naya branch object banao
      const newBranch = { id: 0, name: res.nextName, isDefault: true };

      // 2. Check karo duplicate na aaye
      const exists = this.branches.some(b => b.name === res.nextName);

      if (!exists) {
        // 3. New branch ko add karo (neeche add hoga)
        this.branches.push(newBranch);
      }

      // 4. Auto select latest branch
      this.selectedBranch = newBranch;

      this.cdr.detectChanges();
    },
    error: (err) => console.error("Branch fetch error:", err)
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
    
    // Agar wahi tab active tha jo band kiya, toh kisi aur tab par shift ho jao ya khali kar do
    if (this.activeTab === role) {
      this.activeTab = this.selectedRoles.length > 0 ? this.selectedRoles[0] : 'general';
    }
  } else {
    // Naya role add karo
    this.selectedRoles.push(role);
    
    // Page redirect karne ki jagah isi page ka 'activeTab' badal do
    this.activeTab = role; 

    // Debugging ke liye console log
    if (role === 'shipper') {
      console.log("Shipper section activated on current page.");
    }
    if (role === 'consignee') {
      console.log("Consignee section activated on current page.");
    }
  }
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

  // Payload: Branch logic ke saath (Baaki sab same hai)
  const payload = {
    Id: this.selectedOrgId || 0,
    OrgName: this.orgName,
    Alias: this.alias,
    // Yahan selectedBranch ka name ja raha hai
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
    Contacts: this.contacts.map(c => ({
      ContactName: c.contactName,
      Mobile: c.mobile,
      Whatsapp: c.whatsapp,
      Email: c.email,
      DesignationId: (c.DesignationId === 'Manager') ? 1 : (c.DesignationId === 'HOD' ? 2 : 0),
      DepartmentId: (c.DepartmentId === 'Sales') ? 1 : (c.DepartmentId === 'Marketing' ? 2 : 0)
    }))
  };

  this.http.post(url, payload).subscribe({
    next: () => {
      alert(this.selectedOrgId ? 'Updated Successfully!' : 'Saved Successfully!');
      
      this.getOrgList(); 
      this.isFormOpen = false;
      this.fetchNextBranch(); 
      this.resetFormFields(); 
      this.cdr.detectChanges(); 
    },
    error: (err) => {
      console.error('Save Error:', err);
      alert('Error saving data.');
    }
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
  selectBranch(branch: any) { this.selectedBranch = branch; }
  
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
  // Agar backend se 'contacts' ya 'contactDetails' naam se array aa raha hai
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
    // Agar koi contact nahi hai toh kam se kam ek khali row rakho
    this.contacts = [{ contactName: '', designation: '', department: '', mobile: '', whatsapp: '', email: '' }];
  }

  // 7. UI update trigger karo
  this.cdr.detectChanges();
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
    this.fetchNextBranch();
    
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
      if (res && res.selectedColumns) {
        this.selectedColumns = JSON.parse(res.selectedColumns);
        this.availableColumns = JSON.parse(res.availableColumns);
      } else {
        // Default Columns agar DB mein kuch na ho
        this.selectedColumns = ['Org ID', 'Org Name', 'Type', 'Location'];
        // availableColumns mein wo saare columns daal do jo selectedColumns mein nahi hain
        const allPossibleColumns = Object.keys(this.columnFieldMap);
        this.availableColumns = allPossibleColumns.filter(c => !this.selectedColumns.includes(c));
      }
      this.cdr.detectChanges();
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
addNewBranch() {
  console.log("Creating a completely fresh branch reference...");
  
  // Naya object assign karne se purana wala memory se 'unlink' ho jata hai
  this.selectedBranch = { 
    id: 0, 
    name: '', 
    isDefault: false, 
    isActive: true 
  };

  // Change detection ko force karna zaroori hai taaki HTML purane reference ko bhul jaye
  this.cdr.detectChanges();
}

/**
 * SAVE BRANCH BUTTON: Jo aap baar-baar click karke branches add karna chahte ho.
 */
saveBranchToDB() {
  const branchName = this.selectedBranch.name?.trim();

  if (!branchName) {
    alert("Bhai, pehle branch ka naam toh likho!");
    return;
  }

  // 1. Check karo ki kya aapke paas Organization ID hai? 
  // Bina Org ID ke branch save nahi hogi database mein.
  if (!this.selectedOrgId) {
    alert("Bhai, pehle Organization select karo ya save karo!");
    return;
  }

  // 2. PAYLOAD: Backend ke hisaab se Keys check karo (Capital 'I' vs small 'i')
  const payload = {
    Id: this.selectedBranch.id || 0,
    Name: branchName,
    OrganizationId: this.selectedOrgId, // 👈 Ye field honi bahut zaroori hai
    IsDefault: this.selectedBranch.isDefault || false,
    IsActive: true
  };

  // 3. URL CHECK: Agar 'save-branch' par 405 aa raha hai, 
  // toh ho sakta hai URL sirf '/Organization/SaveBranch' ho (bina dash ke)
  // Ek baar apne Swagger ya API Doc mein confirm karo.
  const url = `${environment.apiUrl}/Organization/SaveBranch`; 

  this.http.post(url, payload).subscribe({
    next: (res: any) => {
      alert(`Branch "${res.name || branchName}" save ho gayi!`);

      const index = this.branches.findIndex(b => b.id === res.id);
      if (index === -1) {
        this.branches.push(res); 
      } else {
        this.branches[index] = res; 
      }

      this.addNewBranch(); 
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error("Save Error:", err);
      // Agar 405 abhi bhi aa raha hai, toh message box mein dikhega
      if(err.status === 405) {
        alert("Error 405: Backend par 'POST' method allowed nahi hai ya URL galat hai!");
      } else {
        alert("Database error! Save nahi ho paya.");
      }
    }
  });
}
loadCountriesFromApi() {
    this.http.get(this.apiUrl).subscribe({
      next: (response: any) => {
        // response.data mein saari countries aur unke states hote hain
        if (response && response.data) {
          this.countryMasterList = response.data;
        }
      },
      error: (err) => {
        console.error('API Error:', err);
      }
    });
  }

  // 2. Jab user country type ya select kare
  onCountrySelectionChange() {
    // Pichli state selection clear karo
    this.stateProvince = ''; 

    // Find the country object from the master list
    const selectedObj = this.countryMasterList.find(c => 
      c.name.toLowerCase() === this.country.trim().toLowerCase()
    );

    if (selectedObj && selectedObj.states) {
      // States array me se sirf names nikaal kar string array banao
      this.stateLookupList = selectedObj.states.map((s: any) => s.name);
    } else {
      this.stateLookupList = [];
    }

}
}