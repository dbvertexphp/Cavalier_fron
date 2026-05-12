import { Component, OnInit } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DropdownItemTwoComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component-two';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    DropdownComponent, 
    DropdownItemTwoComponent, 
    HttpClientModule
  ]
})
export class UserDropdownComponent implements OnInit {
  // Error fix karne ke liye ye variables define karna zaroori hai
  firstName: string = 'Loading...'; 
  lastName: string = '';
  userName: string = 'User'; 
  email: string = '...';
  gender: string = "Male";
  isOpen = false;

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit() {
    this.fetchUserData();
  }

  fetchUserData() {
    const token = localStorage.getItem('cavalier_token');
    const apiUrl = `${environment.apiUrl}/Auth/me`;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any>(apiUrl, { headers }).subscribe({
      next: (res) => {
        // API response ke data ko variables mein assign karna
        this.firstName = res.firstName || res.userName || 'Admin';
        this.lastName = res.lastName || '';
        this.userName = res.userName || this.firstName;
        this.email = res.email || 'user@cavalier.com';
        this.gender = res.gender || 'Male';

        localStorage.setItem('userName', this.userName);
        localStorage.setItem('gender', this.gender);
      },
      error: (err) => {
        console.error('Data fetch karne mein error:', err);
        // Error hone par local storage ya default value
        this.firstName = 'Cavalier';
        this.lastName = 'Admin';
        this.gender = localStorage.getItem('gender') || 'Male';
      }
    });
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  logout() {
    localStorage.clear(); // Saara data clean karne ke liye best hai
    this.router.navigate(['/']);
  }

  closeDropdown() {
    this.isOpen = false;
  }
}