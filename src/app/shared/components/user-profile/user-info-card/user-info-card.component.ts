import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ModalService } from '../../../services/modal.service';

import { InputFieldComponent } from '../../form/input/input-field.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { LabelComponent } from '../../form/label/label.component';
import { ModalComponent } from '../../ui/modal/modal.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-info-card',
  standalone: true,
  imports: [
    InputFieldComponent,
    ButtonComponent,
    LabelComponent,
    ModalComponent,
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './user-info-card.component.html',
  styles: ``
})
export class UserInfoCardComponent implements OnInit {

  user: any = {
    firstName: 'Loading...',
    lastName: '',
    email: '',
    phone: '',
    bio: ''
  };

  isOpen = false;

  constructor(
    public modal: ModalService,
    private http: HttpClient 
  ) {}

  ngOnInit(): void {
    console.log('%c [System] User Info Card Initialized', 'color: #00ff00; font-weight: bold;');
    this.fetchUserProfile();
  }

  fetchUserProfile() {
    const apiUrl = `${environment.apiUrl}/Auth/me`;
    const token = localStorage.getItem('cavalier_token');

    console.log('%c [API Request] Fetching from:', 'color: #2196F3;', apiUrl);

    // Token Check
    if (!token) {
      console.error('%c [Error] cavalier_token nahi mila! Login check karo.', 'background: red; color: white;');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get(apiUrl, { headers }).subscribe({
      next: (res: any) => {
        console.log('%c [API Success] Data received:', 'color: #4CAF50; font-weight: bold;');
        console.table(res); // Isse pura data table mein dikhega

        // Backend mapping check (agar backend PascalCase bhej raha ho)
        this.user = {
          firstName: res.firstName || res.FirstName || '',
          lastName: res.lastName || res.LastName || '',
          email: res.email || res.Email || '',
          phone: res.phone || res.Mobile || res.phone || '',
          bio: res.bio || res.designation || res.Designation || ''
        };
        
        console.log('[Component State] Local user object updated:', this.user);
      },
      error: (err) => {
        console.error('%c [API Error] Request fail ho gayi!', 'color: #ff0000;');
        console.log('Error Status:', err.status);
        console.log('Error Details:', err);
        
        if(err.status === 401) {
          console.warn('Bhai token expire ho gaya hai ya invalid hai!');
        }
      }
    });
  }

  openModal() { 
    console.log('Opening Modal...');
    this.isOpen = true; 
  }

  closeModal() { 
    this.isOpen = false; 
  }

  handleSave() {
    console.log('%c [Save] Current User Data:', 'color: #ff9800;', this.user);
    // Yahan Update ki API aayegi baad mein
    this.closeModal();
  }
}