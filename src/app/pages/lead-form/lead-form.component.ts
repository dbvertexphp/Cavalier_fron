import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-lead-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lead-form.component.html',
  styleUrl: './lead-form.component.css',
})
export class LeadFormComponent implements OnInit {
  leadForm!: FormGroup;

  // --- Naya Table Logic (Untouched existing logic ke sath) ---
  isFormOpen = false; 
  leads: any[] = [
    { leadNo: 'LD-2026-001', organization: 'ABC SHIPPING', type: 'New Business', leadOwner: 'BHARAT JUYAL', status: 'Inquiry Received', date: '09-Feb-2026' },
    { leadNo: 'LD-2026-002', organization: 'XYZ LOGISTICS', type: 'New Business', leadOwner: 'BHARAT JUYAL', status: 'Won', date: '10-Feb-2026' }
  ];

  toggleForm() {
    this.isFormOpen = !this.isFormOpen;
  }
  // -------------------------------------------------------

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    // Shuruat mein ek empty contact row add karne ke liye
    this.addContactRow();
  }

  initForm() {
    this.leadForm = this.fb.group({
      // Lead Info Section
      leadNo: [{ value: '-----New Entry-----', disabled: true }],
      type: ['New Business'],
      source: [''],
      branch: ['DELHI'],
      pricingTeam: [''],
      date: ['09-Feb-2026'],
      leadOwner: ['BHARAT JUYAL', Validators.required],
      salesProcess: ['Sales Process'],
      salesCoordinator: ['BHARAT JUYAL'],
      expectedValidity: [''],
      prospectNo: [''],
      campaign: [''],
      salesStage: ['Inquiry Received'],

      // Organization Section
      organization: ['', Validators.required],
      branchName: [''],
      addressLine1: [''],
      addressLine2: [''],
      addressLine3: [''],
      orgRole: ['Shipper'],
      shipper: [''],
      country: ['', Validators.required],
      state: [''],
      city: [''],
      zipCode: [''],
      telephone: [''],
      fax: [''],

      // Table (FormArray)
      contacts: this.fb.array([])
    });
  }

  // Contact rows ko access karne ke liye getter
  get contacts(): FormArray {
    return this.leadForm.get('contacts') as FormArray;
  }

  // Nayi row add karne ka function
  addContactRow() {
    const row = this.fb.group({
      name: [''],
      designation: [''],
      department: [''],
      telephone: [''],
      mobile: [''],
      email: ['', Validators.email]
    });
    this.contacts.push(row);
  }

  // Row delete karne ka function
  removeContactRow(index: number) {
    if (this.contacts.length > 1) {
      this.contacts.removeAt(index);
    }
  }

  // Save Button Action
  onSave() {
    if (this.leadForm.valid) {
      console.log('Final Data:', this.leadForm.getRawValue());
      alert('Form Submitted! Check console for data.');
      this.isFormOpen = false; // Save karne ke baad wapas table par jane ke liye
    } else {
      alert('Form is invalid! Please check mandatory fields.');
    }
  }
}