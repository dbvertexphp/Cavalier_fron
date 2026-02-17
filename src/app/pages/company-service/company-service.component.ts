import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-company-service',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './company-service.component.html',
})
export class CompanyServiceComponent implements OnInit {
  
  isModalOpen = false;
  isEditMode = false;
  currentServiceId: number | null = null;
  newServiceName: string = ''; 
  services: any[] = []; 
  
  private apiUrl = environment.apiUrl + '/CompanyService';

  // CDR inject kiya gaya hai
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchServices();
  }

  // 1. Get Data
  fetchServices() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (res) => {
        this.services = res;
        this.cdr.detectChanges(); // UI Update
      },
      error: (err) => console.error('Error fetching services', err)
    });
  }

  openModal() { 
    this.isEditMode = false;
    this.currentServiceId = null;
    this.newServiceName = ''; 
    this.isModalOpen = true; 
    this.cdr.detectChanges();
  }

  closeModal() { 
    this.isModalOpen = false; 
    this.cdr.detectChanges();
  }
  
  // 2. Save Logic
  saveService() { 
    if (this.newServiceName.trim()) {
      const upperName = this.newServiceName.trim().toUpperCase();

      if (this.isEditMode && this.currentServiceId) {
        const payload = { id: this.currentServiceId, serviceName: upperName };
        this.http.put(`${this.apiUrl}/${this.currentServiceId}`, payload).subscribe({
          next: () => this.handleSuccess(),
          error: (err) => console.error('Error updating service', err)
        });
      } else {
        const payload = { serviceName: upperName };
        this.http.post(this.apiUrl, payload).subscribe({
          next: () => this.handleSuccess(),
          error: (err) => console.error('Error saving service', err)
        });
      }
    }
  }

  private handleSuccess() {
    this.fetchServices();
    this.closeModal();
    this.cdr.detectChanges();
  }
  
  // 3. Delete
  deleteService(id: number) {
    if(confirm('Are you sure you want to delete this service?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.fetchServices();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error deleting service', err)
      });
    }
  }

  modifyService(service: any) { 
    this.isEditMode = true;
    this.currentServiceId = service.id;
    this.newServiceName = service.serviceName;
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }
}