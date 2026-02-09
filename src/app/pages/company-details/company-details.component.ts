import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-company-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company-details.component.html'
})
export class CompanyDetailsComponent {
  // Company name ko read-only rakhne ke liye variable
  isReadOnly: boolean = true;

  companyData = {
    name: 'CAVALIER LOGISTICS PRIVATE LIMITED',
    country: 'India',
    timeZone: '(GMT+05:30), Chennai, Kolkata, Mumbai, New Delhi',
    currency: 'INR',
    localLanguage: 'English',
    logo: 'images/assets/logo.png', // Aapka bataya hua path
    smallLogo: ''
  };

  // Edit button toggle function
  toggleEdit() {
    this.isReadOnly = !this.isReadOnly;
  }

  // Logo change karne ke liye function
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.companyData.logo = e.target.result; // Real-time preview update
      };
      reader.readAsDataURL(file);
    }
  }

  onSave() {
    this.isReadOnly = true; // Save ke baad wapas lock
    console.log('Data Saved:', this.companyData);
    alert('Company details and logo updated successfully!');
  }
}