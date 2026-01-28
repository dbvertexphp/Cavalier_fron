import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Router import kiya
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
  showCheckbox = false;
  selectionType: 'checkbox' | 'radio' | null = null;
  selectedUser: any = null; 
  selectedUsers: any[] = []; 

  // Constructor mein Router add kiya
  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.loadUsers(); 
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data: any[]) => {
        this.users = data;
        console.log('Database Data:', this.users);
      },
      error: (err) => console.error("Data fetch error:", err)
    });
  }

  // Ab ye button alert ke baad page change karega
  addUser() {
    this.router.navigate(['/dashboard/register-user']);
  }

  deleteUser() {
    this.showCheckbox = !this.showCheckbox;
    this.selectionType = 'checkbox';
    this.selectedUsers = [];
  }

 modifyUser() {
  if (this.selectionType === 'radio' && this.selectedUser) {
    // Selected user ka data navigation ke saath bhej rahe hain
    this.router.navigate(['/dashboard/register-user'], { 
      state: { data: this.selectedUser, isEdit: true } 
    });
  } else {
    this.showCheckbox = true;
    this.selectionType = 'radio';
    alert("Please select a user to modify");
  }
}

  toggleSelection(user: any, event: any) {
    if (this.selectionType === 'checkbox') {
      if (event.target.checked) {
        this.selectedUsers.push(user);
      } else {
        this.selectedUsers = this.selectedUsers.filter(u => u !== user);
      }
    } else if (this.selectionType === 'radio') {
      this.selectedUser = user;
    }
  }

  confirmDelete() {
    if (this.selectedUsers.length === 0) return;
    if(confirm(`Are you sure you want to delete ${this.selectedUsers.length} users?`)) {
      this.selectedUsers.forEach(user => {
        this.userService.deleteUser(user.id).subscribe(() => {
          this.loadUsers();
        });
      });
      this.showCheckbox = false;
      this.selectedUsers = [];
    }
  }
}