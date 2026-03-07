import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface Shift {
  id: number;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  breakDuration: string;
}

@Component({
  selector: 'app-shift-management',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './shift-management.component.html'
})
export class ShiftManagementComponent implements OnInit {
  // API URL using environment pattern
  private apiUrl = `${environment.apiUrl}/Shifts`;

  activeTab: 'list' | 'ai-insights' = 'list';
  showModal = false;
  isEdit = false;
  loading = false;

  shiftList: Shift[] = [];
  
  aiInsights = {
    shortageRisk: 'High (Night Shift)',
    burnoutAlert: '3 Employees (Finance)',
    fatiguePattern: 'Increasing in Night Shift'
  };

  currentShift: Shift = this.initShift();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadShifts();
  }

  initShift(): Shift {
    return { id: 0, code: '', name: '', startTime: '', endTime: '', breakDuration: '' };
  }

  // GET: Fetch all shifts from Database
  loadShifts() {
    this.loading = true;
    this.http.get<Shift[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.shiftList = data;
        this.loading = false;
      },
      error: (err) => {
        console.error("Error fetching shifts:", err);
        this.loading = false;
      }
    });
  }

  addShift() {
    this.isEdit = false;
    this.currentShift = this.initShift();
    this.showModal = true;
  }

  editShift(shift: Shift) {
    this.isEdit = true;
    // Object copy taaki direct table update na ho jab tak save na karein
    this.currentShift = { ...shift }; 
    this.showModal = true;
  }

  // POST & PUT: Save or Update Shift
  saveShift() {
  // Data ko clean karke ek temporary object banayein
  const payload = {
    id: this.isEdit ? this.currentShift.id : 0, // New shift ke liye hamesha 0 bhejein
    code: this.currentShift.code.toString(),
    name: this.currentShift.name.toString(),
    startTime: this.currentShift.startTime,
    endTime: this.currentShift.endTime,
    breakDuration: this.currentShift.breakDuration.toString() // String mein convert karke dekhein
  };

  if (this.isEdit) {
    this.http.put(`${this.apiUrl}/${payload.id}`, payload).subscribe({
      next: () => { this.loadShifts(); this.closeModal(); },
      error: (err) => console.log("PUT Error:", err)
    });
  } else {
    this.http.post(this.apiUrl, payload).subscribe({
      next: () => { this.loadShifts(); this.closeModal(); },
      error: (err) => {
        console.error("Full Error Details:", err); // Isse console mein exact reason dikhega
        alert("Save failed! Check Console (F12) for details.");
      }
    });
  }
}

  // DELETE: Remove shift from DB
  deleteShift(id: number) {
    if (confirm('Proceed with deleting this shift?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => this.loadShifts(),
        error: (err) => alert("Delete failed: " + err.message)
      });
    }
  }

  closeModal() { this.showModal = false; }
}