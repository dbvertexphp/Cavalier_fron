import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { NgSelectModule } from '@ng-select/ng-select';
@Component({
  selector: 'app-port-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, DragDropModule,NgSelectModule],
  templateUrl: './port-setup.component.html',
})
export class PortSetupComponent implements OnInit {
countries: string[] = [];
cities: string[] = [];
countrySearch = '';
citySearch = '';
selectedCountry = 'Peru';
  private apiUrl = environment.apiUrl + '/PortSetup';

  allPorts: any[] = [];

  isModalOpen = false;
  isEditMode = false;

  newPort = {
    id: 0,
    portName: '',
    portCode: '',
    cityName: '',
    countryName: '',
    functionName: '',
    status: true,
    sortOrder: 0
  };

  searchCountry = '';
  searchPortName = '';
  searchFunction = '';
  quickSearch = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadCountries();
    this.fetchPorts();
  }
loadCountries() {
  this.http.get<any>('https://countriesnow.space/api/v0.1/countries/positions')
    .subscribe(res => {
      this.countries = res.data.map((c: any) => c.name);
    });
}

// On country change
onCountryChange(selectedCountry: string) {

  

  this.http.post<any>('https://countriesnow.space/api/v0.1/countries/cities', {
    country: selectedCountry
  }).subscribe(res => {
    this.cities = res.data;
  });
}
filteredCountries() {
  return this.countries.filter(c =>
    c.toLowerCase().includes(this.countrySearch.toLowerCase())
  );
}

filteredCities() {
  return this.cities.filter(c =>
    c.toLowerCase().includes(this.citySearch.toLowerCase())
  );
}
  // 🔐 Token Header
  private getHeaders() {
    const token = localStorage.getItem('cavalier_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // 📥 Fetch
  fetchPorts() {
    this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.allPorts = res.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        this.cdr.detectChanges();
      }
    });
  }

  // ➕ Open Modal
  openModal() {
    this.isEditMode = false;
    this.newPort = {
      id: 0,
      portName: '',
      portCode: '',
      cityName: '',
      countryName: '',
      functionName: '',
      status: true,
      sortOrder: 0
    };
    this.isModalOpen = true;
  }

  // ✏️ Edit
  editPort(port: any) {
    this.isEditMode = true;
    this.newPort = { ...port };
    this.isModalOpen = true;
  }

  // ❌ Close
  closeModal() {
    this.isModalOpen = false;
  }

  // 💾 Save
  savePort() {
    const headers = this.getHeaders();

    const request = this.isEditMode
      ? this.http.put(`${this.apiUrl}/${this.newPort.id}`, this.newPort, { headers })
      : this.http.post(this.apiUrl, this.newPort, { headers });

    request.subscribe(() => {
      alert(this.isEditMode ? "Updated!" : "Saved!");
      this.fetchPorts();
      this.closeModal();
    });
  }

  // 🗑 Delete
  deletePort(id: number) {
    if (confirm('Delete?')) {
      this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
        .subscribe(() => this.fetchPorts());
    }
  }

  // 🔍 Filter
  get filteredPorts() {
    return this.allPorts.filter(port => {
      const q = this.quickSearch.toLowerCase();
      return (
        (port.countryName || '').toLowerCase().includes(this.searchCountry.toLowerCase()) &&
        (port.portName || '').toLowerCase().includes(this.searchPortName.toLowerCase()) &&
        (port.functionName || '').toLowerCase().includes(this.searchFunction.toLowerCase()) &&
        (!this.quickSearch ||
          port.portName?.toLowerCase().includes(q) ||
          port.portCode?.toLowerCase().includes(q) ||
          port.countryName?.toLowerCase().includes(q))
      );
    });
  }

  resetFilters() {
    this.searchCountry = '';
    this.searchPortName = '';
    this.searchFunction = '';
    this.quickSearch = '';
  }
}