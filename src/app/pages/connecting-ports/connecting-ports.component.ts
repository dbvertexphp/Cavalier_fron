import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-connecting-ports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './connecting-ports.component.html'
})
export class ConnectingPortsComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private apiUrl = `${environment.apiUrl}/ConnectingPort`;

  activeTab: 'AIRPORT' | 'SEAPORT' = 'AIRPORT';
  ports: any[] = [];
  isLoading = false;
  isModalOpen = false;
  isEditMode = false;
  newPort: any = { id: 0, portType: '', name: '', code: '' };

  ngOnInit() { this.loadData(); }

  loadData() {
    this.isLoading = true;
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (res) => {
        this.ports = res;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { 
        this.isLoading = false; 
        this.cdr.detectChanges();
      }
    });
  }

  changeTab(tab: 'AIRPORT' | 'SEAPORT') {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  get filteredPorts() {
    return this.ports.filter(p => p.portType === this.activeTab);
  }

  openModal(port?: any) {
    this.isEditMode = !!port;
    this.newPort = port ? { ...port } : { id: 0, portType: this.activeTab, name: '', code: '' };
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  closeModal() { 
    this.isModalOpen = false;
    this.newPort = { id: 0, portType: '', name: '', code: '' }; // Reset fields
    this.cdr.detectChanges();
  }

  savePort() {
    if (!this.newPort.name || !this.newPort.code) {
      Swal.fire('Error', 'Please fill all fields', 'error');
      return;
    }
    
    this.newPort.portType = this.activeTab;
    this.http.post(this.apiUrl, this.newPort).subscribe({
      next: () => {
        // Modal pehle close karo taaki user ko lage action complete ho gaya
        this.closeModal();
        Swal.fire('Success', 'Port saved successfully!', 'success');
        this.loadData();
      },
      error: () => {
        Swal.fire('Error', 'Failed to save data', 'error');
      }
    });
  }

  deletePort(id: number) {
    Swal.fire({ 
      title: 'Delete?', 
      text: "You won't be able to revert this!", 
      icon: 'warning', 
      showCancelButton: true,
      confirmButtonColor: '#d33' 
    }).then(r => {
      if (r.isConfirmed) {
        this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
          this.loadData();
          Swal.fire('Deleted!', 'Port removed.', 'success');
        });
      }
    });
  }
}