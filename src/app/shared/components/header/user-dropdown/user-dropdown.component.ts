import { Component, OnInit } from '@angular/core'; // OnInit add kiya
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DropdownItemTwoComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component-two';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  standalone: true, // Agar standalone hai toh
  imports: [CommonModule, RouterModule, DropdownComponent, DropdownItemTwoComponent]
})
export class UserDropdownComponent implements OnInit {
  userName: string = 'Cavalier Admin'; // Default value
  isOpen = false;

  constructor(private router: Router) { }

  ngOnInit() {
    // Local storage se userName nikal kar variable mein set kiya
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      this.userName = storedName;
    }
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  logout() {
    localStorage.removeItem('adminlogin');
    localStorage.removeItem('userRole');
    localStorage.removeItem('session_expiry_time');
    localStorage.removeItem('userName'); // Safai ke liye ye bhi remove kar sakte hain
    this.router.navigate(['/']);
  }

  closeDropdown() {
    this.isOpen = false;
  }
}