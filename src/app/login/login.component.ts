

// import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { HttpClient } from '@angular/common/http';
// import { environment } from '../../environments/environment';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [CommonModule, FormsModule, ReactiveFormsModule],
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.css']
// })
// export class LoginComponent implements OnInit {
// branches: any[] = [];
// isBranchDisabled = false;
//   loginForm!: FormGroup;
//   selectionForm!: FormGroup;

//   slides = [0, 1, 2];
//   currentSlide = 0;

//   isStepTwo = false;

//   displayUserName = '';
//   displayCompanyName = '';

//   roles: string[] = [];
//   cities: string[] = [];

//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private http: HttpClient,
//     private c:ChangeDetectorRef
//   ) {}

//   ngOnInit(): void {

//     this.loginForm = this.fb.group({
//       email: ['', [Validators.required, Validators.email]],
//       password: ['', Validators.required]
//     });

//     this.selectionForm = this.fb.group({
//       selectedRole: [''],
//       selectedCity: ['']
//     });

//     setInterval(() => {
//       this.currentSlide = (this.currentSlide + 1) % this.slides.length;
//     }, 5000);
//   }

//   setSlide(index: number): void {
//     this.currentSlide = index;
//   }

//   // 🔐 LOGIN STEP (API BASED)
//   onNextStep(): void {
//     console.log('clicked next step');
//   if (this.loginForm.invalid) {
//     alert('Email & Password required');
//     return;
//   }

//   this.http.post<any>(
//     `${environment.apiUrl}/Auth/login`,
//     this.loginForm.value
//   ).subscribe({
//     next: (res) => {

//       const user = res.user;
//       this.isStepTwo = true;
//       this.c.detectChanges(); // Force UI update for step 2

//       // ✅ USER + COMPANY
//       this.displayUserName = user.firstName;
//     this.displayCompanyName = (user.branches?.[0]?.companyName || '').toUpperCase();

//       localStorage.setItem('userName', user.firstName);
//       localStorage.setItem('companyName', this.displayCompanyName);
//       localStorage.setItem('cavalier_token', res.token);

//       // ✅ MASTER ROLE LOGIC
//       if (user.role?.name === 'Master') {

//         // 🔥 BOTH ROLES
//         this.roles = [
//           'System Administrator',
//           'Branch Administrator'
//         ];

//         // 🔥 BRANCHES FROM API
//         // this.branches = user.branches || [];
//         // 🔥 BRANCHES FROM API
// this.branches = user.branches || [];
// console.log(this.branches)

// // Loop chala kar har branch ke name ko capital kar do

//         // this.branches = (user.branches || []).map((b: string) => b.toUpperCase());

//         this.selectionForm.patchValue({
//           selectedRole: '',
//           selectedCity: ''
//         });

//         this.isBranchDisabled = false; // Initial state jab Select Role ho
//         this.selectionForm.get('selectedCity')?.enable();
//       }

//       // SAVE
//       localStorage.setItem('userRole', user.role.name);
//     },
//     error: (err) => {
//       alert(err.error?.message || 'Login Failed');
//     }
//   });
// }
// onRoleChange(): void {
//   const role = this.selectionForm.value.selectedRole;

//   if (role === 'System Administrator') {
//     this.isBranchDisabled = true; // Isse HTML mein hide karenge
//     this.selectionForm.patchValue({ selectedCity: '' });
//     this.selectionForm.get('selectedCity')?.disable();
//   } else {
//     // Branch Administrator ya empty (Select Role) par show hoga
//     this.isBranchDisabled = false; 
//     this.selectionForm.get('selectedCity')?.enable();
//   }
// }


//   // 🚀 FINAL SUBMIT
//   onFinalSubmit(): void {

//   const role = this.selectionForm.value.selectedRole;
//   const branch = this.selectionForm.value.selectedCity;

//   if (!role) {
//     alert('Please select role');
//     return;
//   }

//   if (role === 'Branch Administrator' && !branch) {
//     alert('Please select branch');
//     return;
//   }

//   // 🔥 ACCESS TYPE DECISION
//   let accessType = '';

//   if (role === 'System Administrator') {
//     accessType = 'system';
//   }

//   if (role === 'Branch Administrator') {
//     accessType = 'branch';
//   }

//   // 🔥 CALL BACKEND TO UPDATE CLAIM
//   this.http.post<any>(
//     `${environment.apiUrl}/Auth/set-access-type`,
//     { accessType },
//     {
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem('cavalier_token')}`
//       }
//     }
//   ).subscribe({
//     next: (res) => {

//       // ✅ SAVE NEW TOKEN + ACCESS TYPE
//       localStorage.setItem('cavalier_token', res.token);
//       localStorage.setItem('accessType', res.accessType);

//       // OPTIONAL
//       localStorage.setItem('adminlogin', '1');
//       localStorage.setItem('selectedRole', role);

//       if (accessType === 'branch') {
//         localStorage.setItem('selectedBranch', branch);
//       }

//       // 🚀 REDIRECT
//       this.router.navigate(['/dashboard']);
//     },
//     error: () => {
//       alert('Failed to set access type');
//     }
//   });
// }

// }

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  branches: any[] = [];
  isBranchDisabled = false;
  loginForm!: FormGroup;
  selectionForm!: FormGroup;

  slides = [0, 1, 2];
  currentSlide = 0;

  isStepTwo = false;

  displayUserName = '';
  displayCompanyName = '';

  roles: string[] = [];
  cities: string[] = [];

  // ✅ Password Toggle Variable
  isPasswordVisible: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private c: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.selectionForm = this.fb.group({
      selectedRole: [''],
      selectedCity: ['']
    });

    setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    }, 5000);
  }

  // ✅ Password Toggle Function
  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  setSlide(index: number): void {
    this.currentSlide = index;
  }

  // 🔐 LOGIN STEP (API BASED)
  onNextStep(): void {
    console.log('clicked next step');
    if (this.loginForm.invalid) {
      alert('Email & Password required');
      return;
    }

    this.http.post<any>(
      `${environment.apiUrl}/Auth/login`,
      this.loginForm.value
    ).subscribe({
      next: (res) => {

        const user = res.user;
        this.isStepTwo = true;
        this.c.detectChanges(); // Force UI update for step 2

        // ✅ USER + COMPANY
        this.displayUserName = user.firstName;
        this.displayCompanyName = (user.branches?.[0]?.companyName || '').toUpperCase();

        localStorage.setItem('userName', user.firstName);
        localStorage.setItem('companyName', this.displayCompanyName);
        localStorage.setItem('cavalier_token', res.token);

        // ✅ MASTER ROLE LOGIC
        const userRole = user.role?.name;

if (userRole === 'Master') {

  // 🔥 BOTH ROLES (Master ke liye)
  this.roles = [
    'System Administrator',
    'Branch Administrator'
  ];

  this.branches = user.branches || [];
  console.log(this.branches);

  this.selectionForm.patchValue({
    selectedRole: '',
    selectedCity: ''
  });

  this.isBranchDisabled = false;
  this.selectionForm.get('selectedCity')?.enable();

} else {

  // 🔥 NON-MASTER ke liye sirf Branch Administrator
  this.roles = ['Branch Administrator'];

  this.branches = user.branches || [];
  console.log(this.branches);

  // Default role auto select
  this.selectionForm.patchValue({
    selectedRole: 'Branch Administrator',
    selectedCity: ''
  });

  this.isBranchDisabled = false;
  this.selectionForm.get('selectedCity')?.enable();
}

        // SAVE
        localStorage.setItem('userRole', user.role.name);
      },
      error: (err) => {
        alert(err.error?.message || 'Login Failed');
      }
    });
  }

  onRoleChange(): void {
    const role = this.selectionForm.value.selectedRole;

    if (role === 'System Administrator') {
      this.isBranchDisabled = true; // Isse HTML mein hide karenge
      this.selectionForm.patchValue({ selectedCity: '' });
      this.selectionForm.get('selectedCity')?.disable();
    } else {
      // Branch Administrator ya empty (Select Role) par show hoga
      this.isBranchDisabled = false;
      this.selectionForm.get('selectedCity')?.enable();
    }
  }


  // 🚀 FINAL SUBMIT
  onFinalSubmit(): void {

    const role = this.selectionForm.value.selectedRole;
    const branch = this.selectionForm.value.selectedCity;

    if (!role) {
      alert('Please select role');
      return;
    }

    if (role === 'Branch Administrator' && !branch) {
      alert('Please select branch');
      return;
    }

    // 🔥 ACCESS TYPE DECISION
    let accessType = '';

    if (role === 'System Administrator') {
      accessType = 'system';
    }

    if (role === 'Branch Administrator') {
      accessType = 'branch';
    }
const branchId = this.selectionForm.value.selectedCity;

    // 🔥 CALL BACKEND TO UPDATE CLAIM
    this.http.post<any>(
      `${environment.apiUrl}/Auth/set-access-type`,
      { accessType, branchId },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('cavalier_token')}`
        }
      }
    ).subscribe({
      next: (res) => {

        // ✅ SAVE NEW TOKEN + ACCESS TYPE
        localStorage.setItem('cavalier_token', res.token);
        localStorage.setItem('accessType', res.accessType);

        // OPTIONAL
        localStorage.setItem('adminlogin', '1');
        localStorage.setItem('selectedRole', role);

        if (accessType === 'branch') {
          localStorage.setItem('selectedBranch', branch);
        }

        // 🚀 REDIRECT
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        alert('Failed to set access type');
      }
    });
  }
}