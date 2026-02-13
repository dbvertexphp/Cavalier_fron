import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  users: any[] = []; 
  loading = true;
  showCheckbox = false;
  selectionType: 'checkbox' | 'radio' | null = null;
  selectedUser: any = null; 
  selectedUsers: any[] = []; 
  newEmployeeID:any=0;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.loadUsers(); 
  }

//   loadUsers(userType: string = 'all') {
//   this.loading = true;

//   this.userService.getUsers(userType).subscribe({
//     next: (data: any[]) => {
//       this.users = data;
//       this.loading = false;
//       this.resetSelection();
//     },
//     error: (err) => {
//       console.error("Data fetch error:", err);
//       this.loading = false;
//     }
//   });
// }

loadUsers(userType: string = 'all') {
  this.loading = true;

  this.userService.getUsers(userType).subscribe({
    next: (data: any[]) => {
      this.users = data;
      this.loading = false;
      this.resetSelection();

      // --- START GENERATION LOGIC ---
     
      // --- END GENERATION LOGIC ---
    },
    error: (err) => {
      console.error("Data fetch error:", err);
      this.loading = false;
    }
  });
}

/**
 * Logic to find the highest ID in the current list and increment it.
 * Assumes your user object has a numeric property like 'empId'.
 */


  addUser() {
    this.router.navigate(['/dashboard/register-user'], { 
      state: { isEdit: false } 
      
    });
  }

  // ✅ Updated to accept a specific user object from the table
  modifyUser(user?: any) {
    // If a user is passed directly from the table button
    if (user) {
      this.router.navigate(['/dashboard/register-user'], { 
        state: { data: user, isEdit: true } 
      });
      return;
    }

    // Original logic kept for compatibility
    if (this.selectionType !== 'radio' || !this.showCheckbox) {
      this.showCheckbox = true;
      this.selectionType = 'radio';
      this.selectedUsers = [];
      return;
    }

    if (this.selectedUser) {
      this.router.navigate(['/dashboard/register-user'], { 
        state: { data: this.selectedUser, isEdit: true } 
      });
    } else {
      alert("Please select a user to modify.");
    }
  }

  // ✅ Updated to accept a specific ID from the table button
  deleteUser(id?: number) {
    // If an ID is passed directly from the table button
    if (id) {
      if (confirm(`Are you sure you want to delete this user?`)) {
        this.loading = true;
        this.userService.deleteUser(id).subscribe({
          next: () => {
            alert('User deleted successfully');
            this.loadUsers();
          },
          error: (err) => {
            console.error("Delete Error:", err);
            alert('Error deleting user.');
            this.loading = false;
          }
        });
      }
      return;
    }

    // Original logic kept for compatibility
    if (this.selectionType !== 'checkbox' || !this.showCheckbox) {
      this.showCheckbox = true;
      this.selectionType = 'checkbox';
      this.selectedUser = null;
      return;
    }

    if (this.selectedUsers.length > 0) {
      this.confirmDelete();
    } else {
      alert("Please select at least one user to delete.");
    }
  }

  confirmDelete() {
    const count = this.selectedUsers.length;
    if (confirm(`Are you sure you want to delete ${count} user(s)?`)) {
      this.loading = true;
      const deleteRequests = this.selectedUsers.map(u => 
        this.userService.deleteUser(u.id).toPromise()
      );

      Promise.all(deleteRequests).then(() => {
        alert('Users deleted successfully');
        this.loadUsers(); 
      }).catch(err => {
        console.error("Delete Error:", err);
        alert('Error deleting some users.');
        this.loading = false;
      });
    }
  }

  toggleSelection(user: any, event: any) {
    if (this.selectionType === 'checkbox') {
      if (event.target.checked) {
        this.selectedUsers.push(user);
      } else {
        this.selectedUsers = this.selectedUsers.filter(u => u.id !== user.id);
      }
    } else if (this.selectionType === 'radio') {
      this.selectedUser = user;
    }
  }

  resetSelection() {
    this.showCheckbox = false;
    this.selectionType = null;
    this.selectedUser = null;
    this.selectedUsers = [];
  }
}