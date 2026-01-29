import { Component, OnInit } from '@angular/core';
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
}