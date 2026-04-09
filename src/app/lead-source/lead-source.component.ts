import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-lead-source',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lead-source.component.html'
})
export class LeadSourceComponent implements OnInit {
  private apiUrl = `${environment.apiUrl}/LeadSources`;

  leadSources: any[] = [];
  sourceName: string = '';
  isModalOpen = false;
  isEditMode = false;
  currentId: number | null = null;

  constructor(private http: HttpClient,private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.getData(); }

  getData() {
    this.http.get<any[]>(this.apiUrl).subscribe(res => this.leadSources = res);
  }

  openModal() {
    this.isEditMode = false;
    this.sourceName = '';
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.sourceName = '';
    this.currentId = null;
  }

  edit(item: any) {
    this.isEditMode = true;
    this.currentId = item.id;
    this.sourceName = item.name;
    this.isModalOpen = true;
  }

 save() {
  if (!this.sourceName?.trim()) {
    alert("Please enter Source Name");
    return;
  }

  const payload = { 
    name: this.sourceName.toUpperCase().trim() 
  };

  if (this.isEditMode && this.currentId) {
    // ==================== UPDATE ====================
    this.http.put(`${this.apiUrl}/${this.currentId}`, { id: this.currentId, ...payload })
      .subscribe({
        next: () => {
          alert("✅ Updated Successfully!");
          this.getData();           // List refresh
          this.closeModal();        // Modal close
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          alert("❌ Failed to Update!");
        }
      });

  } else {
    // ==================== CREATE (SAVE) ====================
    this.http.post(this.apiUrl, payload)
      .subscribe({
        next: () => {
          alert("✅ Saved Successfully!");
          this.getData();           // List refresh
          this.closeModal();        // Modal close
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          alert("❌ Failed to Save!");
        }
      });
  }
}

  delete(id: number) {
    if (confirm("Delete this Lead Source?")) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => this.getData());
    }
  }
}