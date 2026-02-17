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
  newServiceName: string = ''; 
  services: any[] = []; // Data API se aayega
  
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
    this.newServiceName = ''; 
    this.isModalOpen = true; 
  }

  closeModal() { this.isModalOpen = false; }
  
  // 2. Post Data to API
  saveService() { 
    if (this.newServiceName.trim()) {
      const payload = { serviceName: this.newServiceName.trim() };
      
      this.http.post(this.apiUrl, payload).subscribe({
        next: () => {
          this.fetchServices(); // Table refresh karo
          this.closeModal();
        },
        error: (err) => console.error('Error saving service', err)
      });
    }
  }
  
  // 3. Delete Data from API
  deleteService(id: number) {
    if(confirm('Are you sure you want to delete this service?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => this.fetchServices(), // Table refresh karo
        error: (err) => console.error('Error deleting service', err)
      });
    }
  }

  modifyService(service: any) { 
    console.log('Editing:', service); 
  }
}