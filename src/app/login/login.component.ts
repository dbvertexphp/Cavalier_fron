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
  

  const loginData = {
    email: this.loginForm.value.email,
    password: this.loginForm.value.password,
    access: this.loginForm.value.systemType
  };

  this.http.post(
    `${environment.apiUrl}/Auth/login`,
    loginData
  ).subscribe({
    next: (res: any) => {
      alert(res.message || 'Login Successful');
       localStorage.setItem('adminlogin', '1');
      this.router.navigate(['/dashboard']);
    },
    error: (err) => {
      alert(err.error?.message || 'Login failed');
    }
  });
}


}
