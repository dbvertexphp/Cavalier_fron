import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { BranchService } from '../../services/branch.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom, forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit {
  @ViewChild('deptInput') deptInput!: ElementRef;
  @ViewChild('desigInput') desigInput!: ElementRef;
lineOfBusinessList: any[] = [];
  isImageModalOpen = false;
  selectedImageUrl = '';
  employeeData: any;
  userlist: any = [];
  todayDate: string = new Date().toISOString().split('T')[0];
  permissions: any[] = [];
  selectedPermissionIds: number[] = [];

  showPassword = false;
  userForm!: FormGroup;
  isEditMode = false;
  isBranchForm = false;
  id: number | null = null;
  initialData: any;
  isLoading = false;
  public baseUrl: string = '';

  departments: any[] = [];
  designations: any[] = [];
  roles: any[] = [];
  branches: any[] = [];
  hods: any[] = [];
  teams: any[] = [];
  bloodGroups: string[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  selectedBloodGroup: string = '';

  filteredDepts: any[] = [];
  filteredDesig: any[] = [];
  isModalOpen = false;
  modalType: 'dept' | 'des' = 'dept';
  users: any[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private branchService: BranchService,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private location: Location
  ) {
    let api = environment.apiUrl;
    if (api.endsWith('/api')) {
      this.baseUrl = api.substring(0, api.length - 4);
    } else {
      this.baseUrl = api;
    }
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state) {
      this.initialData = nav.extras.state['data'];
      this.isEditMode = nav.extras.state['isEdit'] || false;
      this.isBranchForm = nav.extras.state['isBranch'] || false;
      this.id = this.initialData?.id || null;
    }
  }

  ngOnInit(): void {
    this.getuser();
    this.userService.getDepartments().subscribe(res => this.departments = res);
    this.userService.getDesignations().subscribe(res => this.designations = res);
    this.initForm();

    if (!this.isBranchForm) {
      this.loadDropdowns();
      this.getBranches();
      this.loadPermissions();
      this.loadLineOfBusiness();
    }

    // Designation change hone par Department auto-select logic
    this.userForm.get('designation')?.valueChanges.subscribe((selectedDesId) => {
      if (selectedDesId) {
        const selectedDesignation = this.designations.find(des => des.id === Number(selectedDesId));
        if (selectedDesignation && selectedDesignation.departmentId) {
          this.userForm.patchValue({
            department: selectedDesignation.departmentId
          }, { emitEvent: false });
        }
      }
    });

    // Team changes block - HOD mapping sync engine
    this.userForm.get('teamId')?.valueChanges.subscribe((selectedTeamIds: any[]) => {
      if (selectedTeamIds && selectedTeamIds.length > 0) {
        const requests = selectedTeamIds.map(teamId =>
          this.http.get<any>(`${environment.apiUrl}/Teams/${teamId}/details`)
        );

        forkJoin(requests).subscribe({
          next: (responses: any[]) => {
            let combinedHods: any[] = [];
            responses.forEach(res => {
              if (res && res.hods && Array.isArray(res.hods)) {
                res.hods.forEach((h: any) => {
                  if (!combinedHods.some(existing => existing.id === Number(h.id))) {
                    combinedHods.push({
                      id: Number(h.id),
                      name: h.name
                    });
                  }
                });
              }
            });
            this.hods = combinedHods;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error("❌ Details loading engine failed:", err);
            this.hods = [];
            this.cdr.detectChanges();
          }
        });
      } else {
        this.hods = [];
        this.cdr.detectChanges();
      }
    });

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
    this.userForm.patchValue({ permissionIds: current });
  }

  openImageModal(url: string | null | undefined) {
    if (url) {
      this.selectedImageUrl = url;
      this.isImageModalOpen = true;
    }
  }

  getFormattedImagePath(path: string | null | undefined): string {
    if (!path) return 'assets/images/default-placeholder.png';
    const filename = path.split(/[\\/]/).pop();
    let cleanBase = this.baseUrl.replace(/\/api\/?$/, '');
    if (!cleanBase.endsWith('/')) {
      cleanBase += '/';
    }
    return `${cleanBase}uploads/${filename}`;
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
        hodId: [[]],
        teamId: [[]],
       lineOfBusiness: [[]],
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
        userType: ['', [Validators.required]],
        branchId: [null],
        roleId: [null],
        licenceType: [''],
        dateOfJoining: ['', [Validators.required]],
        ctc_Monthly: [0],
        salaryAccountNo: [''],
        secondaryEmail: [''],
        email: ['', [Validators.required, Validators.email]],
        mobile: ['', [Validators.required, Validators.pattern("^[0-9]{10}$")]],
        telephone: [''],
        paN_No: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
        aadhaarNo: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(12)]],
        ipAdress: [''],
        permissionIds: [[]],

        presHouseNo: [''], presBuilding: [''], presFloor: [''], presBlock: [''], presStreet: [''], presLandmark: [''], presArea: [''], presCity: [''], presDistrict: [''], presState: [''], presPincode: [''], presCountry: ['India'],
        permHouseNo: [''], permBuilding: [''], permFloor: [''], permBlock: [''], permStreet: [''], permLandmark: [''], permArea: [''], permCity: [''], permDistrict: [''], permState: [''], permPincode: [''], permCountry: ['India'],

        educations: this.fb.array([]),
        experiences: this.fb.array([this.createExperienceGroup()]),

        tenthId: [null], tenthName: ['10th'], tenthYear: [''], tenthPercentage: [''], tenthMarksheet: [null], tenthMarksheetPath: [''],
        twelfthId: [null], twelfthName: ['12th'], twelfthYear: [''], twelfthPercentage: [''], twelfthMarksheet: [null], twelfthMarksheetPath: [''],
        graduationId: [null], graduationName: ['Graduation'], graduationYear: [''], graduationPercentage: [''], graduationMarksheet: [null], graduationMarksheetPath: [''],
        postGraduationId: [null], postGraduationName: ['Post Graduation'], postGraduationYear: [''], postGraduationPercentage: [''], postGraduationMarksheet: [null], postGraduationMarksheetPath: [''],

        accountHolderName: [''], bankName: [''], ifscCode: [''], accountType: [''], accountNumber: [''], bankBranchName: [''],
        profileSelect: [''], profilePicture: [null], profilePicturePath: [''], signature: [''], reportTo: [''],

        emergencyName: [''], EmergencyRelation: [''], emergencyContactNo: [''],
        mfaRegistration: [false], fieldVisit: [false], alwaysBccmyself: [false],

        invitationLetter: [null], offerLetter: [null], appointmentLetter: [null], relievingLetter: [null], fullAndFinalLetter: [null],
        invitationLetterPath: [''], offerLetterPath: [''], appointmentLetterPath: [''], relievingLetterPath: [''], fullAndFinalLetterPath: [''],

        simIssued: [false], status: [true], hodId: [null], teamId: [null], exitDate: [null],
        address: [''], city: [''], state: [''], postalCode: ['']
      });
    }
  }

  createEducationGroup(): FormGroup {
    return this.fb.group({
      id: [null],
      educationName: [''],
      year: [''],
      percentage: [''],
      marksheet: [null],
      marksheetPath: ['']
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

  createExperienceGroup(): FormGroup {
    return this.fb.group({
      id: [null],
      organizationName: [''],
      designation: [''],
      annualSalary: [''],
      joiningDate: [''],
      exitDate: [''],
      totalYears: [''],
      verification: [false],
      documents: this.fb.array([])
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
    this.userService.getTeams().subscribe(res => this.teams = res);
  }

  getBranches() {
    this.http.get<any>(`${environment.apiUrl}/branch/list`).subscribe({
      next: res => {
        this.branches = Array.isArray(res) ? res : res?.data || [];
      }
    });
  }

  onSubmit() {
    console.log('================ FINAL SUBMIT START ================');
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        const controlErrors = this.userForm.get(key)?.errors;
        if (controlErrors != null) {
          Swal.fire({
            icon: 'error',
            title: 'Validation Discrepancy Identified',
            text: `The field '${key}' is invalid. Please check your entry and try again.`,
            confirmButtonText: 'Acknowledge',
            confirmButtonColor: '#d33'
          });
        }
      });
      this.userForm.markAllAsTouched();
      return;
    }

    const raw = this.userForm.getRawValue();

    if (this.isBranchForm) {
      const branchData = new FormData();
      Object.keys(raw).forEach(key => {
        if (raw[key] !== null && raw[key] !== undefined) {
          branchData.append(key, raw[key]);
        }
      });
      this.branchService.addBranch(branchData).subscribe({
        next: () => alert('Branch Saved Successfully'),
        error: err => console.error('Branch API Error:', err)
      });
      return;
    } else {
      let formattedDob = raw.dob;
      if (raw.dob && raw.dob.includes('-')) {
        const parts = raw.dob.split('-');
        if (parts.length === 3 && parts[0].length === 2) {
          formattedDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }

      let formattedDoj = raw.dateOfJoining;
      if (raw.dateOfJoining && raw.dateOfJoining.includes('-')) {
        const parts = raw.dateOfJoining.split('-');
        if (parts.length === 3 && parts[0].length === 2) {
          formattedDoj = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
let formattedLobArray: number[] = [];
    if (Array.isArray(raw.lineOfBusiness)) {
      formattedLobArray = raw.lineOfBusiness.map((id: any) => Number(id)).filter((id: number) => !isNaN(id));
    } else if (raw.lineOfBusiness) {
      formattedLobArray = [Number(raw.lineOfBusiness)].filter((id: number) => !isNaN(id));
    }
      const finalPayload = {
        ...raw,
        dob: formattedDob,
        dateOfJoining: formattedDoj,
        lineOfBusiness: formattedLobArray,
        id: this.isEditMode ? this.id : 0,
        EmergencyRelation: raw.emergencyRelationship || raw.EmergencyRelation
      };

      const apiCall = this.isEditMode
        ? this.userService.updateUser(finalPayload)
        : this.userService.registerUser(finalPayload);

      apiCall.subscribe({
        next: async (res: any) => {
          const currentId = this.isEditMode ? this.id : (res.id || res.userId || res.data?.id);
          if (currentId) {
            try {
              await this.saveEducation(currentId);
            } catch (eduError) {
              console.error('❌ saveEducation error:', eduError);
            }

            try {
              await this.saveExperience(currentId);
            } catch (expError) {
              console.error('❌ saveExperience error:', expError);
            }

            alert(this.isEditMode ? 'User Updated Successfully' : 'User Saved Successfully');
          } else {
            alert('User Saved, but ID not received for sub-records');
          }
          this.router.navigate(['/dashboard/hr/employee-master']);
        },
        error: err => {
          let errorTitle = "Validation Error";
          let errorMessage = "Something went wrong. Please try again.";
          if (err.error && err.error.errors) {
            errorTitle = "Please fix the following Fields:";
            errorMessage = '';
            Object.keys(err.error.errors).forEach((field) => {
              const fieldErrors = err.error.errors[field];
              errorMessage += `• ${Array.isArray(fieldErrors) ? fieldErrors.join(', ') : fieldErrors}<br>`;
            });
          } else if (err.error && typeof err.error === 'string') {
            errorMessage = err.error;
          } else if (err.error && err.error.message) {
            errorMessage = err.error.message;
          }
          Swal.fire({
            title: errorTitle,
            html: `<div style="text-align: left;">${errorMessage}</div>`,
            icon: "error",
            confirmButtonText: "OK"
          });
        }
      });
    }
  }

  async saveEducation(userId: any) {
    const raw = this.userForm.getRawValue();
    const educationArray: any[] = [];

    const allEntries = [
      { name: raw.tenthName || '10th', year: raw.tenthYear, perc: raw.tenthPercentage, file: raw.tenthMarksheet },
      { name: raw.twelfthName || '12th', year: raw.twelfthYear, perc: raw.twelfthPercentage, file: raw.twelfthMarksheet },
      { name: raw.graduationName || 'Graduation', year: raw.graduationYear, perc: raw.graduationPercentage, file: raw.graduationMarksheet },
      { name: raw.postGraduationName || 'Post Graduation', year: raw.postGraduationYear, perc: raw.postGraduationPercentage, file: raw.postGraduationMarksheet },
      ...(raw.educations || []).map((e: any) => ({ name: e.educationName, year: e.year, perc: e.percentage, file: e.marksheet }))
    ];

    for (const entry of allEntries) {
      const isAnyFieldFilled = entry.year || entry.perc || entry.file;
      const isBothFilled = entry.year && entry.perc;

      if (isAnyFieldFilled) {
        if (!isBothFilled) {
          Swal.fire({
            icon: 'success',
            title: 'Form Saved Successfully',
            html: `<p>The academic record for <b>${entry.name}</b> is incomplete.</p>`,
            confirmButtonText: 'Acknowledge',
            confirmButtonColor: '#10b981'
          });
          return;
        }
        educationArray.push({
          userId: userId,
          educationName: entry.name,
          passingYear: entry.year,
          percentage: entry.perc,
          marksheetFile: entry.file
        });
      }
    }

    const formData = new FormData();
    educationArray.forEach((edu, index) => {
      formData.append(`educations[${index}].UserId`, edu.userId.toString());
      formData.append(`educations[${index}].EducationName`, edu.educationName || '');
      formData.append(`educations[${index}].PassingYear`, edu.passingYear || '');
      formData.append(`educations[${index}].Percentage`, edu.percentage || '');
      if (edu.marksheetFile instanceof File) {
        formData.append(`educations[${index}].MarksheetFile`, edu.marksheetFile);
      }
    });

    try {
      if (educationArray.length === 0) return;
      Swal.fire({
        title: 'Data Synchronization',
        text: 'Processing academic records...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });
      await firstValueFrom(this.http.post(`${environment.apiUrl}/User/add-multiple-education`, formData));
      Swal.close();
    } catch (err) {
      console.error('❌ Error saving education details:', err);
    }
  }

  async saveExperience(userId: any) {
    const raw = this.userForm.getRawValue();
    const experienceArray = raw.experiences || [];
    const payloadArray: any[] = [];

    for (const exp of experienceArray) {
      if (exp.organizationName && exp.organizationName.toString().trim() !== '') {
        let finalExitDate = null;
        if (exp.exitDate) {
          try {
            if (exp.exitDate.includes('-') && exp.exitDate.split('-')[0].length === 2) {
              const parts = exp.exitDate.split('-');
              finalExitDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).toISOString();
            } else {
              finalExitDate = new Date(exp.exitDate).toISOString();
            }
          } catch (e) {
            finalExitDate = null;
          }
        }

        payloadArray.push({
          userId: parseInt(userId),
          organizationName: exp.organizationName,
          designation: exp.designation || "",
          yearsOfExperience: exp.totalYears ? exp.totalYears.toString() : "",
          annualSalary: parseFloat(exp.annualSalary) || 0,
          dateOfExit: finalExitDate,
          verificationComplete: exp.verification || false
        });
      }
    }

    if (payloadArray.length === 0) return;

    try {
      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/User/add-multiple-experience`, payloadArray)
      );
    } catch (err) {
      console.error(`❌ Error saving experiences:`, err);
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
    this.location.back();
  }

  getuser() {
    this.userService.getUsers('onlyuserdata').subscribe({
      next: res => {
        this.userlist = res;
        this.cdr.detectChanges();
      }
    });
  }
loadLineOfBusiness() {
  this.http.get<any[]>(`${environment.apiUrl}/CompanyService`).subscribe({
    next: (res) => {
      if (Array.isArray(res)) {
        // Sirf unhi services ko render karega jinka status 'Active' hai
        this.lineOfBusinessList = res.filter(item => item.status === 'Active');
      }
    },
    error: (err) => console.error('❌ Line of Business API Error:', err)
  });
}
  onlyNumbers(event: any) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  populateForm(data: any) {
    if (!data) return;

    let parsedHodIds: number[] = [];
   let parsedLobIds: number[] = [];
    let parsedTeamIds: number[] = [];

    try {
      if (data.hodId) {
        parsedHodIds = typeof data.hodId === 'string' ? JSON.parse(data.hodId) : data.hodId;
        parsedHodIds = Array.isArray(parsedHodIds) ? parsedHodIds.map(id => Number(id)) : [Number(parsedHodIds)];
      }
    } catch (e) {
      parsedHodIds = [];
    }

    try {
      if (data.teamId) {
        parsedTeamIds = typeof data.teamId === 'string' ? JSON.parse(data.teamId) : data.teamId;
        parsedTeamIds = Array.isArray(parsedTeamIds) ? parsedTeamIds.map(id => Number(id)) : [Number(parsedTeamIds)];
      }
    } catch (e) {
      parsedTeamIds = [];
    }
 try {
    const rawLob = data.lineOfBusiness || data.lineOfBusinessId || data.companyServiceId;
    if (rawLob) {
      parsedLobIds = typeof rawLob === 'string' ? JSON.parse(rawLob) : rawLob;
      parsedLobIds = Array.isArray(parsedLobIds) ? parsedLobIds.map(id => Number(id)) : [Number(parsedLobIds)];
    }
  } catch (e) {
    parsedLobIds = [];
  }

    this.userForm.patchValue({
      ...data,
      hodId: parsedHodIds,
      teamId: parsedTeamIds,
     lineOfBusiness: parsedLobIds,
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
      EmergencyRelation: data.emergencyRelation || data.EmergencyRelation || data.emergencyRelationship
    });

    if (parsedTeamIds.length > 0) {
      this.userForm.get('teamId')?.setValue(parsedTeamIds, { emitEvent: true });
    }

    setTimeout(() => {
      if (data.department) {
        const dept = this.departments.find(d => d.id == data.department);
        if (dept && this.deptInput) this.deptInput.nativeElement.value = dept.name;
      }
      if (data.designation) {
        const des = this.designations.find(d => d.id == data.designation);
        if (des && this.desigInput) this.desigInput.nativeElement.value = des.name;
      }
    }, 1000);

    // Populate Education Array Mapping 
    if (data.addMoreEducations && Array.isArray(data.addMoreEducations)) {
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

      this.educations.clear();
      const otherEdus = data.addMoreEducations.filter((e: any) =>
        !['10th', '12th', 'Graduation', 'Post Graduation'].includes(e.educationName)
      );
      otherEdus.forEach((edu: any) => {
        this.educations.push(this.fb.group({
          id: [edu.id || null],
          educationName: [edu.educationName || ''],
          year: [edu.year || edu.passingYear || ''],
          percentage: [edu.percentage || ''],
          marksheet: [null],
          marksheetPath: [edu.marksheetPath || '']
        }));
      });
    }

    // Populate Experience FormArray
    if (data.addAnotherExperiences && Array.isArray(data.addAnotherExperiences)) {
      this.experiences.clear();
      data.addAnotherExperiences.forEach((exp: any) => {
        this.experiences.push(this.fb.group({
          id: [exp.id || null],
          organizationName: [exp.organizationName || ''],
          designation: [exp.designation || ''],
          annualSalary: [exp.annualSalary || ''],
          joiningDate: [''],
          exitDate: [exp.dateOfExit ? exp.dateOfExit.split('T')[0] : ''],
          totalYears: [exp.yearsOfExperience || ''],
          verification: [exp.verificationComplete || false],
          documents: this.fb.array([])
        }));
      });
    } else {
      if (this.experiences.length === 0) {
        this.addExperience();
      }
    }
  }

  // Row index framework fix added inside parameters
  onDateInput(event: any, controlName: string = 'dob', index?: number): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 8) value = value.substring(0, 8);

    let displayValue = '';
    if (value.length > 4) {
      displayValue = `${value.substring(0, 2)}-${value.substring(2, 4)}-${value.substring(4, 8)}`;
    } else if (value.length > 2) {
      displayValue = `${value.substring(0, 2)}-${value.substring(2, 4)}`;
    } else {
      displayValue = value;
    }

    input.value = displayValue;

    const control = index !== undefined
      ? this.experiences.at(index).get(controlName)
      : this.userForm.get(controlName);

    control?.setValue(displayValue, { emitEvent: false });
  }

  onCalendarChange(event: any, controlName: string = 'dob', index?: number): void {
    const dateInput = event.target as HTMLInputElement;
    if (!dateInput.value) return;

    const selectedDate = dateInput.value;
    const [year, month, day] = selectedDate.split('-');
    const displayFormat = `${day}-${month}-${year}`;

    const control = index !== undefined
      ? this.experiences.at(index).get(controlName)
      : this.userForm.get(controlName);

    control?.setValue(selectedDate);

    const textInput = dateInput.parentElement?.querySelector('input[type="text"]') as HTMLInputElement;
    if (textInput) {
      textInput.value = displayFormat;
    }
  }

  syncAddress(event: any) {
    if (event.target.checked) {
      const currentValues = this.userForm.value;
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
      this.userForm.patchValue({
        permHouseNo: '', permBuilding: '', permFloor: '', permBlock: '',
        permStreet: '', permLandmark: '', permArea: '', permCity: '',
        permDistrict: '', permState: '', permPincode: '', permCountry: ''
      });
    }
  }

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

  openModal(type: 'dept' | 'des') {
    this.modalType = type;
    this.isModalOpen = true;
  }

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

  onUserTypeChange(event: any) {
    const selectedType = event.target.value;
    if (selectedType) {
      this.isLoading = true;
      this.userService.generateNextCode(selectedType).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (res && res.nextCode) {
            this.userForm.patchValue({ employeeCode: res.nextCode });
            this.cdr.detectChanges();
          }
        },
        error: () => this.isLoading = false
      });
    }
  }

  onHodSelect(event: any) {
    const value = event.target.value;
    if (!value) return;
    const hodIdNum = Number(value);
    const currentHods: any[] = this.userForm.get('hodId')?.value || [];
    if (!currentHods.includes(hodIdNum)) {
      currentHods.push(hodIdNum);
      this.userForm.get('hodId')?.setValue(currentHods);
    }
    event.target.value = '';
  }

  removeHod(hodId: number) {
    let currentHods: any[] = this.userForm.get('hodId')?.value || [];
    currentHods = currentHods.filter(id => id !== hodId);
    this.userForm.get('hodId')?.setValue(currentHods);
  }

  getHodNameById(hodId: any): string {
    const match = this.hods.find(h => h.id == hodId);
    return match ? (match.name || match.hod) : `HOD (ID: ${hodId})`;
  }

  isHodSelected(hodId: number): boolean {
    const currentHods: any[] = this.userForm.get('hodId')?.value || [];
    return currentHods.includes(hodId);
  }

  onTeamSelect(event: any) {
    const value = event.target.value;
    if (!value) return;
    const teamIdNum = Number(value);
    const currentTeams: any[] = this.userForm.get('teamId')?.value || [];
    if (!currentTeams.includes(teamIdNum)) {
      currentTeams.push(teamIdNum);
      this.userForm.get('teamId')?.setValue(currentTeams);
    }
    event.target.value = '';
  }

  removeTeam(teamId: number) {
    let currentTeams: any[] = this.userForm.get('teamId')?.value || [];
    currentTeams = currentTeams.filter(id => id !== teamId);
    this.userForm.get('teamId')?.setValue(currentTeams);
  }

  getTeamNameById(teamId: any): string {
    const match = this.teams.find(t => t.id == teamId);
    return match ? match.teamName : `Team (ID: ${teamId})`;
  }

  isTeamSelected(teamId: number): boolean {
    const currentTeams: any[] = this.userForm.get('teamId')?.value || [];
    return currentTeams.includes(teamId);
  }


isLobDropdownOpen = false;

toggleLobDropdown() {
  this.isLobDropdownOpen = !this.isLobDropdownOpen;
}

onLobCheckboxChange(isChecked: boolean, rawLobId: any) {
  console.log('--- [LOB CHECKBOX CLICKED] ---');
  console.log('👉 Checked Status:', isChecked, '| Raw LOB ID:', rawLobId);

  const lobId = Number(rawLobId);

  // 1. Safety Check: If control doesn't exist, create it on the fly
  if (!this.userForm.contains('lineOfBusiness')) {
    console.warn('⚠️ "lineOfBusiness" control was missing! Adding dynamically...');
    this.userForm.addControl('lineOfBusiness', this.fb.control([]));
  }

  // 2. Get current value safely
  let currentLobs: any[] = this.userForm.get('lineOfBusiness')?.value || [];
  if (!Array.isArray(currentLobs)) {
    currentLobs = [];
  }

  // 3. Add or Remove ID
  if (isChecked) {
    if (!currentLobs.some(id => Number(id) === lobId)) {
      currentLobs.push(lobId);
      console.log('✅ Added LOB ID:', lobId);
    }
  } else {
    currentLobs = currentLobs.filter(id => Number(id) !== lobId);
    console.log('❌ Removed LOB ID:', lobId);
  }

  // 4. Update Form Control using setControl / patchValue
  this.userForm.get('lineOfBusiness')?.setValue([...currentLobs]);
  this.userForm.get('lineOfBusiness')?.markAsDirty();
  this.userForm.get('lineOfBusiness')?.updateValueAndValidity();

  console.log('👉 Final Control Value:', this.userForm.get('lineOfBusiness')?.value);

  // 5. Force View Refresh
  this.cdr.detectChanges();
}

removeLob(rawLobId: any) {
  const lobId = Number(rawLobId);
  let currentLobs: any[] = this.userForm.get('lineOfBusiness')?.value || [];
  if (!Array.isArray(currentLobs)) return;

  const filteredArray = currentLobs.filter(id => Number(id) !== lobId);

  this.userForm.patchValue({
    lineOfBusiness: [...filteredArray]
  });
  this.userForm.get('lineOfBusiness')?.markAsDirty();
  this.userForm.get('lineOfBusiness')?.updateValueAndValidity();
  this.cdr.detectChanges();
}

getLobNameById(rawLobId: any): string {
  if (!this.lineOfBusinessList || this.lineOfBusinessList.length === 0) {
    return `LOB (${rawLobId})`;
  }
  const lobId = Number(rawLobId);
  const match = this.lineOfBusinessList.find(lob => Number(lob.id) === lobId);
  return match ? (match.serviceName || match.name) : `LOB (${rawLobId})`;
}

isLobSelected(rawLobId: any): boolean {
  const lobId = Number(rawLobId);
  const currentLobs: any[] = this.userForm.get('lineOfBusiness')?.value || [];
  if (!Array.isArray(currentLobs)) return false;
  return currentLobs.some(id => Number(id) === lobId);
}
  downloadData(type: string) {
    let dataToDownload = [];
    let fileName = "";
    if (type === 'dept') {
      dataToDownload = this.filteredDepts.length > 0 ? this.filteredDepts : this.departments;
      fileName = "departments.csv";
    } else if (type === 'des') {
      dataToDownload = this.filteredDesig.length > 0 ? this.filteredDesig : this.designations;
      fileName = "designations.csv";
    }
    if (!dataToDownload || dataToDownload.length === 0) return;

    const csvContent = "data:text/csv;charset=utf-8," + "ID,Name\n" + dataToDownload.map(d => `${d.id},${d.name}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  checkPanLength() {
    const panControl = this.userForm.get('paN_No');
    if (panControl?.touched && panControl.value && panControl.value.length < 10) {
      Swal.fire({
        icon: 'error',
        title: 'Inadequate Digit Count',
        text: 'Please enter a valid 10-character alphanumeric PAN.',
        confirmButtonText: 'Rectify Entry',
        confirmButtonColor: '#3b82f6'
      });
    }
  }

  validateAadhaarLength() {
    const control = this.userForm.get('aadhaarNo');
    if (control?.touched && control.value && control.value.length < 12) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Identification Sequence',
        text: 'Invalid Aadhaar. Please enter the full 12-digit number.',
        confirmButtonText: 'Amend Submission',
        confirmButtonColor: '#3b82f6'
      });
    }
  }

  validateUserType() {
    const control = this.userForm.get('userType');
    if (!control?.value || control.value === '') {
      Swal.fire({
        icon: 'warning',
        title: 'Categorization Oversight',
        text: 'User category is required.',
        confirmButtonText: 'Amend Selection',
        confirmButtonColor: '#3b82f6'
      });
    }
  }

  validateDOB() {
    const control = this.userForm.get('dob');
    const dateValue = control?.value;
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
    if (control?.touched && dateValue && !dateRegex.test(dateValue)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Date Format',
        text: 'Please enter the date of birth in DD-MM-YYYY format.',
        confirmButtonText: 'Amend Entry',
        confirmButtonColor: '#d33'
      });
    }
  }

  validateJoiningDate() {
    const control = this.userForm.get('dateOfJoining');
    const dateValue = control?.value;
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
    if (control?.touched && dateValue && !dateRegex.test(dateValue)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Date Format',
        text: 'Please enter the date in DD-MM-YYYY format.',
        confirmButtonText: 'Amend Entry',
        confirmButtonColor: '#d33'
      });
    }
  }
}