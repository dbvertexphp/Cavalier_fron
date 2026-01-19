import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  
  // Data for the carousel/dots
  slides = [0, 1, 2]; 
  currentSlide = 0;

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      // We set the default value to an empty string so the 'required' validator works properly
      systemType: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit() {
    // Auto-play the slides every 5 seconds for the "Seamless Collaboration" section
    setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    }, 5000);
  }

  /**
   * Allows users to click on dots to change the slide manually
   */
  setSlide(index: number) {
    this.currentSlide = index;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Form data:', this.loginForm.value);
      // Navigate to the dashboard. 
      // NOTE: Ensure this spelling matches path: 'Dashboard' in your app.routes.ts
      this.router.navigate(['/Dashboard']);
    } else {
      // Highlights the input fields if they are empty
      this.loginForm.markAllAsTouched();
    }
  }
}