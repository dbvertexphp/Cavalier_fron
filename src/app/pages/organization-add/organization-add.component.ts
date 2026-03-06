import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http'; 
import { environment } from '../../../environments/environment';
import { any } from '@amcharts/amcharts5/.internal/core/util/Array';
import { Router } from '@angular/router';

@Component({
  selector: 'app-organization-add',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule], 
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

  branches :any [] =[];
  selectedBranch: any = null

  constructor(private location: Location, private http: HttpClient,private cdr: ChangeDetectorRef,private router:Router) {}
fetchNextBranch() {
  const url = `${environment.apiUrl}/Organization/next-branch-name`;
  this.http.get<{nextName: string}>(url).subscribe({
    next: (res) => {
      // 1. Pehle list ko khali karo taaki purane temporary numbers (like Branch 02) hat jaye in
      this.branches = []; 

      // 2. Naya branch object banao
      const newBranch = { id: 0, name: res.nextName, isDefault: true };
      
      // 3. List mein sirf naya number daalo
      this.branches.push(newBranch);
      
      // 4. Isko auto-select karo taaki form mein dikhne lage
      this.selectedBranch = newBranch;
      
      this.cdr.detectChanges();
    },
    error: (err) => console.error("Branch fetch error:", err)
  });
}
  ngOnInit() {
    this.getOrgList();
    this.fetchNextBranch();
  }

  getOrgList() {
    const url = `${environment.apiUrl}/Organization/list`;
    
    this.http.get(url).subscribe({
      next: (data: any) => { 
        this.organizations = data; 
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
  //   const index = this.selectedRoles.indexOf(role);
  //   if (index > -1) {
  //     this.selectedRoles.splice(index, 1);
  //   } else {
  //     this.selectedRoles.push(role);
  //     this.activeTab = role;
  //   }
  // }
// selectedRoles array ko track karne ke liye logic
toggleRole(role: string) {
  const index = this.selectedRoles.indexOf(role);
  if (index > -1) {
    this.selectedRoles.splice(index, 1);
  } else {
    this.selectedRoles.push(role);
    this.activeTab = role;
    
    // Agar 'shipper' select hua hai, toh hum toggle kar sakte hain ya redirect
    if (role === 'shipper') {
      console.log("Shipper selected! Showing Shipper Form...");
      this.router.navigate(['/dashboard/shipper']);
    }
       if (role === 'consignee') {
      console.log("Consignee selected! Showing Shipper Form...");
      this.router.navigate(['/dashboard/Consignee']);
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
  console.log("🚀 Sab sahi hai! Data save ho raha hai.");
  const telValue = this.telephone ? this.telephone.toString().trim() : '';

  // Naya Logic: Min 5, Max 15
  const isTelInvalid = telValue.length > 0 && telValue.length < 5;
  if (isTelInvalid) {
    alert("telephoe must be5 to 15 dig's");
    return;
  }

  console.log("✅ Telephone validation passed!");
  const faxValue = this.fax ? this.fax.toString().trim() : '';
  const isFaxInvalid = faxValue.length > 0 && faxValue.length < 6;
  if (isFaxInvalid) {
    alert("fax dig min 6 or max 13");
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

  const isAnyNumberInvalid = this.contacts.some(c => 
    c.whatsapp && c.whatsapp.length > 0 && c.whatsapp.length < 10
  );

  if (isAnyNumberInvalid) {
    alert("please fill the valid email or a mobile number!");
    return;
  }

  if (!this.orgName || !this.alias || !this.country || !this.city) {
    alert('Please fill mandatory fields: Name, Alias, Country, and City');
    return;
  }

  const url = `${environment.apiUrl}/Organization/save`;

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
      
      // 1. List refresh karo
      this.getOrgList(); 
      
      // 2. Form close karo
      this.isFormOpen = false;

      // 🔥 3. AGLE BRANCH KA NAAM FETCH KARO (Dynamic Increment)
      this.fetchNextBranch(); 

      // 4. Form fields reset karo (taaki agla entry fresh ho)
      this.resetFormFields();

      console.log(payload);
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
    this.isFormOpen = true;
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
  //   const query = this.searchQuery ? this.searchQuery.trim() : '';
  //   if (!query) {
  //     this.getOrgList();
  //     return;
  //   }
  //   const url = `${environment.apiUrl}/Organization/search?orgName=${query}`;
  //   this.http.get(url).subscribe({
  //     next: (data: any) => {
  //       this.organizations = data || [];  
  //       console.log('Data mila:', this.organizations);

  //       this.cdr.detectChanges();
  //     }
  //   });
  // }

  // onOrgSelect(org: any) {
  //   this.searchQuery = org.orgName;
  //   this.organizations = [org];
   
  // }
  

// searchFilters: any = {
//     orgName: '',
//     orgCode: '',
//     orgType: '',
//     city: '', // Ye city search ke liye zaroori hai
//     orgGroup: '',
//     status: 'Active',
//     branch: 'DELHI',
//     createdDate: ''
//   };

//   ///city search
// // 1. City (address) list store karne ke liye variable


// // 2. City search function (Address field ke basis par)
// searchCity() {
//   const query = this.searchFilters.city ? this.searchFilters.city.trim() : '';
  
//   // Agar query khali hai toh dropdown clear karein
//   if (!query) {
//     this.cities = [];
//     return;
//   }

//   // API call to search for city based on 'address'
// const url =  `${environment.apiUrl}/Organization/search?address=${query}`;;
  
//   this.http.get(url).subscribe({
//     next: (data: any) => {
//       // API se aaya data cities ar
//       // ray mein daalein
//       console.log('API se data mila:', data); // <--- YAHAN CHECK KAREIN
//       this.cities = data || [];
//     },
//     error: (err) => {
//       console.error('Error searching address', err);
//       this.cities = [];
//        this.cdr.detectChanges();
//     }
//   });
// }

// // 3. City Selection Logic
// onCitySelect(city: any) {
//   // 1. Input field ko select kiye gaye city se update karein
//   this.searchFilters.city = city.address; 
  
//   // 2. Cities array ko khali karein taaki dropdown band ho jaye
//   this.cities = []; // <--- SEHI: Dropdown band karne ke liye array empty karein
  
//   // 3. TABLE REFRESH KAREIN: Select hone ke baad data reload karein
//   this.searchOrganization(); // <--- ADDED: Table update karein
  
//   console.log('City selected and table refresh called:', this.searchFilters.city);
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



}