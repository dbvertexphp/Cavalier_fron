import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// --- ADDED: Validators import ---
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
CdkDragDrop,
moveItemInArray,
transferArrayItem
} from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-lead-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule,DragDropModule],
  templateUrl: './lead-form.component.html',
  styleUrl: './lead-form.component.css',
})

export class LeadFormComponent implements OnInit {
// Aapka data array
showModal: boolean = false;
  leadForm!: FormGroup;
  searchForm!: FormGroup;
  showCustomPicker: boolean = false; // Shortcuts menu dikhane ke liye
  isFormOpen = false;
allLeads: any[] = [];       // original backup

  // --- CHANGED: Initialized as empty array ---
  leads: any[] = []; 

  // --- ADDED: Variable to store next lead number ---
  nextLeadNo: string = '0001';

  hodList: any[] = [];
  teamList: any[] = [];
  organizations: any[] = [];
  filteredOrganizations: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
this.loadColumnSettings();
    this.http.get(`${environment.apiUrl}/Hod`)
      .subscribe((res: any) => {
        this.hodList = res;
      });

    this.http.get(`${environment.apiUrl}/Teams`)
      .subscribe((res: any) => {
        this.teamList = res;
      });

    this.loadOrganizations();
    this.loadLeads();
    this.initSearchForm();
     // Important: Leads load first to calculate number
  }
availableColumns:string[] = [];

selectedColumns:string[] = [];

sortOrders:any = {};

drop(event: CdkDragDrop<string[]>) {

if (event.previousContainer === event.container) {

moveItemInArray(
event.container.data,
event.previousIndex,
event.currentIndex
);

} else {

transferArrayItem(
event.previousContainer.data,
event.container.data,
event.previousIndex,
event.currentIndex
);

}
console.log("Available Columns:", this.availableColumns);
console.log("Selected Columns:", this.selectedColumns);

// 🔥 table turant refresh
this.cdr.detectChanges();
 const payload = {
    availableColumns: JSON.stringify(this.availableColumns),
    selectedColumns: JSON.stringify(this.selectedColumns)
  };

  console.log("Available Columns:", this.availableColumns);
  console.log("Selected Columns:", this.selectedColumns);

  this.http.post(`${environment.apiUrl}/LeadColumnSettings/save`, payload)
  .subscribe({
    next:(res)=>{
      console.log("Column Settings Saved:", res);
    },
    error:(err)=>{
      console.error("Save error",err);
    }
  });

}
columnFieldMap:any = {
  'Lead No': 'leadNo',
  'Organization': 'organizationName',
  'Source': 'leadSource',
  'Sales Process': 'salesProcess',
  'Sales Stage': 'salesStage',
  'Owner': 'leadOwner',
  'Location': 'location',
  'Branch': 'branch',
  'Area': 'area',
  'Team': 'team',
  'Type': 'type',
  'Date': 'date',
  'Expected Validity': 'expectedValidity',
  'Reporting Manager': 'reportingManager',
  'Sales Coordinator': 'salesCoordinator',
  'HOD': 'hod',
  'Created At': 'createdAt',
  'Updated At': 'updatedAt'
};
sortColumn(column:string){

  const field = this.columnFieldMap[column];

  if(!this.sortOrders[column]){
    this.sortOrders[column] = 'asc';
  }else{
    this.sortOrders[column] = this.sortOrders[column] === 'asc' ? 'desc' : 'asc';
  }

  const order = this.sortOrders[column];

  this.leads.sort((a:any,b:any)=>{

    let valA = a[field];
    let valB = b[field];

    if(valA == null) return 1;
    if(valB == null) return -1;

    if(typeof valA === 'string'){
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if(order === 'asc'){
      return valA > valB ? 1 : -1;
    }else{
      return valA < valB ? 1 : -1;
    }

  });

  this.cdr.detectChanges();
}
loadColumnSettings() {

  this.http.get<any>(`${environment.apiUrl}/LeadColumnSettings`)
  .subscribe({

    next: (res) => {

      if(res){

        // API se string aa rahi hai → JSON.parse
        this.availableColumns = JSON.parse(res.availableColumns || '[]');
        this.selectedColumns = JSON.parse(res.selectedColumns || '[]');

      }

      this.cdr.detectChanges();

      console.log("Available Columns:", this.availableColumns);
      console.log("Selected Columns:", this.selectedColumns);

    },

    error:(err)=>{
      console.error("Column setting load error",err);
    }

  });

}
initSearchForm() {
    this.searchForm = this.fb.group({
      organizationName: [''],
      salesProcess: [''],
      leadNo: [''],
      salesStage: ['']
    });
  }

  // --- UPDATED: Clear Filters ---
 
  loadLeads(): void {
    this.http.get<any[]>(`${environment.apiUrl}/Leads`) 
      .subscribe({
        next: (res) => {
          this.leads = res; 
          console.log('Leads loaded:', res);
          // --- ADDED: Calculate next number after loading leads ---
          this.calculateNextLeadNo();
        },
        error: (err) => {
          console.error('Error fetching leads:', err);
        }
      });
  }

  // --- ADDED: Logic to calculate next lead number ---
  calculateNextLeadNo(): void {
    if (this.leads && this.leads.length > 0) {
      // Find the highest number in existing leads
      const maxLeadNo = this.leads.reduce((max, lead) => {
        // Assuming leadNo is like "0005" or "5"
        const currentNo = parseInt(lead.leadNo) || 0;
        return currentNo > max ? currentNo : max;
      }, 0);

      // Increment and format (e.g., 5 -> "0006")
      const nextNumber = maxLeadNo + 1;
      this.nextLeadNo = nextNumber.toString().padStart(4, '0');
    } else {
      this.nextLeadNo = '0001';
    }
    
    // Update the form field
    this.leadForm.patchValue({ leadNo: this.nextLeadNo });
  }

  onDeleteLead(id: any) {
    if (confirm('Do you want to delete this lead')) {
      this.http.delete(`${environment.apiUrl}/Leads/${id}`, { responseType: 'text' })
        .subscribe({
          next: (res) => {
            console.log('Delete response:', res);
            alert('Lead Deleted Successfully!');
            this.loadLeads(); // Table refresh karein
          },
          error: (err) => {
            console.error('Delete Error:', err);
            
            if (err.status === 200) {
              alert('Lead Deleted Successfully!');
              this.loadLeads();
            } else {
              alert('Delete fail !');
            }
          }
        });
    }
  }
  private loadOrganizations(): void {
    this.http
      .get<any[]>(`${environment.apiUrl}/Organization/List`)
      .subscribe({
        next: (res) => {
          this.organizations = res;
        },
        error: (err) => {
          console.error('Organization API Error:', err);
        }
      });
  }

  onOrganizationSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase();

    if (!value) {
      this.filteredOrganizations = [];
      return;
    }

    this.filteredOrganizations = this.organizations.filter(org =>
      org.orgName.toLowerCase().includes(value)
    );
  }

  selectOrganization(org: any): void {
    this.leadForm.patchValue({
      organization: org.orgName,
      organizationId: org.id
    });

    this.filteredOrganizations = [];
  }

  initForm() {
    const today = new Date();
    const validityDate = new Date();
    validityDate.setDate(today.getDate() + 90);

    this.leadForm = this.fb.group({
      organizationName: [''],
      // --- CHANGED: Bind to nextLeadNo ---
      // --- CHANGED: Added Validators.required to critical fields ---
      leadId:[""],
      leadNo: [{value: this.nextLeadNo, disabled: true}], // Disable for editing
      type: ['New Business', Validators.required],
      source: ['', Validators.required],
      salesProcess: ['', Validators.required],
      salesCoordinator: ['', Validators.required],
      branch: ['DELHI', Validators.required],
      date: [this.toISODate(today), Validators.required],
      leadOwner: ['BHARAT JUYAL', Validators.required],
      expectedValidity: [this.toISODate(validityDate)],
      salesStage: ['Inquiry Received', Validators.required],
      reportingManager: ['', Validators.required],
      hod: ['', Validators.required],
      team: ['', Validators.required],
      organization: ['', Validators.required],
      organizationId: ['', Validators.required],
      location: ['', Validators.required],
      area: ['', Validators.required],
    });
  }

  toggleForm() {
    this.isFormOpen = !this.isFormOpen;
  }

  navigateToNewOrg() {
    this.router.navigate(['/dashboard/organization-add']);
  }

  private toISODate(date: Date): string {
    return date.toISOString().substring(0, 10);
  }
// --- ADDED: Variable to store filtered leads ---
filteredLeads: any[] = [];

// --- ADDED: Search logic for Lead No ---
onLeadNoSearch(event: Event): void {
  const value = (event.target as HTMLInputElement).value.toLowerCase();

  if (!value) {
    this.filteredLeads = [];
    return;
  }

  // leads array mein se search karo
  this.filteredLeads = this.leads.filter(lead =>
    lead.leadNo.toLowerCase().includes(value)
  );
}

// --- ADDED: Selection logic for Lead No ---
selectLead(lead: any): void {
  // Form ko select ki gayi lead ki values se update karo
  this.leadForm.patchValue({
    leadNo: lead.leadNo,
    type: lead.type,
    source: lead.leadSource,
    salesProcess: lead.salesProcess,
    salesCoordinator: lead.salesCoordinator,
    branch: lead.branch,
    date: this.toISODate(new Date(lead.date)),
    expectedValidity: this.toISODate(new Date(lead.expectedValidity)),
    salesStage: lead.salesStage,
    reportingManager: lead.reportingManager,
    hod: lead.hod,
    team: lead.team,
    organization: lead.organizationName,
    location: lead.location,
    area: lead.area
  });

  // Dropdown list ko band karo
  this.filteredLeads = [];
}
// --- ADDED: Variables for filtering Sales Stages ---
filteredSalesStages: any[] = [];
// Assuming your API gives a list of strings for sales stages
salesStages: string[] = ['Inquiry Received', 'Qualified', 'Proposal Sent', 'Sales Closed']; 

// --- ADDED: Search logic for Sales Stage ---
onSalesStageSearch(event: Event): void {
  const value = (event.target as HTMLInputElement).value.toLowerCase();
  
  if (!value) {
    this.filteredSalesStages = [];
    return;
  }
  
  // salesStages array mein se search karo
  this.filteredSalesStages = this.salesStages.filter(stage =>
    stage.toLowerCase().includes(value)
  );
}

// --- ADDED: Selection logic for Sales Stage ---
selectSalesStage(stage: string): void {
  // Form ko select kiye gaye stage se update karo
  this.leadForm.patchValue({
    salesStage: stage
  });
  
  // Dropdown list ko band karo
  this.filteredSalesStages = []; 
}
// --- ADDED: Variables for filtering Dates ---
filteredDates: string[] = [];
allDates: string[] = []; // Saari leads ki dates yahan store hongi

// --- ADDED: Load dates from leads ---
loadLeadDates(): void {
  // leads array se saari unique dates nikal lo aur format karo
  this.allDates = [...new Set(this.leads.map(lead => this.toISODate(new Date(lead.date))))];
}

// --- ADDED: Search logic for Date ---
// onDateSearch(event: Event): void {
//   const value = (event.target as HTMLInputElement).value; // Date string format mein aayegi

//   if (!value) {
//     this.filteredDates = [];
//     return;
//   }

//   // allDates array mein se search karo
//   this.filteredDates = this.allDates.filter(date =>
//     date.includes(value)
//   );
// }

// --- ADDED: Selection logic for Date ---
selectDate(date: string): void {
  // Form ko select ki gayi date se update karo
  this.leadForm.patchValue({
    date: date
  });

  // Dropdown list ko band karo
  this.filteredDates = [];
}
  onSave() {
    if (this.leadForm.valid) {
      // --- CHANGED: Use getRawValue() to get disabled fields (like leadNo) ---
      const rawValue = this.leadForm.getRawValue();

      // Backend ke format mein data prepare karna
      const payload = {
        // --- CHANGED: Send calculated leadNo ---
        leadNo: this.nextLeadNo, 
        date: new Date(rawValue.date).toISOString(), 
        expectedValidity: new Date(rawValue.expectedValidity).toISOString(),
        type: rawValue.type,
        leadOwner: rawValue.leadOwner,
        leadSource: rawValue.source,
        salesProcess: rawValue.salesProcess,
        salesCoordinator: rawValue.salesCoordinator,
        salesStage: rawValue.salesStage,
        branch: rawValue.branch,
        reportingManager: rawValue.reportingManager,
        team: rawValue.team,
        hod: rawValue.hod,
        location: rawValue.location || "Default Location",
        area: rawValue.area || "Default Area",
        organizationName: rawValue.organization
      };

      console.log('--- Payload for Backend ---');
      console.log(JSON.stringify(payload, null, 2));

      // API Call
      this.http.post(`${environment.apiUrl}/Leads`, payload)
        .subscribe({
          next: (res) => {
            console.log('API Success! Closing form...');                
            // --- ADDED: For Date Shortcuts Panel ---
            this.isFormOpen = false;
            this.initForm();
            this.loadLeads(); // Reload leads to calculate new number for next form
            
            this.cdr.detectChanges();
            
            alert('Data successfully sent to backend!');
          },
          error: (err) => {
            console.error('API Error:', err);
            alert('Backend error: ' + err.message);
          }
        });

    } else {
      this.leadForm.markAllAsTouched();
      alert('Please fill all required fields.');
    }
  }

clearFilters() {
  this.leadForm.reset();
;// normal GET API call
}
  // 1. Apne HTML mein (click) event ko isse update kar do:
// (click)="selectAndSearchOrganization(org)"

// --- ADDED: Method with unique name ---
// ... existing imports and code

// --- ADDED: Method for input event in search form ---
// --- UPDATED: Method for input event in search bar (Performance Fixed) ---
onOrgSearchForFilters(event: Event): void {
  const value = (event.target as HTMLInputElement).value.toLowerCase();

  // 1. Agar input khali hai, toh dropdown aur table reset karein
  if (!value) {
    this.filteredOrganizations = [];
    this.loadLeads(); // Table wapas load karein
    return;
  }

  // 2. Sirf dropdown suggestions filter karein, API call na karein yahan
  this.filteredOrganizations = this.organizations.filter(org =>
    org.orgName.toLowerCase().includes(value)
  );
}

// --- ADDED: Method for selection in search form ---
selectOrgForFilters(org: any): void {
  // 1. --- CHANGED: Direct control access for faster update ---
  this.searchForm.controls['organizationName'].setValue(org.orgName);

  // 2. Dropdown suggestions ko khali karein
  this.filteredOrganizations = [];

  // --- ADDED: Force Angular to update UI immediately ---
  this.cdr.detectChanges();

  // 3. API Call to filter table immediately
  this.filterTableByOrganization(org.orgName);
}

// --- ADDED: Method to call search API for filtering table ---
filterTableByOrganization(orgName: string) {
  this.http.get<any[]>(`${environment.apiUrl}/Leads/search-leads`, {
    params: { organizationName: orgName }
  })
  .subscribe(res => {
    this.leads = res; // Main table update ho jayegi
  });
}
// ... rest of the code
// // --- ADDED: Method for input event in Lead No search bar ---
onLeadNoSearchForFilters(event: Event): void {
  const value = (event.target as HTMLInputElement).value.toLowerCase();

  if (!value) {
    this.filteredLeads = [];
    this.loadLeads(); // Reset table
    return;
  }

  // Filter dropdown suggestions
  this.filteredLeads = this.leads.filter(lead =>
    lead.leadNo.toLowerCase().includes(value)
  );
}


// --- ADDED: Method for input event in Sales Stage search bar ---
onSalesStageSearchForFilters(event: Event): void {
  const value = (event.target as HTMLInputElement).value.toLowerCase();

  if (!value) {
    this.filteredSalesStages = [];
    this.loadLeads(); // Reset table
    return;
  }

  // Filter dropdown suggestions from the predefined salesStages array
  this.filteredSalesStages = this.salesStages.filter(stage =>
    stage.toLowerCase().includes(value)
  );
}

// --- ADDED: Method for selection in Sales Stage search bar ---
selectSalesStageForFilters(stage: string): void {
  // 1. Update search form control
  this.searchForm.controls['salesStage'].setValue(stage);

  // 2. Hide dropdown
  this.filteredSalesStages = [];

  // 3. --- Force UI update ---
  this.cdr.detectChanges();

  // 4. API Call to filter table immediately
  this.filterTableBySalesStage(stage);
}

// --- ADDED: Method to call search API for Table ---
filterTableBySalesStage(stage: string) {
  this.http.get<any[]>(`${environment.apiUrl}/Leads/search-leads`, {
    params: { salesStage: stage }
  })
  .subscribe(res => {
    this.leads = res; // Update table
  });
}
// --- ADDED: Array to store filtered processes ---
filteredSalesProcesses: string[] = [];

// --- ADDED: Array to store all available processes (load this on init) ---
allSalesProcesses: string[] = ['Process A', 'Process B', 'Process C']; // Replace with actual API data

// --- ADDED: Method for input event in Sales Process search bar ---
onSalesProcessSearchForFilters(event: Event): void {
  const value = (event.target as HTMLInputElement).value.toLowerCase();

  if (!value) {
    this.filteredSalesProcesses = [];
    this.loadLeads(); // Reset table
    return;
  }

  // Filter dropdown suggestions from allSalesProcesses array
  this.filteredSalesProcesses = this.allSalesProcesses.filter(process =>
    process.toLowerCase().includes(value)
  );
}

// --- ADDED: Method for selection in Sales Process search bar ---
selectSalesProcessForFilters(process: string): void {
  // 1. Update search form control
  this.searchForm.controls['salesProcess'].setValue(process);

  // 2. Hide dropdown
  this.filteredSalesProcesses = [];

  // 3. --- Force UI update ---
  this.cdr.detectChanges();

  // 4. API Call to filter table immediately
  this.filterTableBySalesProcess(process);
}

// --- ADDED: Method to call search API for Table ---
filterTableBySalesProcess(process: string) {
  this.http.get<any[]>(`${environment.apiUrl}/Leads/search-leads`, {
    params: { salesProcess: process }
  })
  .subscribe(res => {
    this.leads = res; // Update table
  });
}
// Component ke upar define karein
// Search Filters ka main object
leadSearchFilters = {
  date: null,
  organizationName: '',
  type: 'Any',
  leadNo: '',
  salesProcess: '',
  salesStage: '',
  leadOwner: 'Any'
};
// Dropdown lists for suggestions
leadNoList: string[] = [];
leadOrgList: string[] = [];
leadOwnerList: string[] = [];

// Date select karne par filter trigger ho
// Date select karne ke liye unique function
selectLeadDate(date: any): void {
  this.leadSearchFilters.date = date; // Object update (string value set ho jayegi)
  this.filteredDates = [];           // Dropdown suggestions band
  this.onLeadSearch();               // Turant search trigger (Jaise Inq/Quo mein hota hai)
}

// Date search logic (Saari leads ki unique dates mein se filter)
onDateSearch(event: Event): void {
  const value = (event.target as HTMLInputElement).value;
  if (!value) {
    this.filteredDates = [];
    return;
  }
  // allDates hum loadLeads() ke waqt fill kar lenge
  this.filteredDates = this.allDates.filter(d => d.includes(value));
}

// 1. Dropdown filter karne ke liye (Same rahega)
onLeadOrgSearch(event: Event): void {
  const value = (event.target as HTMLInputElement).value.toLowerCase();
  
  if (!value) {
    this.filteredOrganizations = [];
    return;
  }

  this.filteredOrganizations = this.organizations.filter(org =>
    org.orgName.toLowerCase().includes(value)
  );
}





// --- ADDED: Date Shortcut Logic for Lead Form ---
setLeadQuickDate(type: string) {
  const today = new Date();
  let targetDate = new Date();

  switch (type) {
    case 'tomorrow': targetDate.setDate(today.getDate() + 1); break;
    case 'yesterday': targetDate.setDate(today.getDate() - 1); break;
    case 'nextWeek': targetDate.setDate(today.getDate() + 7); break;
    case 'lastWeek': targetDate.setDate(today.getDate() - 7); break;
    case 'nextMonth': targetDate.setMonth(today.getMonth() + 1); break;
    case 'lastMonth': targetDate.setMonth(today.getMonth() - 1); break;
    default: targetDate = today; // Today
  }

  // Formatting to YYYY-MM-DD
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;

  // Aapke leadForm mein value patch karega
  this.leadForm.patchValue({
    date: formattedDate
  });

  this.showCustomPicker = false; // Menu band
  this.cdr.detectChanges();      // UI refresh
}








// 2. Dropdown se select karne par (Ab SEARCH CALL NAHI HOGA)
selectLeadOrg(org: any): void {
  this.leadSearchFilters.organizationName = org.orgName; // Bas value update hogi
  this.filteredOrganizations = [];                      // Dropdown band hoga
  // Yahan se this.onLeadSearch() hata diya gaya hai taaki auto-search na ho
}

loadLeadSuggestions() {
  this.http.get<any[]>(`${environment.apiUrl}/Leads`)
    .subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          // 1. Lead Numbers
          this.leadNoList = [...new Set(data.map(l => l.leadNo).filter(val => val))];

          // 2. Organization Names
          this.leadOrgList = [...new Set(data.map(l => l.organizationName).filter(val => val))];

          // 3. Lead Owners (Assigned To)
          this.leadOwnerList = [...new Set(data.map(l => l.leadOwner).filter(val => val))];
          // 4. Sales Processes (Suggestions ke liye)
         this.allSalesProcesses = [...new Set(data.map(l => l.salesProcess).filter(val => val))];

          this.cdr.detectChanges(); 
        }
      },
      error: (err) => console.error("Leads Suggestions Fetch Error:", err)
    }); 
}
// 1. Dropdown se select karte waqt sirf value set karo, search mat chalao
selectLeadForFilters(lead: any): void {
this.leadSearchFilters.leadNo = lead.leadNo; // Check: kya ye sahi set ho raha hai?
  this.filteredLeads = [];
  this.cdr.detectChanges();// Dropdown band
  
}

// 2. Main Search Button Function
onLeadSearch() {
  const searchInput = this.leadSearchFilters.leadNo?.toString().trim();
  let filtersToSend: any = {};

  // 🔥 MAGIC LOGIC: Agar Lead No likha hai, toh baaki filters ko saaf kar do
  if (searchInput && searchInput !== "") {
    // Sirf Lead No bhejo (PascalCase mein taaki Backend accept kare)
    filtersToSend = {
      LeadNo: searchInput,
      OrganizationName: '',
      Type: '',
      LeadOwner: '',
      SalesStage: '',
      SalesProcess: ''
    };
    console.log("🎯 Hard Searching for Lead No only:", searchInput);
  } else {
    // Agar Lead No khali hai, tab normal filters chalne do
    filtersToSend = {
      LeadNo: '',
      OrganizationName: this.leadSearchFilters.organizationName || "",
      Type: this.leadSearchFilters.type === 'Any' ? "" : this.leadSearchFilters.type,
      LeadOwner: this.leadSearchFilters.leadOwner === 'Any' ? "" : this.leadSearchFilters.leadOwner,
      SalesStage: this.leadSearchFilters.salesStage || "",
      SalesProcess: this.leadSearchFilters.salesProcess || ""
    };
    console.log("🔍 Normal Filter Search Triggered");
  }

  // API Call (Make sure environment.apiUrl correct ho)
  this.http.post<any[]>(`${environment.apiUrl}/Leads/Search`, filtersToSend)
    .subscribe({
      next: (response) => {
        let results = response || [];

        // 🎯 Sorting: Match milte hi Index 0 (Top) par!
        if (searchInput && results.length > 0) {
          results.sort((a, b) => {
            // Backend se LeadNo ya leadNo jo bhi aaye handle karein
            const valA = (a.leadNo || a.LeadNo || "").toString().trim();
            const valB = (b.leadNo || b.LeadNo || "").toString().trim();

            if (valA === searchInput) return -1; // Exact match top par
            if (valB === searchInput) return 1;
            return 0;
          });
        }

        this.leads = [...results];
        this.cdr.detectChanges();
        
        console.log("✅ Data on table:", this.leads);

        if (this.leads.length === 0) {
          alert("No data found In db.");
        }
      },
      error: (err) => {
        console.error("❌ API Error:", err);
        alert("Search failed! Check if API is running.");
      }
    });
}
// Global Search Function (Filters + Sorting)
private executeGlobalSearch(targetNo: string | null) {
  let filters: any = {};
  
  // Baaki saare filters load karo
  if (this.leadSearchFilters.organizationName) filters.organizationName = this.leadSearchFilters.organizationName;
  if (this.leadSearchFilters.type && this.leadSearchFilters.type !== 'Any') filters.type = this.leadSearchFilters.type;
  if (this.leadSearchFilters.leadOwner && this.leadSearchFilters.leadOwner !== 'Any') filters.leadOwner = this.leadSearchFilters.leadOwner;
  if (this.leadSearchFilters.salesProcess) filters.salesProcess = this.leadSearchFilters.salesProcess;
  if (this.leadSearchFilters.salesStage) filters.salesStage = this.leadSearchFilters.salesStage;
  if (this.leadSearchFilters.date) filters.date = new Date(this.leadSearchFilters.date).toISOString();

  this.http.post<any[]>(`${environment.apiUrl}/Leads/Search`, filters)
    .subscribe({
      next: (response) => {
        let results = response || [];

        // Sorting Logic: Agar targetNo match kare toh TOP par
        if (targetNo && results.length > 0) {
          const lowerTarget = targetNo.toLowerCase();
          results.sort((a, b) => {
            const aNo = a.leadNo?.toString().toLowerCase() || '';
            const bNo = b.leadNo?.toString().toLowerCase() || '';
            if (aNo === lowerTarget) return -1;
            if (bNo === lowerTarget) return 1;
            return 0;
          });
        }

        this.leads = results;
        this.cdr.detectChanges();
        console.log("🌐 Global Search complete. Leads sorted by priority.");
      }
    });
}
// 1. Input filter logic
onLeadSalesStageSearch(event: Event): void {
  const value = (event.target as HTMLInputElement).value.toLowerCase();
  
  if (!value) {
    this.filteredSalesStages = [];
    return;
  }

  // salesStages list (jo loadLeadSuggestions mein bhari gayi thi) se filter karein
  this.filteredSalesStages = this.salesStages.filter(stage =>
    stage.toLowerCase().includes(value)
  );
}

// 2. Selection logic (Sirf value bharega, search tabhi hoga jab 🔍 click hoga)
selectLeadSalesStage(stage: string): void {
  this.leadSearchFilters.salesStage = stage; // UI update
  this.filteredSalesStages = [];             // Dropdown band
}
resetLeadFilters() {
  this.leadSearchFilters = {
    leadNo: '',
    date: null,
    organizationName: '',
    type: 'Any',
    leadOwner: 'Any',
    salesProcess: '',
    salesStage: ''
  };

  const resetPayload = {
    leadNo: '',
    date: null,
    organizationName: '',
    type: '',
    leadOwner: '',
    salesProcess: '',
    salesStage: ''
  };

  this.http.post<any[]>(`${environment.apiUrl}/Leads/Search`, resetPayload)
    .subscribe({
      next: (response) => {
        this.leads = response || [];
        this.cdr.detectChanges();
        console.log("✅ Leads Table Restored");
      }
    });
}
}