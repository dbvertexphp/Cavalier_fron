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
        console.log('LOGIN RESPONSE:', res);

        const user = res.user;
this.isStepTwo = true;
console.log('STEP TWO ENABLED',this.isStepTwo);

        // ✅ USERNAME
        this.displayUserName = user.firstName;
        localStorage.setItem('userName', user.firstName);

        // ✅ COMPANY NAME
        this.displayCompanyName = user.branch?.companyName || '';
        localStorage.setItem('companyName', this.displayCompanyName);

        // ✅ TOKEN
        localStorage.setItem('token', res.token);

        // ✅ ROLE LOGIC
        if (user.role?.name === 'Admin') {

          this.roles = ['System Administrator'];
          this.cities = []; // city blank
  
          this.selectionForm.patchValue({
            selectedRole: 'System Administrator',
            selectedCity: ''
          });
          this.selectionForm.get('selectedCity')?.disable();

        } else {

          this.roles = ['Branch Administrator'];

          this.selectionForm.patchValue({
            selectedRole: 'Branch Administrator'
          });
        }

        // Save role & branch details
        localStorage.setItem('userRole', user.role.name);
        localStorage.setItem('branchId', user.branch?.id);
        localStorage.setItem('branchCity', user.branch?.city || '');

        
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Login Failed');
      }
    });
  }

  // 🚀 FINAL SUBMIT
  onFinalSubmit(): void {

    const role = this.selectionForm.value.selectedRole;

    localStorage.setItem('adminlogin', '1');

    if (role === 'Branch Administrator') {
      this.router.navigate(['/branchdashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}