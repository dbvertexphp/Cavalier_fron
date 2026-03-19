import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-shipment-type',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shipment-type.component.html'
})
export class ShipmentTypeComponent implements OnInit {
  private apiUrl = `${environment.apiUrl}/ShipmentTypes`;
  shipmentTypes: any[] = [];
  typeName: string = '';
  isModalOpen = false;
  isEditMode = false;
  currentId: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() { this.getData(); }

  getData() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (res) => this.shipmentTypes = res,
      error: (err) => console.error(err)
    });
  }

  openModal() {
    this.isEditMode = false;
    this.typeName = '';
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.typeName = '';
    this.currentId = null;
  }

  edit(item: any) {
    this.isEditMode = true;
    this.currentId = item.id;
    this.typeName = item.name;
    this.isModalOpen = true;
  }

  save() {
    if (!this.typeName.trim()) return;
    const payload = { name: this.typeName.toUpperCase() };

    if (this.isEditMode && this.currentId) {
      this.http.put(`${this.apiUrl}/${this.currentId}`, { id: this.currentId, ...payload })
        .subscribe(() => { this.getData(); this.closeModal(); });
    } else {
      this.http.post(this.apiUrl, payload)
        .subscribe(() => { this.getData(); this.closeModal(); });
    }
  }

  delete(id: number) {
    if (confirm("Are you sure?")) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => this.getData());
    }
  }
}