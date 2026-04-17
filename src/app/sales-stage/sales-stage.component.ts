import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CheckPermissionService } from '../services/check-permission.service';

@Component({
  selector: 'app-sales-stage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-stage.component.html'
})
export class SalesStageComponent implements OnInit {
  private apiUrl = `${environment.apiUrl}/SalesStages`;

  salesStages: any[] = [];
  stageName: string = '';
  isModalOpen = false;
  PermissionID:any;
  isEditMode = false;
  currentId: number | null = null;

  constructor(private http: HttpClient,private cdr: ChangeDetectorRef,public CheckPermissionService:CheckPermissionService) {}

  ngOnInit() { this.PermissionID = Number(localStorage.getItem('permissionID')); this.getData(); }

  getData() {
    this.http.get<any[]>(this.apiUrl).subscribe(res => this.salesStages = res);
  }

  openModal() {
    this.isEditMode = false;
    this.stageName = '';
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.stageName = '';
    this.currentId = null;
  }

  edit(item: any) {
    this.isEditMode = true;
    this.currentId = item.id;
    this.stageName = item.name;
    this.isModalOpen = true;
  }

 save() {
  if (!this.stageName?.trim()) {
    alert("Please enter Stage Name!");
    return;
  }

  const payload = { 
    name: this.stageName.toUpperCase().trim() 
  };

  if (this.isEditMode && this.currentId) {
    // ==================== UPDATE ====================
    this.http.put(`${this.apiUrl}/${this.currentId}`, { id: this.currentId, ...payload })
      .subscribe({
        next: () => {
          alert("✅ Updated Successfully!");
          this.getData();      // List refresh
          this.closeModal();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          alert("❌ Failed to Update!");
        }
      });

  } else {
    // ==================== SAVE (New) ====================
    this.http.post(this.apiUrl, payload)
      .subscribe({
        next: () => {
          alert("✅ Saved Successfully!");
          this.getData();      // List refresh
          this.closeModal();
          this.cdr.detectChanges();  // Modal close
        },
        error: (err) => {
          console.error(err);
          alert("❌ Failed to Save!");
        }
      });
  }
}

  delete(id: number) {
    if (confirm("Delete this Sales Stage?")) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => this.getData());
    }
  }
}