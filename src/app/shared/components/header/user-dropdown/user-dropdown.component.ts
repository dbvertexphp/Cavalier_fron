import { Component, OnInit } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DropdownItemTwoComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component-two';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-dropdown',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    DropdownComponent, 
    DropdownItemTwoComponent, 
    HttpClientModule,
    FormsModule
  ],
  templateUrl: './user-dropdown.component.html'
})
export class UserDropdownComponent implements OnInit {
  firstName: string = 'Loading...'; 
  lastName: string = '';
  userName: string = 'User'; 
  email: string = '...';
  gender: string = "Male";
  isOpen = false;

  // Password Modal Variables
  showPasswordModal = false;
  showPass1 = false; showPass2 = false; showPass3 = false;
  passData = { currentPassword: '', newPassword: '', confirmPassword: '' };

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit() {
    this.fetchUserData();
  }

  fetchUserData() {
    const token = localStorage.getItem('cavalier_token');
    const apiUrl = `${environment.apiUrl}/Auth/me`;
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any>(apiUrl, { headers }).subscribe({
      next: (res) => {
        this.firstName = res.firstName || res.userName || 'Admin';
        this.lastName = res.lastName || '';
        this.userName = res.userName || this.firstName;
        this.email = res.email || 'user@cavalier.com';
        this.gender = res.gender || 'Male';
        localStorage.setItem('userName', this.userName);
        localStorage.setItem('gender', this.gender);
      },
      error: (err) => {
        console.error('Data fetch error:', err);
      }
    });
  }

  // YE WALA METHOD HTML SE CALL HO RAHA HAI
  changePassword() {
    this.showPasswordModal = true;
  }

  submitPassword() {
    if (!this.passData.currentPassword || !this.passData.newPassword || !this.passData.confirmPassword) {
      Swal.fire('Error', 'Please fill all fields', 'warning');
      return;
    }

    const token = localStorage.getItem('cavalier_token');
    const headers = new HttpHeaders({ 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' 
    });

    this.http.post(`${environment.apiUrl}/Auth/change-password`, this.passData, { headers }).subscribe({
      next: () => {
        this.showPasswordModal = false;
        Swal.fire('Success', 'Password updated! Please login again.', 'success').then(() => this.logout());
      },
      error: (err) => Swal.fire('Error', err.error?.message || 'Update failed', 'error')
    });
  }

  toggleDropdown() { this.isOpen = !this.isOpen; }
  
  closeDropdown() { this.isOpen = false; }

  logout() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}