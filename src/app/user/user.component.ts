import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule   // 🔥 YE ADD KARNA HI KARNA HAI
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css',
})
export class UserComponent {

  users = [
    {
      name: 'Admin User',
      role: 'Admin',
      department: 'Administration',
      licenseType: 'Enterprise',
      country: 'India',
      dob: '1995-08-15',
      gender: 'Male',
      userType: 'Internal',
      reportTo: 'Super Admin',
      status: true,
      ipAddress: '192.168.1.10',
      telephone: '011-23345678',
      mobile: '+91-9876543210',
      profilePicture: 'assets/user.png'
    }
  ];
}
