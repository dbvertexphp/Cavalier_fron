import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
// import { environment } from '../../environments/environment';

@Component({
  selector: 'app-branch-department',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './branch-department.component.html'
})
export class BranchDepartmentComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/BranchDepartment`;

  departments: any[] = [];
  isModalOpen = false;
  isEditMode = false;
  newDept: any = { id: 0, name: '' };

  ngOnInit() {
    this.loadDepartments();
  }

  loadDepartments() {
    this.http.get<any[]>(this.apiUrl).subscribe(res => {
      this.departments = res;
    });
  }

  openModal(dept?: any) {
    this.isEditMode = !!dept;
    this.newDept = dept ? { ...dept } : { id: 0, name: '' };
    this.isModalOpen = true;
  }

  closeModal() { 
    this.isModalOpen = false; 
    this.newDept = { id: 0, name: '' };
  }

  saveDepartment() {
    if (!this.newDept.name) return;

    this.http.post(this.apiUrl, this.newDept).subscribe(() => {
      this.loadDepartments();
      this.closeModal();
    });
  }

  deleteDept(id: number) {
    if (confirm('Delete this department?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
        this.loadDepartments();
      });
    }
  }
}