import { Component } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DropdownItemTwoComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component-two';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  imports:[CommonModule,RouterModule,DropdownComponent,DropdownItemTwoComponent]
})
export class UserDropdownComponent {
    constructor(private router: Router) { }
  isOpen = false;

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }
  logout() {
  localStorage.removeItem('adminlogin');  // adminlogin remove kar diya
  this.router.navigate(['']);
}


  closeDropdown() {
    this.isOpen = false;
  }
}