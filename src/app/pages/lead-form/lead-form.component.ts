import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// --- ADDED: Validators import ---
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CheckPermissionService } from '../../services/check-permission.service';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { leadSchema } from './lead.schema';
import { Subscription } from 'rxjs';
import { HttpHeaders } from '@angular/common/http'; // Top par import check kar lena
import { UserService } from '../../services/user.service';
// 'fdfd';
@Component({
  selector: 'app-lead-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule, DragDropModule ],
  templateUrl: './lead-form.component.html',
  styleUrl: './lead-form.component.css',
   
})

export class LeadFormComponent implements OnInit {
// Aapka data array
// PAGINATION VARIABLES

salesProcesses: any[] = [];
leadOwners: any[] = [];
salesCoordinators: any[] = [];
reportingManagers: any[] = [];
branches: any[] = [];
currentPage: number = 1;
itemsPerPage: number = 10;
totalPages: number = 0;
 PermissionID:any;
paginatedLeads: any[] = [];
showModal: boolean = false;
  leadForm!: FormGroup;
  searchForm!: FormGroup;
  showCustomPicker: boolean = false; // Shortcuts menu dikhane ke liye
  isFormOpen = false;
allLeads: any[] = [];       // original backup
// sortOrders: { [key: string]: string } = {};
  // --- CHANGED: Initialized as empty array ---
  leads: any[] = []; 

  // --- ADDED: Variable to store next lead number ---
  nextLeadNo: string = '0001';

  hodList: any[] = [];
  teamList: any[] = [];
  organizations: any[] = [];
  filteredOrganizations: any[] = [];
  filteredHODSuggestions:any[]=[]
  hodUniqueList:any[]=[]
goToPage(page: number) {
  this.currentPage = page;
  this.updatePagination();
}
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    public CheckPermissionService:CheckPermissionService,
    public userServices:UserService
  ) {}

  ngOnInit(): void {
    this.loadDropdownData()
    this.loadLeadOwners();
    this.getSalesProcesses();
    this.getLeadOwners();
    this.getSalesCoordinators();
    this.getBranches();
        this.PermissionID = Number(localStorage.getItem('permissionID'));
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
    this.loadLeadSuggestions();
    this.getReportingManagers(); // Isse call karna mat bhulna!
     // Important: Leads load first to calculate number
  }
  
  updatePagination() {

  this.totalPages = Math.ceil(this.leads.length / this.itemsPerPage);

  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  const endIndex = startIndex + this.itemsPerPage;

  this.paginatedLeads = this.leads.slice(startIndex, endIndex);

}
nextPage() {

  if (this.currentPage < this.totalPages) {

    this.currentPage++;

    this.updatePagination();

  }

}
getLeadOwners() {
  this.http.get<any[]>(`${environment.apiUrl}/LeadOwners`).subscribe({
    next: (res) => {
      this.leadOwners = res;
    },
    error: (err) => console.error('Error fetching lead owners', err)
  });
}
getSalesCoordinators() {
  this.http.get<any[]>(`${environment.apiUrl}/SalesCoordinators`).subscribe({
    next: (res) => {
      this.salesCoordinators = res;
    },
    error: (err) => console.error('Sales Coordinator load karne mein error:', err)
  });
}
getBranches() {
  this.http.get<any[]>(`${environment.apiUrl}/branch/list`).subscribe(res => {
    console.log("Branch Data:", res); // 👈 Ye check karo console mein ki 'name' ki jagah kya likha hai
    this.branches = res;
  });
}
getSalesProcesses() {
  this.http.get<any[]>(`${environment.apiUrl}/SalesProcesses`).subscribe({
    next: (res) => {
      this.salesProcesses = res;
    },
    error: (err) => console.error('Error fetching sales processes', err)
  });
}
getReportingManagers() {
  this.http.get<any[]>(`${environment.apiUrl}/ReportingManagers`).subscribe({
    next: (res) => {
      this.reportingManagers = res;
    },
    error: (err) => console.error('Reporting Manager fetch error:', err)
  });
}
previousPage() {

  if (this.currentPage > 1) {

    this.currentPage--;

    this.updatePagination();

  }

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
  const token = localStorage.getItem('cavalier_token');

  const headers = {
    Authorization: `Bearer ${token}`
  };

  this.http.get<any[]>(`${environment.apiUrl}/Leads`, { headers }) 
    .subscribe({
      next: (res) => {
        this.leads = res; 
        this.currentPage = 1;

        this.updatePagination();
        console.log('Leads loaded:', res);

        // Next Lead Number calculate
        this.calculateNextLeadNo();
      },
      error: (err) => {
        console.error('Error fetching leads:', err);

        if (err.status === 401) {
          alert("Unauthorized! Please login again.");
        }
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
    // 1. Pehle hi list se hata do (Optimistic Update)
    // Maan lo aapki leads 'leads' array mein hain:
    this.leads = this.leads.filter((l: any) => l.id !== id);
    this.cdr.detectChanges(); // Turant table se gayab ho jayega

    this.http.delete(`${environment.apiUrl}/Leads/${id}`, { responseType: 'text' })
      .subscribe({
        next: (res) => {
          console.log('Delete response:', res);
          
          // 2. Alert ko baad mein dikhao taaki UI na ruke
          setTimeout(() => {
            this.loadLeads(); // Backend se sync
            this.cdr.detectChanges();
            console.log('Lead Deleted Successfully!');
          }, 100);
        },
        error: (err) => {
          console.error('Delete Error:', err);
          if (err.status === 200) {
            this.loadLeads();
            this.cdr.detectChanges();
          } else {
            alert('Delete fail !');
            this.loadLeads(); // Fail hone par wapas laao
            this.cdr.detectChanges();
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

  const rawValue = this.leadForm.getRawValue();
console.log(rawValue);

const validation = leadSchema.safeParse(rawValue);
console.log(validation);

  if (!validation.success) {

    const errors = validation.error.flatten().fieldErrors;

    Object.keys(errors).forEach((field: string) => {

  const control = this.leadForm.get(field);

  if (control) {
    control.setErrors({ zod: errors[field as keyof typeof errors]?.[0] });
  }

});

    alert("Please fix validation errors");
    return;
  }

  // 👉 agar validation pass ho gaya to API call chalegi
  console.log("Valid data", rawValue);

  const payload = {
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
    location: rawValue.location,
    area: rawValue.area,
    organizationName: rawValue.organization
  };

  const token = localStorage.getItem('cavalier_token'); // ya jahan store kiya ho

const headers = {
  Authorization: `Bearer ${token}`
};

this.http.post(`${environment.apiUrl}/Leads`, payload, { headers })
  .subscribe({
    next: () => {
      alert("Lead saved successfully");
      this.initForm();
      this.loadLeads();
    },
    error: (err) => {
      console.error(err);
      alert("Error saving lead");
    }
  });

}

clearFilters() {
  this.leadForm.reset();
;// normal GET API call
}

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
  const value = (event.target as HTMLInputElement).value.toLowerCase().trim();

  // 1. Agar input ekdum khali hai, toh table reset karo aur dropdown band
  if (!value) {
    this.filteredLeads = [];
    this.loadLeads(); // Poora table wapas dikhayega
    return;
  }

  // 🔥 2. Logic: Agar 3 characters se kam hain, toh suggestions mat dikhao
  if (value.length < 4) {
    this.filteredLeads = []; // Dropdown band rakhega
    return;
  }

  // 3. Filter dropdown suggestions (Sirf tab chalega jab length >= 3 ho)
  this.filteredLeads = this.leads.filter(lead =>
    (lead.leadNo || '').toString().toLowerCase().includes(value)
  );
  
  console.log("Suggestions found for:", value, this.filteredLeads);
}

// --- Variables ---
filteredTeams: any[] = []; // Search results ke liye

// 1. Team Search Logic (3 characters threshold)
onTeamSearch(event: Event): void {
  const value = (event.target as HTMLInputElement).value.toLowerCase().trim();

  // 🔥 3 characters condition
  if (!value || value.length < 3) {
    this.filteredTeams = [];
    return;
  }

  // teamList se filter karein (Jo backend se aayi hai)
  // Note: Agar teamList strings ki array hai toh 't.teamName' hata kar sirf 't' likhein
  this.filteredTeams = this.teamList.filter(t => {
    const teamName = (t.teamName || t.name || t || '').toString().toLowerCase();
    return teamName.includes(value);
  });
}

// 2. Selection Logic
selectTeam(team: any): void {
  // Agar team object hai toh team.teamName, agar string hai toh direct team
  const selectedName = team.teamName || team.name || team;
  
  this.leadSearchFilters.team = selectedName; // Object property update
  this.filteredTeams = [];                    // Dropdown band
  this.cdr.detectChanges();
}


// selectLeadForFilters(lead: any): void {
//   // 1. Update search form control
//   this.searchForm.controls['leadNo'].setValue(lead.leadNo);

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
  leadOwner: 'Any',
  hod:'',
  team:'',
  reportingManager: '',

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
  
  // 🔥 Logic: 3 letter se kam hone par list khali kar do aur function rok do
  if (!value || value.length < 4) {
    this.filteredOrganizations = [];
    return;
  }

  // 3 letters pure hone par hi filter chalega
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
// 1. Dropdown filter logic (Custom Div style)


// Selection logic
onHODSearchType(event: Event): void {
  const value = (event.target as HTMLInputElement).value.toLowerCase().trim();
  
  // 3 letters condition
  if (!value || value.length < 3) {
    this.filteredHODSuggestions = [];
    return;
  }

  // Filter directly from the strings array
  this.filteredHODSuggestions = this.hodUniqueList.filter(hod =>
    hod.toLowerCase().includes(value)
  );

  console.log("🎯 HOD Matches Found:", this.filteredHODSuggestions);
}
// --- Is function ko class ke andar kahin bhi paste kar dein ---
selectHOD(hodName: string): void {
  // 1. Filtered value ko search filter object mein set karein
  this.leadSearchFilters.hod = hodName; 

  // 2. Dropdown list ko band karne ke liye array khali kar dein
  this.filteredHODSuggestions = []; 

  // 3. Angular ko batayein ki UI update karni hai
  this.cdr.detectChanges();

  console.log("HOD Selected:", hodName);
}
// --- Variables (Aapke paas pehle se honge, bas check kar lein) ---
filteredLeadOwners: string[] = []; 

// 1. Search Logic for Lead Owner
onLeadOwnerSearch(event: Event): void {
  const value = (event.target as HTMLInputElement).value.toLowerCase().trim();

  // 3 letters condition
  if (!value || value.length < 3) {
    this.filteredLeadOwners = [];
    return;
  }

  // leadOwnerList se filter karein (Jo loadLeadSuggestions mein bhari gayi thi)
  this.filteredLeadOwners = this.leadOwnerList.filter(owner =>
    owner.toLowerCase().includes(value)
  );
}

// 2. Selection Logic
selectLeadOwner(ownerName: string): void {
  this.leadSearchFilters.leadOwner = ownerName; // Object property update
  this.filteredLeadOwners = [];       
   // Dropdown band
  this.cdr.detectChanges();
}
loadLeadSuggestions() {
  this.http.get<any[]>(`${environment.apiUrl}/Leads`)
    .subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          // 1. Lead Numbers
          this.leadNoList = [...new Set(data.map(l => l.leadNo).filter(val => val))];
          // 2. Organizations
          this.leadOrgList = [...new Set(data.map(l => l.organizationName).filter(val => val))];
          // 3. Owners
          this.leadOwnerList = [...new Set(data.map(l => l.leadOwner).filter(val => val))];
          // 4. Sales Processes
          this.allSalesProcesses = [...new Set(data.map(l => l.salesProcess).filter(val => val))];

          // 🔥 FIXED: HOD unique list load karna zaroori hai suggestions ke liye
          this.hodUniqueList = [...new Set(data
            .map(l => l.hod)
            .filter(val => val && val.toString().trim() !== '')
          )];
          // loadLeadSuggestions function ke andar ye add karein:
this.managerUniqueList = [...new Set(data
  .map(l => l.reportingManager || l.ReportingManager)
  .filter(val => val && val.toString().trim() !== '')
)];

          console.log("✅ HOD Unique List Loaded:", this.hodUniqueList);
          console.log("✅ owner Unique List Loaded:", this.leadOwnerList);
          this.cdr.detectChanges(); 
        }
      },
      error: (err) => console.error("Leads Suggestions Fetch Error:", err)
    }); 
}
// 2. Variables for suggestions
filteredManagers: string[] = [];
// Aapki leads se nikali hui master list (loadLeadSuggestions mein bhari jayegi)
managerUniqueList: string[] = []; 

// 3. Reporting Manager Search Logic
onManagerSearch(event: Event): void {
  const value = (event.target as HTMLInputElement).value.toLowerCase().trim();

  if (!value || value.length < 3) {
    this.filteredManagers = [];
    return;
  }

  // Filter from master list
  this.filteredManagers = this.managerUniqueList.filter(m =>
    m.toLowerCase().includes(value)
  );
}

// 4. Selection Logic
selectManager(managerName: string): void {
  this.leadSearchFilters.reportingManager = managerName;
  this.filteredManagers = [];
  this.cdr.detectChanges();
}
// 1. Dropdown se select karte waqt sirf value set karo, search mat chalao
selectLeadForFilters(lead: any): void {
this.leadSearchFilters.leadNo = lead.leadNo; // Check: kya ye sahi set ho raha hai?
  this.filteredLeads = [];
  this.cdr.detectChanges();// Dropdown band
  
}
filteredStatusSuggestions: string[] = [];
// Predefined list (Kyunki status aksar fixed hote hain)
statusList: string[] = ['Inquiry Received', 'Qualified', 'Proposal Sent', 'Sales Closed', 'Lost'];

// 3. Search Logic (3 characters ke baad)
onStatusSearch(event: Event): void {
  const value = (event.target as HTMLInputElement).value.toLowerCase().trim();

  if (!value || value.length < 3) {
    this.filteredStatusSuggestions = [];
    return;
  }

  this.filteredStatusSuggestions = this.statusList.filter(s =>
    s.toLowerCase().includes(value)
  );
}

// 4. Selection Logic
selectStatus(status: string): void {
  this.leadSearchFilters.salesStage = status;
  this.filteredStatusSuggestions = [];
  this.cdr.detectChanges();
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
    salesStage: '',
    hod:'',
    team:'',
    reportingManager:''
  };

  const resetPayload = {
    leadNo: '',
    date: null,
    organizationName: '',
    type: '',
    leadOwner: '',
    salesProcess: '',
    salesStage: '',
    team:''
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
// 1. PDF DOWNLOAD LOGIC FOR LEADS
isExportOpen = false;


downloadLeadsPDF() {
  this.isExportOpen = false;

  // Leads array check (Aapke component mein 'leads' naam ka array hai)
  if (!this.leads || this.leads.length === 0) {
    alert("Table mein data nahi hai!");
    return;
  }

  const doc = new jsPDF('l', 'mm', 'a4');
  const startX = 10;
  let startY = 25;
  const colCount = this.selectedColumns.length;
  const colWidth = 277 / (colCount || 1);

  // Title
  doc.setFontSize(16);
  doc.setTextColor(74, 63, 63);
  doc.text("LEAD RECORDS SUMMARY", 110, 15);

  // Header Background
  doc.setFillColor(74, 63, 63);
  doc.rect(startX, startY, 277, 10, 'F');

  // Header Text
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);

  this.selectedColumns.forEach((col, i) => {
    doc.text(col.toUpperCase(), startX + (i * colWidth) + 2, startY + 7);
  });

  // Table Body
  doc.setTextColor(0, 0, 0);
  startY += 10;

  // Loop through 'leads' array
  this.leads.forEach((l, rowIndex) => {
    if (startY > 185) {
      doc.addPage();
      startY = 20;
    }

    if (rowIndex % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(startX, startY, 277, 8, 'F');
    }

    this.selectedColumns.forEach((col, colIndex) => {
      const fieldKey = this.columnFieldMap[col] || col; 
      let val = l[fieldKey];

      let displayVal = (val !== null && val !== undefined) ? val.toString() : '-';
      
      if (displayVal.length > 20) displayVal = displayVal.substring(0, 17) + "...";
      
      doc.text(displayVal, startX + (colIndex * colWidth) + 2, startY + 5);
      
      doc.setDrawColor(220, 220, 220);
      doc.line(startX + (colIndex * colWidth), startY, startX + (colIndex * colWidth), startY + 8);
    });

    doc.line(startX, startY + 8, startX + 277, startY + 8);
    startY += 8;
  });

  doc.save(`Leads_Report_${new Date().getTime()}.pdf`);
}

// 2. PRINT LOGIC FOR LEADS
printLeads() {
  this.isExportOpen = false;

  if (!this.leads || this.leads.length === 0) {
    alert("Print karne ke liye data nahi hai!");
    return;
  }

  const activeCols = this.selectedColumns;
  let tableHeader = `<tr style="background-color: #4a3f3f; color: white;">`;
  activeCols.forEach(col => {
    tableHeader += `<th style="padding: 10px; border: 1px solid #ddd; text-align: left; font-size: 12px;">${col}</th>`;
  });
  tableHeader += `</tr>`;

  let tableRows = '';
  this.leads.forEach((l) => {
    tableRows += `<tr>`;
    activeCols.forEach(col => {
      const fieldKey = this.columnFieldMap[col] || col;
      let val = l[fieldKey] !== null && l[fieldKey] !== undefined ? l[fieldKey] : '-';
      
      if (typeof val === 'string' && val.includes('T') && !isNaN(Date.parse(val))) {
        val = new Date(val).toLocaleDateString('en-GB');
      }
      tableRows += `<td style="padding: 8px; border: 1px solid #eee; font-size: 11px;">${val}</td>`;
    });
    tableRows += `</tr>`;
  });

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Lead Records Print</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            h2 { text-align: center; color: #4a3f3f; }
            .footer { margin-top: 20px; text-align: right; font-size: 10px; color: #666; }
          </style>
        </head>
        <body>
          <h2>LEAD RECORDS SUMMARY</h2>
          <p style="text-align: center; font-size: 12px;">Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>${tableHeader}</thead>
            <tbody>${tableRows}</tbody>
          </table>
          <div class="footer">Cavalier Logistics - Internal Document</div>
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }
}
downloadLeadsExcel() {
  // 1. Check karein ki data hai ya nahi
  if (!this.leads || this.leads.length === 0) {
    alert("Excel export ke liye table mein data hona zaroori hai!");
    return;
  }

  // 2. Data Prepare karein (Sirf selected columns ke basis par)
  const excelData = this.leads.map(lead => {
    let row: any = {};
    
    // selectedColumns array par loop chalayein (e.g. ['Lead No', 'Organization'])
    this.selectedColumns.forEach(col => {
      // columnFieldMap se backend key nikalein (e.g. 'Lead No' -> 'leadNo')
      const fieldKey = this.columnFieldMap[col] || col;
      let val = lead[fieldKey];

      // Date formatting check (agar ISO string hai toh readable banayein)
      if (val && typeof val === 'string' && val.includes('T') && !isNaN(Date.parse(val))) {
        val = new Date(val).toLocaleDateString('en-GB');
      }

      // Row mein data set karein
      row[col] = (val !== null && val !== undefined) ? val : '-';
    });
    
    return row;
  });

  // 3. Worksheet aur Workbook banayein
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Leads Data');

  // 4. Column width auto-adjust (optional par achha lagta hai)
  const colWidths = this.selectedColumns.map(() => ({ wch: 20 }));
  ws['!cols'] = colWidths;

  // 5. File Save karein
  XLSX.writeFile(wb, `Lead_Report_${new Date().getTime()}.xlsx`);
  
  console.log("✅ Excel Downloaded Successfully");
}
// --- Pagination Variables ---
// currentPage: number = 1;
// pageSize: number = 10; // Default records per page
// protected readonly Math = Math;

// Computed Property: Table mein isi ko loop karein
// get paginatedLeads(): any[] {
//   const startIndex = (this.currentPage - 1) * this.pageSize;
//   return this.leads.slice(startIndex, startIndex + this.pageSize);
// }

// Total pages calculate karein
// get totalPages(): number {
//   return Math.ceil(this.leads.length / this.pageSize) || 1;
// }

// Page change handler
setPage(page: number) {
  if (page < 1 || page > this.totalPages) return;
  this.currentPage = page;
  this.cdr.detectChanges();
}

// Page size change hone par page 1 par reset karein
onPageSizeChange() {
  this.currentPage = 1;
  this.cdr.detectChanges();
}
// Icon Popup ke liye alag variables (Inhe kisi aur logic mein mat use karna)
iconSearchOrgs: any[] = []; 
private iconSearchSub?: Subscription;

// 1. Sirf Icon (🔍) click par chalne wala logic
oniconLeadSearch() {
  // Agar list pehle se khuli hai toh toggling (band karna)
  if (this.iconSearchOrgs.length > 0) {
    this.iconSearchOrgs = [];
    this.cdr.detectChanges();
    return;
  }

  this.iconSearchSub?.unsubscribe();

  this.iconSearchSub = this.http.get<any[]>(`${environment.apiUrl}/Leads`).subscribe({
    next: (res) => {
      if (res && res.length > 0) {
        // Strict Uniqueness check using Set
        const uniqueNames = [...new Set(res.map(item => item.organizationName))]
          .filter(name => name && name.trim() !== "");

        // Mapping to object as per your HTML requirement
        this.iconSearchOrgs = uniqueNames.map(name => ({ orgName: name }));
        
        this.cdr.detectChanges(); 
      }
    },
    error: (err) => {
      console.error("Icon Search Error:", err);
      this.cdr.detectChanges();
    }
  });
}

// 2. Icon wali list se select karne par
selectIconOrg(org: any) {
  this.leadSearchFilters.organizationName = org.orgName;
  this.iconSearchOrgs = []; // Sirf icon wali list band hogi
  this.cdr.detectChanges();
}// Variables wahi rahenge
iconHODList: string[] = []; 
private hodIconSub?: Subscription;

// 1. 🔍 Icon par click karne wala logic
oniconHODSearch() {
  // 1. Toggle Close Logic (Single Click Close)
  if (this.iconHODList && this.iconHODList.length > 0) {
    this.iconHODList = [];
    this.cdr.detectChanges(); 
    return;
  }

  this.hodIconSub?.unsubscribe();

  // API Call se pehle Loader ya initial check ke liye detectChanges call karo
  this.cdr.detectChanges(); 

  this.hodIconSub = this.http.get<any[]>(`${environment.apiUrl}/Hod`).subscribe({
    next: (res) => {
      if (res && res.length > 0) {
        const uniqueHODs = [...new Set(res.map(item => item.name || item.hodName || item))]
          .filter(name => name && typeof name === 'string' && name.trim() !== "");

        // Data assign karne ke turant baad detectChanges()
        this.iconHODList = uniqueHODs;
        
        // Sabse important line: Isse Angular ko pata chalega ki Modal render karna hai
        this.cdr.markForCheck(); 
        this.cdr.detectChanges(); 
      }
    },
    error: (err) => {
      console.error("HOD API Error:", err);
      this.iconHODList = [];
      this.cdr.detectChanges();
    }
  });
}

// 2. Icon wali list se select karne par
selectHODFromIcon(name: string) {
  this.leadSearchFilters.hod = name;
  this.iconHODList = []; 
  
  setTimeout(() => {
    this.cdr.detectChanges();
  }, 0);
}
// Lead Owner Icon Popup ke liye UNIQUE variables
loIconList: string[] = []; 
private loIconSub?: Subscription;

// 1. UNIQUE Function name: onLeadOwnerIconClick
onLeadOwnerIconClick() {
  // Toggle Logic
  if (this.loIconList.length > 0) {
    this.loIconList = [];
    this.cdr.detectChanges(); 
    return;
  }

  this.loIconSub?.unsubscribe();

  // Loader state ke liye trigger
  this.cdr.detectChanges(); 

  this.loIconSub = this.http.get<any[]>(`${environment.apiUrl}/LeadOwners`).subscribe({
    next: (res) => {
      if (res && res.length > 0) {
        const uniqueOwners = [...new Set(res.map(item => item.name || item.fullName || item.leadOwner || item))]
          .filter(name => name && typeof name === 'string' && name.trim() !== "");

        this.loIconList = uniqueOwners;

        // Forced Update: Isse popup turant dikhega
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    },
    error: (err) => {
      console.error("Lead Owner API Error:", err);
      this.loIconList = [];
      this.cdr.detectChanges();
    }
  });
}

// Selection logic
selectLoFromIcon(owner: string) {
  this.leadSearchFilters.leadOwner = owner;
  this.loIconList = []; 
  
  // Close hone par bhi detect change zaroori hai
  this.cdr.detectChanges();
}

// Error handle karne ke liye empty function (agar tum filter baad mein likhna chaho)
filterLeadOwners(event: any) {
  // Add your filtering logic here if needed
}
// Lead No Icon Popup ke liye UNIQUE variables
lnIconList: any[] = []; 
private lnIconSub?: Subscription;

onLeadNoIconClick() {
  // Toggle Logic: Agar pehle se khula hai toh band kar do
  if (this.lnIconList && this.lnIconList.length > 0) {
    this.lnIconList = [];
    this.cdr.detectChanges();
    return;
  }

  // 1. Sahi key name use karo
  const token = localStorage.getItem('cavalier_token'); 

  console.log("Checking Token:", token);

  if (!token) {
    console.warn("Bhai login token nahi mila!");
    return;
  }

  this.loIconSub?.unsubscribe();

  // 2. Headers mein pass karo
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  // 3. API Call
  this.loIconSub = this.http.get<any[]>(`${environment.apiUrl}/Inquiry`, { headers }).subscribe({
    next: (res) => {
      if (res && res.length > 0) {
        // Unique Inquiry/Lead Numbers nikalna
        const uniqueNos = [...new Set(res.map(item => item.inquiryNo || item.leadNo || item))]
          .filter(val => val && val.toString().trim() !== "");

        this.lnIconList = uniqueNos;

        // Instant UI Update (Single click fix)
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    },
    error: (err) => {
      console.error("Leads API Error:", err);
      this.lnIconList = [];
      this.cdr.detectChanges();
    }
  });
}

// 2. Selection function
selectLeadNoFromIcon(val: any) {
  this.leadSearchFilters.leadNo = val;
  this.lnIconList = []; // Popup close
  
  // Instant UI update
  this.cdr.detectChanges();
}

// Search filter error na de isliye
filterLeadNumbers(event: any) {
  // Baad mein logic likh sakte ho
}
// Team Icon Popup ke liye UNIQUE variables
tmIconList: any[] = []; 
private tmIconSub?: Subscription;

// 1. UNIQUE Function: onTeamIconClick
onTeamIconClick() {
  // Toggle Logic: Agar list pehle se khuli hai toh band kar do
  if (this.tmIconList.length > 0) {
    this.tmIconList = [];
    this.cdr.detectChanges();
    return;
  }

  this.tmIconSub?.unsubscribe();

  // API Call to /Teams
  this.tmIconSub = this.http.get<any[]>(`${environment.apiUrl}/Teams`).subscribe({
    next: (res) => {
      if (res && res.length > 0) {
        // Unique Team names nikalna (teamName, name ya direct string)
        const uniqueTeams = [...new Set(res.map(item => item.teamName || item.name || item))]
          .filter(val => val && val.toString().trim() !== "");

        this.tmIconList = uniqueTeams;

        // Force UI update taaki ek hi click par load ho jaye
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);
      }
    },
    error: (err) => {
      console.error("Team API Error:", err);
      this.tmIconList = [];
      this.cdr.detectChanges();
    }
  });
}

// 2. UNIQUE Selection function: selectTmFromIcon
selectTmFromIcon(team: any) {
  this.leadSearchFilters.team = team;
  this.tmIconList = []; // Popup close
  
  setTimeout(() => {
    this.cdr.detectChanges();
  }, 0);
}
// Reporting Manager Icon Popup ke liye UNIQUE variables
rmIconList: string[] = []; 
private rmIconSub?: Subscription;

// 1. UNIQUE Function: onManagerIconClick
onManagerIconClick() {
  // Toggle Logic: Agar list pehle se khuli hai toh band kar do
  if (this.rmIconList.length > 0) {
    this.rmIconList = [];
    this.cdr.detectChanges();
    return;
  }

  this.rmIconSub?.unsubscribe();

  // API Call to /ReportingManagers
  this.rmIconSub = this.http.get<any[]>(`${environment.apiUrl}/ReportingManagers`).subscribe({
    next: (res) => {
      if (res && res.length > 0) {
        // Unique Managers nikalna (Check property: name, managerName ya direct string)
        const uniqueManagers = [...new Set(res.map(item => item.name || item.managerName || item))]
          .filter(val => val && typeof val === 'string' && val.trim() !== "");

        this.rmIconList = uniqueManagers;

        // Force UI update for instant popup
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);
      }
    },
    error: (err) => {
      console.error("Manager API Error:", err);
      this.rmIconList = [];
      this.cdr.detectChanges();
    }
  });
}

// 2. UNIQUE Selection function: selectRmFromIcon
selectRmFromIcon(manager: string) {
  this.leadSearchFilters.reportingManager = manager;
  this.rmIconList = []; // Popup close
  
  setTimeout(() => {
    this.cdr.detectChanges();
  }, 0);
}
// 1. In variables ko aise define karein
orgList: any[] = [];
showOrgDropdown: boolean = false;

// Quotation ko Array ki jagah Object banayein {}
quotation: any = {}; 
showInquiryDropdown=true
loadOrganizationList() {
  // Toggle logic same rakha hai
  if (this.showOrgDropdown) {
    this.showOrgDropdown = false;
    this.cdr.detectChanges();
    return;
  }

  // 1. Token nikalo
  const token = localStorage.getItem('cavalier_token'); 
  if (!token) {
    console.warn("Bhai login token nahi mila!");
    return;
  }

  // 2. Headers set karo
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  const url = `${environment.apiUrl}/Organization/List`;
  
  // 3. API Call with Token
  this.http.get<any[]>(url, { headers }).subscribe({
    next: (res) => {
      this.orgList = res; 
      this.showOrgDropdown = true; 
      this.cdr.detectChanges(); 
      console.log(res, "Organization list loaded with token");
    },
    error: (err) => {
      console.error("Organization fetch error:", err);
      this.showOrgDropdown = false;
      this.cdr.detectChanges();
    }
  });
}

selectOrg(org: any) {
  // Purana logic: quotation update karna
  if (this.quotation) {
    this.quotation.organizationName = org.orgName; 
  }
  
  // LeadSearchFilters bhi update kar dete hain safety ke liye
  this.leadSearchFilters.organizationName = org.orgName;

  this.showOrgDropdown = false;
  this.cdr.detectChanges(); 
}
filterHODs(event: any) {
  // Baad mein logic likh lena
}

filterLeads(event: any) {
  // Baad mein logic likh lena
}
filterTeams(event: any) {
  // Baad mein logic likh lena
}
filterManagers(event: any) {
  // Baad mein logic likh lena
}
filterOrgList(event: any) {
  // Baad mein logic likh lena
}
// Is function ka naam wahi rakho jo HTML mang raha hai: selectLnFromIcon
selectLnFromIcon(val: any) {
  this.leadSearchFilters.leadNo = val; // Tumhara logic
  this.lnIconList = []; // Modal close karne ke liye
  
  // Instant UI update taaki modal turant band ho jaye
  this.cdr.detectChanges();
}
loadLeadOwners(): void {
  // Teri API call
  this.userServices.getUsers('all').subscribe({
    next: (data: any) => {
      // API se aane wala data leadOwners mein assign kar diya
      this.leadOwners = data; 
      console.log('Lead Owners loaded:', this.leadOwners);
          this.cdr.detectChanges(); 
    },
    error: (err) => {
      console.error('Error loading users:', err);
    }
  });
}loadDropdownData(): void {
  this.userServices.getUsers('all').subscribe({
    next: (data: any) => {
      // Data assign kiya
      this.leadOwners = data;
      this.salesCoordinators = data;
      this.reportingManagers = data;
      this.hodList = data;
      
      console.log('Data loaded, triggering change detection...');

      // 3. Ye magic line hai jo UI turant update kar degi
      this.cdr.detectChanges(); 
    },
    error: (err) => {
      console.error('API Error:', err);
    }
  });
}
}