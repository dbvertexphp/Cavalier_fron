import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-list-of-unit',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './list-of-unit.component.html',
})
export class ListOfUnitComponent implements OnInit {
  
  private apiUrl = environment.apiUrl + '/Uom';
  unitList: any[] = [];
  
  isModalOpen = false;
  isEditMode = false;
  showPopup = false;
  unitToDeleteId: number | null = null;

  // FIX: Initialization me unitName use karein
  currentUnit: any = { id: 0, unitName: '', shortCode: '' };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void { 
    this.fetchUnits();
  }

  // 1. GET API
  fetchUnits() {
    this.http.get<any[]>(`${this.apiUrl}/list`).subscribe({
      next: (data) => {
        this.unitList = data;
        console.log('✅ Units Loaded:', this.unitList);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('❌ Fetch failed', err)
    });
  }

  openModal() {
    this.isEditMode = false;
    this.currentUnit = { id: 0, unitName: '', shortCode: '' };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  // 2. SAVE/UPDATE API
  saveUnit() {
    const payload = {
      unitName: this.currentUnit.unitName.trim(),
      shortCode: this.currentUnit.shortCode.trim().toUpperCase(),
      isActive: true
    };

    if (this.isEditMode) {
      // Backend: PUT /api/Uom/edit/{id}
      this.http.put(`${this.apiUrl}/edit/${this.currentUnit.id}`, payload).subscribe({
        next: () => this.handleSuccess(),
        error: (err) => console.error('Update failed', err)
      });
    } else {
      // Backend: POST /api/Uom/add
      this.http.post(`${this.apiUrl}/add`, payload).subscribe({
        next: () => this.handleSuccess(),
        error: (err) => console.error('Save failed', err)
      });
    }
  }

  private handleSuccess() {
    this.fetchUnits();
    this.closeModal();
    alert(this.isEditMode ? 'Unit Updated!' : 'Unit Saved!');
  }

  editUnit(unit: any) {
    this.isEditMode = true;
    this.currentUnit = { ...unit }; // Copy unit data
    this.isModalOpen = true;
  }

  // 3. DELETE API
  deleteUnit(id: number) {
    this.unitToDeleteId = id;
    this.showPopup = true;
  }

  confirmDelete() {
    if (this.unitToDeleteId) {
      // Backend: DELETE /api/Uom/delete/{id}
      this.http.delete(`${this.apiUrl}/delete/${this.unitToDeleteId}`).subscribe({
        next: () => {
          this.fetchUnits();
          this.showPopup = false;
          this.unitToDeleteId = null;
        },
        error: (err) => console.error('Delete failed', err)
      });
    }
  }

  cancelDelete() {
    this.showPopup = false;
    this.unitToDeleteId = null;
  }
}