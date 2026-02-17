import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

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
  
  private apiUrl = 'http://localhost:5000/api/CompanyService';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchServices();
  }

  // 1. Get Data from API
  fetchServices() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (res) => this.services = res,
      error: (err) => console.error('Error fetching services', err)
    });
  }

  openModal() { 
    this.isEditMode = false;
    this.currentServiceId = null;
    this.newServiceName = ''; 
    this.isModalOpen = true; 
  }

  closeModal() { this.isModalOpen = false; }
  
  // 2. Post / Put Data to API
  saveService() { 
    if (this.newServiceName.trim()) {
      // Permanent Uppercase before sending to DB
      const upperName = this.newServiceName.trim().toUpperCase();

      if (this.isEditMode && this.currentServiceId) {
        // EDIT Logic
        const payload = { id: this.currentServiceId, serviceName: upperName };
        this.http.put(`${this.apiUrl}/${this.currentServiceId}`, payload).subscribe({
          next: () => {
            this.fetchServices();
            this.closeModal();
          },
          error: (err) => console.error('Error updating service', err)
        });
      } else {
        // ADD Logic
        const payload = { serviceName: upperName };
        this.http.post(this.apiUrl, payload).subscribe({
          next: () => {
            this.fetchServices();
            this.closeModal();
          },
          error: (err) => console.error('Error saving service', err)
        });
      }
    }
  }
  
  // 3. Delete Data from API
  deleteService(id: number) {
    if(confirm('Are you sure you want to delete this service?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => this.fetchServices(),
        error: (err) => console.error('Error deleting service', err)
      });
    }
  }

  modifyService(service: any) { 
    this.isEditMode = true;
    this.currentServiceId = service.id;
    this.newServiceName = service.serviceName; // Modal khulte hi existing name dikhega
    this.isModalOpen = true;
  }
}