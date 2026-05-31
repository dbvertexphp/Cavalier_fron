import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-branch-designation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './branch-designation.component.html'
})
export class BranchDesignationComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef); // ChangeDetectorRef inject kiya
  private apiUrl = `${environment.apiUrl}/BranchDesignation`;

  designations: any[] = [];
  isModalOpen = false;
  isEditMode = false;
  newDesig: any = { id: 0, name: '', level: '' };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.http.get<any[]>(this.apiUrl).subscribe(res => {
      this.designations = res;
      this.cdr.detectChanges(); // UI force update
    });
  }

  openModal(desig?: any) {
    this.isEditMode = !!desig;
    this.newDesig = desig ? { ...desig } : { id: 0, name: '', level: '' };
    this.isModalOpen = true;
    this.cdr.detectChanges(); // Modal open hote hi trigger
  }

  closeModal() { 
    this.isModalOpen = false; 
    this.newDesig = { id: 0, name: '', level: '' };
    this.cdr.detectChanges(); // UI reflect
  }

  saveDesignation() {
    if (!this.newDesig.name) {
      Swal.fire('Warning', 'Please enter a designation name.', 'warning');
      return;
    }

    this.http.post(this.apiUrl, this.newDesig).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: this.isEditMode ? 'Updated!' : 'Saved!',
          text: `Designation ${this.isEditMode ? 'updated' : 'created'} successfully.`,
          timer: 1500,
          showConfirmButton: false
        });

        this.loadData(); 
        this.closeModal();
      },
      error: () => {
        Swal.fire('Error', 'Something went wrong!', 'error');
      }
    });
  }

  deleteDesig(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#654E51',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
          this.loadData();
          Swal.fire('Deleted!', 'Designation has been deleted.', 'success');
          this.cdr.detectChanges(); // Delete ke baad UI refresh
        });
      }
    });
  }
}