import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-list-of-unit',
  standalone: true, // Agar aap Angular 17+ use kar rahe hain
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './list-of-unit.component.html',
  styleUrl: './list-of-unit.component.css',
})
export class ListOfUnitComponent implements OnInit {
  // Initial data mein shortCode add kiya hai
   unitList: any[] = [
  { id: 1, name: 'KILOGRAMS', shortCode: 'KGS' },
  { id: 2, name: 'CENTIMETERS', shortCode: 'CMS' },
  { id: 3, name: 'PIECES', shortCode: 'PCS' },
  { id: 4, name: 'CUBIC METER', shortCode: 'CBM' }
  ];
  
  isModalOpen = false;
  isEditMode = false;
  showPopup = false;
  unitToDeleteId: number | null = null;

  // Form Object
  currentUnit = {
    id: null,
    name: '',
    shortCode: ''
  };

  constructor() { }

  ngOnInit(): void { 
    
  }

  // Modal Controls
  openModal() {
    this.isEditMode = false;
    this.currentUnit = { id: null, name: '', shortCode: '' };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  // Save or Update
  saveUnit() {
    // ShortCode ko automatically Uppercase karne ke liye
    if (this.currentUnit.shortCode) {
      this.currentUnit.shortCode = this.currentUnit.shortCode.toUpperCase();
    }

    if (this.isEditMode) {
      // Update logic
      const index = this.unitList.findIndex(u => u.id === this.currentUnit.id);
      if (index > -1) {
        this.unitList[index] = { ...this.currentUnit };
      }
    } else {
      // Add logic
      const newId = this.unitList.length > 0 ? Math.max(...this.unitList.map(u => u.id)) + 1 : 1;
      // Yahan shortCode include karna zaroori tha
      this.unitList.push({ 
        id: newId, 
        name: this.currentUnit.name, 
        shortCode: this.currentUnit.shortCode 
      });
    }
    this.closeModal();
  }

  // Edit Action
  editUnit(unit: any) {
    this.isEditMode = true;
    this.currentUnit = { ...unit };
    this.isModalOpen = true;
  }

  // Delete Actions
  deleteUnit(id: number) {
    this.unitToDeleteId = id;
    this.showPopup = true;
  }

  confirmDelete() {
    if (this.unitToDeleteId) {
      this.unitList = this.unitList.filter(u => u.id !== this.unitToDeleteId);
    }
    this.showPopup = false;
    this.unitToDeleteId = null;
  }

  cancelDelete() {
    this.showPopup = false;
    this.unitToDeleteId = null;
  }
}