import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// --- ADDED: Validators import ---
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-lead-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lead-form.component.html',
  styleUrl: './lead-form.component.css',
})

export class LeadFormComponent implements OnInit {
// Aapka data array
  leadForm!: FormGroup;
  searchForm!: FormGroup;
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
initSearchForm() {
    this.searchForm = this.fb.group({
      organizationName: [''],
      salesProcess: [''],
      leadNo: [''],
      salesStage: ['']
    });
  }
searchLeads() {
    const filters = this.searchForm.value;
    
    // HTTP Params banayein (GET request ke liye)
    let params = new HttpParams();
    if (filters.organizationName) params = params.set('organizationName', filters.organizationName);
    if (filters.salesProcess) params = params.set('salesProcess', filters.salesProcess);
    if (filters.leadNo) params = params.set('leadNo', filters.leadNo);
    if (filters.salesStage) params = params.set('salesStage', filters.salesStage);

    // Backend GET API call
    this.http.get<any[]>(`${environment.apiUrl}/Leads/search-leads`, { params })
      .subscribe({
        next: (res) => {
          this.leads = res; // Search results se table update karein
          console.log('Search Results:', res);
        },
        error: (err) => {
          console.error('Search Error:', err);
        }
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
    if (confirm('Kya aap sach mein is lead ko delete karna chahte hain?')) {
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
              alert('Delete fail ho gaya!');
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
onDateSearch(event: Event): void {
  const value = (event.target as HTMLInputElement).value; // Date string format mein aayegi

  if (!value) {
    this.filteredDates = [];
    return;
  }

  // allDates array mein se search karo
  this.filteredDates = this.allDates.filter(date =>
    date.includes(value)
  );
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
// --- ADDED: Method for input event in Lead No search bar ---
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

// --- ADDED: Method for selection in Lead No search bar ---
selectLeadForFilters(lead: any): void {
  // 1. Update search form control
  this.searchForm.controls['leadNo'].setValue(lead.leadNo);

  // 2. Hide dropdown
  this.filteredLeads = [];

  // 3. --- Force UI update ---
  this.cdr.detectChanges();

  // 4. API Call to filter table immediately
  this.filterTableByLeadNo(lead.leadNo);
}

// --- ADDED: Method to call search API for Table ---
filterTableByLeadNo(leadNo: string) {
  this.http.get<any[]>(`${environment.apiUrl}/Leads/search-leads`, {
    params: { leadNo: leadNo }
  })
  .subscribe(res => {
    this.leads = res; // Update table
  });
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
}