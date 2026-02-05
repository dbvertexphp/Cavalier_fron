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
  designationList: any[] = []; 
  departments: any[] = [];

  // Backend property names se match karne ke liye model
  newDesignation = { name: '', departmentId: '' }; 

  constructor(
    private userService: UserService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDesignations();
    this.loadDepartments();
  }

  loadDesignations() {
    this.userService.getDesignations().subscribe({
      next: (res: any[]) => {
        // Fallback mapping handle karein taaki template break na ho
        this.designationList = res;
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('API Error:', err)
    });
  }

  loadDepartments() {
    this.userService.getDepartments().subscribe({
      next: (res: any[]) => { 
        // Backend 'Id/Name' ko small 'id/name' mein map karein taaki dropdown sahi kaam kare
        this.departments = res.map(d => ({
          id: d.Id || d.id,
          name: d.Name || d.name
        })); 
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading departments:', err)
    });
  }

  addDesignation() {
    // Validation check
    if (!this.newDesignation.name || !this.newDesignation.departmentId) {
      alert("Bhai, Designation Name aur Department select karna zaroori hai!");
      return;
    }

    this.isLoading = true;
    
    // Asli payload jo backend accept karega
    const payload = {
      name: this.newDesignation.name,
      departmentId: Number(this.newDesignation.departmentId)
    };

    console.log("Sending Payload:", payload); // Debugging ke liye check karein

    this.userService.addDesignation(payload).subscribe({
      next: (res) => {
        alert("Designation saved successfully!");
        this.loadDesignations(); // List refresh karein
        this.closeModal();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Payload sent was:", payload);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  editDesignation(desig: any) {
    // Edit ke waqt existing values load karein
    this.newDesignation = { 
      name: desig.name || desig.Name, 
      departmentId: desig.departmentId || desig.DepartmentId 
    };
    this.openModal();
  }

  deleteDesignation(index: number) {
    // Future: Yahan backend delete API use karein
    if (confirm('Are you sure you want to delete this?')) {
      this.designationList.splice(index, 1);
    }
  }

  openModal() { this.isModalOpen = true; }
  
  closeModal() { 
    this.isModalOpen = false; 
    this.newDesignation = { name: '', departmentId: '' }; 
    this.isLoading = false;
  }
}