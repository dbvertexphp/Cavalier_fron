import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-bcc-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bcc-config.component.html'
})
export class BccConfigComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/BccConfig`;

  bccList: any[] = [];
  isModalOpen = false;
  isEditMode = false;
  newBccData: any = { id: 0, bccName: '', status: true };

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadBccConfigs();
  }

  loadBccConfigs() {
    this.http.get<any>(`${this.apiUrl}/list?pageNumber=1&pageSize=50`).subscribe({
      next: (res) => {
        this.bccList = res.data || res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading BCC lists:', err)
    });
  }

  openModal(bcc?: any) {
    this.isEditMode = !!bcc;
    this.newBccData = bcc ? { ...bcc } : { id: 0, bccName: '', status: true };
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  closeModal() { 
    this.isModalOpen = false; 
    this.newBccData = { id: 0, bccName: '', status: true };
    this.cdr.detectChanges();
  }

  saveBccConfig() {
    if (!this.newBccData.bccName) return;

    this.http.post(`${this.apiUrl}/save`, this.newBccData).subscribe({
      next: () => {
        this.loadBccConfigs(); 
        this.closeModal();  
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Error saving BCC object:', err)
    });
  }

  toggleStatus(bcc: any) {
    const payload = { id: bcc.id, status: !bcc.status };
    this.http.put(`${this.apiUrl}/toggle-status`, payload).subscribe({
      next: () => {
        bcc.status = !bcc.status;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error updating status state:', err)
    });
  }

  deleteBcc(id: number) {
    if (confirm('Are you sure you want to delete this configuration?')) {
      this.http.delete(`${this.apiUrl}/delete/${id}`).subscribe({
        next: () => {
          this.loadBccConfigs(); 
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error deleting BCC config:', err)
      });
    }
  }
}