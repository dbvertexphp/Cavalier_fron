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

  // ================= NORMAL FIELDS =================
  Object.keys(raw).forEach(key => {

    // Skip complex fields (handle separately)
    if (key === 'educations' || key === 'experiences') return;
    if (key === 'permissionIds') return;

    const value = raw[key];

    if (value !== null && value !== undefined && value !== '') {

      // File check
      if (value instanceof File) {
        formData.append(key, value);
      }
      else {
        formData.append(key, value);
      }
    }
  });

  // ================= PERMISSIONS =================
  if (raw.permissionIds?.length) {
    raw.permissionIds.forEach((id: number) => {
      formData.append('permissionIds', id.toString());
    });
  }

  // ================= EDUCATION HANDLING =================
  const educationPayload: any[] = [];

  raw.educations?.forEach((edu: any, index: number) => {

    const eduObj = {
      educationName: edu.educationName,
      year: edu.year,
      percentage: edu.percentage
    };

    educationPayload.push(eduObj);

    if (edu.marksheet instanceof File) {
      formData.append(`educationFiles_${index}`, edu.marksheet);
    }
  });

  // Static Education Files
  




let fileIndex = 0;

// 🔹 STATIC EDUCATIONS
const staticEducations = [
  { name: raw.tenthName, year: raw.tenthYear, percentage: raw.tenthPercentage, file: raw.tenthMarksheet },
  { name: raw.twelfthName, year: raw.twelfthYear, percentage: raw.twelfthPercentage, file: raw.twelfthMarksheet },
  { name: raw.graduationName, year: raw.graduationYear, percentage: raw.graduationPercentage, file: raw.graduationMarksheet },
  { name: raw.postGraduationName, year: raw.postGraduationYear, percentage: raw.postGraduationPercentage, file: raw.postGraduationMarksheet }
];

staticEducations.forEach(edu => {

  if (!edu.name) return;

  const obj: any = {
    educationName: edu.name,
    year: edu.year,
    percentage: edu.percentage,
    fileKey: null
  };

  if (edu.file instanceof File) {
    const key = `educationFile_${fileIndex}`;
    formData.append(key, edu.file);
    obj.fileKey = key;
    fileIndex++;
  }

  educationPayload.push(obj);
});

// 🔹 DYNAMIC EDUCATIONS
raw.educations?.forEach((edu: any) => {

  const obj: any = {
    educationName: edu.educationName,
    year: edu.year,
    percentage: edu.percentage,
    fileKey: null
  };

  if (edu.marksheet instanceof File) {
    const key = `educationFile_${fileIndex}`;
    formData.append(key, edu.marksheet);
    obj.fileKey = key;
    fileIndex++;
  }

  educationPayload.push(obj);
});

formData.append('educations', JSON.stringify(educationPayload));

  // ================= EXPERIENCE HANDLING =================
  const experiencePayload: any[] = [];

  raw.experiences?.forEach((exp: any, expIndex: number) => {

    const expObj: any = {
      organizationName: exp.organizationName,
      designation: exp.designation,
      annualSalary: exp.annualSalary,
      joiningDate: exp.joiningDate,
      exitDate: exp.exitDate,
      totalYears: exp.totalYears,
      verification: exp.verification,
      documents: []
    };

    exp.documents?.forEach((doc: any, docIndex: number) => {

      expObj.documents.push({
        docName: doc.docName
      });

      if (doc.fileSource instanceof File) {
        formData.append(
          `experience_${expIndex}_document_${docIndex}`,
          doc.fileSource
        );
      }

    });

    experiencePayload.push(expObj);
  });

  formData.append('experiences', JSON.stringify(experiencePayload));

  // ================= TOP LEVEL FILES =================

  const fileFields = [
    'profilePicture',
    'offerLetter',
    'appointmentLetter',
    'invitationLetter',
    'relievingLetter',
    'fullAndFinalLetter'
  ];

  fileFields.forEach(field => {
    if (raw[field] instanceof File) {
      formData.append(field, raw[field]);
    }
  });

  console.log('================ COMPLETE FORM DATA DEBUG =================');

const formDataObject: any = {};

for (let pair of (formData as any).entries()) {

  const key = pair[0];
  const value = pair[1];

  if (value instanceof File) {
    formDataObject[key] = {
      fileName: value.name,
      fileSize: value.size,
      fileType: value.type
    };
  } else {
    formDataObject[key] = value;
  }
}

console.log(JSON.stringify(formDataObject, null, 2));
console.log('================ END DEBUG =================');

  // ================= API CALL =================

  if (this.isBranchForm) {

    this.branchService.addBranch(formData).subscribe({
      next: () => {
        alert('Branch Saved Successfully');
        this.router.navigate(['/dashboard/branch']);
      },
      error: err => {
        console.error(err);
      }
    });

  } else {
       console.log('================ API CALL PAYLOAD =================');
    this.userService.registerUser(formData).subscribe({
      next: () => {
        alert('User Saved Successfully');
        this.router.navigate(['/dashboard/users']);
      },
      error: err => {
        console.error(err);
      }
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
}