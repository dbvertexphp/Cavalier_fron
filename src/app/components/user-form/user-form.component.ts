/*import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { BranchService } from '../../services/branch.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  isEditMode: boolean = false;
  isBranchForm: boolean = false;
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
      this.isBranchForm = navigation.extras.state['isBranch'] || false;
      this.id = this.initialData ? this.initialData.id : null;
    }
  }

  ngOnInit(): void {
    this.initForm();
    if (this.initialData) {
      setTimeout(() => {
        // SQL Bit conversion handle karne ke liye (Branch ke liye IsActive, User ke liye Status)
        const patchData = { ...this.initialData };
        if (this.isBranchForm && patchData.isActive === undefined) patchData.isActive = true;
        
        this.userForm.patchValue(patchData);
      }, 100);
    }
  }

  initForm() {
    // Sabhi Validators hata diye gaye hain taaki koi rukawat na aaye
    if (this.isBranchForm) {
      this.userForm = this.fb.group({
        id: [this.id || 0],
        companyName: ['Cavalier Logistics'], // Backend Required field
        companyAlias: ['CL'],
        branchName: [''],                    // Backend Required field
        branchCode: [''],                    // Backend Required field
        country: ['India'],                  // Backend Required field
        timeZone: ['Asia/Kolkata'],          // Backend Required field
        city: [''],                          // Backend Required field
        address: [''],                       // Backend Required field
        state: [''],                         // Backend Required field
        postalCode: [''],                    // Backend Required field
        contactNo: [''],                     // Backend Required field
        email: [''],                         // Backend Required field
        faxNumber: [''],
        gstCategory: ['Registered'],         // Backend Required field
        gstin: [''],                         // Backend Required field
        iecCode: [''],
        defaultCustomHouseCode: [''],
        copyDefaultFrom: ['None'],           // Backend Required field
        isActive: [true]                     // Backend property name matches 'IsActive'
      });
      
    } else {
      this.userForm = this.fb.group({
        id: [this.id || 0], 
        empCode: [''],
        firstName: [''],
        middleName: [''],
        lastName: [''],
        dob: [null],
        dateOfJoining: [null],
        ctc_Monthly: [0],
        designation: [''],
        functionalArea: [''],
        email: [''],
        password: ['Admin@123'],
        contactPersonal: [''],
        location: [''],
        presentAddress: [''],
        permanentAddress: [''],
        paN_No: [''],
        aadhaarNo: [''],
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
        mobile: [''],
        profileSelect: [''],
        fieldVisit: [false],
        signature: [''],
        alwaysBccmyself: [false]
      });
    }
  }

  onSubmit(): void {
    const data = this.userForm.value;
    
    // Update ke waqt ID ka hona zaruri hai
    if (this.isEditMode && this.id) {
        data.id = this.id;
    }

    if (this.isBranchForm) {
      this.handleBranchSubmit(data);
    } else {
      this.handleUserSubmit(data);
    }
  }

  private handleBranchSubmit(data: any) {
    if (this.isEditMode && this.id) {
      this.branchService.updateBranch(this.id, data).subscribe({
        next: () => { alert('Branch Updated Successfully!'); this.router.navigate(['/dashboard/branch']); },
        error: (err) => { 
          console.error('Branch Update Error:', err); 
          alert('Update Failed! Check if Branch Code is unique.'); 
        }
      });
    } else {
      // addBranch/createBranch method call
      this.branchService.addBranch(data).subscribe({
        next: () => { alert('Branch Created Successfully!'); this.router.navigate(['/dashboard/branch']); },
        error: (err) => { 
          console.error('Branch Creation Error:', err); 
          alert('Creation Failed! Please check all required fields.'); 
        }
      });
    }
  }

  private handleUserSubmit(data: any) {
    if (this.isEditMode) {
      this.userService.updateUser(data).subscribe({ 
        next: () => { alert('User Updated Successfully!'); this.router.navigate(['/dashboard/users']); },
        error: (err) => { console.error('User Update Error:', err); alert('Update Failed!'); }
      });
    } else {
      this.userService.registerUser(data).subscribe({
        next: () => { alert('User Registered Successfully!'); this.router.navigate(['/dashboard/users']); },
        error: (err) => { console.error('User Registration Error:', err); alert('Registration Failed!'); }
      });
    }
  }

  onCancel() {
    const path = this.isBranchForm ? '/dashboard/branch' : '/dashboard/users';
    this.router.navigate([path]);
  }
}*/




import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { BranchService } from '../../services/branch.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  isEditMode: boolean = false;
  isBranchForm: boolean = false;
  id: number | null = null;
  initialData: any = null;

  departments: any[] = [];
  designations: any[] = [];

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
      this.isBranchForm = navigation.extras.state['isBranch'] || false;
      this.id = this.initialData ? this.initialData.id : null;
    }
  }

  ngOnInit(): void {
    this.initForm();

    if (!this.isBranchForm) {
      this.loadDropdownData();
    }

    if (this.initialData) {
      setTimeout(() => {
        const patchData = { ...this.initialData };
        if (this.isBranchForm && patchData.isActive === undefined) patchData.isActive = true;
        this.userForm.patchValue(patchData);
      }, 100);
    }
  }

  loadDropdownData() {
    this.userService.getDepartments().subscribe({
      next: (res: any) => { this.departments = res; },
      error: (err) => console.error(err)
    });

    this.userService.getDesignations().subscribe({
      next: (res: any) => { this.designations = res; },
      error: (err) => console.error(err)
    });
  }

  initForm() {
    if (this.isBranchForm) {
      this.userForm = this.fb.group({
        id: [this.id || 0],
        companyName: ['Cavalier Logistics', Validators.required],
        companyAlias: ['CL', Validators.required],
        branchName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
        branchCode: ['', Validators.required],
        country: ['India'],
        timeZone: ['Asia/Kolkata'],
        city: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
        address: ['', Validators.required],
        state: ['', Validators.required],
        postalCode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
        contactNo: ['', [Validators.required, Validators.pattern('^[0-9]{10,12}$')]],
        email: ['', [Validators.required, Validators.email]],
        faxNumber: [''],
        gstCategory: ['Registered'],
        gstin: ['', [Validators.pattern('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$')]],
        iecCode: [''],
        defaultCustomHouseCode: [''],
        copyDefaultFrom: ['None'],
        isActive: [true]
      });
      
    } else {
      this.userForm = this.fb.group({
        id: [this.id || 0], 
        empCode: ['', Validators.required],
        firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
        middleName: ['', [Validators.pattern('^[a-zA-Z ]*$')]],
        lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
        dob: [null, Validators.required],
        dateOfJoining: [null, Validators.required],
        ctc_Monthly: [0, [Validators.required, Validators.min(0)]],
        designation: ['', Validators.required],
        functionalArea: [''],
        email: ['', [Validators.required, Validators.email]],
        password: ['Admin@123', [Validators.required, Validators.minLength(6)]],
        contactPersonal: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        location: ['', Validators.required],
        
        // Present Address Fields
        presHouseNo: ['', Validators.required],
        presBuilding: [''],
        presFloor: [''],
        presBlock: [''],
        presStreet: ['', Validators.required],
        presLandmark: [''],
        presArea: [''],
        presCity: ['', Validators.required],
        presDistrict: ['', Validators.required],
        presState: ['', Validators.required],
        presPincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
        presCountry: ['India'],

        // Permanent Address Fields
        permHouseNo: ['', Validators.required],
        permBuilding: [''],
        permFloor: [''],
        permBlock: [''],
        permStreet: ['', Validators.required],
        permLandmark: [''],
        permArea: [''],
        permCity: ['', Validators.required],
        permDistrict: ['', Validators.required],
        permState: ['', Validators.required],
        permPincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
        permCountry: ['India'],
        
        paN_No: ['', [Validators.required, Validators.pattern('^[A-Z]{5}[0-9]{4}[A-Z]{1}$')]],
        aadhaarNo: ['', [Validators.required, Validators.pattern('^[0-9]{12}$')]],
        tenthYear: ['', [Validators.pattern('^[0-9]{4}$')]],
        twelfthYear: ['', [Validators.pattern('^[0-9]{4}$')]],
        graduationYear: ['', [Validators.pattern('^[0-9]{4}$')]],
        postGraduationYear: ['', [Validators.pattern('^[0-9]{4}$')]],
        photoPath: [''],
        bloodGroup: ['', Validators.required],
        salaryAccountNo: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
        invitationLetter: [false],
        simIssued: [false],
        maritalStatus: ['', Validators.required],
        emergencyName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
        emergencyRelation: ['', Validators.required],
        emergencyContactNo: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        sourceOfSelection: [''],
        status: [true],
        branchId: [1],
        roleId: [null, Validators.required],
        licenceType: [''],
        //country: ['India'],
        department: ['', Validators.required],
        gender: ['Male', Validators.required],
        userType: ['', Validators.required],
        reportTo: [null],
        mfaRegistration: [false],
        ipAdress: [''],
        profilePicture: [''],
        telephone: ['', [Validators.pattern('^[0-9]*$')]],
        mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        profileSelect: [''],
        fieldVisit: [false],
        signature: [''],
        alwaysBccmyself: [false]
      });
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      alert('Bhai, form mein galti hai! Red fields check karo.');
      this.userForm.markAllAsTouched();
      return;
    }

    const data = this.userForm.value;
    if (this.isEditMode && this.id) {
        data.id = this.id;
    }

    if (this.isBranchForm) {
      this.handleBranchSubmit(data);
    } else {
      this.handleUserSubmit(data);
    }
  }

  private handleBranchSubmit(data: any) {
    if (this.isEditMode && this.id) {
      this.branchService.updateBranch(this.id, data).subscribe({
        next: () => { alert('Branch Updated!'); this.router.navigate(['/dashboard/branch']); },
        error: (err) => { console.error(err); alert('Update Failed!'); }
      });
    } else {
      this.branchService.addBranch(data).subscribe({
        next: () => { alert('Branch Created!'); this.router.navigate(['/dashboard/branch']); },
        error: (err) => { console.error(err); alert('Creation Failed!'); }
      });
    }
  }

  private handleUserSubmit(data: any) {
    if (this.isEditMode) {
      this.userService.updateUser(data).subscribe({ 
        next: () => { alert('User Updated!'); this.router.navigate(['/dashboard/users']); },
        error: (err) => { console.error(err); alert('Update Failed!'); }
      });
    } else {
      this.userService.registerUser(data).subscribe({
        next: () => { alert('User Registered!'); this.router.navigate(['/dashboard/users']); },
        error: (err) => { console.error(err); alert('Registration Failed!'); }
      });
    }
  }

  onCancel() {
    const path = this.isBranchForm ? '/dashboard/branch' : '/dashboard/users';
    this.router.navigate([path]);
  }

  // Helper method to check validation in HTML
  isInvalid(controlName: string): boolean {
    const control = this.userForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}