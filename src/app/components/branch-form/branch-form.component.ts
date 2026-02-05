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
  roles: any[] = [];

  constructor(
    private fb: FormBuilder,
    private branchService: BranchService,
    private router: Router
  ) {
    this.branchForm = this.fb.group({
      id: [0],
      companyName: [{ value: 'Cavalier Logistic Private Limited', disabled: false }],
      companyAlias: ['', Validators.maxLength(100)],
      branchName: ['', [Validators.required, Validators.maxLength(250)]],
      branchCode: ['', [Validators.required, Validators.maxLength(50)]],
      
      // --- Detailed Address Fields ---
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
      
      // Full Address Summary (Readonly in HTML)
      address: ['', Validators.required],
      
      timeZone: [''],
      contactNo: ['', [Validators.required, Validators.pattern('^[0-9]{10,12}$')]],
      email: ['', [Validators.required, Validators.email]],
      faxNumber: [''],
      gstCategory: ['', Validators.required],
      gstin: ['', [Validators.required]],
      iecCode: [''],
      defaultCustomHouseCode: [''],
      copyDefaultFrom: [''],
      isActive: [true]
    });

    // Auto-update summary address logic
    this.setupAddressAutoSummary();
  }

  ngOnInit(): void {
    const state = history.state;
    if (state && state.data && state.isEdit) {
      this.isEdit = true;
      // Patching values if they exist in state.data
      this.branchForm.patchValue(state.data);
    }
  }

  // Yeh function saari fields ko combine karke ek string banata hai
  private setupAddressAutoSummary() {
    const addressFields = [
      'houseNo', 'buildingName', 'floorBlock', 'streetName', 
      'landmark', 'areaSector', 'city', 'district', 'state', 'postalCode'
    ];

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
      // Debugging ke liye invalid controls check karne ke liye:
      console.log('Form Invalid Controls:', this.findInvalidControls());
      return;
    }
    
    this.loading = true;
    // getRawValue use kiya hai taaki disabled fields (CompanyName) bhi chali jayein
    const formData = this.branchForm.getRawValue();

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
        alert('Action Failed: ' + (err.error?.message || 'Server Error. Check console.'));
      }
    });
  }

  // Helper function to debug invalid fields
  private findInvalidControls() {
    const invalid = [];
    const controls = this.branchForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  cancel() {
    this.router.navigate(['/dashboard/branch']);
  }
}