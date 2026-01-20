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

  private apiUrl = 'http://api.cavalierlogistic.graphicsvolume.com/api/Auth/login';

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
    Email: this.loginForm.get('email')?.value,
    Password: this.loginForm.get('password')?.value,
    Access: this.loginForm.get('systemType')?.value     // system type
  };

  this.http.post(this.apiUrl, loginData, {
    headers: { 'Content-Type': 'application/json' }
  }).subscribe({
    next: (res: any) => {
      console.log('Login success:', res);
      alert(res.message);
       this.router.navigate(['/dashboard']);
    },
    error: (err) => {
      console.error('Login failed:', err);
      alert(err.error?.message || 'Login failed');
    }
  });
}

}
