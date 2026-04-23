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
    this.branchForm = this.fb.group({
      id: [0],
      companyName: [{ value: 'Cavalier Logistic Private Limited', disabled: true }, Validators.required],
      companyAlias: ['', Validators.maxLength(100)],
      branchName: ['', [Validators.required, Validators.maxLength(250)]],
      branchCode: ['', [Validators.required, Validators.maxLength(50)]],
      houseNo: [''],
      buildingName: [''],
      floorBlock: [''],
      landmark: [''],
      streetName: [''],
      areaSector: [''],
      district: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      country: ['India'],
      address: ['', Validators.required],
      timeZone: [''],
      contactNo: ['', [Validators.required, Validators.pattern('^[0-9]{10,12}$')]],
      email: ['', [Validators.required, Validators.email]],
      faxNumber: [''],
      gstCategory: ['', Validators.required],
      gstin: ['', Validators.required],
      iecCode: [''],
      defaultCustomHouseCode: [''],
      copyDefaultFrom: [''],
      isActive: [true]
    });

    this.setupAddressAutoSummary();
    this.manageGstValidation(); 

    // Pincode auto-fill logic
    this.branchForm.get('postalCode')?.valueChanges.subscribe(value => {
      if (value && value.length === 6) {
        this.fetchLocationDetails(value);
      }
    });
  }

  ngOnInit(): void {
    const state = history.state;
    if (state && state.data && state.isEdit) {
      this.isEdit = true;
      this.branchForm.patchValue(state.data);
    }
  }

  // Naya method Pincode se data fetch karne ke liye
  private fetchLocationDetails(pincode: string) {
    fetch(`https://api.postalpincode.in/pincode/${pincode}`)
      .then(response => response.json())
      .then(data => {
        if (data[0].Status === 'Success') {
          const postOffice = data[0].PostOffice[0];
          this.branchForm.patchValue({
            city: postOffice.Block,
            district: postOffice.District,
            state: postOffice.State
          });
        }
      })
      .catch(error => console.error('Pincode API Error:', error));
  }

  private setupAddressAutoSummary() {
    const addressFields = ['houseNo','buildingName','floorBlock','streetName','landmark','areaSector','city','district','state','postalCode'];
    this.branchForm.valueChanges.subscribe(() => {
      const vals = this.branchForm.getRawValue();
      const summary = addressFields
        .map(field => vals[field])
        .filter(val => val && val.trim() !== '')
        .join(', ');
      this.branchForm.get('address')?.setValue(summary, { emitEvent: false });
    });
  }

  saveDetails() {
    if (this.branchForm.invalid) {
      this.branchForm.markAllAsTouched();
      return;
    }
    
    this.loading = true;
    const formData = this.branchForm.getRawValue();

    if (formData.gstCategory === 'Unregistered') {
      formData.gstin = "N/A"; 
    }

    const request = this.isEdit 
      ? this.branchService.updateBranch(formData.id, formData)
      : this.branchService.addBranch(formData);

    request.subscribe({
      next: () => {
        this.loading = false;
        alert(this.isEdit ? 'Branch updated successfully!' : 'Branch registered successfully!');
        this.router.navigate(['/dashboard/branch']);
      },
      error: (err) => {
        this.loading = false;
        console.error('API Error:', err);
        alert('Action Failed: ' + (err.error?.message || 'Server Error.'));
      }
    });
  }

  cancel() {
    this.router.navigate(['/dashboard/branch']);
  }

  getError(field: string) {
    const control = this.branchForm.get(field);
    if (!control || !control.touched || control.valid) return null;
    if (control.errors?.['required']) return 'This field is required';
    if (control.errors?.['maxlength']) return `Maximum length exceeded (${control.errors['maxlength'].requiredLength})`;
    if (control.errors?.['pattern']) return 'Invalid format';
    if (control.errors?.['email']) return 'Invalid email address';
    return null;
  }

  private manageGstValidation() {
    this.branchForm.get('gstCategory')?.valueChanges.subscribe(value => {
      const gstinControl = this.branchForm.get('gstin');
      if (value === 'Registered') {
        gstinControl?.setValidators([Validators.required]);
      } else {
        gstinControl?.clearValidators();
        gstinControl?.setValue(null); 
      }
      gstinControl?.updateValueAndValidity();
    });
  }
}