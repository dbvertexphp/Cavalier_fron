import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// --- ADDED: Validators import ---
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-lead-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lead-form.component.html',
  styleUrl: './lead-form.component.css',
})

export class LeadFormComponent implements OnInit {

  leadForm!: FormGroup;
  isFormOpen = false;

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
    this.loadLeads(); // Important: Leads load first to calculate number
  }


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
}