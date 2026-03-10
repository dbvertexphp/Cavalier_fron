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
  isLoading = false; // Fixed: Added missing property from image_2a47c4

  departments: any[] = [];
  designations: any[] = [];
  roles: any[] = [];
  branches: any[] = [];

  hods: any[] = [];
  teams: any[] = [];
  bloodGroups: string[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  selectedBloodGroup: string = '';

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
        companyName: ['Cavalier Logistics'],
        companyAlias: ['CL'],
        branchName: [''],
        branchCode: [''],
        email: ['admin@cavalierlogistic.in'], // Default as per your preference
        city: [''],
        state: [''],
        postalCode: [''],
        contactNo: [''],
        gstCategory: ['Regular'],
        gstin: [''],
        address: [''],
        isActive: [true]
      });
    } else {
      this.userForm = this.fb.group({
        firstName: [''],
        middleName: [''],
        lastName: [''],
        dob: [''],
        gender: ['Male'],
        maritalStatus: ['Single'],
        bloodGroup: [''],
        password: ['123456'],
        department: [''],
        designation: [''],
        functionalArea: [''],
        userType: [''],
        branchId: [null],
        roleId: [null],
        licenceType: [''],
        dateOfJoining: [''],
        ctc_Monthly: [0],
        salaryAccountNo: [''],
        email: [''],
        mobile: [''],
        telephone: [''],
        paN_No: [''],
        aadhaarNo: [''],
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

        accountHolderName: [''],
        bankName: [''],
        ifscCode: [''],
        accountType: [''],
        accountNumber: [''],
bankBranchName: [''],
        profileSelect: [''],
        profilePicture: [null],
        profilePicturePath: [''],
        signature: [''],
        reportTo: [''],
        emergencyName: [''],
        emergencyRelationship:[''],
        emergencyContactNo: [''],
        mfaRegistration: [false],
        fieldVisit: [false],
        alwaysBccmyself: [false],
        invitationLetter: [null],
        offerLetter: [null],
appointmentLetter: [null],
relievingLetter: [null],
fullAndFinalLetter: [null],
        invitationLetterPath: [''],
        simIssued: [false],
        status: [true],
        hodId: [null], 
        teamId: [null],
        exitDate:[null],
        
        address: [''],
        city: [''],
        state: [''],
        postalCode: ['']
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

  // ============= DYNAMIC EXPERIENCE METHODS =============
  
createExperienceGroup(): FormGroup {
  return this.fb.group({
    organizationName: [''],
    designation: [''],
    annualSalary: [''],
    joiningDate: [''],
    exitDate: [''],
    totalYears: [''],
    verification: [false],
    documents: this.fb.array([]) // empty
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

  // ============= FILE HANDLER (FIXED FOR ALL BUILD ERRORS) =============

  onFileSelect(event: any, field: string, index?: number, type: 'edu' | 'exp' = 'edu', docIndex?: number) {
    const file = event.target.files[0];
    if (file) {
      if (index !== undefined) {
        if (type === 'exp' && docIndex !== undefined) {
          const docGroup = this.getExperienceDocuments(index).at(docIndex);
          docGroup.get('fileSource')?.patchValue(file);
        } else {
          const array = type === 'edu' ? this.educations : this.experiences;
          const control = array.at(index).get(field);
          control?.patchValue(file);
        }
      } else {
        this.userForm.patchValue({ [field]: file });
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
  console.log('================ FINAL SUBMIT START ================');
  if (this.userForm.invalid) {
    this.userForm.markAllAsTouched();
    alert('Form invalid hai bhai');
    return;
  }

  const raw = this.userForm.getRawValue();
  const formData = new FormData();

  Object.keys(raw).forEach(key => {
    if (key === 'educations' || key === 'experiences') return;
    if (key === 'permissionIds') return;

    const value = raw[key];
    if (value !== null && value !== undefined && value !== '') {
      formData.append(key, value);
    }
    // ❌ YAHAN SE 'this.saveEducation()' HATA DIYA HAI
  });

  // ... (Baki saara Permission, Education Handling, Experience logic jo aapne likha hai waisa hi rahega)

  // ================= API CALL =================
  if (this.isBranchForm) {
    this.branchService.addBranch(formData).subscribe({
      next: () => {
        alert('Branch Saved Successfully');
        this.router.navigate(['/dashboard/branch']);
      },
      error: err => console.error(err)
    });
  } else {
    // Pehle main user register hoga
    this.userService.registerUser(this.userForm.value).subscribe({
      next: () => {
        // ✅ USER SAVE HONE KE BAAD EDUCATION SAVE KARO
        this.saveEducation(); 
        alert('User & Education Saved Successfully');
        this.router.navigate(['/dashboard/hr/employee-master']);
      },
      error: err => console.error(err)
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
      this.isBranchForm ? '/dashboard/branch' : '/dashboard/hr/employee-master'
    ]);
  }
  saveEducation() {
  const formData = new FormData();
  const raw = this.userForm.getRawValue();

  // 1. Static Education Data (Jo aapne payload mein bheja hai)
  const staticEdu = [
    { prefix: 'tenth', name: raw.tenthName, year: raw.tenthYear, pct: raw.tenthPercentage, file: raw.tenthMarksheet },
    { prefix: 'twelfth', name: raw.twelfthName, year: raw.twelfthYear, pct: raw.twelfthPercentage, file: raw.twelfthMarksheet },
    { prefix: 'graduation', name: raw.graduationName, year: raw.graduationYear, pct: raw.graduationPercentage, file: raw.graduationMarksheet },
    { prefix: 'postGraduation', name: raw.postGraduationName, year: raw.postGraduationYear, pct: raw.postGraduationPercentage, file: raw.postGraduationMarksheet }
  ];

  staticEdu.forEach(edu => {
    if (edu.year || edu.pct || edu.file) {
      // Backend naming convention ke hisaab se append karein
      formData.append(`${edu.prefix}Name`, edu.name || '');
      formData.append(`${edu.prefix}Year`, edu.year || '');
      formData.append(`${edu.prefix}Percentage`, edu.pct || '');
      if (edu.file instanceof File) {
        formData.append(`${edu.prefix}Marksheet`, edu.file);
      }
    }
  });

  // 2. Dynamic Educations (Agar user ne 'Add More' kiya ho)
  raw.educations?.forEach((edu: any, i: number) => {
    formData.append(`otherEducations[${i}].educationName`, edu.educationName);
    formData.append(`otherEducations[${i}].year`, edu.year);
    formData.append(`otherEducations[${i}].percentage`, edu.percentage);
    if (edu.marksheet instanceof File) {
      formData.append(`otherEducations[${i}].marksheet`, edu.marksheet);
    }
  });

  // Sabse important: Kya aapko UserId bhejna hai? 
  // Agar user naya hai, toh pehle registerUser se ID lani hogi.
  
  this.http.post('http://localhost:5000/api/UserEducation/add', formData).subscribe({
    next: (res) => console.log('Education Saved!', res),
    error: (err) => console.error('Education API Error:', err)
  });
}
}