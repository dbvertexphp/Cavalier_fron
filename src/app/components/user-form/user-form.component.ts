import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { BranchService } from '../../services/branch.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { employeeSchema } from './employee.schema';
import flatpickr from 'flatpickr';
@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule,],
  templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit {
  @ViewChild('dobInput') dobInput!: ElementRef;
  todayDate: string = new Date().toISOString().split('T')[0];
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
// Form initialization mein DOB ko aise update karein

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

  // --- Naya Logic: Designation change hone par Department auto-select hoga ---
  this.userForm.get('designation')?.valueChanges.subscribe((selectedDesId) => {
    if (selectedDesId) {
      // designations array mein se matching ID wala object dhoodhna
      const selectedDesignation = this.designations.find(des => des.id === Number(selectedDesId));
      
      if (selectedDesignation && selectedDesignation.departmentId) {
        // Department field ko update karna
        this.userForm.patchValue({
          department: selectedDesignation.departmentId
        }, { emitEvent: false }); // emitEvent: false taaki infinite loop na bane
      }
    }
  });
  // -----------------------------------------------------------------------

  if (this.initialData) {
    this.isEditMode = true;
    this.id = this.initialData.id;
    setTimeout(() => {
      this.populateForm(this.initialData);
    }, 300);
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
onDobChange(event: any) {
  console.log('DOB changed to:', event.target.value);
  // Agar koi extra logic chahiye toh yahan likh sakte ho
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
tenthId: [null], // <--- Add this
tenthName: ['10th'],
tenthYear: [''],
tenthPercentage: [''],
tenthMarksheet: [null],

twelfthId: [null], // <--- Add this
twelfthName: ['12th'],
twelfthYear: [''],
twelfthPercentage: [''],
twelfthMarksheet: [null],

graduationId: [null], // <--- Add this
graduationName: ['Graduation'],
graduationYear: [''],
graduationPercentage: [''],
graduationMarksheet: [null],

postGraduationId: [null], // <--- Add this
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
       EmergencyRelation: [''], // 'emergencyRelationship' ko badal kar ye kar dein
       
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

  // 1. Zod Validation Check
  if (!this.validateForm()) {
    this.userForm.markAllAsTouched();
    alert('Form validation faild. Check the feilds properly and try aganin .');
    return;
  }

  // 2. Angular Internal Validation Check
  if (this.userForm.invalid) {
    this.userForm.markAllAsTouched();
    alert('some important feilds are left.');
    return;
  }

  const raw = this.userForm.getRawValue();

  // ================= BRANCH FORM LOGIC =================
  if (this.isBranchForm) {
    const branchData = new FormData();
    Object.keys(raw).forEach(key => {
        if (raw[key] !== null && raw[key] !== undefined) {
            branchData.append(key, raw[key]);
        }
    });

    this.branchService.addBranch(branchData).subscribe({
      next: () => {
        alert('Branch Saved Successfully');
        this.router.navigate(['/dashboard/branch']);
      },
      error: err => console.error('Branch API Error:', err)
    });

  } else {
    // ================= USER FORM LOGIC (EDIT + REGISTER) =================
    
    const finalPayload = {
      ...raw,
      id: this.isEditMode ? this.id : 0, // Edit mein ID bhejni zaroori hai
      EmergencyRelation: raw.emergencyRelationship || raw.EmergencyRelation
    };

    // Logic: Agar edit hai toh update call, warna register
    const apiCall = this.isEditMode 
      ? this.userService.updateUser(finalPayload) 
      : this.userService.registerUser(finalPayload);

    apiCall.subscribe({
      next: (res: any) => {
        console.log(this.isEditMode ? 'Update Success' : 'Register Success', res);
        alert(res);
        // UserId handle karein (res.id ya this.id)
        const currentId = this.isEditMode ? this.id : (res.id || res.userId || res.data?.id);

        if (currentId) {
          this.saveEducation(currentId); 
          this.saveExperience(currentId);
          alert(this.isEditMode ? 'User Updated Successfully' : 'User Saved Successfully');
        } else {
          alert('User Saved, but ID not received for sub-records');
        }

        this.router.navigate(['/dashboard/Employee']);
      },
      error: err => {
        console.error('API Error:', err);
        alert('Email already exists');
      }
    });
  }
}

// 3. saveEducation ko UserId receive karne ke liye update kijiye
async saveEducation(userId: any) {
  const raw = this.userForm.getRawValue();

  // 1. Saare records ko ek array mein prepare karein backend DTO ke names ke hisaab se
  const records = [
    { name: raw.tenthName, year: raw.tenthYear, pct: raw.tenthPercentage, file: raw.tenthMarksheet },
    { name: raw.twelfthName, year: raw.twelfthYear, pct: raw.twelfthPercentage, file: raw.twelfthMarksheet },
    { name: raw.graduationName, year: raw.graduationYear, pct: raw.graduationPercentage, file: raw.graduationMarksheet },
    { name: raw.postGraduationName, year: raw.postGraduationYear, pct: raw.postGraduationPercentage, file: raw.postGraduationMarksheet }
  ];

  // Dynamic fields (FormArray) ko bhi add karein
  raw.educations?.forEach((edu: any) => {
    records.push({
      name: edu.educationName,
      year: edu.year,
      pct: edu.percentage,
      file: edu.marksheet
    });
  });

  // 2. Loop chala kar har ek record ke liye API hit karein
  for (const item of records) {
    // Sirf tab bhejenge jab data bhara ho (Qualification mandatory hai)
    if (item.name && (item.year || item.pct || item.file)) {
      const formData = new FormData();
      
      // ✅ EXACT MATCH WITH YOUR EducationUploadDto
      formData.append('UserId', userId.toString());
      formData.append('EducationName', item.name); // DTO: EducationName
      formData.append('PassingYear', item.year || ''); // DTO: PassingYear
      formData.append('Percentage', item.pct || '');  // DTO: Percentage
      
      if (item.file instanceof File) {
        formData.append('MarksheetFile', item.file); // DTO: MarksheetFile
      }

     try {
  // ✅ Hardcoded URL ko environment variable se replace kiya
  await this.http.post(`${environment.apiUrl}/UserEducation/add`, formData).toPromise();
  console.log(`✅ ${item.name} saved successfully`);
} catch (err) {
  console.error(`❌ Error saving ${item.name}:`, err);
}
    }
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
//   saveEducation() {
//   const formData = new FormData();
//   const raw = this.userForm.getRawValue();

//   // 1. Static Education Data (Jo aapne payload mein bheja hai)
//   const staticEdu = [
//     { prefix: 'tenth', name: raw.tenthName, year: raw.tenthYear, pct: raw.tenthPercentage, file: raw.tenthMarksheet },
//     { prefix: 'twelfth', name: raw.twelfthName, year: raw.twelfthYear, pct: raw.twelfthPercentage, file: raw.twelfthMarksheet },
//     { prefix: 'graduation', name: raw.graduationName, year: raw.graduationYear, pct: raw.graduationPercentage, file: raw.graduationMarksheet },
//     { prefix: 'postGraduation', name: raw.postGraduationName, year: raw.postGraduationYear, pct: raw.postGraduationPercentage, file: raw.postGraduationMarksheet }
//   ];

//   staticEdu.forEach(edu => {
//     if (edu.year || edu.pct || edu.file) {
//       // Backend naming convention ke hisaab se append karein
//       formData.append(`${edu.prefix}Name`, edu.name || '');
//       formData.append(`${edu.prefix}Year`, edu.year || '');
//       formData.append(`${edu.prefix}Percentage`, edu.pct || '');
//       if (edu.file instanceof File) {
//         formData.append(`${edu.prefix}Marksheet`, edu.file);
//       }
//     }
//   });

//   // 2. Dynamic Educations (Agar user ne 'Add More' kiya ho)
//   raw.educations?.forEach((edu: any, i: number) => {
//     formData.append(`otherEducations[${i}].educationName`, edu.educationName);
//     formData.append(`otherEducations[${i}].year`, edu.year);
//     formData.append(`otherEducations[${i}].percentage`, edu.percentage);
//     if (edu.marksheet instanceof File) {
//       formData.append(`otherEducations[${i}].marksheet`, edu.marksheet);
//     }
//   });

//   // Sabse important: Kya aapko UserId bhejna hai? 
//   // Agar user naya hai, toh pehle registerUser se ID lani hogi.
  
//   this.http.post('http://localhost:5000/api/UserEducation/add', formData).subscribe({
//     next: (res) => console.log('Education Saved!', res),
//     error: (err) => console.error('Education API Error:', err)
//   });
// }
async saveExperience(userId: any) {
  const raw = this.userForm.getRawValue();
  const experienceArray = raw.experiences || [];

  for (const exp of experienceArray) {
    // Sirf tab bhejenge jab kam se kam Organization Name bhara ho
    if (exp.organizationName) {
      const payload = {
        userId: parseInt(userId),
        organizationName: exp.organizationName,
        designation: exp.designation,
        yearsOfExperience: exp.totalYears, // Form mein 'totalYears' hai, DTO mein 'YearsOfExperience'
        annualSalary: parseFloat(exp.annualSalary) || 0,
        dateOfExit: exp.exitDate ? new Date(exp.exitDate).toISOString() : null,
        verificationComplete: exp.verification || false
      };

      try {
        await this.http.post(`${environment.apiUrl}/Experience/add`, payload).toPromise();
        console.log(`✅ Experience with ${exp.organizationName} saved`);
      } catch (err) {
        console.error(`❌ Error saving experience:`, err);
      }
    }
  }
}
validateForm(): boolean {
  const rawData = this.userForm.getRawValue();
  const validation = employeeSchema.safeParse(rawData);

  if (!validation.success) {
    // 🔍 Sabse important: Console mein dekho kaunsi field invalid hai
    console.error("Validation failed for these fields:", validation.error.flatten().fieldErrors);
    
    const errors = validation.error.flatten().fieldErrors as Record<string, string[]>;

    Object.keys(errors).forEach((field: string) => {
      const control = this.userForm.get(field);
      if (control) {
        control.setErrors({ zod: errors[field]?.[0] });
      } else {
        // 🚩 Agar control null hai, matlab Zod schema ka naam aur Form name alag hai!
        console.warn(`Zod error for field "${field}", but this control doesn't exist in userForm.`);
      }
    });

    return false;
  }

  return true;
}
onlyNumbers(event: any) {
  const pattern = /[0-9]/;
  const inputChar = String.fromCharCode(event.charCode);
  if (!pattern.test(inputChar)) {
    event.preventDefault(); // Agar number nahi hai toh type hi nahi hoga
  }
}
ngAfterViewInit() {
  flatpickr(this.dobInput.nativeElement, {
    dateFormat: "Y-m-d",
    maxDate: "today",
    allowInput: true  // 🔥 THIS IS IMPORTANT (typing allow karega)
  });
}
populateForm(data: any) {
  if (!data) return;

  // 1. Basic Fields Patch
  this.userForm.patchValue({
    ...data,
    dob: data.dob ? data.dob.split('T')[0] : '',
    dateOfJoining: data.dateOfJoining ? data.dateOfJoining.split('T')[0] : '',
    exitDate: data.exitDate ? data.exitDate.split('T')[0] : null,
    // Backend se aane wale different naming conventions ko handle kiya
    EmergencyRelation: data.emergencyRelation || data.EmergencyRelation || data.emergencyRelationship
  });

  // 2. Populate Education (Static Fields + FormArray)
  if (data.educations && Array.isArray(data.educations)) {
    
    // --- STATIC FIELDS POPULATION ---
    // Backend array se data filter karke static controls mein patch kar rahe hain
    const tenth = data.educations.find((e: any) => e.educationName === '10th');
    if (tenth) {
      this.userForm.patchValue({
        tenthId: tenth.id,
        tenthYear: tenth.passingYear || tenth.year,
        tenthPercentage: tenth.percentage
      });
    }

    const twelfth = data.educations.find((e: any) => e.educationName === '12th');
    if (twelfth) {
      this.userForm.patchValue({
        twelfthId: twelfth.id,
        twelfthYear: twelfth.passingYear || twelfth.year,
        twelfthPercentage: twelfth.percentage
      });
    }

    const grad = data.educations.find((e: any) => e.educationName === 'Graduation');
    if (grad) {
      this.userForm.patchValue({
        graduationId: grad.id,
        graduationYear: grad.passingYear || grad.year,
        graduationPercentage: grad.percentage
      });
    }

    const pg = data.educations.find((e: any) => e.educationName === 'Post Graduation');
    if (pg) {
      this.userForm.patchValue({
        postGraduationId: pg.id,
        postGraduationYear: pg.passingYear || pg.year,
        postGraduationPercentage: pg.percentage
      });
    }

    // --- DYNAMIC FORMARRAY POPULATION ---
    this.educations.clear(); // Purani khali rows hatayin
    
    // Wo educations jo static list mein nahi hain, unhe 'Add More' wale array mein dalenge
    const otherEdus = data.educations.filter((e: any) => 
      !['10th', '12th', 'Graduation', 'Post Graduation'].includes(e.educationName)
    );

    otherEdus.forEach((edu: any) => {
      this.educations.push(this.fb.group({
        id: [edu.id || null], // ID zaroori hai edit ke liye
        educationName: [edu.educationName || ''],
        year: [edu.year || edu.passingYear || ''],
        percentage: [edu.percentage || ''],
        marksheet: [null]
      }));
    });
  }

  // 3. Populate Experience FormArray
  if (data.experiences && Array.isArray(data.experiences)) {
    this.experiences.clear(); 
    data.experiences.forEach((exp: any) => {
      this.experiences.push(this.fb.group({
        id: [exp.id || null], // Experience ID mapping
        organizationName: [exp.organizationName || ''],
        designation: [exp.designation || ''],
        annualSalary: [exp.annualSalary || ''],
        joiningDate: [exp.joiningDate ? exp.joiningDate.split('T')[0] : ''],
        exitDate: [exp.exitDate ? exp.exitDate.split('T')[0] : ''],
        totalYears: [exp.totalYears || exp.yearsOfExperience || ''],
        verification: [exp.verification || false],
        documents: this.fb.array([]) // Nested documents population yahan add ho sakti hai
      }));
    });
  }
}
}



