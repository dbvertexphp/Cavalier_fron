import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { ModalService } from '../../../services/modal.service';

import { InputFieldComponent } from './../../form/input/input-field.component';
import { ModalComponent } from '../../ui/modal/modal.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { LabelComponent } from '../../form/label/label.component';
import { th } from 'zod/v4/locales';

@Component({
  selector: 'app-user-meta-card',
  standalone: true,
  imports: [
    ModalComponent,
    InputFieldComponent,
    ButtonComponent,
    LabelComponent,
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './user-meta-card.component.html'
})
export class UserMetaCardComponent implements OnInit {
gender:string="Male";
avtaar:string="/images/assets/male.png";
  constructor(
    public modal: ModalService, 
    private http: HttpClient,
    private cdr: ChangeDetectorRef 
  ) {}

  isOpen = false;
  openModal() { this.isOpen = true; }
  closeModal() { this.isOpen = false; }

  user = {
    firstName: '',
    lastName: '',
    role: '',
    location: '',
    avatar: this.avtaar,
    social: {
      facebook: '#',
      x: '#',
      linkedin: '#',
      instagram: '#',
    },
    email: '',
    phone: '',
    bio: '',
  };

  ngOnInit(): void {
    this.gender=localStorage.getItem('gender') || 'Male';
    
    this.fetchUserProfile();
  }

  fetchUserProfile() {
    if(this.gender==="Female"){
      this.avtaar="/images/assets/female.png";
    }
    else{
      this.avtaar="/images/assets/male.png";
    }
    const apiUrl = `${environment.apiUrl}/Auth/me`;
    const token = localStorage.getItem('cavalier_token');
    
    console.log('Fetching Meta Profile from:', apiUrl);

    if (token) {
      const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
      this.http.get(apiUrl, { headers }).subscribe({
        next: (res: any) => {
          console.log('API Response for Meta Card:', res);

          // Mapping fields based on your backend logic
          this.user.firstName = res.firstName || '';
          this.user.lastName = res.lastName || '';
          this.user.email = res.email || '';
          this.user.phone = res.phone || '';
          this.user.bio = res.bio || '';
          
          // Role aur Address (Location) mapping
          this.user.role = res.role || 'User'; 
          // Agar backend se cityState aa raha hai toh wahi location ban jayegi
          this.user.location = res.cityState || res.country || 'Location not set';

          if (res.social) this.user.social = res.social;
          
          console.log('Mapped User Data:', this.user);

          // Force UI update
          this.cdr.detectChanges(); 
        },
        error: (err) => {
          console.error('Error in Meta Card fetch:', err);
        }
      });
    } else {
      console.warn('Meta Card: No token found!');
    }
  }

  handleSave() {
    console.log('Saving Meta Changes:', this.user);
    // Future update API call can be added here
    this.closeModal();
  }
}