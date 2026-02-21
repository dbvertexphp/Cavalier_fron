import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule, FormArray, FormControl } from '@angular/forms';
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

  // 🔄 CHANGE HERE: Naye variables add karein dropdown data store karne ke liye
  hods: any[] = [];
  teams: any[] = [];

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
   
  }//change
  
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
        // password: ['', Validators.required],
        department: ['', Validators.required],
        designation: ['', Validators.required],
        functionalArea: [''],
        userType: ['', Validators.required],
        // branchId: [null, Validators.required],
        // roleId: [null, Validators.required],
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
        
        // ✅ Yahan maine empty array [] ki jagah default ek group daal diya hai
        experiences: this.fb.array([this.createExperienceGroup()]),

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
        status: [true],
        //change
        hodId: [null], 
        teamId: [null],
        exitDate:[null],
       
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

  // ✅ 2. DYNAMIC EXPERIENCE METHODS (Updated for default docs)
  
  createExperienceGroup(): FormGroup {
    return this.fb.group({
      organizationName: [''],
      designation: [''],
      annualSalary: [''],
      joiningDate: [''],
      exitDate: [''],
      totalYears: [''],
      verification: [false],
      // Isme default 4 docs aayenge jo aapne HTML mein maange the
      documents: this.fb.array([
        this.createDocumentGroup('Appointment Letter'),
        this.createDocumentGroup('Joining Letter'),
        this.createDocumentGroup('Relieving Letter'),
        this.createDocumentGroup('Salary Slip')
      ])
    });
  }

  createDocumentGroup(name: string = ''): FormGroup {
    return this.fb.group({
      docName: [name],
      fileSource: [null]
    });
  }

  get experiences() {
    return this.userForm.get('experiences') as FormArray;
  }

  getExperienceDocuments(expIndex: number) {
    return this.experiences.at(expIndex).get('documents') as FormArray;
  }

  addExperience() {
    this.experiences.push(this.createExperienceGroup());
  }

  removeExperience(index: number) {
    this.experiences.removeAt(index);
  }

  addDocumentToExperience(expIndex: number) {
    this.getExperienceDocuments(expIndex).push(this.createDocumentGroup('Other Document'));
  }

  removeDocumentFromExperience(expIndex: number, docIndex: number) {
    this.getExperienceDocuments(expIndex).removeAt(docIndex);
  }

  // ==========================================================

  // ✅ 3. FileSelect handler
  onFileSelect(event: any, field: string, index?: number, type: 'edu' | 'exp' = 'edu', docIndex?: number) {
    const file = event.target.files[0];
    if (file) {
      if (index !== undefined) {
        if (type === 'exp' && docIndex !== undefined) {
          const docGroup = this.getExperienceDocuments(index).at(docIndex);
          docGroup.get(field)?.patchValue(file);
        } else {
          const array = type === 'edu' ? this.educations : this.experiences;
          const control = array.at(index).get(field);
          control?.patchValue(file);
        }
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
    this.userService.getHods().subscribe(res => this.hods = res);
    this.userService.getTeams().subscribe(res => this.teams = res);
  }

  getBranches() {
    this.http.get<any>(`${environment.apiUrl}/branch/list`).subscribe({
      next: res => {
        this.branches = Array.isArray(res) ? res : res?.data || [];
      }
    });
  }

  // onSubmit() {
  //   console.log('================ FORM RAW VALUE ================');
  //   console.log(this.userForm.value);

  //   if (this.userForm.invalid) {
  //     this.userForm.markAllAsTouched();
  //     alert('Form invalid hai bhai');
  //     return;
  //   }

  //   const payload = this.userForm.value;
  //   const formData = new FormData();

  //   Object.keys(this.userForm.controls).forEach(key => {
  //     const value = this.userForm.get(key)?.value;
  //     if (key === 'permissionIds') {
  //       value.forEach((id: number) => {
  //         formData.append('PermissionIds', id.toString());
  //       });
  //     } else if (key === 'educations' || key === 'experiences') {
  //         formData.append(key, JSON.stringify(value));
  //     } else if (value !== null && value !== '') {
  //       formData.append(key, value);
  //     }
  //   });

  //   if (this.isBranchForm) {
  //     this.branchService.addBranch(formData).subscribe(() => {
  //       alert('Branch Saved');
  //       this.router.navigate(['/dashboard/branch']);
  //     });
  //   } else {
  //     this.userService.registerUser(payload).subscribe(() => {
  //       alert('User Saved');
  //       this.router.navigate(['/dashboard/users']);
  //     });
  //   }
  // }
  onSubmit() {

  console.log('================ FULL FORM DEBUG START ================');

  // 1️⃣ Pure form ka raw value (including disabled fields)
  console.log('RAW VALUE:', this.userForm.getRawValue());

  // 2️⃣ Simple value
  console.log('NORMAL VALUE:', this.userForm.value);

  // 3️⃣ Individual Controls
  Object.keys(this.userForm.controls).forEach(key => {
    console.log(`FIELD => ${key} :`, this.userForm.get(key)?.value);
  });

  // 4️⃣ Experiences Deep Console
  console.log('================ EXPERIENCES =================');
  this.experiences.controls.forEach((exp: any, i: number) => {
    console.log(`Experience ${i + 1}:`, exp.value);

    const docs = exp.get('documents')?.value;
    console.log(`Documents of Exp ${i + 1}:`, docs);
  });

  // 5️⃣ Educations Deep Console
  console.log('================ EDUCATIONS =================');
  this.educations.controls.forEach((edu: any, i: number) => {
    console.log(`Education ${i + 1}:`, edu.value);
  });

  // 6️⃣ Permission IDs
  console.log('Permission IDs:', this.userForm.get('permissionIds')?.value);

  console.log('================ FORM DEBUG END ================');


  if (this.userForm.invalid) {
    this.userForm.markAllAsTouched();
    alert('Form invalid hai bhai');
    return;
  }

  // 👇 Yahan se original submit logic
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
    this.isBranchForm ? '/dashboard/branch' : '/dashboard/hr/employee-master'
  ]);
}

  bloodGroups: string[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  selectedBloodGroup: string = '';
  
}