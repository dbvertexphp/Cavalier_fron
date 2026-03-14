import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
selector: 'app-port-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, DragDropModule],
  templateUrl: './port-setup.component.html',
  styleUrl: './port-setup.component.css'
})
export class PortSetupComponent implements OnInit
{
  private apiUrl = environment.apiUrl + '/PortSetup';

allPorts: any[] = [];

// Column Reordering State
// Aap is list ka order badal kar default columns set kar sakte hain
displayedColumns: string[] = ['name', 'code', 'function', 'actions'];

// Modal & Form State
isModalOpen = false;
isEditMode = false;
newPort = { id: 0, name: '', code: '', function: '', country: '', status: true, sortOrder: 0 }
;

// Search Fields
searchCountry: string = '';
searchPortName: string = '';
searchFunction: string = '';
quickSearch: string = '';

constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchPorts();
  }

  fetchPorts() {
    this.http.get<any[]>(this.apiUrl).subscribe({
    next: (res) => {
        this.allPorts = res.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        this.cdr.detectChanges();
    },
      error: (err) => console.error("Error loading ports", err)
    });
}

// --- Column Drag Logic ---
onColumnDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
}

// --- Row Drag Logic ---
onDrop(event: CdkDragDrop<any[]>) {
    if (event.previousIndex === event.currentIndex) return;

    moveItemInArray(this.allPorts, event.previousIndex, event.currentIndex);
    this.allPorts = [...this.allPorts];

    this.http.post(`${ this.apiUrl}/ reorder`, this.allPorts).subscribe({
    next: () => console.log("Row order updated"),
      error: (err) => {
          console.error("Reorder failed", err);
          this.fetchPorts();
      }
    });
}

// --- Modal & CRUD Actions ---
openModal() {
    this.isEditMode = false;
    this.newPort = { id: 0, name: '', code: '', function: '', country: '', status: true, sortOrder: 0 }
    ;
    this.isModalOpen = true;
}

editPort(port: any) {
    this.isEditMode = true;
    this.newPort = { ...port }
    ;
    this.isModalOpen = true;
}

closeModal() { this.isModalOpen = false; }

savePort() {
    if (this.isEditMode)
    {
        this.http.put(`${ this.apiUrl}/${ this.newPort.id}`, this.newPort).subscribe(() => {
            this.fetchPorts();
            this.closeModal();
        });
    }
    else
    {
        this.http.post(this.apiUrl, this.newPort).subscribe(() => {
            this.fetchPorts();
            this.closeModal();
        });
    }
}

deletePort(id: number) {
    if (confirm('Are you sure?'))
    {
        this.http.delete(`${ this.apiUrl}/${ id}`).subscribe(() => this.fetchPorts());
    }
}

get filteredPorts()
{
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