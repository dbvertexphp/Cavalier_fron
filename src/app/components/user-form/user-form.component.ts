// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { UserService } from '../../services/user.service';
// import { BranchService } from '../../services/branch.service';
// import { HttpClient } from '@angular/common/http';
// import { environment } from '../../../environments/environment';

// @Component({
//   selector: 'app-user-form',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule,FormsModule],
//   templateUrl: './user-form.component.html'
// })
// export class UserFormComponent implements OnInit {
//  permissions: any[] = [];
// selectedPermissionIds: number[] = [];
// showPassword = false;
//   userForm!: FormGroup;
//   isEditMode = false;
//   isBranchForm = false;
//   id: number | null = null;
//   initialData: any;

//   departments: any[] = [];
//   designations: any[] = [];
//   roles: any[] = [];
//   branches: any[] = [];

//   constructor(
//     private fb: FormBuilder,
//     private userService: UserService,
//     private branchService: BranchService,
//     private router: Router,
//     private http: HttpClient
//   ) {
//     const nav = this.router.getCurrentNavigation();
//     if (nav?.extras.state) {
//       this.initialData = nav.extras.state['data'];
//       this.isEditMode = nav.extras.state['isEdit'] || false;
//       this.isBranchForm = nav.extras.state['isBranch'] || false;
//       this.id = this.initialData?.id || null;
//     }
//   }

//   ngOnInit(): void {
//     this.initForm();

//     if (!this.isBranchForm) {
//       this.loadDropdowns();
//       this.getBranches();
//        this.loadPermissions();
//     }

//     if (this.initialData) {
//       setTimeout(() => {
//         this.userForm.patchValue(this.initialData);
//       });
//     }
//   }
// loadPermissions() {
//   this.http
//     .get<any[]>(`${environment.apiUrl}/permissions/list`) // 👈 direct call
//     .subscribe({
//       next: (res) => {
//         // route '#' wale hata do
//         this.permissions = res.filter(p => p.route !== '#');
//         console.log('✅ Permissions Loaded:', this.permissions);
//       },
//       error: (err) => {
//         console.error('❌ Permission API Error', err);
//       }
//     });
// }

//   // ================= FORM INIT =================
// onPermissionToggle(permission: any, event: any) {
//   const id = permission.permissionID;

//   let current = this.userForm.get('permissionIds')?.value || [];

//   if (event.target.checked) {
//     if (!current.includes(id)) {
//       current.push(id);
//     }
//   } else {
//     current = current.filter((x: number) => x !== id);
//   }

//   // 🔥 form ke andar set karo
//   this.userForm.patchValue({
//     permissionIds: current
//   });

//   console.log('✅ PermissionIds in Form:', this.userForm.value.permissionIds);
// }



//   initForm() {
//     if (this.isBranchForm) {
//       this.userForm = this.fb.group({
//         companyName: ['Cavalier Logistics', Validators.required],
//         companyAlias: ['CL'],
//         branchName: ['', Validators.required],
//         branchCode: ['', Validators.required],
//         email: ['', [Validators.required, Validators.email]],
//         city: ['', Validators.required],
//         state: ['', Validators.required],
//         postalCode: ['', Validators.required],
//         contactNo: ['', Validators.required],
//         gstCategory: ['Regular'],
//         gstin: [''],
//         address: ['', Validators.required],
//         isActive: [true]
//       });
//     } 
//     else {
//       this.userForm = this.fb.group({

//         // BASIC
//         firstName: ['', Validators.required],
//         middleName: [''],
//         lastName: ['', Validators.required],
//         dob: ['', Validators.required],
//         gender: ['Male'],
//         maritalStatus: ['Single'],
//   password: ['', Validators.required],
//         // JOB
//         department: ['', Validators.required],
//         designation: ['', Validators.required],
//         functionalArea: [''],
//         userType: ['', Validators.required],
//         branchId: [null, Validators.required],
//         roleId: [null, Validators.required],
//         licenceType: [''],

//         dateOfJoining: ['', Validators.required],
//         ctc_Monthly: [0, Validators.required],
//         salaryAccountNo: [''],

//         // CONTACT
//         email: ['', [Validators.required, Validators.email]],
//         mobile: ['', Validators.required],
//         telephone: [''],

//         // GOVT
//         paN_No: ['', Validators.required],
//         aadhaarNo: ['', Validators.required],
//         ipAdress: [''],
//   permissionIds: [[]], 
//         // ADDRESS (PRESENT)
//         presHouseNo: [''],
//         presBuilding: [''],
//         presFloor: [''],
//         presBlock: [''],
//         presStreet: [''],
//         presLandmark: [''],
//         presArea: [''],
//         presCity: [''],
//         presDistrict: [''],
//         presState: [''],
//         presPincode: [''],
//         presCountry: ['India'],
// tenthYear: [''],
//   tenthPercentage: [''],
//   tenthMarksheet: [null],

//   twelfthYear: [''],
//   twelfthPercentage: [''],
//   twelfthMarksheet: [null],

//   graduationYear: [''],
//   graduationPercentage: [''],
//   graduationMarksheet: [null],

//   postGraduationYear: [''],
//   postGraduationPercentage: [''],
//   postGraduationMarksheet: [null],

//   // Profile Media

  
 
//         // ADDRESS (PERMANENT)
//         permHouseNo: [''],
//         permBuilding: [''],
//         permFloor: [''],
//         permBlock: [''],
//         permStreet: [''],
//         permLandmark: [''],
//         permArea: [''],
//         permCity: [''],
//         permDistrict: [''],
//         permState: [''],
//         permPincode: [''],
//         permCountry: ['India'],

//         // EDUCATION
       

//         // MEDIA
//         profileSelect: [''],
//         profilePicture: [''],
//         signature: [''],

//         // EMERGENCY
//         reportTo: [''],
//         emergencyName: [''],
//         emergencyContactNo: [''],

//         // SYSTEM
//         mfaRegistration: [false],
//         fieldVisit: [false],
//         alwaysBccmyself: [false],
//         invitationLetter: [false],
//         simIssued: [false],
//         status: [true]
//       });
//     }
//   }

//   // ================= DROPDOWNS =================
// onFileSelect(event: any, field: string) {
//   const file = event.target.files[0];
//   if (file) {
//     this.userForm.patchValue({
//       [field]: file
//     });
//     this.userForm.get(field)?.updateValueAndValidity();
//   }
// }

//   loadDropdowns() {
//     this.userService.getDepartments().subscribe(res => this.departments = res);
//     this.userService.getDesignations().subscribe(res => this.designations = res);
//     this.userService.getRoles().subscribe(res => this.roles = res);
//   }

//   getBranches() {
//     this.http.get<any>(`${environment.apiUrl}/branch/list`).subscribe({
//       next: res => {
//         this.branches = Array.isArray(res) ? res : res?.data || [];
//       }
//     });
//   }

//   // ================= SUBMIT =================

// onSubmit() {

//   console.log('================ FORM RAW VALUE ================');
//   console.log(this.userForm.value);

//   console.log('================ FORM STATUS ==================');
//   console.log('Valid:', this.userForm.valid);
//   console.log('Invalid:', this.userForm.invalid);

//   console.log('================ INVALID FIELDS ===============');
//   Object.keys(this.userForm.controls).forEach(key => {
//     const control = this.userForm.get(key);
//     if (control?.invalid) {
//       console.warn(`❌ Invalid: ${key}`, control.errors);
//     }
//   });

//   console.log('================ EMPTY / NULL FIELDS ==========');
//   Object.keys(this.userForm.controls).forEach(key => {
//     const value = this.userForm.get(key)?.value;
//     if (value === '' || value === null) {
//       console.warn(`⚠️ Empty: ${key}`);
//     }
//   });

//   if (this.userForm.invalid) {
//     this.userForm.markAllAsTouched();
//     alert('Form invalid hai bhai');
//     return;
//   }

//   const payload = this.userForm.value;
//   const formData = new FormData();

// Object.keys(this.userForm.controls).forEach(key => {
//   const value = this.userForm.get(key)?.value;
//   if (value !== null && value !== '') {
//     formData.append(key, value);
//   }
// });
// Object.keys(this.userForm.controls).forEach(key => {
//   const value = this.userForm.get(key)?.value;

//   if (key === 'permissionIds') {
//     // 🔥 array ko multiple values me bhejo
//     value.forEach((id: number) => {
//       formData.append('PermissionIds', id.toString());
//     });
//   } 
//   else if (value !== null && value !== '') {
//     formData.append(key, value);
//   }
// });

//   if (this.isBranchForm) {
//     this.branchService.addBranch(formData).subscribe(() => {
//       alert('Branch Saved');
//       this.router.navigate(['/dashboard/branch']);
//     });
//   } 
//   else {
//     this.userService.registerUser(payload).subscribe(() => {
//       alert('User Saved');
//       this.router.navigate(['/dashboard/users']);
//     });
//   }
// }


// generatePassword() {
//   const chars =
//     'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
//   let password = '';

//   for (let i = 0; i < 10; i++) {
//     password += chars.charAt(Math.floor(Math.random() * chars.length));
//   }

//   this.userForm.patchValue({
//     password: password
//   });
// }
//   onCancel() {
//     this.router.navigate([
//       this.isBranchForm ? '/dashboard/branch' : '/dashboard/users'
//     ]);
//   }
//   // Add this inside your Export Class
// bloodGroups: string[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
// selectedBloodGroup: string = ''; // To store the selection


// }
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { BranchService } from '../../services/branch.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit {
  
  permissions: any[] = [];
  selectedPermissionIds: number[] = [];
  showPassword = false;
  userForm!: FormGroup;
  isEditMode = false;
  isBranchForm = false;
  id: number | null = null;
  initialData: any;

  departments: any[] = [];
  designations: any[] = [];
  roles: any[] = [];
  branches: any[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private branchService: BranchService,
    private router: Router,
    private http: HttpClient
  ) {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state) {
      this.initialData = nav.extras.state['data'];
      this.isEditMode = nav.extras.state['isEdit'] || false;
      this.isBranchForm = nav.extras.state['isBranch'] || false;
      this.id = this.initialData?.id || null;
    }
  }

  ngOnInit(): void {
    this.initForm();

    if (!this.isBranchForm) {
      this.loadDropdowns();
      this.getBranches();
      this.loadPermissions();
    }

    if (this.initialData) {
      setTimeout(() => {
        this.userForm.patchValue(this.initialData);
      });
    }
  }

  loadPermissions() {
    this.http
      .get<any[]>(`${environment.apiUrl}/permissions/list`)
      .subscribe({
        next: (res) => {
          this.permissions = res.filter(p => p.route !== '#');
          console.log('✅ Permissions Loaded:', this.permissions);
        },
        error: (err) => {
          console.error('❌ Permission API Error', err);
        }
      });
  }

  onPermissionToggle(permission: any, event: any) {
    const id = permission.permissionID;
    let current = this.userForm.get('permissionIds')?.value || [];
    if (event.target.checked) {
      if (!current.includes(id)) {
        current.push(id);
      }
    } else {
      current = current.filter((x: number) => x !== id);
    }
    this.userForm.patchValue({
      permissionIds: current
    });
  }

  initForm() {
    if (this.isBranchForm) {
      this.userForm = this.fb.group({
        companyName: ['Cavalier Logistics', Validators.required],
        companyAlias: ['CL'],
        branchName: ['', Validators.required],
        branchCode: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        city: ['', Validators.required],
        state: ['', Validators.required],
        postalCode: ['', Validators.required],
        contactNo: ['', Validators.required],
        gstCategory: ['Regular'],
        gstin: [''],
        address: ['', Validators.required],
        isActive: [true]
      });
    } else {
      this.userForm = this.fb.group({
        firstName: ['', Validators.required],
        middleName: [''],
        lastName: ['', Validators.required],
        dob: ['', Validators.required],
        gender: ['Male'],
        maritalStatus: ['Single'],
        password: ['', Validators.required],
        department: ['', Validators.required],
        designation: ['', Validators.required],
        functionalArea: [''],
        userType: ['', Validators.required],
        branchId: [null, Validators.required],
        roleId: [null, Validators.required],
        licenceType: [''],
        dateOfJoining: ['', Validators.required],
        ctc_Monthly: [0, Validators.required],
        salaryAccountNo: [''],
        email: ['', [Validators.required, Validators.email]],
        mobile: ['', Validators.required],
        telephone: [''],
        paN_No: ['', Validators.required],
        aadhaarNo: ['', Validators.required],
        ipAdress: [''],
        permissionIds: [[]],
        presHouseNo: [''],
        presBuilding: [''],
        presFloor: [''],
        presBlock: [''],
        presStreet: [''],
        presLandmark: [''],
        presArea: [''],
        presCity: [''],
        presDistrict: [''],
        presState: [''],
        presPincode: [''],
        presCountry: ['India'],

        educations: this.fb.array([]),
        
        // ✅ 1. Added Experiences Array
        experiences: this.fb.array([]),

        tenthName: ['10th'],
        tenthYear: [''],
        tenthPercentage: [''],
        tenthMarksheet: [null],

        twelfthName: ['12th'],
        twelfthYear: [''],
        twelfthPercentage: [''],
        twelfthMarksheet: [null],

        graduationName: ['Graduation'],
        graduationYear: [''],
        graduationPercentage: [''],
        graduationMarksheet: [null],

        postGraduationName: ['Post Graduation'],
        postGraduationYear: [''],
        postGraduationPercentage: [''],
        postGraduationMarksheet: [null],

        permHouseNo: [''],
        permBuilding: [''],
        permFloor: [''],
        permBlock: [''],
        permStreet: [''],
        permLandmark: [''],
        permArea: [''],
        permCity: [''],
        permDistrict: [''],
        permState: [''],
        permPincode: [''],
        permCountry: ['India'],
        profileSelect: [''],
        profilePicture: [''],
        signature: [''],
        reportTo: [''],
        emergencyName: [''],
        emergencyRelationship:[''],
        emergencyContactNo: [''],
        mfaRegistration: [false],
        fieldVisit: [false],
        alwaysBccmyself: [false],
        invitationLetter: [false],
        simIssued: [false],
        status: [true]
      });
    }
  }

  // ============= DYNAMIC EDUCATION METHODS =============
  
  createEducationGroup(): FormGroup {
    return this.fb.group({
      educationName: [''],
      year: [''],
      percentage: [''],
      marksheet: [null]
    });
  }

  get educations() {
    return this.userForm.get('educations') as FormArray;
  }

  addEducation() {
    this.educations.push(this.createEducationGroup());
  }

  removeEducation(index: number) {
    this.educations.removeAt(index);
  }

  // ✅ 2. DYNAMIC EXPERIENCE METHODS
  
  createExperienceGroup(): FormGroup {
    return this.fb.group({
      organizationName: [''],
      designation: [''],
      annualSalary: [''],
      joiningDate: [''],
      exitDate: [''],
      salarySlip: [null],
      relievingLetter: [null],
      experienceLetter: [null],
      appointmentLetter: [null]
    });
  }

  get experiences() {
    return this.userForm.get('experiences') as FormArray;
  }

  addExperience() {
    this.experiences.push(this.createExperienceGroup());
  }

  removeExperience(index: number) {
    this.experiences.removeAt(index);
  }

  // ==========================================================

  // ✅ 3. Updated FileSelect to handle both Edu and Exp arrays
  onFileSelect(event: any, field: string, index?: number, type: 'edu' | 'exp' = 'edu') {
    const file = event.target.files[0];
    if (file) {
      if (index !== undefined) {
        const array = type === 'edu' ? this.educations : this.experiences;
        const control = array.at(index).get(field);
        control?.patchValue(file);
      } else {
        this.userForm.patchValue({ [field]: file });
        this.userForm.get(field)?.updateValueAndValidity();
      }
    }
  }

  loadDropdowns() {
    this.userService.getDepartments().subscribe(res => this.departments = res);
    this.userService.getDesignations().subscribe(res => this.designations = res);
    this.userService.getRoles().subscribe(res => this.roles = res);
  }

  getBranches() {
    this.http.get<any>(`${environment.apiUrl}/branch/list`).subscribe({
      next: res => {
        this.branches = Array.isArray(res) ? res : res?.data || [];
      }
    });
  }

  onSubmit() {
    console.log('================ FORM RAW VALUE ================');
    console.log(this.userForm.value);

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      alert('Form invalid hai bhai');
      return;
    }

    const payload = this.userForm.value;
    const formData = new FormData();

    Object.keys(this.userForm.controls).forEach(key => {
      const value = this.userForm.get(key)?.value;
      if (key === 'permissionIds') {
        value.forEach((id: number) => {
          formData.append('PermissionIds', id.toString());
        });
      } else if (key === 'educations' || key === 'experiences') {
         // ✅ 4. Appending both dynamic arrays
         formData.append(key, JSON.stringify(value));
      } else if (value !== null && value !== '') {
        formData.append(key, value);
      }
    });

    if (this.isBranchForm) {
      this.branchService.addBranch(formData).subscribe(() => {
        alert('Branch Saved');
        this.router.navigate(['/dashboard/branch']);
      });
    } else {
      this.userService.registerUser(payload).subscribe(() => {
        alert('User Saved');
        this.router.navigate(['/dashboard/users']);
      });
    }
  }

  generatePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.userForm.patchValue({ password: password });
  }

  onCancel() {
    this.router.navigate([
      this.isBranchForm ? '/dashboard/branch' : '/dashboard/users'
    ]);
  }

  bloodGroups: string[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  selectedBloodGroup: string = '';
}