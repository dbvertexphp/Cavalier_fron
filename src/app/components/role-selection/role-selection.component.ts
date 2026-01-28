import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-selection.component.html'
})
export class RoleSelectionComponent {
  selectedRole: string = '';

  constructor(private router: Router) {}

  submitRole() {
    if (this.selectedRole) {
      // Role select karne ke baad dashboard par bhejein
      this.router.navigate(['/dashboard']);
    } else {
      alert('Please select a system type');
    }
  }
}