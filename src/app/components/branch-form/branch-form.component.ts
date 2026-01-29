import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BranchService } from '../../services/branch.service';

@Component({
  selector: 'app-branch-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './branch-form.component.html'
})
export class BranchFormComponent implements OnInit {
  branchForm: FormGroup;
  isEdit: boolean = false;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private branchService: BranchService,
    private router: Router
  ) {
    // Adding all missing fields based on your SQL schema
    this.branchForm = this.fb.group({
      id: [0],
      companyName: ['', [Validators.required, Validators.maxLength(250)]],
      companyAlias: ['', Validators.maxLength(100)],
      branchName: ['', [Validators.required, Validators.maxLength(250)]],
      branchCode: ['', [Validators.required, Validators.maxLength(50)]],
      country: ['India'],
      timeZone: [''],
      city: ['', Validators.required],
      address: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]], // Indian Pin Code
      contactNo: ['', [Validators.required, Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      faxNumber: [''],
      gstCategory: ['', Validators.required],
      gstin: ['', [Validators.required, Validators.maxLength(15)]],
      iecCode: [''],
      defaultCustomHouseCode: [''],
      copyDefaultFrom: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    const state = history.state;
    if (state && state.data && state.isEdit) {
      this.isEdit = true;
      this.branchForm.patchValue(state.data);
    }
  }

  saveDetails() {
    if (this.branchForm.invalid) {
      // Form invalid hai toh user ko missing fields dikhane ke liye mark karein
      this.branchForm.markAllAsTouched();
      return;
    }
    
    this.loading = true;
    const formData = this.branchForm.value;

    if (this.isEdit) {
      this.branchService.updateBranch(formData.id, formData).subscribe({
        next: () => {
          alert('Branch details updated successfully!');
          this.router.navigate(['/dashboard/branch']);
        },
        error: (err: any) => { 
          console.error('Update Error:', err); 
          this.loading = false; 
        }
      });
    } else {
      this.branchService.addBranch(formData).subscribe({
        next: () => {
          alert('New Branch registered successfully!');
          this.router.navigate(['/dashboard/branch']);
        },
        error: (err: any) => { 
          console.error('Save Error:', err); 
          this.loading = false; 
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/dashboard/branch']);
  }
}