import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  slides = [0, 1, 2]; 
  currentSlide = 0;

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {
    this.loginForm = this.fb.group({
      // Role selection hatane ke liye systemType ko remove kiya gaya hai
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Background slider logic
    setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    }, 5000);
  }

  setSlide(index: number) {
    this.currentSlide = index;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      alert('Please fill all fields correctly.');
      return;
    }

    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;

    // Hardcoded check for admin credentials
    if (email === 'admin@cavalierlogistic.com' && password === '123456') {
      
      // Login Success Logic
      localStorage.setItem('adminlogin', '1'); 
      alert('Login Successful!');
      
      // Seedha dashboard par navigation (select-role skip kar diya)
      this.router.navigate(['/dashboard']); 
      
    } else {
      // Login Failed Logic
      alert('Invalid Email or Password');
    }
  }
}