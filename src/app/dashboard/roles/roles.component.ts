import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css',
})
export class RolesComponent {
  isModalOpen = false;
  
  // Modal mein dikhane ke liye permissions list
  availablePermissions = [
    { name: 'View', selected: false },
    { name: 'Edit', selected: false },
    { name: 'Delete', selected: false },
    { name: 'Settings', selected: false },
    { name: 'Security', selected: false },
    { name: 'Reports', selected: false }
  ];

  // Form Model
  newRole = {
    name: ''
  };

rolesList = [
  { name: 'System Administrator', perms: ['All', 'Settings', 'Security'] },
  { name: 'Branch Administrator', perms: ['Branch View', 'User Edit'] },
  { name: 'HR Manager', perms: ['Payroll', 'Leave Approval'] },
  { name: 'Employee', perms: ['View Profile', 'Attendance'] }
];

showPopup = false;
roleIndexToDelete: number | null = null;

deleteRole(index: number) {
  this.roleIndexToDelete = index;
  this.showPopup = true;
}

confirmDelete() {
  if (this.roleIndexToDelete !== null) {
    this.rolesList.splice(this.roleIndexToDelete, 1);
    this.roleIndexToDelete = null;
  }
  this.showPopup = false;
}

cancelDelete() {
  this.roleIndexToDelete = null;
  this.showPopup = false;
}

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.newRole.name = '';
    // Checkboxes ko reset karna
    this.availablePermissions.forEach(p => p.selected = false);
  }

  addRole() {
    if (this.newRole.name.trim()) {
      // Sirf wahi permissions pick karein jo check ki gayi hain
      const selectedPerms = this.availablePermissions
        .filter(p => p.selected)
        .map(p => p.name);

      this.rolesList.unshift({
        name: this.newRole.name,
        perms: selectedPerms.length > 0 ? selectedPerms : ['View Only']
      });

      this.closeModal();
    } else {
      alert("Role ka naam likhna zaroori hai!");
    }
  }

  
  editRole(role: any) {
    alert('Editing: ' + role.name);
  }
}