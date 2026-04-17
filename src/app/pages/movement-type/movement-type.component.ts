import { Permission } from './../employee/employee.component';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CheckPermissionService } from '../../services/check-permission.service';

@Component({
  selector: 'app-movement-type',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movement-type.component.html'
})
export class MovementTypeComponent implements OnInit {
  private apiUrl = `${environment.apiUrl}/MovementTypes`;
  movementTypes: any[] = [];
  moveName: string = '';
  isModalOpen = false;
  isEditMode = false;
  currentId: number | null = null;
  PermissionID:any;

  constructor(private http: HttpClient,public CheckPermissionService:CheckPermissionService) {}

  ngOnInit() { 
    this.PermissionID = Number(localStorage.getItem('permissionID'));
    this.getData(); }

  getData() {
    this.http.get<any[]>(this.apiUrl).subscribe(res => this.movementTypes = res);
  }

  openModal() {
    this.isEditMode = false;
    this.moveName = '';
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.moveName = '';
    this.currentId = null;
  }

  edit(item: any) {
    this.isEditMode = true;
    this.currentId = item.id;
    this.moveName = item.name;
    this.isModalOpen = true;
  }

  save() {
    if (!this.moveName.trim()) return;
    const payload = { name: this.moveName.toUpperCase() };

    if (this.isEditMode && this.currentId) {
      this.http.put(`${this.apiUrl}/${this.currentId}`, { id: this.currentId, ...payload })
        .subscribe(() => { this.getData(); this.closeModal(); });
    } else {
      this.http.post(this.apiUrl, payload)
        .subscribe(() => { this.getData(); this.closeModal(); });
    }
  }

  delete(id: number) {
    if (confirm("Delete this movement type?")) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => this.getData());
    }
  }
}