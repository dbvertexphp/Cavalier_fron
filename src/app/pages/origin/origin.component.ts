import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CheckPermissionService } from '../../services/check-permission.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-origin',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './origin.component.html',
})
export class OriginComponent implements OnInit {
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, public CheckPermissionService: CheckPermissionService) {}
  private apiUrl = environment.apiUrl + '/Origin';

  isModalOpen = false;
  isEditMode = false;
  PermissionID: any;
  rolesList: any[] = [];
  countries: any[] = [];
  
  // newRole mein isoCode add kiya
  newRole = { id: 0, name: '', countryName: '', countryCode: '', isoCode: '', status: true };

  ngOnInit(): void {
    this.PermissionID = Number(localStorage.getItem('permissionID'));
    this.fetchOrigins();
    this.loadCountries();
  }

  loadCountries() {
    // API se iso2 bhi fetch kar rahe hain
    this.http.get<any>('https://countriesnow.space/api/v0.1/countries/info?returns=dialCode,iso2')
      .subscribe(res => { this.countries = res.data; });
  }

  onCountrySelect(event: any) {
    const selectedName = event.target.value;
    const country = this.countries.find(c => c.name === selectedName);
    if (country) {
      this.newRole.countryName = country.name;
      this.newRole.countryCode = country.dialCode;
      this.newRole.isoCode = country.iso2; // ISO code set ho gaya
    }
  }

  fetchOrigins() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => { this.rolesList = data; this.cdr.detectChanges(); },
      error: (err) => console.error('Error:', err)
    });
  }

  saveRole() {
    if (!this.newRole.name.trim()) return;

    const payload = { ...this.newRole, name: this.newRole.name.trim().toUpperCase() };
    const request = this.isEditMode 
      ? this.http.put(`${this.apiUrl}/${this.newRole.id}`, payload)
      : this.http.post(this.apiUrl, payload);
    
    request.subscribe({
      next: () => {
        Swal.fire('Success', `Origin ${this.isEditMode ? 'updated' : 'created'} successfully!`, 'success');
        this.fetchOrigins();
        this.closeModal();
      },
      error: () => Swal.fire('Error', 'Something went wrong', 'error')
    });
  }

  deleteRole(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
          this.fetchOrigins();
          Swal.fire('Deleted!', 'The record has been deleted.', 'success');
        });
      }
    });
  }

  openModal() { this.isEditMode = false; this.newRole = { id: 0, name: '', countryName: '', countryCode: '', isoCode: '', status: true }; this.isModalOpen = true; }
  closeModal() { this.isModalOpen = false; }
  editRole(role: any) { this.isEditMode = true; this.newRole = { ...role }; this.isModalOpen = true; }
}