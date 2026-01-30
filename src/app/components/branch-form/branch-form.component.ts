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
      roleId: ['', Validators.required],
      companyName: ['', [Validators.required, Validators.maxLength(250)]],
      companyAlias: ['', Validators.maxLength(100)],
      branchName: ['', [Validators.required, Validators.maxLength(250)]],
      branchCode: ['', [Validators.required, Validators.maxLength(50)]],
      country: ['India'],
      timeZone: [''],
      city: ['', Validators.required],
      address: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]], 
      contactNo: ['', [Validators.required, Validators.pattern('^[0-9]{10,12}$')]],
      email: ['', [Validators.required, Validators.email]],
      faxNumber: [''],
      gstCategory: ['', Validators.required],
      gstin: [''],
      iecCode: [''],
      defaultCustomHouseCode: [''],
      copyDefaultFrom: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    const state = history.state;
    if (state && state.data && state.isEdit) {
      this.isEdit = true;
      this.branchForm.patchValue(state.data);
    }
  }

  loadRoles() {
    this.branchService.getRoles().subscribe({
      next: (data) => this.roles = data,
      error: (err) => console.error('Roles fetch failed', err)
    });
  }

  saveDetails() {
    if (this.branchForm.invalid) {
      this.branchForm.markAllAsTouched();
      return;
    }
    
    this.loading = true;
    const formData = this.branchForm.value;

    const request = this.isEdit 
      ? this.branchService.updateBranch(formData.id, formData)
      : this.branchService.addBranch(formData); // Ensure this calls /api/branch/create in service

    request.subscribe({
      next: () => {
        this.loading = false;
        alert(this.isEdit ? 'Updated successfully!' : 'Registered successfully!');
        this.router.navigate(['/dashboard/branch']);
      },
      error: (err) => {
        this.loading = false;
        console.error('API Error:', err);
        alert('Action Failed: ' + (err.error?.message || 'Check network tab for 405/500 error'));
      }
    });
  }

  cancel() {
    this.router.navigate(['/dashboard/branch']);
  }
}