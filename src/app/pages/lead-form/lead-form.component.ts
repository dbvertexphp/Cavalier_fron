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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lead-form.component.html',
  styleUrl: './lead-form.component.css',
})
export class LeadFormComponent implements OnInit {

  leadForm!: FormGroup;
  isFormOpen = false; 
  form!: FormGroup;
  
  leads: any[] = [];
  leadList: any[] = []; 

  editingLeadId: number | null = null;

  organizations: any[] = [];
  filteredOrganizations: any[] = [];
  selectedOrganizationId: number | null = null;

  hodList: any[] = [];
  teamsList: any[] = [];

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.initForm();

    this.getLeads().subscribe(data => {
      this.leads = data;

      if (this.leads && this.leads.length > 0 && !this.editingLeadId) {
        const lastLead = this.leads[this.leads.length - 1];

        if (lastLead.leadNo && !isNaN(parseInt(lastLead.leadNo))) {
          const nextNumber = parseInt(lastLead.leadNo) + 1;
          const formattedNextNo = nextNumber.toString().padStart(4, '0');

          this.leadForm.patchValue({
            leadNo: formattedNextNo
          });
        }
      } else if (!this.editingLeadId) {
        this.leadForm.patchValue({ leadNo: '0001' });
      }
    });

    this.getOrganizations();

    this.http.get(`${environment.apiUrl}/Hod`)
      .subscribe((res: any) => {
        this.hodList = res;
      });

    this.getTeams();
  }

  getOrganizations() {
    this.http.get<any[]>(`${environment.apiUrl}/Organization/list`)
      .subscribe(data => {
        this.organizations = data;
        this.filteredOrganizations = [];
      });
  }

  getTeams() {
    this.http.get(`${environment.apiUrl}/Teams`)
      .subscribe((res: any) => {
        this.teamsList = res;
      });
  }

  searchOrganization(event: any) {
    const searchTerm = event.target.value.toLowerCase();

    if (searchTerm.length === 0) {
      this.filteredOrganizations = [];
      return;
    }

    this.filteredOrganizations = this.organizations.filter(org =>
      org && org.orgName && org.orgName.toLowerCase().includes(searchTerm)
    );
  }

  selectOrganization(org: any) {
    this.leadForm.patchValue({
      organization: org.orgName
    });

    this.selectedOrganizationId = org.id;
    this.filteredOrganizations = [];
  }

  // 🔥 FIXED EDIT METHOD (PURA DATA PATCH)
  editLead(leadId: number): void {

    if (!leadId) {
      console.error('Lead ID is undefined');
      return;
    }

    this.editingLeadId = leadId;
    this.isFormOpen = true;

    this.http.get<any>(`${environment.apiUrl}/leads/${leadId}`)
      .subscribe({
        next: (data) => {

          console.log('Lead Data:', data);

          // 🔥 Organization ID store karo
          this.selectedOrganizationId = data.organizationId;

          // 🔥 Pura form patch karo
          this.leadForm.patchValue({
            leadNo: data.leadNo,
            type: data.type,
            salesProcess: data.salesProcess,
            date: data.date,
            expectedValidity: data.expectedValidity,
            leadOwner: data.leadOwner,
            salesCoordinator: data.salesCoordinator,
            salesStage: data.salesStage,
            branch: data.branch,
            reportingManager: data.reportingManager,
            hod: data.hod,
            team: data.team,
            location: data.location,
            area: data.area,
            source: data.leadSource,
            organization: data.organizationName
          });
        },
        error: (error) => {
          alert('Failed to fetch lead data.');
        }
      });
  }

  deleteLead(id: number) {
    if (confirm('Are you sure you want to delete this lead?')) {
      this.http.delete(`${environment.apiUrl}/leads/${id}`).subscribe({
        next: () => {
          alert('Success: Lead Deleted!');
          this.getLeads().subscribe(data => this.leads = data);
        },
        error: () => {
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

    if (!this.isFormOpen) {
      this.editingLeadId = null;
      this.selectedOrganizationId = null;
      this.leadForm.reset();
    }
  }

  initForm() {
    const today = new Date();

    this.leadForm = this.fb.group({
      leadNo: [{ value: 'Auto-Generated', disabled: true }],
      type: ['New Business', Validators.required],
      salesProcess: ['', Validators.required],
      date: [this.formatDate(today), Validators.required],
      leadOwner: ['BHARAT JUYAL', Validators.required],
      salesCoordinator: ['', Validators.required],
      expectedValidity: ['', Validators.required],
      source: ['', Validators.required],
      salesStage: ['Inquiry Received', Validators.required],
      branch: ['DELHI', Validators.required],
      reportingManager: [''],
      hod: ['', Validators.required],
      team: ['', Validators.required],
      location: [''],
      area: [''],
      organization: ['', Validators.required],
    });
  }

  formatDate(date: Date): string {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // 🔥 FINAL WORKING SAVE (NEW + UPDATE)
  onSave() {

    if (!this.leadForm.valid) {
      alert('Error: Mandatory fields missing.');
      return;
    }

    const formValue = this.leadForm.getRawValue();

    const data = {
      id: this.editingLeadId ?? 0,
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
      organizationId: this.selectedOrganizationId // 🔥 FIXED
    };

    const backendData = { leadDto: data };

    let request: Observable<any>;

    if (this.editingLeadId) {
      request = this.http.put(`${environment.apiUrl}/leads/${this.editingLeadId}`, backendData);
    } else {
      request = this.http.post(`${environment.apiUrl}/leads`, backendData);
    }

    request.subscribe({
      next: () => {
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
  }
}