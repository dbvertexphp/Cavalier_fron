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

  editHod(hod: any) {
    this.isEditMode = true;
    this.selectedHodId = hod.id;
    this.newHod = { name: hod.name }; // Modal mein existing name dikhega
    this.isModalOpen = true;
  }

  closeModal() { 
    this.isModalOpen = false; 
    this.selectedHodId = null;
  }
  
  saveHod() { 
    if (this.newHod.name.trim()) {
      // Logic: Convert to UPPERCASE before saving
      const upperName = this.newHod.name.trim().toUpperCase();

      if (this.isEditMode && this.selectedHodId) {
        // PUT API Call for Updating HOD
        const payload = { id: this.selectedHodId, name: upperName };
        this.http.put(`${this.apiUrl}/${this.selectedHodId}`, payload).subscribe({
          next: () => {
            this.fetchHods();
            this.closeModal();
          },
          error: (err) => console.error('Update HOD failed:', err)
        });
      } else {
        // POST API Call for Adding HOD
        const payload = { name: upperName };
        this.http.post(this.apiUrl, payload).subscribe({
          next: () => {
            this.fetchHods();
            this.closeModal();
          },
          error: (err) => {
            console.error('Add HOD failed:', err);
            alert('Could not add HOD. Please check API.');
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