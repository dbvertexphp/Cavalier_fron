import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departments.component.html',
  styleUrl: './departments.component.css',
})
export class DepartmentsComponent {
  isModalOpen = false;

  // Form Model (Count hata diya gaya hai)
  newDept = {
    name: '',
    head: ''
  };

  departments = [
    { id: 1, name: 'IT Department', head: 'Rahul Sharma', count: 25 },
    { id: 2, name: 'Human Resources', head: 'Priya Singh', count: 8 },
    { id: 3, name: 'Operations', head: 'Suresh Patel', count: 40 },
    { id: 4, name: 'Sales & Marketing', head: 'Amit Sharma', count: 15 }
  ];

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.newDept = { name: '', head: '' }; // Reset form
  }

  addDepartment() {
    if (this.newDept.name && this.newDept.head) {
      // Naya ID generate karna
      const nextId = this.departments.length + 1;

      this.departments.unshift({
        id: nextId,
        name: this.newDept.name,
        head: this.newDept.head,
        count: 0 // Naye department ke liye default count 0
      });

      this.closeModal();
    } else {
      alert("Please enter Department Name and Head Name");
    }
  }

  deleteDept(index: number) {
    if(confirm('Are you sure you want to delete this department?')) {
      this.departments.splice(index, 1);
    }
  }
}