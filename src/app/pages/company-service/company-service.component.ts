import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CheckPermissionService } from '../../services/check-permission.service';
import Swal from 'sweetalert2';   // 🔥 NAYA IMPORT

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
    this.fetchServices();
  }

  fetchServices() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (res) => {
        // 🔥 FIX: Backend ke 'status' string field se isActive boolean banao
        this.services = res.map(s => ({
          ...s,
          isActive: s.status === 'Active'
        }));
        console.log("Services loaded:", this.services.length);
        this.cdr.detectChanges();
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
          this.fetchServices();
          this.closeModal();
        },
        error: (err) => console.error('Error updating service', err)
      });
    } else {
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

  deleteService(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this service?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}/${id}`).subscribe({
          next: () => {
            this.fetchServices();
            Swal.fire('Deleted!', 'Service has been deleted.', 'success');
          },
          error: (err) => {
            console.error('Error deleting service', err);
            Swal.fire('Error!', 'Failed to delete service.', 'error');
          }
        });
      }
    });
  }

  modifyService(service: any) {
    this.isEditMode = true;
    this.currentServiceId = service.id;
    this.newServiceName = service.serviceName;
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  
  toggleStatus(service: any) {
    const newStatusText = service.isActive ? 'Inactive' : 'Active';

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to mark this service as ${newStatusText}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText: `Yes, make it ${newStatusText}!`,
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const previousState = service.isActive;

        this.http.patch<any>(`${this.apiUrl}/ToggleStatus/${service.id}`, {}).subscribe({
          next: (res) => {
            // Backend se aaye naye status se sync karo
            service.isActive = res.newStatus === 'Active';
            service.status = res.newStatus;
            this.cdr.detectChanges();

            Swal.fire({
              icon: 'success',
              title: 'Updated!',
              text: `Service status changed to ${res.newStatus}.`,
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error('Error toggling status', err);
            service.isActive = previousState; // revert on failure
            this.cdr.detectChanges();
            Swal.fire('Error!', 'Failed to update status. Please try again.', 'error');
          }
        });
      }
    });
  }
}