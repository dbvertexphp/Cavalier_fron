import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-designations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './designations.component.html',
  styleUrl: './designations.component.css',
})
export class DesignationsComponent {
  isModalOpen = false;

  // Naya designation store karne ke liye model
  newDesignation = {
    title: '',
    dept: '',
    selected: false
  };

  designationList = [
    { title: 'Software Engineer', dept: 'IT', selected: false },
    { title: 'Team Lead', dept: 'IT', selected: false },
    { title: 'HR Executive', dept: 'Human Resources', selected: false },
    { title: 'Regional Manager', dept: 'Operations', selected: false },
    { title: 'Developer', dept: 'IT', selected: false }
  ];

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.newDesignation = { title: '', dept: '', selected: false };
  }

  addDesignation() {
    if (this.newDesignation.title.trim() && this.newDesignation.dept.trim()) {
      // List ke shuruat mein naya designation add karna
      this.designationList.unshift({
        title: this.newDesignation.title,
        dept: this.newDesignation.dept,
        selected: false
      });
      this.closeModal();
    } else {
      alert("Please fill both title and department!");
    }
  }

  deleteDesignation(index: number) {
    if (confirm('Are you sure you want to delete this designation?')) {
      this.designationList.splice(index, 1);
    }
  }

  editDesignation(desig: any) {
    console.log('Editing:', desig);
    // Yahan aap edit ka logic ya modal khol sakte hain
  }
}