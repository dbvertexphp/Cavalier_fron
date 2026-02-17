import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-hod',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './hod.component.html',
})
export class HodComponent implements OnInit {
  isModalOpen = false;
  isEditMode = false;
  selectedHodId: number | null = null;
  
  // Aapka API URL
  private apiUrl = 'http://localhost:5000/api/Hod';

  hods: any[] = [];
  newHod = { name: '' };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchHods();
  }

  fetchHods() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => this.hods = data,
      error: (err) => console.error('Error fetching HODs', err)
    });
  }

  openModal() { 
    this.isEditMode = false;
    this.newHod = { name: '' };
    this.isModalOpen = true; 
  }

  // Ye method miss ho gaya tha, ab add kar diya hai
  editHod(hod: any) {
    this.isEditMode = true;
    this.selectedHodId = hod.id;
    this.newHod = { name: hod.name };
    this.isModalOpen = true;
  }

  closeModal() { 
    this.isModalOpen = false; 
    this.selectedHodId = null;
  }
  
  saveHod() { 
    if (this.newHod.name.trim()) {
      if (this.isEditMode) {
        // Edit logic (Abhi UI level par hai, agar backend mein PUT API hai toh call karein)
        console.log('Update logic for:', this.selectedHodId);
        this.closeModal();
      } else {
        // POST API Call for Adding HOD
        this.http.post(this.apiUrl, this.newHod).subscribe({
          next: () => {
            this.fetchHods(); // Success ke baad list refresh karein
            this.closeModal();
          },
          error: (err) => {
            console.error('Add HOD failed:', err);
            alert('HOD add nahi ho raha! Check karein backend mein [HttpPost] method hai ya nahi.');
          }
        });
      }
    }
  }
  
  deleteHod(id: number) {
    if(confirm('Are you sure you want to delete this HOD?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => this.fetchHods(),
        error: (err) => console.error('Error deleting HOD', err)
      });
    }
  }
}