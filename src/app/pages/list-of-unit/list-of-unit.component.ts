import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-list-of-unit',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './list-of-unit.component.html',
})
export class ListOfUnitComponent implements OnInit {
  
  private apiUrl = 'http://localhost:5000/api/UnitOfMeasurement';
  unitList: any[] = [];
  
  isModalOpen = false;
  isEditMode = false;
  showPopup = false;
  unitToDeleteId: number | null = null;

  currentUnit = { id: 0, name: '', shortCode: '' };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void { 
    this.fetchUnits();
  }

  // 1. API se data lana
  fetchUnits() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.unitList = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Fetch failed', err)
    });
  }

  openModal() {
    this.isEditMode = false;
    this.currentUnit = { id: 0, name: '', shortCode: '' };
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  closeModal() {
    this.isModalOpen = false;
    this.cdr.detectChanges();
  }

  // 2. Save/Update API Call
  saveUnit() {
    const payload = {
      ...this.currentUnit,
      name: this.currentUnit.name.trim().toUpperCase(),
      shortCode: this.currentUnit.shortCode.trim().toUpperCase()
    };

    if (this.isEditMode) {
      this.http.put(`${this.apiUrl}/${payload.id}`, payload).subscribe({
        next: () => this.handleSuccess(),
        error: (err) => console.error('Update failed', err)
      });
    } else {
      this.http.post(this.apiUrl, payload).subscribe({
        next: () => this.handleSuccess(),
        error: (err) => console.error('Save failed', err)
      });
    }
  }

  private handleSuccess() {
    this.fetchUnits();
    this.closeModal();
  }

  editUnit(unit: any) {
    this.isEditMode = true;
    this.currentUnit = { ...unit };
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  // 3. Delete Logic
  deleteUnit(id: number) {
    this.unitToDeleteId = id;
    this.showPopup = true;
    this.cdr.detectChanges();
  }

  confirmDelete() {
    if (this.unitToDeleteId) {
      this.http.delete(`${this.apiUrl}/${this.unitToDeleteId}`).subscribe({
        next: () => {
          this.fetchUnits();
          this.showPopup = false;
        },
        error: (err) => console.error('Delete failed', err)
      });
    }
  }

  cancelDelete() {
    this.showPopup = false;
    this.unitToDeleteId = null;
    this.cdr.detectChanges();
  }
}