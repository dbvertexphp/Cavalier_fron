/*import { Component, OnInit } from '@angular/core';
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
      `${environment.apiUrl}/Admin/login`,
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
}*/



import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
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
  isLoading = false; // ✅ Loading state handle karne ke liye

  displayUserName = '';
  displayCompanyName = '';

  roles: string[] = [];
  cities: string[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private ngZone: NgZone,        // ✅ UI fast update ke liye
    private cdr: ChangeDetectorRef // ✅ Manual refresh ke liye
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['admin@cavalierlogistic.in', [Validators.required, Validators.email]], // ✅ Pre-filled email as per instructions
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

  // 🔐 LOGIN STEP (FIXED: NO MORE DOUBLE CLICK)
  onNextStep(): void {
    if (this.loginForm.invalid) {
      alert('Email & Password required');
      return;
    }

    this.isLoading = true; // ✅ Button freeze karein

    this.http.post<any>(
      `${environment.apiUrl}/Admin/login`,
      this.loginForm.value
    ).subscribe({
      next: (res) => {
        // ✅ NgZone Angular ko jagata hai ki data aa gaya hai
        this.ngZone.run(() => {
          console.log('LOGIN RESPONSE:', res);
          const user = res.user;

          // Token aur User details save karein
          localStorage.setItem('token', res.token);
          localStorage.setItem('userName', user.firstName);
          localStorage.setItem('companyName', user.branch?.companyName || '');
          localStorage.setItem('userRole', user.role?.name);
          localStorage.setItem('branchId', user.branch?.id);
          localStorage.setItem('branchCity', user.branch?.city || '');

          // Role setup
          if (user.role?.name === 'Admin') {
            this.roles = ['System Administrator'];
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

          this.isStepTwo = true; // ✅ Step 2 active karein
          this.isLoading = false;
          this.cdr.detectChanges(); // ✅ Screen update force karein
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.isLoading = false;
          console.error('Login error:', err); //
          alert(err.error?.message || 'Login Failed. Check Connection.');
          this.cdr.detectChanges();
        });
      }
    });
  }

  // 🚀 FINAL SUBMIT (FAST NAVIGATION)
  onFinalSubmit(): void {
    const role = this.selectionForm.value.selectedRole;
    localStorage.setItem('adminlogin', '1');

    const route = (role === 'Branch Administrator') ? '/branchdashboard' : '/dashboard';
    
    // ✅ Navigation ko fast zone mein chalayein
    this.ngZone.run(() => {
      this.router.navigate([route]);
    });
  }
}



      
