import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
  
  private apiUrl = environment.apiUrl + '/Hod'; // API URL from environment variable

  hods: any[] = [];
  newHod = { name: '' };

  // ChangeDetectorRef inject kiya gaya hai
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchHods();
  }

  fetchHods() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.hods = data;
        this.cdr.detectChanges(); // Data aate hi UI refresh
      },
      error: (err) => console.error('Error fetching HODs', err)
    });
  }

  openModal() { 
    this.isEditMode = false;
    this.newHod = { name: '' };
    this.isModalOpen = true; 
    this.cdr.detectChanges();
  }

  editHod(hod: any) {
    this.isEditMode = true;
    this.selectedHodId = hod.id;
    this.newHod = { name: hod.name };
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  closeModal() { 
    this.isModalOpen = false; 
    this.selectedHodId = null;
    this.cdr.detectChanges();
  }
  
  saveHod() { 
    if (this.newHod.name.trim()) {
      const upperName = this.newHod.name.trim().toUpperCase();

      if (this.isEditMode && this.selectedHodId) {
        const payload = { id: this.selectedHodId, name: upperName };
        this.http.put(`${this.apiUrl}/${this.selectedHodId}`, payload).subscribe({
          next: () => this.handleSuccess(),
          error: (err) => console.error('Update HOD failed:', err)
        });
      } else {
        const payload = { name: upperName };
        this.http.post(this.apiUrl, payload).subscribe({
          next: () => this.handleSuccess(),
          error: (err) => {
            console.error('Add HOD failed:', err);
            alert('Could not add HOD. Please check API.');
          }
        });
      }
    }
  }

  private handleSuccess() {
    this.fetchHods();
    this.closeModal();
    this.cdr.detectChanges();
  }
  
  deleteHod(id: number) {
    if(confirm('Are you sure you want to delete this HOD?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.fetchHods();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error deleting HOD', err)
      });
    }
  }
}