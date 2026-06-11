import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-cc',
  imports: [CommonModule, FormsModule],
  templateUrl: './cc.component.html',
  styleUrl: './cc.component.css',
})
export class CcComponent {
private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/CcConfig`;

  ccList: any[] = [];
  isModalOpen = false;
  isEditMode = false;
  
  // Model setup reflecting backend controller parameters
  newCcData: any = { id: 0, ccName: '', status: true };

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadCcConfigs();
  }

  // List fetch targeting backend list schema
  loadCcConfigs() {
    // backend list supports pagination, fetching standard dump matching all list operations
    this.http.get<any>(`${this.apiUrl}/list?pageNumber=1&pageSize=50`).subscribe({
      next: (res) => {
        // Checking schema mapping structure out from standard response payload
        this.ccList = res.data || res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading CC Configurations:', err);
      }
    });
  }

  openModal(cc?: any) {
    this.isEditMode = !!cc;
    this.newCcData = cc ? { ...cc } : { id: 0, ccName: '', status: true };
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  closeModal() { 
    this.isModalOpen = false; 
    this.newCcData = { id: 0, ccName: '', status: true };
    this.cdr.detectChanges();
  }

  // Submitting clean JSON body matching model structure
  saveCcConfig() {
    if (!this.newCcData.ccName) return;

    this.http.post(`${this.apiUrl}/save`, this.newCcData).subscribe({
      next: () => {
        this.loadCcConfigs(); 
        this.closeModal();  
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error saving CC configuration payload:', err);
      }
    });
  }

  // Dynamic state modification mapping toggle-status endpoint logic
  toggleStatus(cc: any) {
    const payload = {
      id: cc.id,
      status: !cc.status
    };

    this.http.put(`${this.apiUrl}/toggle-status`, payload).subscribe({
      next: () => {
        cc.status = !cc.status; // Update local reference state locally on code check
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error updating status state structure:', err);
      }
    });
  }

  // Delete configuration call matching endpoint id sequence mapping
  deleteCc(id: number) {
    if (confirm('Are you sure you want to delete this configuration?')) {
      this.http.delete(`${this.apiUrl}/delete/${id}`).subscribe({
        next: () => {
          this.loadCcConfigs(); 
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error processing entity destruction:', err);
        }
      });
    }
  }
}
