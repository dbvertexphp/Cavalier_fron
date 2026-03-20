import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-tranport-mode',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tranport-mode.component.html',
  styleUrl: './tranport-mode.component.css',
})
export class TranportModeComponent implements OnInit {
  private apiUrl = `${environment.apiUrl}/TransportModes`; 

  transportModes: any[] = [];
  newName: string = '';
  
  // Modal states
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  currentId: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (res) => this.transportModes = res,
      error: (err) => console.error("Error fetching data:", err)
    });
  }

  // Modal Open for Add
  openModal() {
    this.isEditMode = false;
    this.newName = '';
    this.currentId = null;
    this.isModalOpen = true;
  }

  // Modal Open for Edit
  editModeOpen(item: any) {
    this.isEditMode = true;
    this.currentId = item.id;
    this.newName = item.name;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.newName = '';
  }

 save() {
  if (!this.newName.trim()) {
    alert("Please enter a name");
    return;
  }

  const payload = { name: this.newName.toUpperCase() };

  if (this.isEditMode && this.currentId) {
    // --- UPDATE LOGIC ---
    this.http.put(`${this.apiUrl}/${this.currentId}`, { id: this.currentId, ...payload })
      .subscribe({
        next: () => {
          this.getData();      // List refresh karo
          this.closeModal();   // ✅ Modal band karo
        },
        error: (err) => console.error("Update failed:", err)
      });
  } else {
    // --- CREATE LOGIC ---
    this.http.post(this.apiUrl, payload)
      .subscribe({
        next: () => {
          this.getData();      // List refresh karo
          this.closeModal();   // ✅ Modal band karo
        },
        error: (err) => console.error("Post failed:", err)
      });
  }
}

  deleteMode(id: number) {
    if (confirm("Are you sure you want to delete this transport mode?")) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => this.getData()
      });
    }
  }
}