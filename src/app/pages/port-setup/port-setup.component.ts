import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgSelectModule } from '@ng-select/ng-select';
import { CheckPermissionService } from '../../services/check-permission.service';
import Swal from 'sweetalert2';
const INDIA_GST_STATE_CODES: { [stateName: string]: string } = {
  'Jammu and Kashmir': '01',
  'Himachal Pradesh': '02',
  'Punjab': '03',
  'Chandigarh': '04',
  'Uttarakhand': '05',
  'Haryana': '06',
  'Delhi': '07',
  'Rajasthan': '08',
  'Uttar Pradesh': '09',
  'Bihar': '10',
  'Sikkim': '11',
  'Arunachal Pradesh': '12',
  'Nagaland': '13',
  'Manipur': '14',
  'Mizoram': '15',
  'Tripura': '16',
  'Meghalaya': '17',
  'Assam': '18',
  'West Bengal': '19',
  'Jharkhand': '20',
  'Odisha': '21',
  'Chhattisgarh': '22',
  'Madhya Pradesh': '23',
  'Gujarat': '24',
  'Dadra and Nagar Haveli and Daman and Diu': '26',
  'Maharashtra': '27',
  'Andhra Pradesh (New)': '37',
  'Andhra Pradesh': '37',
  'Karnataka': '29',
  'Goa': '30',
  'Lakshadweep': '31',
  'Kerala': '32',
  'Tamil Nadu': '33',
  'Puducherry': '34',
  'Andaman and Nicobar Islands': '35',
  'Telangana': '36',
  'Ladakh': '38'
};

@Component({
  selector: 'app-port-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, DragDropModule, NgSelectModule],
  templateUrl: './port-setup.component.html',
  styleUrls: ['./port-setup.component.css'],
})
// India ke liye official GST State Codes (state name -> 2-digit GST code)
// countriesnow.space API generic state_code deta hai (jaise 'MP', 'GJ'),
// lekin GST filing ke liye numeric code chahiye hota hai, isliye ye alag mapping hai.

export class PortSetupComponent implements OnInit {
  countries: any[] = [];
  states: any[] = [];       // { name, stateCode }
  cities: string[] = [];

  PermissionID: any;

  selectedCountry: any = null;
  selectedState: any = null; // ng-select ke liye object rakhte hain (name + stateCode), lekin sirf name dikhega

  private apiUrl = environment.apiUrl + '/PortSetup';

  allPorts: any[] = [];
  isModalOpen = false;
  isEditMode = false;

  newPort = {
    id: 0,
    portName: '',
    portCode: '',
    countryCode: '',
    isoCode: '',
    cityName: '',
    countryName: '',
    stateName: '',
    stateCode: '',      // <-- DB me save hoga, lekin frontend me input nahi dikhega
    functionName: '',
    pinCode: null as any,
    status: true,
    sortOrder: 0
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

  // Step 1: Country change -> load States (city list reset)
  onCountryChange(selected: any) {
    // Reset state & city selection every time country changes
    this.selectedState = null;
    this.states = [];
    this.cities = [];
    this.newPort.stateName = '';
    this.newPort.stateCode = '';
    this.newPort.cityName = '';

    if (!selected) {
      this.newPort.countryName = '';
      this.newPort.countryCode = '';
      this.newPort.isoCode = '';
      return;
    }

    this.newPort.countryName = selected.name;
    this.newPort.countryCode = selected.dialCode.startsWith('+') ? selected.dialCode : '+' + selected.dialCode;
    this.newPort.isoCode = selected.isoCode;

    this.http.post<any>('https://countriesnow.space/api/v0.1/countries/states', { country: selected.name })
      .subscribe(res => {
        // res.data.states => [{ name: 'Madhya Pradesh', state_code: 'MP' }, ...]
        this.states = (res.data?.states || []).map((s: any) => ({
          name: s.name,
          stateCode: s.state_code
        }));
        this.cdr.detectChanges();
      });
  }

  // Step 2: State change -> save stateName + stateCode (code stays hidden in UI), then load Cities
  onStateChange(selected: any) {
    this.cities = [];
    this.newPort.cityName = '';

    if (!selected) {
      this.newPort.stateName = '';
      this.newPort.stateCode = '';
      return;
    }

    this.newPort.stateName = selected.name;
    // hidden from UI, only saved in model -> DB (GST code for India, API code otherwise)
    this.newPort.stateCode = this.resolveStateCode(this.newPort.countryName, selected.name, selected.stateCode);

    this.http.post<any>('https://countriesnow.space/api/v0.1/countries/state/cities', {
      country: this.newPort.countryName,
      state: selected.name
    }).subscribe(res => {
      this.cities = res.data || [];
      this.cdr.detectChanges();
    });
  }

  // India ke liye GST code use karo, baaki countries ke liye API ka state_code
  private resolveStateCode(countryName: string, stateName: string, apiStateCode: string): string {
    if (countryName === 'India') {
      return INDIA_GST_STATE_CODES[stateName] || apiStateCode || '';
    }
    return apiStateCode || '';
  }

  private getHeaders() {
    const token = localStorage.getItem('cavalier_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  fetchPorts() {
    this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.allPorts = res.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        this.cdr.detectChanges();
      }
    });
  }

  openModal() {
    this.isEditMode = false;
    this.selectedCountry = null;
    this.selectedState = null;
    this.states = [];
    this.cities = [];
    this.newPort = {
      id: 0, portName: '', portCode: '', countryCode: '', isoCode: '',
      cityName: '', countryName: '', stateName: '', stateCode: '',
      functionName: '', pinCode: null, status: true, sortOrder: 0
    };
    this.isModalOpen = true;
  }

  editPort(port: any) {
    this.isEditMode = true;
    this.newPort = { ...port };
    this.selectedCountry = this.countries.find(c => c.name === port.countryName) || null;

    // Country ke states load karo, phir current state ko select karo, phir cities load karo
    if (this.newPort.countryName) {
      this.http.post<any>('https://countriesnow.space/api/v0.1/countries/states', { country: this.newPort.countryName })
        .subscribe(res => {
          this.states = (res.data?.states || []).map((s: any) => ({ name: s.name, stateCode: s.state_code }));
          this.selectedState = this.states.find(s => s.name === port.stateName) || null;

          if (this.selectedState) {
            this.http.post<any>('https://countriesnow.space/api/v0.1/countries/state/cities', {
              country: this.newPort.countryName,
              state: this.selectedState.name
            }).subscribe(cityRes => {
              this.cities = cityRes.data || [];
              this.cdr.detectChanges();
            });
          }
        });
    }

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
        Swal.fire({ icon: 'success', title: this.isEditMode ? 'Updated!' : 'Saved!', timer: 1500, showConfirmButton: false });
        this.fetchPorts();
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