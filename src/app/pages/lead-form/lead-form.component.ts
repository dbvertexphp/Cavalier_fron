    import { Component, OnInit } from '@angular/core';
    import { CommonModule } from '@angular/common';
    import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
    import { Router } from '@angular/router'; 
    import { HttpClient } from '@angular/common/http';
    import { environment } from '../../../environments/environment'; 
    import { Observable } from 'rxjs';

    @Component({
      selector: 'app-lead-form',
      standalone: true,
      imports: [CommonModule,  ReactiveFormsModule],
      templateUrl: './lead-form.component.html',
      styleUrl: './lead-form.component.css',
    })
    export class LeadFormComponent implements OnInit {
      leadForm!: FormGroup;
      isFormOpen = false; 
      form!: FormGroup
      
      leads: any[] = [
        { date: '12-Feb-2026', organization: 'ABC SHIPPING', type: 'New Business', leadOwner: 'BHARAT JUYAL', status: 'Inquiry Received', branch: 'DELHI' },
        { date: '12-Feb-2026', organization: 'XYZ LOGISTICS', type: 'New Business', leadOwner: 'BHARAT JUYAL', status: 'Won', branch: 'DELHI' }
      ];
      leadList: any[] = []; 

      // 🔥 Edit ke liye ID store karne ke liye variable
      editingLeadId: number | null = null;

      // 🔥 Organization ke liye variables
      organizations: any[] = [];
      filteredOrganizations: any[] = [];
      selectedOrganizationId: number | null = null; // 🔄 Org ID store karne ke liye
hodList: any[] = []
teamsList: any[] = [];
      constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {}

      ngOnInit() {
        this.initForm();
        
        // 1. Pehle saare leads layein
        this.getLeads().subscribe(data => {
          this.leads = data;
          console.log('Leads fetched:', this.leads);
          
          // 2. 🔥 Table ka last record uthayein aur +1 karein
          if (this.leads && this.leads.length > 0 && !this.editingLeadId) {
            const lastLead = this.leads[this.leads.length - 1];
            
            if (lastLead.leadNo && !isNaN(parseInt(lastLead.leadNo))) {
              const nextNumber = parseInt(lastLead.leadNo) + 1;
              const formattedNextNo = nextNumber.toString().padStart(4, '0');
              
              // 3. 🔥 Form mein naya number set karein
              this.leadForm.patchValue({
                leadNo: formattedNextNo
              });
            }
          } else if (!this.editingLeadId) {
            // Agar database khali hai toh 0001 set karein
            this.leadForm.patchValue({ leadNo: '0001' });
          }
        });

        // 🔥 Organization list fetch karein
        this.getOrganizations();
         this.http.get(`${environment.apiUrl}/Hod`)
      .subscribe((res: any) => {
        this.hodList = res;
       
      });
      this.getTeams();
      }

      // 🔥 Organization fetch karne ki API
      getOrganizations() {
        this.http.get<any[]>(`${environment.apiUrl}/Organization/list`).subscribe(data => {
          // 🔄 Store data
          this.organizations = data;
          console.log('Organizations fetched:', this.organizations);
          this.filteredOrganizations = []; // 🔄 Dropdown shuru mein khali rakhein
        });
      }
      getTeams() {
  this.http.get(`${environment.apiUrl}/Teams`)
    .subscribe((res: any) => {
      this.teamsList = res; // ❗ Data fill karein
    });
}

      // ... existing imports ...

    // ... inside LeadFormComponent class ...

    // 🔥 Search Logic (Updated for orgName)
    searchOrganization(event: any) {
      const searchTerm = event.target.value.toLowerCase();
      
      if (searchTerm.length === 0) {
        this.filteredOrganizations = [];
        return;
      }

      // 🔄 Check if org and org.orgName exist
      this.filteredOrganizations = this.organizations.filter(org =>
        org && org.orgName && org.orgName.toLowerCase().includes(searchTerm)
      );
    }

    // 🔥 Select Logic (Updated to set orgName in input)
    selectOrganization(org: any) {
      // 🔄 Set the orgName in the input field
      this.leadForm.patchValue({
        organization: org.orgName
      });
      
      // 🔄 Store the ID
      this.selectedOrganizationId = org.id;

      this.filteredOrganizations = []; // Hide dropdown
    }

      // 🔥 ADDED: Edit Lead Method (Data Fill Logic)
    // ... inside LeadFormComponent class ...

    // 🔥 FIXED: Edit Lead Method (Data Fill Logic)
    // ... inside LeadFormComponent class ...
// 🔥 UPDATED: Edit Lead Method (Fetches Data via API)
// 🔄 Accept ID as argument
editLead(leadId: number) {
  // ❗ Agar leadId undefined hai, to dikkat yahan hai
  console.log('Editing Lead ID:', leadId); 
 
  this.editingLeadId = leadId;
  this.isFormOpen = true;

  // 🔄 API se specific lead ka data laayein
  this.http.get<any>(`${environment.apiUrl}/leads/${leadId}`).subscribe({
    next: (data) => {
      // ... (rest of the logic) ...
    },
    error: (error) => {
      console.error('Error fetching lead:', error);
      alert('Failed to fetch lead data.');
    }
  });
} // 🔥 ADDED: Delete Lead Method
      deleteLead(id: number) {
        if (confirm('Are you sure you want to delete this lead?')) {
          this.http.delete(`${environment.apiUrl}/leads/${id}`).subscribe({
            next: () => {
              alert('Success: Lead Deleted!');
              // List refresh karein
              this.getLeads().subscribe(data => this.leads = data);
            },
            error: (error) => {
              console.error('API Error:', error);
              alert('Delete Failed.');
            }
          });
        }
      }

      getLeads(): Observable<any[]> {                 
        return this.http.get<any[]>(`${environment.apiUrl}/leads`);                
      }
      
      navigateToNewOrg() {
        this.router.navigate(['/dashboard/organization-add']);
      }

      toggleForm() {
        this.isFormOpen = !this.isFormOpen;
        if (this.isFormOpen) {
          this.calculateExpectedValidity();
        } else {
          // Form band hone par reset karein
          this.editingLeadId = null;
          this.leadForm.reset();
        }
      }

      initForm() {
        const today = new Date();
        this.leadForm = this.fb.group({
          // Column 1
          leadNo: [{ value: 'Auto-Generated', disabled: true }],
          type: ['New Business'],
          salesProcess: [''],

          // Column 2
          date: [this.formatDate(today)],
          leadOwner: ['BHARAT JUYAL', Validators.required],
          salesCoordinator: [''],

          // Column 3
          expectedValidity: [''],
          source: [''],
          salesStage: ['Inquiry Received'],

          // HOD / Branch / Team Section
          branch: ['DELHI'],
          reportingManager: [''],
          hod: [''],
          team: [''],
          
          location: [''], 
          area: [''],

          // Organization Section
          organization: ['', Validators.required],
        });
      }

      calculateExpectedValidity() {
        const date = new Date();
        date.setDate(date.getDate() + 90);
        this.leadForm.patchValue({
          expectedValidity: this.formatDate(date)
        });
      }

      formatDate(date: Date): string {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const day = String(date.getDate()).padStart(2, '0');
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      }

onSave() {
  if (this.leadForm.valid) {
    const formValue = this.leadForm.getRawValue();

    // 🔄 Backend ke liye data format karein
    const backendData = {
      leadNo: formValue.leadNo,
      type: formValue.type,
      salesProcess: formValue.salesProcess,
      date: new Date(formValue.date).toISOString(), 
      expectedValidity: new Date(formValue.expectedValidity).toISOString(), 
      leadOwner: formValue.leadOwner,
      leadSource: formValue.source,
      salesCoordinator: formValue.salesCoordinator,
      salesStage: formValue.salesStage,
      branch: formValue.branch,
      reportingManager: formValue.reportingManager,
      team: formValue.team,
      hod: formValue.hod,
      location: formValue.location,
      area: formValue.area,
      
      // ❗ FIX: Yahan 'formValue.organization' mein Naam hai, wahi ja raha hai
      organizationId: formValue.organization
    };

    console.log('Formatted Data for Backend:', backendData);
    
    let request: Observable<any>;
    
    if (this.editingLeadId) {
      // 🔥 PUT API call (for update)
      request = this.http.put(`${environment.apiUrl}/leads/${this.editingLeadId}`, backendData);
    } else {
      // 🔥 POST API call (for new record)
      request = this.http.post(`${environment.apiUrl}/leads`, backendData);
    }

    request.subscribe({
      next: (response) => {
        alert(this.editingLeadId ? 'Success: Lead Updated!' : 'Success: Lead Information Saved!');
        this.getLeads().subscribe(data => this.leads = data);
        this.leadForm.reset();
        this.selectedOrganizationId = null;
        this.editingLeadId = null; 
        this.isFormOpen = false;
      },
      error: (error) => {
        alert('Bad Request: ' + JSON.stringify(error.error));
      }
    });
  } else {
    alert('Error: Mandatory fields missing.');
  }
}
    }