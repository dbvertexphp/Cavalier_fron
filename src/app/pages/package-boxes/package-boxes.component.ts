import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
// import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-package-boxes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './package-boxes.component.html',
})
export class PackageBoxesComponent implements OnInit {
  apiUrl = `${environment.apiUrl}/PackageBox`;
  boxesList: any[] = [];
  isModalOpen = false;
  isEditMode = false;
  newBox: any = { id: 0, name: '' };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadBoxes();
  }

  loadBoxes() {
    this.http.get<any[]>(`${this.apiUrl}/list`).subscribe(res => {
      this.boxesList = res;
    });
  }

  openModal(box: any = null) {
    this.isEditMode = !!box;
    this.newBox = box ? { ...box } : { id: 0, name: '' };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveBox() {
    if (!this.newBox.name) {
      Swal.fire('Error', 'Name is required', 'error');
      return;
    }

    const request = this.isEditMode 
      ? this.http.put(`${this.apiUrl}/update/${this.newBox.id}`, this.newBox)
      : this.http.post(`${this.apiUrl}/add`, this.newBox);

    request.subscribe({
      next: () => {
        Swal.fire('Success', `Box ${this.isEditMode ? 'updated' : 'added'} successfully`, 'success');
        this.loadBoxes();
        this.closeModal();
      },
      error: () => Swal.fire('Error', 'Something went wrong', 'error')
    });
  }

  deleteBox(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}/delete/${id}`).subscribe(() => {
          this.loadBoxes();
          Swal.fire('Deleted!', 'Box has been deleted.', 'success');
        });
      }
    });
  }
}