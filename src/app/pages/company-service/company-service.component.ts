import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CheckPermissionService } from '../../services/check-permission.service';

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
  PermissionID: number = 0;
  private apiUrl = environment.apiUrl + '/CompanyService';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    public CheckPermissionService: CheckPermissionService
  ) {}

  ngOnInit(): void {
    const storedID = localStorage.getItem('permissionID');
    if (storedID) {
      this.PermissionID = Number(storedID);
    }
    
    // Direct fetch call bina kisi condition ke, taaki data hamesha dikhe
    this.fetchServices();
  }

  fetchServices() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (res) => {
        // API response ko services array mein daal rahe hain
        this.services = res.map(s => ({
          ...s,
          isActive: s.isActive ?? true
        }));
        console.log("Services loaded:", this.services.length);
        this.cdr.detectChanges(); // UI update force karein
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
    this.newServiceName = '';
    this.cdr.detectChanges();
  }
  
  saveService() { 
    if (!this.newServiceName.trim()) return;

    const upperName = this.newServiceName.trim().toUpperCase();

    if (this.isEditMode && this.currentServiceId) {
      const payload = { id: this.currentServiceId, serviceName: upperName };
      this.http.put(`${this.apiUrl}/${this.currentServiceId}`, payload).subscribe({
        next: () => {
          this.fetchServices(); // Update ke baad fresh load
          this.closeModal();
        },
        error: (err) => console.error('Error updating service', err)
      });
    } else {
      const payload = { serviceName: upperName };
      this.http.post(this.apiUrl, payload).subscribe({
        next: () => {
          this.fetchServices(); // Add ke baad fresh load
          this.closeModal();
        },
        error: (err) => console.error('Error saving service', err)
      });
    }
  }

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
    this.newServiceName = service.serviceName;
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  toggleStatus(service: any) {
    service.isActive = !service.isActive;
    // Note: Yahan server par status update ki API call honi chahiye agar database mein save karna hai
  }
}