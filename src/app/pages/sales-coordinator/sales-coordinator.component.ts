import { Permission } from './../employee/employee.component';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CheckPermissionService } from '../../services/check-permission.service';

@Component({
  selector: 'app-sales-coordinator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-coordinator.component.html'
})
export class SalesCoordinatorComponent implements OnInit {
  private apiUrl = `${environment.apiUrl}/SalesCoordinators`;
  coordinators: any[] = [];
  coordinatorName: string = '';
  isModalOpen = false;
  isEditMode = false;
  currentId: number | null = null;
  PermissionID:any;

  constructor(private http: HttpClient,public CheckPermissionService:CheckPermissionService) {}

  ngOnInit() { 
    this.PermissionID = Number(localStorage.getItem('permissionID'));
    this.getData(); }

  getData() {
    this.http.get<any[]>(this.apiUrl).subscribe(res => this.coordinators = res);
  }

  openModal() {
    this.isEditMode = false;
    this.coordinatorName = '';
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.coordinatorName = '';
    this.currentId = null;
  }

  edit(item: any) {
    this.isEditMode = true;
    this.currentId = item.id;
    this.coordinatorName = item.name;
    this.isModalOpen = true;
  }

  save() {
    if (!this.coordinatorName.trim()) return;
    const payload = { name: this.coordinatorName.toUpperCase() };

    if (this.isEditMode && this.currentId) {
      this.http.put(`${this.apiUrl}/${this.currentId}`, { id: this.currentId, ...payload })
        .subscribe(() => { this.getData(); this.closeModal(); });
    } else {
      this.http.post(this.apiUrl, payload)
        .subscribe(() => { this.getData(); this.closeModal(); });
    }
  }

  delete(id: number) {
    if (confirm("Delete this Sales Coordinator?")) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => this.getData());
    }
  }
}