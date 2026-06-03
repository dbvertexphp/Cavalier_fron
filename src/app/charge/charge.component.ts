import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-charge',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './charge.component.html'
})
export class ChargeComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Charge`;

  charges: any[] = [];
  isModalOpen = false;
  isEditMode = false;
  newCharge: any = { id: 0, name: '' };

  // Constructor jismein ChangeDetectorRef inject kiya hai
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadCharges();
  }

  loadCharges() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (res) => {
        this.charges = res;
        this.cdr.detectChanges(); // Data load hone ke baad UI refresh karega
      },
      error: (err) => {
        console.error('Error loading charges:', err);
      }
    });
  }

  openModal(charge?: any) {
    this.isEditMode = !!charge;
    this.newCharge = charge ? { ...charge } : { id: 0, name: '' };
    this.isModalOpen = true;
    this.cdr.detectChanges(); // Modal open hone par state update karega
  }

  closeModal() { 
    this.isModalOpen = false; 
    this.newCharge = { id: 0, name: '' };
    this.cdr.detectChanges();
  }

  saveCharge() {
    if (!this.newCharge.name) return;

    this.http.post(this.apiUrl, this.newCharge).subscribe({
      next: () => {
        this.loadCharges(); // Naya data reload karega
        this.closeModal();  // Modal close karega
        this.cdr.detectChanges(); // Save hone ke baad final UI update
      },
      error: (err) => {
        console.error('Error saving charge:', err);
      }
    });
  }

  deleteCharge(id: number) {
    if (confirm('Delete this charge?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.loadCharges(); // Delete ke baad list refresh
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error deleting charge:', err);
        }
      });
    }
  }
}