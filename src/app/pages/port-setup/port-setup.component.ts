import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-port-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, DragDropModule],
  templateUrl: './port-setup.component.html',
  styleUrl: './port-setup.component.css'
})
export class PortSetupComponent implements OnInit {
  private apiUrl = environment.apiUrl + '/PortSetup';

  allPorts: any[] = [];
  // 'sno' column list mein pehle add kiya hai
  displayedColumns: string[] = ['sno', 'name', 'code', 'function', 'actions'];

  isModalOpen = false;
  isEditMode = false;
  newPort = { id: 0, name: '', code: '', function: '', country: '', status: true, sortOrder: 0 };

  searchCountry = '';
  searchPortName = '';
  searchFunction = '';
  quickSearch = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchPorts();
  }

  // Token Authorization ke liye headers
  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  fetchPorts() {
    const headers = this.getHeaders();
    this.http.get<any[]>(this.apiUrl, { headers }).subscribe({
      next: (res) => {
        this.allPorts = res.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Error loading ports", err)
    });
  }

  onColumnDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }

  onDrop(event: CdkDragDrop<any[]>) {
    if (event.previousIndex === event.currentIndex) return;
    moveItemInArray(this.allPorts, event.previousIndex, event.currentIndex);
    this.allPorts = [...this.allPorts];

    const headers = this.getHeaders();
    this.http.post(`${this.apiUrl}/reorder`, this.allPorts, { headers }).subscribe({
      next: () => console.log("Row order updated"),
      error: (err) => {
        console.error("Reorder failed", err);
        this.fetchPorts();
      }
    });
  }

  openModal() {
    this.isEditMode = false;
    this.newPort = { id: 0, name: '', code: '', function: '', country: '', status: true, sortOrder: 0 };
    this.isModalOpen = true;
    alert('Please fill in the port details and click Save.');
  }

  editPort(port: any) {
    this.isEditMode = true;
    this.newPort = { ...port };
    this.isModalOpen = true;
  }

  closeModal() { this.isModalOpen = false; }

  savePort() {
    const headers = this.getHeaders();
    if (this.isEditMode) {
      this.http.put(`${this.apiUrl}/${this.newPort.id}`, this.newPort, { headers }).subscribe(() => {
        this.fetchPorts();
        this.closeModal();
      });
    } else {
      this.http.post(this.apiUrl, this.newPort, { headers }).subscribe(() => {
        this.fetchPorts();
        this.closeModal();
      });
    }
  }

  deletePort(id: number) {
    if (confirm('Are you sure?')) {
      const headers = this.getHeaders();
      this.http.delete(`${this.apiUrl}/${id}`, { headers }).subscribe(() => this.fetchPorts());
    }
  }

  get filteredPorts() {
    return this.allPorts.filter(port => {
      const matchCountry = (port.country || '').toLowerCase().includes(this.searchCountry.toLowerCase());
      const matchName = (port.name || '').toLowerCase().includes(this.searchPortName.toLowerCase());
      const matchFunction = (port.function || '').toLowerCase().includes(this.searchFunction.toLowerCase());
      const q = this.quickSearch.toLowerCase();
      const matchQuick = !this.quickSearch ? true : (
        (port.name || '').toLowerCase().includes(q) ||
        (port.code || '').toLowerCase().includes(q) ||
        (port.country || '').toLowerCase().includes(q)
      );
      return matchCountry && matchName && matchFunction && matchQuick;
    });
  }

  resetFilters() {
    this.searchCountry = ''; this.searchPortName = '';
    this.searchFunction = ''; this.quickSearch = '';
  }
}