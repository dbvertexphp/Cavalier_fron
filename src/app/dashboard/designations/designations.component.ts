import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-designations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './designations.component.html',
  styleUrl: './designations.component.css',
})
export class DesignationsComponent implements OnInit {
  isModalOpen = false;
  isLoading = false;
  isSaving = false; 
  isEditMode = false;
  currentDesignationId: number | null = null; 
  
  designationList: any[] = []; 
  departments: any[] = [];
  newDesignation = { name: '', departmentId: '' }; 

  constructor(private userService: UserService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadDesignations();
    this.loadDepartments();
  }

  loadDesignations() {
    this.isLoading = true;
    this.userService.getDesignations().subscribe({
      next: (res: any[]) => {
        if (Array.isArray(res)) {
          this.designationList = res.map(d => ({
            id: d.id || d.Id,
            name: d.name || d.Name,
            departmentId: d.departmentId || d.DepartmentId,
            departmentName: d.departmentName || d.DepartmentName || 'N/A'
          }));
        }
        this.isLoading = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('API Error:', err);
        this.isLoading = false;
      }
    });
  }

  loadDepartments() {
    this.userService.getDepartments().subscribe({
      next: (res: any[]) => { 
        this.departments = res.map(d => ({ 
          id: d.id || d.Id, 
          name: d.name || d.Name 
        })); 
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading departments:', err)
    });
  }

  addDesignation() {
    if (!this.newDesignation.name || !this.newDesignation.departmentId) {
      alert("Please fill in all required details.");
      return;
    }

    this.isSaving = true;
    const payload: any = {
      Name: this.newDesignation.name.trim(),
      DepartmentId: Number(this.newDesignation.departmentId)
    };

    if (this.isEditMode && this.currentDesignationId) {
      // Logic for updating existing record
      payload.Id = this.currentDesignationId;
      this.userService.updateDesignation(payload).subscribe({
        next: () => this.handleSuccess("Designation updated successfully!"),
        error: (err) => this.handleError(err)
      });
    } else {
      // Logic for adding new record
      this.userService.addDesignation(payload).subscribe({
        next: () => this.handleSuccess("Designation added successfully!"),
        error: (err) => this.handleError(err)
      });
    }
  }

  editDesignation(desig: any) {
    this.isEditMode = true;
    this.currentDesignationId = desig.id;
    this.newDesignation = { 
      name: desig.name, 
      departmentId: desig.departmentId?.toString() || '' 
    };
    this.openModal();
  }

  deleteDesignation(id: number) {
    if (confirm('Are you sure you want to delete this designation?')) {
      this.userService.deleteDesignation(id).subscribe({
        next: () => { 
          alert("Designation deleted successfully!"); 
          this.loadDesignations(); 
        },
        error: (err) => {
          console.error("Delete Error:", err);
          alert("Failed to delete designation. Please try again.");
        }
      });
    }
  }

  private handleSuccess(msg: string) {
    alert(msg);
    this.loadDesignations();
    this.closeModal();
    this.isSaving = false;
  }

  private handleError(err: any) {
    console.error("Backend Error Detail:", err);
    // Generic error message if DepartmentId validation fails
    alert("Operation failed. Please ensure the selected Department exists in the database."); 
    this.isSaving = false;
  }

  openModal() { this.isModalOpen = true; }
  
  closeModal() { 
    this.isModalOpen = false; 
    this.isEditMode = false;
    this.currentDesignationId = null;
    this.newDesignation = { name: '', departmentId: '' }; 
    this.isSaving = false;
  }
}