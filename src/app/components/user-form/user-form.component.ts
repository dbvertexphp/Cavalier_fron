import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { BranchService } from '../../services/branch.service'; // BranchService import kiya

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  isEditMode: boolean = false;
  isBranchForm: boolean = false; // Flag to identify if it's a Branch form
  id: number | null = null;
  initialData: any = null;

  constructor(
    private fb: FormBuilder, 
    private userService: UserService,
    private branchService: BranchService,
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.initialData = navigation.extras.state['data'];
      this.isEditMode = navigation.extras.state['isEdit'] || false;
      this.isBranchForm = navigation.extras.state['isBranch'] || false; // Catching isBranch flag
      this.id = this.initialData ? this.initialData.id : null;
    }
  }

  ngOnInit(): void {
    this.initForm();

    if (this.initialData) {
      setTimeout(() => {
        this.userForm.patchValue(this.initialData);
        if (this.isEditMode && !this.isBranchForm) {
          this.userForm.get('password')?.clearValidators();
          this.userForm.get('password')?.updateValueAndValidity();
        }
      }, 100); 
    }
  }

  initForm() {
    if (this.isBranchForm) {
      // BRANCH FORM FIELDS
      this.userForm = this.fb.group({
        companyName: ['', Validators.required],
        companyAlias: [''],
        branchName: ['', Validators.required],
        branchCode: ['', Validators.required],
        country: ['India', Validators.required],
        timeZone: ['Asia/Kolkata', Validators.required],
        city: ['', Validators.required],
        address: ['', Validators.required],
        state: ['', Validators.required],
        postalCode: ['', [Validators.required, Validators.maxLength(10)]],
        contactNo: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        faxNumber: [''],
        gstCategory: ['', Validators.required],
        gstin: ['', [Validators.required, Validators.maxLength(15)]],
        iecCode: [''],
        defaultCustomHouseCode: [''],
        copyDefaultFrom: ['None'],
        isActive: [true]
      });
    } else {
      // USER FORM FIELDS
      this.userForm = this.fb.group({
        empCode: ['', Validators.required],
        firstName: ['', Validators.required],
        middleName: [''],
        lastName: ['', Validators.required],
        dob: ['', Validators.required],
        dateOfJoining: ['', Validators.required],
        ctc_Monthly: [0],
        designation: [''],
        functionalArea: [''],
        email: ['', [Validators.required, Validators.email]],
        password: ['Admin@123'], 
        contactPersonal: ['', Validators.required],
        location: [''],
        presentAddress: [''],
        permanentAddress: [''],
        paN_No: ['', Validators.required],
        aadhaarNo: ['', Validators.required],
        tenthYear: [''],
        twelfthYear: [''],
        graduationYear: [''],
        postGraduationYear: [''],
        photoPath: [''],
        bloodGroup: [''],
        salaryAccountNo: [''],
        invitationLetter: [false],
        simIssued: [false],
        maritalStatus: [''],
        emergencyName: [''],
        emergencyRelation: [''],
        emergencyContactNo: [''],
        sourceOfSelection: [''],
        status: [true],
        branchId: [1],
      // ... purani fields ...
      roleId: [null],
      licenceType: [''],
      country: ['India'],
      department: [''],
      gender: ['Male'],
      userType: [''],
      reportTo: [null],
      mfaRegistration: [false],
      ipAdress: [''],
      profilePicture: [''],
      telephone: [''],
      mobile: ['', Validators.required],
      profileSelect: [''],
      fieldVisit: [false],
      signature: [''],
      alwaysBccmyself: [false]
      });
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const data = this.userForm.value;

      if (this.isBranchForm) {
        this.handleBranchSubmit(data);
      } else {
        this.handleUserSubmit(data);
      }
    }
  }

  private handleBranchSubmit(data: any) {
    if (this.isEditMode && this.id) {
      this.branchService.updateBranch(this.id, { ...data, id: this.id }).subscribe({
        next: () => { alert('Branch Updated!'); this.router.navigate(['/dashboard/branch']); },
        error: () => alert('Branch Update Failed')
      });
    } else {
      this.branchService.createBranch(data).subscribe({
        next: () => { alert('Branch Created!'); this.router.navigate(['/dashboard/branch']); },
        error: () => alert('Branch Creation Failed')
      });
    }
  }

  private handleUserSubmit(data: any) {
    if (this.isEditMode && this.id) {
      this.userService.updateUser(this.id, data).subscribe({
        next: () => { alert('User Updated!'); this.router.navigate(['/dashboard/users']); },
        error: () => alert('Update Failed')
      });
    } else {
      this.userService.registerUser(data).subscribe({
        next: () => { alert('User Registered!'); this.router.navigate(['/dashboard/users']); },
        error: () => alert('Registration Failed')
      });
    }
  }

  onCancel() {
    const path = this.isBranchForm ? '/dashboard/branch' : '/dashboard/users';
    this.router.navigate([path]);
  }
}