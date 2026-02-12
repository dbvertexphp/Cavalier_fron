import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router'; // Router import kiya

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
  
  leads: any[] = [
    { date: '12-Feb-2026', organization: 'ABC SHIPPING', type: 'New Business', leadOwner: 'BHARAT JUYAL', status: 'Inquiry Received', branch: 'DELHI' },
    { date: '12-Feb-2026', organization: 'XYZ LOGISTICS', type: 'New Business', leadOwner: 'BHARAT JUYAL', status: 'Won', branch: 'DELHI' }
  ];

  constructor(private fb: FormBuilder, private router: Router) {} // router yahan inject kiya

  ngOnInit(): void {
    this.initForm();
  }

  // Naya function jo Organization page par le jayega
  navigateToNewOrg() {
    this.router.navigate(['/dashboard/organization-add']);
  }

  toggleForm() {
    this.isFormOpen = !this.isFormOpen;
    if (this.isFormOpen) {
      this.calculateExpectedValidity();
    }
  }

  initForm() {
    const today = new Date();
    this.leadForm = this.fb.group({
      type: ['New Business'],
      source: [''], 
      salesProcess: [''],
      salesCoordinator: [''],
      branch: ['DELHI'],
      date: [this.formatDate(today)],
      leadOwner: ['BHARAT JUYAL', Validators.required],
      expectedValidity: [''],
      salesStage: ['Inquiry Received'],
      reportingManager: [''],
      hod: [''],
      team: [''],

      // Organization & Contact Details
      organization: ['', Validators.required],
      roleShipper: [true],
      roleConsignee: [false],
      roleServices: [false],
      contactPerson: [''],
      emailId: ['', [Validators.email]],
      mobileNumber: [''],
      whatsappNumber: [''],
      department: ['']
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
      console.log('Form Data:', this.leadForm.getRawValue());
      alert('Success: Lead Information Saved!');
      this.isFormOpen = false;
    } else {
      alert('Error: Mandatory fields missing.');
    }
  }
}