import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgSelectModule } from '@ng-select/ng-select';
import { CheckPermissionService } from '../../services/check-permission.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-port-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, DragDropModule, NgSelectModule],
  templateUrl: './port-setup.component.html',
})
export class PortSetupComponent implements OnInit {
  countries: any[] = [];
  cities: string[] = [];
  PermissionID: any;
  selectedCountry: any = null;
  private apiUrl = environment.apiUrl + '/PortSetup';

  allPorts: any[] = [];
  isModalOpen = false;
  isEditMode = false;

  newPort = {
    id: 0, portName: '', portCode: '', countryCode: '', isoCode: '', cityName: '', countryName: '', functionName: '', pinCode: null as any, status: true, sortOrder: 0
  };

  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef, 
    public CheckPermissionService: CheckPermissionService
  ) {}

  ngOnInit(): void {
    this.PermissionID = Number(localStorage.getItem('permissionID'));
    this.loadCountries();
    this.fetchPorts();
  }

  loadCountries() {
    this.http.get<any>('https://countriesnow.space/api/v0.1/countries/info?returns=flag,unicodeFlag,dialCode,iso2')
      .subscribe(res => {
        this.countries = res.data.map((c: any) => ({ name: c.name, dialCode: c.dialCode, isoCode: c.iso2 }));
      });
  }

  onCountryChange(selected: any) {
    if (!selected) { 
        this.newPort.countryName = ''; this.newPort.countryCode = ''; this.newPort.isoCode = ''; this.cities = []; return; 
    }
    this.newPort.countryName = selected.name;
    this.newPort.countryCode = selected.dialCode.startsWith('+') ? selected.dialCode : '+' + selected.dialCode;
    this.newPort.isoCode = selected.isoCode; 
    
    this.http.post<any>('https://countriesnow.space/api/v0.1/countries/cities', { country: selected.name })
      .subscribe(res => { this.cities = res.data; });
  }

  private getHeaders() {
    const token = localStorage.getItem('cavalier_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  fetchPorts() {
    this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() }).subscribe({
      next: (res) => { 
        this.allPorts = res.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)); 
        this.cdr.detectChanges(); // Change detection trigger
      }
    });
  }

  openModal() {
    this.isEditMode = false; 
    this.selectedCountry = null;
    this.newPort = { id: 0, portName: '', portCode: '', countryCode: '', isoCode: '', cityName: '', countryName: '', functionName: '', pinCode: null, status: true, sortOrder: 0 };
    this.isModalOpen = true;
  }

  editPort(port: any) {
    this.isEditMode = true; 
    this.newPort = { ...port };
    this.selectedCountry = this.countries.find(c => c.name === port.countryName);
    this.isModalOpen = true;
  }

  closeModal() { 
    this.isModalOpen = false; 
  }

  savePort() {
    const payload = { ...this.newPort, pinCode: this.newPort.pinCode ? Number(this.newPort.pinCode) : 0 };
    const headers = this.getHeaders();
    const request = this.isEditMode 
      ? this.http.put(`${this.apiUrl}/${this.newPort.id}`, payload, { headers }) 
      : this.http.post(this.apiUrl, payload, { headers });

    request.subscribe({
      next: () => { 
        // 1. Success Message
        Swal.fire({ icon: 'success', title: this.isEditMode ? 'Updated!' : 'Saved!', timer: 1500, showConfirmButton: false }); 
        
        // 2. Fetch Data
        this.fetchPorts(); 
        
        // 3. Modal close
        this.closeModal(); 
      },
      error: (err) => { 
        console.error(err); 
        Swal.fire('Error', 'Backend Validation Failed', 'error'); 
      }
    });
  }

  deletePort(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).subscribe(() => {
          this.fetchPorts();
          Swal.fire('Deleted!', 'Port has been deleted.', 'success');
        });
      }
    });
  }
}