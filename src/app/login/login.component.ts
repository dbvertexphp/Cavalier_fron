import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Import HttpClient
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  // Added HttpClientModule to imports
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = ''; 
  
  // Define the API URL variable
  private apiUrl = 'https://your-api-url.com/api/login'; 

  slides = [0, 1, 2]; 
  currentSlide = 0;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private authService: AuthService,
    private http: HttpClient // Inject HttpClient here
  ) {
    this.loginForm = this.fb.group({
      systemType: ['', Validators.required], 
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    }, 5000);
  }

  setSlide(index: number): void {
    this.currentSlide = index;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    const loginData = {
      Email: this.loginForm.get('email')?.value,
      Password: this.loginForm.get('password')?.value,
      Access: this.loginForm.get('systemType')?.value 
    };

    // API Call
    this.http.post(this.apiUrl, loginData).subscribe({
      next: (res: any) => {
        console.log('Login success:', res);
        alert(res.message || 'Login successful');
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => { // Added type 'any' to fix the implicit any error
        console.error('Login failed:', err);
        
        // Check for your specific "Email already exists" or "Invalid credentials" error
        const message = err.error?.message || 'Login failed';
        alert(message);

        // Fallback: Hardcoded admin check if API fails or for testing
        this.checkHardcodedAdmin(loginData);
      }
    });
  }

  // Moved hardcoded check to a separate method for cleaner code
  private checkHardcodedAdmin(data: any) {
    if (
      data.Email === 'admin@gmail.com' &&
      data.Password === '123456' &&
      data.Access === 'System Administrator'
    ) {
      alert('Admin Login Successful (Local Bypass)');
      this.router.navigate(['/dashboard']);
    }
  }
}