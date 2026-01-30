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
  selectionForm: FormGroup;
  
  // Slide tracking
  slides = [0, 1, 2]; 
  currentSlide = 0;
  
  // Step tracking
  isStepTwo: boolean = false; 

  // Dynamic User Name
  displayUserName: string = '';

  // Dropdown options
  roles = ['System Administrator', 'Branch Administrator'];
  cities = ['Indore', 'Delhi', 'Mumbai', 'Bangalore', 'Chennai'];

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {
    // Step 1: Login Form
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Step 2: Role & City Selection Form
    this.selectionForm = this.fb.group({
      selectedRole: ['', Validators.required],
      selectedCity: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Background Slider
    setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    }, 5000);

    // Agar page refresh ho toh localStorage se naam wapas nikalne ke liye
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      this.displayUserName = savedName;
    }
  }

  setSlide(index: number): void {
    this.currentSlide = index;
  }

  // Pehle Step ka function (Email/Password Verification)
  /*onNextStep(): void {
    if (this.loginForm.invalid) {
      alert('Please fill email and password correctly.');
      return;
    }

    const { email, password } = this.loginForm.value;

    // Hardcoded authentication check
    if (email === 'admin@cavalierlogistic.com' && password === '123456') {
      
      // --- DYNAMIC NAME LOGIC ---
      // 1. Email se name nikalna (admin@cavalier... -> admin)
      const namePart = email.split('@')[0]; 
      // 2. First letter Capitalize karna (admin -> Admin)
      this.displayUserName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      // 3. Save for persistence
      localStorage.setItem('userName', this.displayUserName);

      this.isStepTwo = true; 
    } else {
      alert('Invalid Email or Password. Please try again.');
    }
  }*/
 // Component ke andar variable declare karein
displayCompanyName: string = '';

onNextStep(): void {
  if (this.loginForm.invalid) {
    alert('Please fill email and password correctly.');
    return;
  }

  const { email, password } = this.loginForm.value;

  // Hardcoded Check (Real scenario mein ye API response se aayega)
  if (email === 'admin@cavalierlogistic.in' && password === '123456') {
    
    // 1. Name Logic
    const namePart = email.split('@')[0];
    this.displayUserName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    
    // 2. DYNAMIC COMPANY LOGIC
    // Agar email mein 'cavalier' hai toh 'Cavalier Logistics' dikhao
    if (email.includes('cavalier')) {
      this.displayCompanyName = 'Cavalier Logistics Private Limited';
    } else {
      this.displayCompanyName = 'Logi-Sys Global'; // Default company
    }

    // Storage mein save karein
    localStorage.setItem('userName', this.displayUserName);
    localStorage.setItem('companyName', this.displayCompanyName);

    this.isStepTwo = true; 
  } else {
    alert('Invalid Email or Password.');
  }
}

  // Dusre Step ka function (Conditional Routing based on Role)
  onFinalSubmit(): void {
    console.log("Submit button clicked!"); 
    console.log("Form Values:", this.selectionForm.value); 

    if (this.selectionForm.invalid) {
      console.log("Form is Invalid!"); 
      alert('Please select both Role and City.');
      return;
    }

    const role = this.selectionForm.value.selectedRole;
    const city = this.selectionForm.value.selectedCity;

    // Session details save karna
    localStorage.setItem('adminlogin', '1');
    localStorage.setItem('userRole', role);
    localStorage.setItem('userCity', city);

    console.log("Role Selected:", role);

    if (role === 'Branch Administrator') {
      console.log("Navigating to Branch Dashboard...");
      this.router.navigate(['/branchdashboard']);
    } else {
      console.log("Navigating to System Dashboard...");
      this.router.navigate(['/dashboard']);
    }
  }
}