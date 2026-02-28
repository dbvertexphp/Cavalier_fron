import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-lead-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lead-form.component.html',
  styleUrl: './lead-form.component.css',
})
export class LeadFormComponent implements OnInit {

  leadForm!: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    const today = new Date().toISOString().split('T')[0];

    this.leadForm = this.fb.group({
      type: ['Existing Business'],
      salesProcess: ['Standard'],
      date: [today],
      expectedValidity: [''],
      leadOwner: ['BHARAT JUYAL'],
      leadSource: ['Email'],
      salesCoordinator: ['CO_ORDINATOR_1'],
      salesStage: ['Sales Closed'],
      branch: ['DELHI'],
      reportingManager: ['Manager 1'],
      team: [1],     // STATIC
      hod: [1],      // STATIC
      location: ['Delhi'],
      area: ['Area 1'],
      organizationName: ['Test Organization']
    });
  }

  onSave() {

    const formValue = this.leadForm.value;

    const data = {
      type: formValue.type,
      salesProcess: formValue.salesProcess,
      date: new Date(formValue.date).toISOString(),
      expectedValidity: formValue.expectedValidity
        ? new Date(formValue.expectedValidity).toISOString()
        : null,
      leadOwner: formValue.leadOwner,
      leadSource: formValue.leadSource,
      salesCoordinator: formValue.salesCoordinator,
      salesStage: formValue.salesStage,
      branch: formValue.branch,
      reportingManager: formValue.reportingManager,
      team: 1,   // HARD CODED
      hod: 1,    // HARD CODED
      location: formValue.location,
      area: formValue.area,
      organizationName: formValue.organizationName
    };

    console.log("Sending to backend:", data);

    this.http.post(`${environment.apiUrl}/leads`, data)
      .subscribe({
        next: (res) => {
          console.log("Saved:", res);
          alert('Lead Saved Successfully');
          this.leadForm.reset();
        },
        error: (err) => {
          console.log("Backend Error:", err.error);
        }
      });
  }
}