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
  loginForm: FormGroup;

  slides = [0, 1, 2]; 
  currentSlide = 0;

  // private apiUrl = 'http://api.cavalierlogistic.graphicsvolume.com/api/Auth/login';

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {
    this.loginForm = this.fb.group({
      systemType: ['', Validators.required], // System Administrator / Branch Administrator
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit() {
    setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    }, 5000);
  }

  setSlide(index: number) {
    this.currentSlide = index;
  }

 onSubmit() {
const email = this.loginForm.value.email;
  const password = this.loginForm.value.password;
  const access = this.loginForm.value.systemType;

  if (
    email === 'admin@cavalierlogistic.com' &&
    password === '123456' &&
    access === 'System Administrator'
  ) {
    // login success
    localStorage.setItem('adminlogin', '1');
    alert('Login Successful');
    this.router.navigate(['/dashboard']);
  } else {
    // login failed
    alert('Invalid Email, Password or Access');
  }
}


}
