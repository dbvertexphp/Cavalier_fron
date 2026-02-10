import { Component, OnInit } from '@angular/core';
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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {}

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

  setSlide(index: number): void {
    this.currentSlide = index;
  }

  // 🔐 LOGIN STEP (API BASED)
  onNextStep(): void {
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

      // ✅ USER + COMPANY
      this.displayUserName = user.firstName;
      this.displayCompanyName = user.branches?.[0]?.companyName || '';

      localStorage.setItem('userName', user.firstName);
      localStorage.setItem('companyName', this.displayCompanyName);
      localStorage.setItem('cavalier_token', res.token);

      // ✅ MASTER ROLE LOGIC
      if (user.role?.name === 'Master') {

        // 🔥 BOTH ROLES
        this.roles = [
          'System Administrator',
          'Branch Administrator'
        ];

        // 🔥 BRANCHES FROM API
        this.branches = user.branches || [];

        this.selectionForm.patchValue({
          selectedRole: '',
          selectedCity: ''
        });

        this.isBranchDisabled = true;
        this.selectionForm.get('selectedCity')?.disable();
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
    this.isBranchDisabled = true;
    this.selectionForm.patchValue({ selectedCity: '' });
    this.selectionForm.get('selectedCity')?.disable();
  }

  if (role === 'Branch Administrator') {
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

  // 🔥 CALL BACKEND TO UPDATE CLAIM
  this.http.post<any>(
    `${environment.apiUrl}/Auth/set-access-type`,
    { accessType },
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