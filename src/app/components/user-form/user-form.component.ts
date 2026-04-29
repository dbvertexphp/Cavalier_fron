import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { BranchService } from '../../services/branch.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { employeeSchema } from './employee.schema';
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule,],
  templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit {
  @ViewChild('deptInput') deptInput!: ElementRef;
  @ViewChild('desigInput') desigInput!: ElementRef;
  isImageModalOpen = false;
selectedImageUrl = '';
  employeeData: any;
  userlist:any=[];
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
public baseUrl: string ='';
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
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    this.baseUrl = environment.apiUrl.replace('/api', '');
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state) {
      this.initialData = nav.extras.state['data'];
      this.isEditMode = nav.extras.state['isEdit'] || false;
      this.isBranchForm = nav.extras.state['isBranch'] || false;
      this.id = this.initialData?.id || null;
    }
    
  }

ngOnInit(): void {
  console.log(this.initialData);
 
  this.getuser();
  console.log('this is userlist',this.userlist);
    this.userService.getDepartments().subscribe(res => this.departments = res);
  this.userService.getDesignations().subscribe(res => this.designations = res);
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
openImageModal(url: string | null | undefined) {
  if (url) {
    this.selectedImageUrl = url;
    this.isImageModalOpen = true;
  }
}

closeImageModal() {
  this.isImageModalOpen = false;
  this.selectedImageUrl = '';
}
initForm() {
  if (this.isBranchForm) {
    this.userForm = this.fb.group({
      userType: [''],
      employeeCode: [''],
      companyName: ['Cavalier Logistics'],
      companyAlias: ['CL'],
      branchName: [''],
      branchCode: [''],
      email: ['admin@cavalierlogistic.in'],
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
      employeeCode: [''],
      firstName: ['', [Validators.required]],
      middleName: [''],
      lastName: [''],
      dob: ['', [Validators.required]],
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
      dateOfJoining: ['', [Validators.required]],
      ctc_Monthly: [0],
      salaryAccountNo: [''],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern("^[0-9]{10}$")]],
      telephone: [''],
      paN_No: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      aadhaarNo: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(12)]],
      ipAdress: [''],
      permissionIds: [[]],
      
      // Address Fields
      presHouseNo: [''], presBuilding: [''], presFloor: [''], presBlock: [''], presStreet: [''], presLandmark: [''], presArea: [''], presCity: [''], presDistrict: [''], presState: [''], presPincode: [''], presCountry: ['India'],
      permHouseNo: [''], permBuilding: [''], permFloor: [''], permBlock: [''], permStreet: [''], permLandmark: [''], permArea: [''], permCity: [''], permDistrict: [''], permState: [''], permPincode: [''], permCountry: ['India'],
      
      educations: this.fb.array([]),
      experiences: this.fb.array([this.createExperienceGroup()]),
      
      // --- Education Static Fields (Updated with Paths) ---
      tenthId: [null],
      tenthName: ['10th'],
      tenthYear: [''],
      tenthPercentage: [''],
      tenthMarksheet: [null],
      tenthMarksheetPath: [''],

      twelfthId: [null],
      twelfthName: ['12th'],
      twelfthYear: [''],
      twelfthPercentage: [''],
      twelfthMarksheet: [null],
      twelfthMarksheetPath: [''],

      graduationId: [null],
      graduationName: ['Graduation'],
      graduationYear: [''],
      graduationPercentage: [''],
      graduationMarksheet: [null],
      graduationMarksheetPath: [''],

      postGraduationId: [null],
      postGraduationName: ['Post Graduation'],
      postGraduationYear: [''],
      postGraduationPercentage: [''],
      postGraduationMarksheet: [null],
      postGraduationMarksheetPath: [''],
      // ---------------------------------------------------

      accountHolderName: [''], bankName: [''], ifscCode: [''], accountType: [''], accountNumber: [''], bankBranchName: [''],
      profileSelect: [''], profilePicture: [null], profilePicturePath: [''], signature: [''], reportTo: [''],
      
      emergencyName: [''], EmergencyRelation: [''], emergencyContactNo: [''],
      mfaRegistration: [false], fieldVisit: [false], alwaysBccmyself: [false],
      
      // Documents
      invitationLetter: [null], offerLetter: [null], appointmentLetter: [null], relievingLetter: [null], fullAndFinalLetter: [null],
      invitationLetterPath: [''], offerLetterPath: [''], appointmentLetterPath: [''], relievingLetterPath: [''], fullAndFinalLetterPath: [''],
      
      simIssued: [false], status: [true], hodId: [null], teamId: [null], exitDate: [null],
      address: [''], city: [''], state: [''], postalCode: ['']
    });
  }
}

// ============= DYNAMIC EDUCATION METHODS (Updated) =============
createEducationGroup(): FormGroup {
  return this.fb.group({
    id: [null],
    educationName: [''],
    year: [''],
    percentage: [''],
    marksheet: [null],
    marksheetPath: [''] // Added path variable
  });
}

  // ============= DYNAMIC EDUCATION METHODS =============
  
  

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
    this.userService.getUsers('onlyuserdata').subscribe(res => this.hods = res);
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

  // 1. Angular Internal Validation Check
  console.log('Form Validity Status:', this.userForm.valid);
  if (this.userForm.invalid) {
    console.warn('Form is INVALID. Errors:', this.userForm.errors);
    // Detail mein check karne ke liye ki kaunsa field invalid hai
    Object.keys(this.userForm.controls).forEach(key => {
      const controlErrors = this.userForm.get(key)?.errors;
      if (controlErrors != null) {
        console.log('Field Key:', key, 'Errors:', controlErrors);
      }
    });
    
    this.userForm.markAllAsTouched(); 
    alert('Please fill all mandatory fields correctly before submitting.'); 
    return;
  }

  const raw = this.userForm.getRawValue();
  console.log('Raw Form Value:', raw);

  // ================= BRANCH FORM LOGIC =================
  if (this.isBranchForm) {
    console.log('Processing: BRANCH FORM');
    const branchData = new FormData();
    Object.keys(raw).forEach(key => {
        if (raw[key] !== null && raw[key] !== undefined) {
            branchData.append(key, raw[key]);
        }
    });

    console.log('Sending Branch FormData...');
    this.branchService.addBranch(branchData).subscribe({
      next: (res) => {
        console.log('Branch API Success Response:', res);
        alert('Branch Saved Successfully');
        // this.router.navigate(['/dashboard/branch']);
      },
      error: err => {
        console.error('Branch API Error Object:', err);
        console.error('Error Status:', err.status);
      }
    });

  } else {
    // ================= USER FORM LOGIC (EDIT + REGISTER) =================
    console.log('Processing: USER/EMPLOYEE FORM');
    console.log('Mode:', this.isEditMode ? 'EDIT' : 'REGISTER');

    let formattedDob = raw.dob;
    if (raw.dob && raw.dob.includes('-')) {
      const parts = raw.dob.split('-');
      if (parts.length === 3 && parts[0].length === 2) { 
        formattedDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    console.log('Formatted DOB:', formattedDob);

    const finalPayload = {
      ...raw,
      dob: formattedDob, 
      id: this.isEditMode ? this.id : 0, 
      EmergencyRelation: raw.emergencyRelationship || raw.EmergencyRelation
    };

    console.log('FINAL PAYLOAD TO API:', finalPayload);

    const apiCall = this.isEditMode 
      ? this.userService.updateUser(finalPayload) 
      : this.userService.registerUser(finalPayload);

   apiCall.subscribe({
      next: async (res: any) => {
        console.log('User API Success. Response:', res);
        
        const currentId = this.isEditMode ? this.id : (res.id || res.userId || res.data?.id);
        console.log('Extracted ID for Sub-records:', currentId);

        if (currentId) {
          console.log('Saving Education and Experience for ID:', currentId);
          
          // 1. Pehle Education Save Karo (Safer way)
          try {
            console.log('⏳ Starting saveEducation...');
            await this.saveEducation(currentId); 
            console.log('✅ saveEducation completed successfully.');
          } catch (eduError) {
            console.error('❌ saveEducation mein error aayi, par aage ka code chalega:', eduError);
          }

          // 2. Phir Experience Save Karo (Ye 100% chalega ab)
          try {
            console.log('⏳ Starting saveExperience...');
            await this.saveExperience(currentId);
            console.log('✅ saveExperience completed successfully.');
          } catch (expError) {
            console.error('❌ saveExperience mein error aayi:', expError);
          }
          
          alert(this.isEditMode ? 'User Updated Successfully' : 'User Saved Successfully');
        } else {
          console.warn('User Saved, but ID was not found in response!');
          alert('User Saved, but ID not received for sub-records');
        }

        // Sab save hone ke baad page navigate karein
        // this.router.navigate(['/dashboard/Employee']);
      },
      error: err => {
        console.error('--- API ERROR DETECTED ---');
        console.error('Status:', err.status); 
        console.error('Full Error Body:', err.error); 
        alert('Please Check Field properly (API 500 Error)');
      }
    });
  }
  const finalPayload = {
  ...raw,
  // Agar raw.dateOfJoining '15-04-2026' jaisa aa raha hai, toh use yahan fix karein
  dateOfJoining: raw.dateOfJoining.includes('-') && raw.dateOfJoining.split('-')[0].length === 2 
                 ? raw.dateOfJoining.split('-').reverse().join('-') 
                 : raw.dateOfJoining,
  // ... other fields
};
}

// 3. saveEducation ko UserId receive karne ke liye update kijiye
async saveEducation(userId: any) {
  const raw = this.userForm.getRawValue();

  // 1. Ek khali array banayenge jisme saare education objects push karenge
  const educationArray: any[] = [];

  // --- STATIC FIELDS CHECK ---
  if (raw.tenthYear || raw.tenthPercentage || raw.tenthMarksheet) {
    educationArray.push({
      userId: userId,
      educationName: raw.tenthName || '10th',
      passingYear: raw.tenthYear,
      percentage: raw.tenthPercentage,
      marksheetFile: raw.tenthMarksheet
    });
  }

  if (raw.twelfthYear || raw.twelfthPercentage || raw.twelfthMarksheet) {
    educationArray.push({
      userId: userId,
      educationName: raw.twelfthName || '12th',
      passingYear: raw.twelfthYear,
      percentage: raw.twelfthPercentage,
      marksheetFile: raw.twelfthMarksheet
    });
  }

  if (raw.graduationYear || raw.graduationPercentage || raw.graduationMarksheet) {
    educationArray.push({
      userId: userId,
      educationName: raw.graduationName || 'Graduation',
      passingYear: raw.graduationYear,
      percentage: raw.graduationPercentage,
      marksheetFile: raw.graduationMarksheet
    });
  }

  if (raw.postGraduationYear || raw.postGraduationPercentage || raw.postGraduationMarksheet) {
    educationArray.push({
      userId: userId,
      educationName: raw.postGraduationName || 'Post Graduation',
      passingYear: raw.postGraduationYear,
      percentage: raw.postGraduationPercentage,
      marksheetFile: raw.postGraduationMarksheet
    });
  }

  // --- DYNAMIC FIELDS (ADD MORE) CHECK ---
  if (raw.educations && raw.educations.length > 0) {
    raw.educations.forEach((edu: any) => {
      if (edu.year || edu.percentage || edu.marksheet) {
        educationArray.push({
          userId: userId,
          educationName: edu.educationName,
          passingYear: edu.year,
          percentage: edu.percentage,
          marksheetFile: edu.marksheet
        });
      }
    });
  }

  // Console me print karke dekh lo array kaisa bana hai
  console.log('📚 Final Education Array Object:', educationArray);

  if (educationArray.length === 0) {
    console.log('No education details to save.');
    return;
  }

  // 2. FormData banayenge List of Objects bhejne ke liye
  const formData = new FormData();

  // Backend API me list receive karne ke liye index based append karna hota hai
  educationArray.forEach((edu, index) => {
    // Agar API ka model parameter name 'educations' hai:
    formData.append(`educations[${index}].UserId`, edu.userId.toString());
    formData.append(`educations[${index}].EducationName`, edu.educationName || '');
    formData.append(`educations[${index}].PassingYear`, edu.passingYear || '');
    formData.append(`educations[${index}].Percentage`, edu.percentage || '');

    // Image/File append kar rahe hain
    if (edu.marksheetFile instanceof File) {
      formData.append(`educations[${index}].MarksheetFile`, edu.marksheetFile);
    }
  });

  // 3. Alag API par call maarna (Single API call for all educations)
  try {
    // Note: API ka endpoint '/add-multiple' ya jo bhi aapne list ke liye banaya ho wo dalna
    const res = await this.http.post(`${environment.apiUrl}/User/add-multiple-education`, formData).toPromise();
    console.log('✅ All Education details saved successfully in one go!', res);
  } catch (err) {
    console.error('❌ Error saving education details:', err);
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
      this.isBranchForm ? '/dashboard/branch' : '/dashboard/Employee'
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
getuser(){
  this.userService.getUsers('onlyuserdata').subscribe({
    next: res => {
      console.log('User Data:', res);
      this.userlist=res;
     this.cdr.detectChanges(); // Ensure UI updates after data is set
    }

  });
};

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
async saveExperience(userId: any) {
  console.log('➡️ saveExperience function call hua! UserId:', userId);

  const raw = this.userForm.getRawValue();
  const experienceArray = raw.experiences || [];
  
  const payloadArray: any[] = [];

  for (const exp of experienceArray) {
    if (exp.organizationName && exp.organizationName.toString().trim() !== '') {
      
      // ==========================================
      // 👇 DATE FIX LOGIC (For Invalid Time Error)
      // ==========================================
      let finalExitDate = null;
      if (exp.exitDate) {
        try {
          // Agar date DD-MM-YYYY format me hai (length 2 dash ke pehle)
          if (exp.exitDate.includes('-') && exp.exitDate.split('-')[0].length === 2) {
            const parts = exp.exitDate.split('-');
            // YYYY-MM-DD me convert karo (parts[2]=YYYY, parts[1]=MM, parts[0]=DD)
            const validDateString = `${parts[2]}-${parts[1]}-${parts[0]}`; 
            finalExitDate = new Date(validDateString).toISOString();
          } 
          // Agar date pehle se hi sahi format me hai
          else {
            finalExitDate = new Date(exp.exitDate).toISOString();
          }
        } catch (e) {
          console.warn("⚠️ Exit Date parse nahi ho payi, null set kar rahe hain:", exp.exitDate);
          finalExitDate = null;
        }
      }
      // ==========================================

      payloadArray.push({
        userId: parseInt(userId),
        organizationName: exp.organizationName,
        designation: exp.designation || "",
        yearsOfExperience: exp.totalYears ? exp.totalYears.toString() : "", 
        annualSalary: parseFloat(exp.annualSalary) || 0,
        dateOfExit: finalExitDate, // Nayi theek ki hui date yahan assign ki
        verificationComplete: exp.verification || false
      });
    }
  }

  if (payloadArray.length === 0) {
    console.log('🛑 No experience details to save.');
    return;
  }

  try {
    console.log(`🚀 Sending Experience Data to API...`, payloadArray);
    
    const res = await firstValueFrom(
      this.http.post(`${environment.apiUrl}/User/add-multiple-experience`, payloadArray)
    );
    
    console.log(`✅ All Experiences saved successfully in one go!`, res);
  } catch (err) {
    console.error(`❌ Error saving experiences:`, err);
  }
}
populateForm(data: any) {
  if (!data) return;

  // 1. Basic Fields Patch
  this.userForm.patchValue({
    ...data,
    bankBranchName: data.branchNameBank,
    employeeCode: data.empCode || data.employeeCode,
    ctc_Monthly: data.ctC_Monthly || data.ctc_Monthly,
    dob: data.dob ? data.dob.split('T')[0] : '',
    dateOfJoining: data.dateOfJoining ? data.dateOfJoining.split('T')[0] : '',
    exitDate: data.exitDate ? data.exitDate.split('T')[0] : null,
    department: data.department,
    designation: data.designation,
    offerLetterPath: data.offerLetterPath || '',
    appointmentLetterPath: data.appointmentLetterPath || '',
    invitationLetterPath: data.invitationLetterPath || '',
    relievingLetterPath: data.relievingLetterPath || '',
    fullAndFinalLetterPath: data.fullAndFinalLetterPath || '',
    // Backend se aane wale different naming conventions ko handle kiya
    EmergencyRelation: data.emergencyRelation || data.EmergencyRelation || data.emergencyRelationship
  });

  setTimeout(() => {
    if (data.department) {
      // '==' use kiya hai taaki string "12" aur number 12 dono match ho jayein
      const dept = this.departments.find(d => d.id == data.department);
      if (dept && this.deptInput) {
        this.deptInput.nativeElement.value = dept.name; // UI par Naam dikhao
      } else {
        console.warn('Department Name not found for ID:', data.department);
      }
    }

    if (data.designation) {
      const des = this.designations.find(d => d.id == data.designation);
      if (des && this.desigInput) {
        this.desigInput.nativeElement.value = des.name; // UI par Naam dikhao
      } else {
        console.warn('Designation Name not found for ID:', data.designation);
      }
    }
  }, 1000);

  // 2. Populate Education (Backend Array = addMoreEducations)
  if (data.addMoreEducations && Array.isArray(data.addMoreEducations)) {
    
    // --- STATIC FIELDS POPULATION ---
    const tenth = data.addMoreEducations.find((e: any) => e.educationName === '10th');
    if (tenth) {
      this.userForm.patchValue({
        tenthId: tenth.id,
        tenthYear: tenth.passingYear || tenth.year,
        tenthPercentage: tenth.percentage,
        tenthMarksheetPath: tenth.marksheetPath || ''
      });
    }

    const twelfth = data.addMoreEducations.find((e: any) => e.educationName === '12th');
    if (twelfth) {
      this.userForm.patchValue({
        twelfthId: twelfth.id,
        twelfthYear: twelfth.passingYear || twelfth.year,
        twelfthPercentage: twelfth.percentage,
        twelfthMarksheetPath: twelfth.marksheetPath || ''
      });
    }

    const grad = data.addMoreEducations.find((e: any) => e.educationName === 'Graduation');
    if (grad) {
      this.userForm.patchValue({
        graduationId: grad.id,
        graduationYear: grad.passingYear || grad.year,
        graduationPercentage: grad.percentage,
        graduationMarksheetPath: grad.marksheetPath || ''
      });
    }

    const pg = data.addMoreEducations.find((e: any) => e.educationName === 'Post Graduation');
    if (pg) {
      this.userForm.patchValue({
        postGraduationId: pg.id,
        postGraduationYear: pg.passingYear || pg.year,
        postGraduationPercentage: pg.percentage,
        postGraduationMarksheetPath: pg.marksheetPath || ''
      });
    }

    // --- DYNAMIC FORMARRAY POPULATION ---
    this.educations.clear(); // Purani khali rows hatayin
    
    // Wo educations jo static list mein nahi hain, unhe 'Add More' wale array mein dalenge
    const otherEdus = data.addMoreEducations.filter((e: any) => 
      !['10th', '12th', 'Graduation', 'Post Graduation'].includes(e.educationName)
    );

    otherEdus.forEach((edu: any) => {
      this.educations.push(this.fb.group({
        id: [edu.id || null], // ID zaroori hai edit ke liye
        educationName: [edu.educationName || ''],
        year: [edu.year || edu.passingYear || ''],
        percentage: [edu.percentage || ''],
        marksheet: [null],
        marksheetPath: [edu.marksheetPath || '']
      }));
    });
  }

  // 3. Populate Experience FormArray
  // ==================================================
  // 3. Populate Experience FormArray (Updated for new API)
  // ==================================================
  if (data.addAnotherExperiences && Array.isArray(data.addAnotherExperiences)) {
    this.experiences.clear(); // Purani khali row hata do
    
    data.addAnotherExperiences.forEach((exp: any) => {
      this.experiences.push(this.fb.group({
        id: [exp.id || null], // Edit ke liye ID zaroori hai
        organizationName: [exp.organizationName || ''],
        designation: [exp.designation || ''],
        annualSalary: [exp.annualSalary || ''],
        joiningDate: [''], // Ye field backend se nahi aa rahi, toh khali rakha hai
        // Date format "2000-06-21T00:00:00" se "2000-06-21" nikalne ke liye:
        exitDate: [exp.dateOfExit ? exp.dateOfExit.split('T')[0] : ''],
        // Nayi keys ki mapping
        totalYears: [exp.yearsOfExperience || ''],
        verification: [exp.verificationComplete || false],
        documents: this.fb.array([]) 
      }));
    });
  } else {
    // Agar user naya hai ya koi experience nahi hai, toh ek khali row dikhao
    if (this.experiences.length === 0) {
      this.addExperience(); 
    }
  }
}
// 1. Jab user type kare (Auto Dash insertion)
// ==================== REUSABLE DATE FUNCTIONS ====================

// 1. Jab user keyboard se type kare (DD-MM-YYYY format)
onDateInput(event: any, controlName: string = 'dob'): void {
  const input = event.target as HTMLInputElement;
  let value = input.value.replace(/\D/g, ''); // Sirf numbers

  if (value.length > 8) value = value.substring(0, 8);

  let displayValue = '';
  let backendValue = '';

  if (value.length === 8) {
    // Display: DD-MM-YYYY
    displayValue = `${value.substring(0, 2)}-${value.substring(2, 4)}-${value.substring(4, 8)}`;
    // Backend: YYYY-MM-DD
    backendValue = `${value.substring(4, 8)}-${value.substring(2, 4)}-${value.substring(0, 2)}`;
    
    input.value = displayValue;
    this.userForm.get(controlName)?.setValue(backendValue, { emitEvent: false });
  } else {
    // Typing ke waqt display format manage karein
    if (value.length > 4) {
      displayValue = `${value.substring(0, 2)}-${value.substring(2, 4)}-${value.substring(4, 8)}`;
    } else if (value.length > 2) {
      displayValue = `${value.substring(0, 2)}-${value.substring(2, 4)}`;
    } else {
      displayValue = value;
    }
    input.value = displayValue;
  }
}

onCalendarChange(event: any, controlName: string = 'dob'): void {
  const dateInput = event.target as HTMLInputElement;
  if (!dateInput.value) return;

  // Browser calendar hamesha YYYY-MM-DD deta hai
  const selectedDate = dateInput.value; 
  const [year, month, day] = selectedDate.split('-');
  const displayFormat = `${day}-${month}-${year}`;

  // Form Control mein standard format rakhein (taaki backend 400 na de)
  this.userForm.get(controlName)?.setValue(selectedDate);

  // Screen par user ko DD-MM-YYYY dikhane ke liye text input update karein
  const textInput = dateInput.parentElement?.querySelector('input[type="text"]') as HTMLInputElement;
  if (textInput) {
    textInput.value = displayFormat;
  }
}
logEducationData() {
  const raw = this.userForm.getRawValue();

  // 1. Static Educations ko ek array mein daalo
  const allEducations = [
    {
      level: '10th',
      name: raw.tenthName,
      year: raw.tenthYear,
      percentage: raw.tenthPercentage,
      marksheetFile: raw.tenthMarksheet // Yahan File object ya URL aayega
    },
    {
      level: '12th',
      name: raw.twelfthName,
      year: raw.twelfthYear,
      percentage: raw.twelfthPercentage,
      marksheetFile: raw.twelfthMarksheet
    },
    {
      level: 'Graduation',
      name: raw.graduationName,
      year: raw.graduationYear,
      percentage: raw.graduationPercentage,
      marksheetFile: raw.graduationMarksheet
    },
    {
      level: 'Post Graduation',
      name: raw.postGraduationName,
      year: raw.postGraduationYear,
      percentage: raw.postGraduationPercentage,
      marksheetFile: raw.postGraduationMarksheet
    }
  ];

  // 2. Dynamic (Add More) wale educations ko bhi isme push kar do
  if (raw.educations && raw.educations.length > 0) {
    raw.educations.forEach((edu: any, index: number) => {
      allEducations.push({
        level: `Other Education ${index + 1}`,
        name: edu.educationName,
        year: edu.year,
        percentage: edu.percentage,
        marksheetFile: edu.marksheet
      });
    });
  }

  // 3. Khali entries hata do (jisme kuch bhi fill nahi kiya)
  const filteredEducations = allEducations.filter(e => e.year || e.percentage || e.marksheetFile);

  console.log('📚 ================= COMPLETE EDUCATION DATA ================= 📚');
  
  // Ye table format mein saaf saaf dikhayega
  console.table(filteredEducations);
  
  // Ye detailed object dega jisme aap marksheet ke File Object ko expand karke dekh sakte ho
  console.log('🔍 Detailed Objects (Click to expand image/file details):', filteredEducations);
}
syncAddress(event: any) {
  if (event.target.checked) {
    // Sari present address ki values nikal lo
    const currentValues = this.userForm.value;
    
    // Permanent address fields mein patch kar do
    this.userForm.patchValue({
      permHouseNo: currentValues.presHouseNo,
      permBuilding: currentValues.presBuilding,
      permFloor: currentValues.presFloor,
      permBlock: currentValues.presBlock,
      permStreet: currentValues.presStreet,
      permLandmark: currentValues.presLandmark,
      permArea: currentValues.presArea,
      permCity: currentValues.presCity,
      permDistrict: currentValues.presDistrict,
      permState: currentValues.presState,
      permPincode: currentValues.presPincode,
      permCountry: currentValues.presCountry,
    });
  } else {
    // Agar uncheck kare toh permanent address clear kar de (Optional)
    this.userForm.patchValue({
      permHouseNo: '', permBuilding: '', permFloor: '', permBlock: '',
      permStreet: '', permLandmark: '', permArea: '', permCity: '',
      permDistrict: '', permState: '', permPincode: '', permCountry: ''
    });
  }
}
// Variables (Add these in your class)

filteredDepts: any[] = [];
filteredDesig: any[] = [];



// 1. Search Logic (Min 3 characters)
onSearch(event: any, type: string) {
  const query = event.target.value.toLowerCase();
  if (query.length >= 3) {
    if (type === 'dept') {
      this.filteredDepts = this.departments.filter(d => d.name.toLowerCase().includes(query));
    } else {
      this.filteredDesig = this.designations.filter(d => d.name.toLowerCase().includes(query));
    }
  } else {
    this.filteredDepts = [];
    this.filteredDesig = [];
  }
}

// 2. Selection Logic (Value set karne ke liye)
// selectItem(item: any, type: string, inputElement: HTMLInputElement) {
//   if (type === 'dept') {
//     this.userForm.get('department')?.setValue(item.id); // Backend ke liye ID
//     inputElement.value = item.name; // User ke liye Name
//     this.filteredDepts = [];
//   } else {
//     this.userForm.get('designation')?.setValue(item.id); // Backend ke liye ID
//     inputElement.value = item.name; // User ke liye Name
//     this.filteredDesig = [];
//   }
// }

// 3. Modal logic (Aapke project ke modal ke hisaab se)
openDeptModal() {
  // Example: Yahan aap apna modal open karein aur selecting par selectItem call karein
  alert("Modal for all Departments will open here");
}

openDesigModal() {
  alert("Modal for all Designations will open here");
}

isModalOpen = false;
modalType: 'dept' | 'des' = 'dept';

// Modal Open karne ka function
openModal(type: 'dept' | 'des') {
  this.modalType = type;
  this.isModalOpen = true;
}

// Select Item Logic (Updated to handle Modal + Input)
selectItem(item: any, type: string, inputElement: HTMLInputElement) {
  if (type === 'dept') {
    this.userForm.get('department')?.setValue(item.id);
    inputElement.value = item.name;
    this.filteredDepts = [];
  } else {
    this.userForm.get('designation')?.setValue(item.id);
    inputElement.value = item.name;
    this.filteredDesig = [];
  }
}
// Class variables (Make sure these exist)
// isLoading = false;
users: any[] = [];

onUserTypeChange(event: any) {
  const selectedType = event.target.value;

  if (selectedType) {
    this.isLoading = true;
    
    this.userService.getUsers(selectedType).subscribe({
      next: (data: any[]) => {
        this.isLoading = false;

        if (data && data.length > 0) {
          const lastRecord = data[data.length - 1]; 
          const latestCode = lastRecord.empCode; // "TRN/004"

          // setTimeout use kar rahe hain taaki Angular check cycle khatam ho jaye
          setTimeout(() => {
            // Hum direct patchValue use karenge pure form par
            this.userForm.patchValue({
              employeeCode: latestCode
            }, { emitEvent: false }); // emitEvent false karne se loop nahi banega

            this.cdr.detectChanges(); // UI refresh
            console.log("Value ab set ho gayi hai:", latestCode);
          }, 0);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error("API Error:", err);
      }
    });
  }
}
// user-form.component.ts mein class ke andar ye add kar:

downloadData(type: string) {
  let dataToDownload = [];
  let fileName = "";

  if (type === 'dept') {
    dataToDownload = this.filteredDepts.length > 0 ? this.filteredDepts : this.departments;
    fileName = "departments.csv";
  } else if (type === 'des') {
    dataToDownload = this.filteredDesig.length > 0 ? this.filteredDesig : this.designations; // designations array ka naam check kar lena
    fileName = "designations.csv";
  }

  if (!dataToDownload || dataToDownload.length === 0) {
    alert("No data available to download");
    return;
  }

  const csvContent = "data:text/csv;charset=utf-8," 
    + "ID,Name\n" 
    + dataToDownload.map(d => `${d.id},${d.name}`).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
}