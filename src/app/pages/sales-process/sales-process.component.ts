import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CheckPermissionService } from '../../services/check-permission.service';

@Component({
  selector: 'app-sales-process',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-process.component.html'
})
export class SalesProcessComponent implements OnInit {
  private apiUrl = `${environment.apiUrl}/SalesProcesses`;
  processes: any[] = [];
  processName: string = '';
  isModalOpen = false;
  PermissionID: any;
  isEditMode = false;
  currentId: number | null = null;

  constructor(private http: HttpClient, public CheckPermissionService: CheckPermissionService) {}

  ngOnInit() { 
    this.PermissionID = Number(localStorage.getItem('permissionID'));
    this.getData(); 
  }

  getData() {
    this.http.get<any[]>(this.apiUrl).subscribe(res => this.processes = res);
  }

  openModal() {
    this.isEditMode = false;
    this.processName = '';
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.processName = '';
    this.currentId = null;
  }

  edit(item: any) {
    this.isEditMode = true;
    this.currentId = item.id;
    this.processName = item.name;
    this.isModalOpen = true;
  }

  save() {
    if (!this.processName.trim()) return;
    const payload = { name: this.processName.toUpperCase() };

    if (this.isEditMode && this.currentId) {
      this.http.put(`${this.apiUrl}/${this.currentId}`, { id: this.currentId, ...payload })
        .subscribe(() => { this.getData(); this.closeModal(); });
    } else {
      this.http.post(this.apiUrl, payload)
        .subscribe(() => { this.getData(); this.closeModal(); });
    }
  }

  delete(id: number) {
    if (confirm("Delete this Sales Process stage?")) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => this.getData());
    }
  }
}