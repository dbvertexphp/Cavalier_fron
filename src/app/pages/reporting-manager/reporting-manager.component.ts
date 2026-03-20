import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-reporting-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reporting-manager.component.html'
})
export class ReportingManagerComponent implements OnInit {
  private apiUrl = `${environment.apiUrl}/ReportingManagers`;
  managers: any[] = [];
  managerName: string = '';
  isModalOpen = false;
  isEditMode = false;
  currentId: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() { this.getData(); }

  getData() {
    this.http.get<any[]>(this.apiUrl).subscribe(res => this.managers = res);
  }

  openModal() {
    this.isEditMode = false;
    this.managerName = '';
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.managerName = '';
    this.currentId = null;
  }

  edit(item: any) {
    this.isEditMode = true;
    this.currentId = item.id;
    this.managerName = item.name;
    this.isModalOpen = true;
  }

  save() {
    if (!this.managerName.trim()) return;
    const payload = { name: this.managerName.toUpperCase() };

    if (this.isEditMode && this.currentId) {
      this.http.put(`${this.apiUrl}/${this.currentId}`, { id: this.currentId, ...payload })
        .subscribe(() => { this.getData(); this.closeModal(); });
    } else {
      this.http.post(this.apiUrl, payload)
        .subscribe(() => { this.getData(); this.closeModal(); });
    }
  }

  delete(id: number) {
    if (confirm("Delete this Reporting Manager?")) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => this.getData());
    }
  }
}