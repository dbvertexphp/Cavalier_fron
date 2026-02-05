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

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.loadUsers(); 
  }

  loadUsers() {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (data: any[]) => {
        this.users = data;
        this.loading = false;
        this.resetSelection();
      },
      error: (err) => {
        console.error("Data fetch error:", err);
        this.loading = false;
      }
    });
  }

  addUser() {
    this.router.navigate(['/dashboard/register-user'], { 
      state: { isEdit: false } 
    });
  }

  modifyUser() {
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

  deleteUser() {
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