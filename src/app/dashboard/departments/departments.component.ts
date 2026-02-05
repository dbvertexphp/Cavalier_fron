import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departments.component.html',
  styleUrl: './departments.component.css',
})
export class DepartmentsComponent implements OnInit {
  isModalOpen = false;
  departments: any[] = []; 
  newDept = { name: '' };
  isLoading = false; 

  constructor(
    private userService: UserService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments() {
    this.userService.getDepartments().subscribe({
      next: (res: any[]) => {
        if (Array.isArray(res)) {
          // Backend mapping fix: d.id aur d.name (jo aapne backend mein select kiya hai)
          this.departments = res.map((d: any) => ({
            id: d.id || d.Id || 0, 
            name: d.name || d.Name || 'Unknown',
            count: d.count || d.EmployeeCount || 0
          }));
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error("Error loading departments:", err)
    });
  }

  addDepartment() {
  if (!this.newDept.name.trim()) return;
  this.isLoading = true;

  // FIX: Sirf naam bhejna hai, object nahi
  this.userService.addDepartment(this.newDept.name).subscribe({
    next: (res: any) => {
      this.ngZone.run(() => {
        const newEntry = {
          id: res.id || res.Id, 
          name: res.name || this.newDept.name,
          count: 0
        };

        this.departments.unshift(newEntry);
        this.closeModal();
        this.isLoading = false;
        this.cdr.detectChanges();
      });
    },
    error: (err) => {
      console.error("Add Error:", err);
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  });
}

  deleteDept(id: number) {
    if (!id || id === 0) {
      alert("Error: Department ID is missing (ID: " + id + ")");
      return;
    }

    if (confirm('Are you sure you want to delete this department?')) {
      this.userService.deleteDepartment(id).subscribe({
        next: () => {
          // Frontend se delete karein refresh bina
          this.departments = this.departments.filter(d => d.id !== id);
          this.cdr.detectChanges();
          alert('Department deleted successfully!');
        },
        error: (err: any) => {
          console.error("Delete Error:", err);
          alert('Delete failed! Ensure you have created the Delete API in backend.');
        }
      });
    }
  }

  openModal() { this.isModalOpen = true; }
  
  closeModal() { 
    this.isModalOpen = false; 
    this.newDept.name = ''; 
  }
}