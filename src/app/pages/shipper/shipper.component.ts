import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shipper',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './shipper.component.html',
  styleUrl: './shipper.component.css',
})
export class ShipperComponent implements OnInit {
  isFormOpen: boolean = false;

  shippersList: any[] = [
    { id: 1, name: 'BLUE DART LOGISTICS', email: 'CONTACT@BLUEDART.COM', contactPerson: 'RAHUL SHARMA', country: 'INDIA', state: 'MAHARASHTRA', city: 'MUMBAI', zip: '400001', mode: 'AIR FREIGHT' },
  ];

  shipper = {
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    mode: 'AIR FREIGHT',
    country: '',
    state: '',
    city: '',
    zip: ''
  };

  countries: any[] = [];
  filteredCountries: any[] = [];
  states: string[] = [];
  filteredStates: string[] = [];
  showCountryDropdown = false;
  showStateDropdown = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchCountries();
  }

  openForm() {
    this.isFormOpen = true;
  }

  closeForm() {
    this.isFormOpen = false;
    this.resetForm();
  }

  resetForm() {
    this.shipper = { name: '', contactPerson: '', email: '', phone: '', mode: 'AIR FREIGHT', country: '', state: '', city: '', zip: '' };
  }

  fetchCountries() {
    this.http.get<any[]>('https://restcountries.com/v3.1/all?fields=name,cca2')
      .subscribe(data => {
        this.countries = data.map(c => ({ name: c.name.common, code: c.cca2 })).sort((a,b) => a.name.localeCompare(b.name));
        this.filteredCountries = this.countries;
      });
  }

  filterCountries() {
    this.showCountryDropdown = true;
    this.filteredCountries = this.countries.filter(c => 
      c.name.toLowerCase().includes(this.shipper.country.toLowerCase())
    );
  }

  selectCountry(c: any) {
    this.shipper.country = c.name.toUpperCase();
    this.showCountryDropdown = false;
    this.shipper.state = '';
    this.fetchStates(c.name);
  }

  fetchStates(countryName: string) {
    this.http.post<any>('https://countriesnow.space/api/v0.1/countries/states', { country: countryName })
      .subscribe(res => {
        this.states = !res.error ? res.data.states.map((s: any) => s.name) : [];
        this.filteredStates = this.states;
      });
  }

  filterStates() {
    this.showStateDropdown = true;
    this.filteredStates = this.states.filter(s => 
      s.toLowerCase().includes(this.shipper.state.toLowerCase())
    );
  }

  saveShipper() {
    if(this.shipper.name) {
      const newShipper = { ...this.shipper, id: Date.now() };
      this.shippersList.push(newShipper);
      this.closeForm();
    }
  }

  editShipper(s: any) {
    this.shipper = { ...s };
    this.isFormOpen = true;
  }

  deleteShipper(id: number) {
    this.shippersList = this.shippersList.filter(s => s.id !== id);
  }
}