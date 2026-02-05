import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ecommerce',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ecommerce.component.html',
})
export class EcommerceComponent implements OnInit {
  lastLoginUser: any = null;
  loginTime: string = '';

  ngOnInit() {
    // Fetching logged-in user data from storage
    const userData = localStorage.getItem('user'); 
    if (userData) {
      this.lastLoginUser = JSON.parse(userData);
    } else {
      // Fallback for testing purposes [cite: 2026-02-02]
      this.lastLoginUser = {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@cavalierlogistic.in',
        userType: 'Super Admin'
      };
    }
    
    // Formatting the current login time
    this.loginTime = new Date().toLocaleString('en-US', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  }
}