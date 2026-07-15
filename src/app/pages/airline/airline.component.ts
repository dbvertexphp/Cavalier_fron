import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  
import { FormsModule } from '@angular/forms';  
import { AirlineService } from '../../services/airline.service';
import { Airline } from '../../services/airline.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-airline-list',
  standalone: true,                   
  imports: [CommonModule, FormsModule], 
  templateUrl: './airline.component.html',
})
export class AirlineListComponent implements OnInit {
  airlines: Airline[] = [];
  form: Airline = { airlineName: '', airlineCode: '', airlinePrefix: '' };
  editMode = false;
  isModalOpen = false;

  constructor(private airlineService: AirlineService) {}

  ngOnInit(): void {
    this.loadAirlines();
  }

  loadAirlines(): void {
    this.airlineService.getAll().subscribe({
      next: (data: Airline[]) => (this.airlines = data),
      error: (err:any) => console.error('Error loading airlines:', err),
    });
  }

  openAddModal(): void {
    this.resetForm();
    this.isModalOpen = true;
  }

  openEditModal(airline: Airline): void {
    this.form = { ...airline };
    this.editMode = true;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  saveAirline(): void {
    if (!this.form.airlineName || !this.form.airlineCode || !this.form.airlinePrefix) {
      Swal.fire('Missing Fields', 'Please fill Name, Code and Prefix.', 'warning');
      return;
    }

    const action = this.editMode && this.form.id
      ? this.airlineService.update(this.form.id, this.form)
      : this.airlineService.create(this.form);

    action.subscribe({
      next: () => {
        Swal.fire('Success!', `Airline ${this.editMode ? 'updated' : 'added'} successfully.`, 'success');
        this.closeModal();
        this.loadAirlines();
      },
      error: (err:any) => {
        const backendMessage = err?.error?.message || err?.message || 'Failed to save airline.';
        Swal.fire('Error!', backendMessage, 'error');
      },
    });
  }

  deleteAirline(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This airline will be deleted permanently.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
    }).then((result) => {
      if (result.isConfirmed) {
        this.airlineService.delete(id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Airline has been deleted.', 'success');
            this.loadAirlines();
          },
          error: (err:any) => {
            const backendMessage = err?.error?.message || 'Failed to delete airline.';
            Swal.fire('Error!', backendMessage, 'error');
          },
        });
      }
    });
  }

  resetForm(): void {
    this.form = { airlineName: '', airlineCode: '', airlinePrefix: '' };
    this.editMode = false;
  }
}