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
  isEditMode = false; // Track if we are editing
  isLoading = false; 
  currentDeptId: number | null = null; // Store ID for update

  departments: any[] = []; 
  newDept = { name: '' };

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

  // ✅ Unified Save function for both Add and Edit
  saveDepartment() {
    if (!this.newDept.name.trim()) return;
    this.isLoading = true;

    if (this.isEditMode && this.currentDeptId) {
      // Logic for Update
      this.userService.updateDepartment(this.currentDeptId, this.newDept.name).subscribe({
        next: (res: any) => {
          alert('Department updated successfully!');
          this.loadDepartments(); // Refresh list
          this.closeModal();
        },
        error: (err) => {
          console.error("Update Error:", err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      // Logic for Add
      this.userService.addDepartment(this.newDept.name).subscribe({
        next: (res: any) => {
          alert('Department added successfully!');
          this.loadDepartments();
          this.closeModal();
        },
        error: (err) => {
          console.error("Add Error:", err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  // ✅ Open modal for editing
  editDept(dept: any) {
    this.isEditMode = true;
    this.currentDeptId = dept.id;
    this.newDept.name = dept.name;
    this.isModalOpen = true;
  }

  deleteDept(id: number) {
    if (!id || id === 0) {
      alert("Error: Department ID is missing.");
      return;
    }

    if (confirm('Are you sure you want to delete this department?')) {
      this.userService.deleteDepartment(id).subscribe({
        next: () => {
          this.departments = this.departments.filter(d => d.id !== id);
          this.cdr.detectChanges();
          alert('Department deleted successfully!');
        },
        error: (err: any) => {
          console.error("Delete Error:", err);
          alert('Delete failed!');
        }
      });
    }
  }

  openModal() { 
    this.isEditMode = false;
    this.newDept.name = '';
    this.isModalOpen = true; 
  }
  
  closeModal() { 
    this.isModalOpen = false; 
    this.isEditMode = false;
    this.newDept.name = ''; 
    this.isLoading = false;
    this.currentDeptId = null;
  }
}