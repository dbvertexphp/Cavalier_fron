import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-commodity-type',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './commodity-type.component.html',
  styleUrl: './commodity-type.component.css',
})
export class CommodityTypeComponent implements OnInit {
  private apiUrl = environment.apiUrl + '/CommodityType';

  isModalOpen = false;
  isEditMode = false;
  rolesList: any[] = [];

  newRole = {
    id: 0,
    name: '',
    status: true
  };

  showPopup = false;
  roleIdToDelete: number | null = null;

  // ChangeDetectorRef ko inject kiya gaya hai
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

 ngOnInit(): void {
  this.fetchCommodities();
}



  fetchCommodities() {
    this.http.get<any[]>(this.apiUrl).subscribe(res => {
      this.rolesList = res;
      this.cdr.detectChanges(); // Data aane par UI refresh
    });
  }

  saveRole() {
    if (this.newRole.name.trim()) {
      const upperName = this.newRole.name.trim().toUpperCase();

      if (this.isEditMode) {
        const payload = { 
          id: this.newRole.id, 
          name: upperName, 
          status: this.newRole.status 
        };
        this.http.put(`${this.apiUrl}/${this.newRole.id}`, payload).subscribe(() => {
          this.handleResponse();
        });
      } else {
        const payload = { 
          name: upperName, 
          status: this.newRole.status 
        };
        this.http.post(this.apiUrl, payload).subscribe(() => {
          this.handleResponse();
        });
      }
    }
  }

  // Common response handler for Save/Edit/Delete
  private handleResponse() {
    this.fetchCommodities();
    this.closeModal();
    this.cdr.detectChanges(); // Forceful UI update
  }

  confirmDelete() {
    if (this.roleIdToDelete !== null) {
      this.http.delete(`${this.apiUrl}/${this.roleIdToDelete}`).subscribe(() => {
        this.fetchCommodities();
        this.showPopup = false;
        this.roleIdToDelete = null;
        this.cdr.detectChanges(); // Delete ke baad refresh
      });
    }
  }

  openModal() {
    this.isEditMode = false;
    this.newRole = { id: 0, name: '', status: true };
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  closeModal() { 
    this.isModalOpen = false; 
    this.cdr.detectChanges();
  }

  deleteRole(id: number) { 
    this.roleIdToDelete = id; 
    this.showPopup = true; 
    this.cdr.detectChanges();
  }

  cancelDelete() { 
    this.showPopup = false; 
    this.cdr.detectChanges();
  }

  editRole(role: any) { 
    this.isEditMode = true; 
    this.newRole = { ...role }; 
    this.isModalOpen = true; 
    this.cdr.detectChanges();
  }
}