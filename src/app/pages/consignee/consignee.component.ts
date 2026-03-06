import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core'; // OnInit add kiya
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-consignee',
  standalone: true, // Standalone true rakhein agar direct use kar rahe hain
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './consignee.component.html',
  styleUrl: './consignee.component.css',
})
export class ConsigneeComponent implements OnInit {
  isFormOpen: boolean = false;
  isEditMode: boolean = false;

  consigneesList: any[] = [
    { id: 101, name: 'APEX IMPORTS LLC', email: 'OPS@APEX.COM', contactPerson: 'JOHN DOE', phone: '+1 555 123 4567', country: 'USA', state: 'CALIFORNIA', city: 'LOS ANGELES', zip: '90001', taxId: 'TAX123', consigneeType: 'COMMERCIAL' },
    { id: 102, name: 'DUBAI TRADING CO.', email: 'INFO@DUBAITRADE.AE', contactPerson: 'AHMED KHAN', phone: '+971 50 123 4567', country: 'UAE', state: 'DUBAI', city: 'AL RASHIDIYA', zip: '00000', taxId: 'VAT999', consigneeType: 'COMMERCIAL' }
  ];

  // Ek default object banalo taaki baar baar repeat na karna pade
  defaultConsignee = {
    id: null as any,
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    country: '',
    state: '',
    city: '',
    zip: '',
    taxId: '',
    consigneeType: 'COMMERCIAL',
    warehouseName: '',
    addressLine2: '',
    notifyParty: '',
    deliveryInstruction: ''
  };

  consignee = { ...this.defaultConsignee };

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
    this.isEditMode = false;
    this.resetForm();
  }

  closeForm() {
    this.isFormOpen = false;
    this.resetForm();
  }

  // FIX: Reset mein saari fields hona zaroori hai
  resetForm() {
    this.consignee = { ...this.defaultConsignee };
    this.states = [];
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
      c.name.toLowerCase().includes(this.consignee.country.toLowerCase())
    );
  }

  selectCountry(c: any) {
    this.consignee.country = c.name.toUpperCase();
    this.showCountryDropdown = false;
    this.consignee.state = '';
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
      s.toLowerCase().includes(this.consignee.state.toLowerCase())
    );
  }

  saveConsignee() {
    if(this.isEditMode) {
      const index = this.consigneesList.findIndex(c => c.id === this.consignee.id);
      if(index > -1) {
        this.consigneesList[index] = { ...this.consignee };
      }
    } else {
      const newConsignee = { ...this.consignee, id: Date.now() };
      this.consigneesList.push(newConsignee);
    }
    this.closeForm();
  }

  editConsignee(c: any) {
    this.consignee = { ...c };
    this.isEditMode = true;
    this.isFormOpen = true;
    if (c.country) {
      this.fetchStates(c.country);
    }
  }

  deleteConsignee(id: number) {
    this.consigneesList = this.consigneesList.filter(c => c.id !== id);
  }
}