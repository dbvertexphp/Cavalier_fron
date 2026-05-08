import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { ModalService } from '../../../services/modal.service';

import { InputFieldComponent } from '../../form/input/input-field.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { LabelComponent } from '../../form/label/label.component';
import { ModalComponent } from '../../ui/modal/modal.component';

@Component({
  selector: 'app-user-address-card',
  standalone: true,
  imports: [
    InputFieldComponent,
    ButtonComponent,
    LabelComponent,
    ModalComponent,
    FormsModule,
    CommonModule,
    HttpClientModule
  ],
  templateUrl: './user-address-card.component.html'
})
export class UserAddressCardComponent implements OnInit {
  isOpen = false;

  address = {
    country: 'Loading...',
    cityState: 'Loading...',
    postalCode: 'Loading...',
    taxId: 'Loading...',
  };

  constructor(
    public modal: ModalService, 
    private http: HttpClient, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchAddress();
  }

  fetchAddress() {
    const apiUrl = `${environment.apiUrl}/Auth/me`;
    const token = localStorage.getItem('cavalier_token');

    console.log('Fetching address from:', apiUrl);

    if (token) {
      const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
      
      this.http.get(apiUrl, { headers }).subscribe({
        next: (res: any) => {
          console.log('Address Data Received:', res);
          this.address = {
            country: res.country,
            cityState: res.cityState,
            postalCode: res.postalCode,
            taxId: res.taxId
          };
          this.cdr.detectChanges(); // UI refresh karne ke liye
        },
        error: (err) => {
          console.error('Error fetching address:', err);
        }
      });
    } else {
      console.warn('No token found in localStorage!');
    }
  }

  openModal() { this.isOpen = true; }
  closeModal() { this.isOpen = false; }

  handleSave() {
    console.log('Sending Updated Address to Server:', this.address);
    // Yahan Update API call aayegi future mein
    this.closeModal();
  }
}