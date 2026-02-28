import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  // Static Data
  leads: any[] = [
    { id: 1, leadNo: '0001', organizationName: 'Static Corp Inc.', salesStage: 'Inquiry Received' },
    { id: 2, leadNo: '0002', organizationName: 'Demo Solutions Ltd.', salesStage: 'Proposal Sent' }
  ];

  editingLeadId: number | null = null;
  organizations: any[] = [
    { id: 101, orgName: 'Static Corp Inc.' },
    { id: 102, orgName: 'Demo Solutions Ltd.' }
  ];
  filteredOrganizations: any[] = [];
  selectedOrganizationId: number | null = null;

  hodList: any[] = ['John Doe', 'Jane Smith'];
  teamsList: any[] = ['Sales Team A', 'Support Team B'];

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit() {
    this.initForm();
    // API Call replaced with static data
    this.generateNextLeadNo();
  }

  generateNextLeadNo() {
    if (this.leads && this.leads.length > 0) {
      const lastLead = this.leads[this.leads.length - 1];
      const nextNumber = parseInt(lastLead.leadNo) + 1;
      const formattedNextNo = nextNumber.toString().padStart(4, '0');
      this.leadForm.patchValue({ leadNo: formattedNextNo });
    } else {
      this.leadForm.patchValue({ leadNo: '0001' });
    }
  }

  searchOrganization(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    if (searchTerm.length === 0) {
      this.filteredOrganizations = [];
      return;
    }
    this.filteredOrganizations = this.organizations.filter(org =>
      org.orgName.toLowerCase().includes(searchTerm)
    );
  }

  selectOrganization(org: any) {
    this.leadForm.patchValue({
      organization: org.orgName
    });
    this.selectedOrganizationId = org.id;
    this.filteredOrganizations = [];
  }

  editLead(leadId: number): void {
    this.editingLeadId = leadId;
    this.isFormOpen = true;

    // Static data fetch instead of API call
    const data = this.leads.find(l => l.id === leadId);
    
    if (data) {
      this.selectedOrganizationId = 101; // Mock ID
      this.leadForm.patchValue({
        leadNo: data.leadNo,
        type: 'New Business',
        salesProcess: 'Direct',
        date: '2026-02-28',
        expectedValidity: '2026-03-30',
        leadOwner: 'BHARAT JUYAL',
        salesCoordinator: 'Admin',
        salesStage: data.salesStage,
        branch: 'DELHI',
        reportingManager: 'Manager',
        hod: 'John Doe',
        team: 'Sales Team A',
        location: 'Connaught Place',
        area: 'Central',
        source: 'Website',
        organization: data.organizationName
      });
    }
  }

  deleteLead(id: number) {
    if (confirm('Static Mode: Are you sure you want to "delete" this lead? (No actual delete)')) {
      this.leads = this.leads.filter(l => l.id !== id);
      alert('Success: Lead Removed from List (Static)!');
    }
  }

  navigateToNewOrg() {
    alert('Navigation to Add Organization (Static Mode)');
  }

  toggleForm() {
    this.isFormOpen = !this.isFormOpen;
    if (!this.isFormOpen) {
      this.editingLeadId = null;
      this.selectedOrganizationId = null;
      this.leadForm.reset();
      this.initForm(); // Re-initialize with default values
      this.generateNextLeadNo();
    }
  }

  initForm() {
    this.leadForm = this.fb.group({
      leadNo: [{ value: '', disabled: true }],
      type: ['New Business'],
      salesProcess: [''],
      date: [''],
      leadOwner: ['BHARAT JUYAL'],
      salesCoordinator: [''],
      expectedValidity: [''],
      source: [''],
      salesStage: ['Inquiry Received'],
      branch: ['DELHI'],
      reportingManager: [''],
      hod: [''],
      team: [''],
      location: [''],
      area: [''],
      organization: [''],
    });
  }

  onSave() {
    if (this.leadForm.valid) {
      const formValue = this.leadForm.getRawValue();
      console.log('Static Data Saved (No API call):', formValue);
      alert('Success: Lead Information Saved (Static Mode)!');
      
      this.leadForm.reset();
      this.initForm();
      this.generateNextLeadNo();
      this.selectedOrganizationId = null;
      this.isFormOpen = false;
    } else {
      alert('Error: Please fill required fields.');
    }
  }
}