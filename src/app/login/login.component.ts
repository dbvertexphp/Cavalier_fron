import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-login',
  standalone: true,
  // Added HttpClientModule to imports
  imports: [CommonModule, FormsModule, ReactiveFormsModule,], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoggedIn = true;
  selectedSystemType = true;
  slides = [0, 1, 2]; 
  currentSlide = 0;

  // private apiUrl = 'http://api.cavalierlogistic.graphicsvolume.com/api/Auth/login';

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {
    this.loginForm = this.fb.group({
      //systemType: ['', Validators.required], // System Administrator / Branch Administrator
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
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
  

  const payload = {
    email: this.loginForm.value.email,
    password: this.loginForm.value.password,
   
  };

  const url = `${environment.apiUrl}/api/Auth/login`;

  this.http.post<any>(url, payload).subscribe({
    next: (res) => {
      // assuming API returns token & user data
      localStorage.setItem('token', res.token);
       localStorage.setItem('user', JSON.stringify(res.user));
     

      alert('Login Successful');
      this.router.navigate(['/dashboard']);
    },
    error: (err) => {
      localStorage.setItem('token', 'fdfdfdfdfdf');
      console.error(err);
      alert(err?.error?.message || 'Invalid Email, Password or Access');
    }
  });
}



}
