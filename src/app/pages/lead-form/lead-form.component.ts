import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router'; // Router import kiya

@Component({
  selector: 'app-lead-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lead-form.component.html',
  styleUrl: './lead-form.component.css',
})
export class LeadFormComponent implements OnInit {
  leadForm!: FormGroup;
  isFormOpen = false; 
  
  
  leads: any[] = [
    { date: '12-Feb-2026', organization: 'ABC SHIPPING', type: 'New Business', leadOwner: 'BHARAT JUYAL', status: 'Inquiry Received', branch: 'DELHI' },
    { date: '12-Feb-2026', organization: 'XYZ LOGISTICS', type: 'New Business', leadOwner: 'BHARAT JUYAL', status: 'Won', branch: 'DELHI' }
  ];

  constructor(private fb: FormBuilder, private router: Router) {} // router yahan inject kiya

  ngOnInit(): void {
    this.initForm();
  }

  // Naya function jo Organization page par le jayega
  navigateToNewOrg() {
    this.router.navigate(['/dashboard/organization-add']);
  }

  toggleForm() {
    this.isFormOpen = !this.isFormOpen;
    if (this.isFormOpen) {
      this.calculateExpectedValidity();
    }
  }

  initForm() {
    const today = new Date();
    this.leadForm = this.fb.group({
      type: ['New Business'],
      source: [''], 
      salesProcess: [''],
      salesCoordinator: [''],
      branch: ['DELHI'],
      date: [this.formatDate(today)],
      leadOwner: ['BHARAT JUYAL', Validators.required],
      expectedValidity: [''],
      salesStage: ['Inquiry Received'],
      reportingManager: [''],
      hod: [''],
      team: [''],

      // Organization & Contact Details
      organization: ['', Validators.required],
      roleShipper: [true],
      roleConsignee: [false],
      roleServices: [false],
      contactPerson: [''],
      emailId: ['', [Validators.email]],
      mobileNumber: [''],
      whatsappNumber: [''],
      department: ['']
    });
  }

  calculateExpectedValidity() {
    const date = new Date();
    date.setDate(date.getDate() + 90);
    this.leadForm.patchValue({
      expectedValidity: this.formatDate(date)
    });
  }

  formatDate(date: Date): string {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  onSave() {
    if (this.leadForm.valid) {
      console.log('Form Data:', this.leadForm.getRawValue());
      alert('Success: Lead Information Saved!');
      this.isFormOpen = false;
    } else {
      alert('Error: Mandatory fields missing.');
    }
  }
}







// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// // 🔄 Drag-Drop aur Transfer ke liye zaroori imports
// import { 
//   CdkDragDrop, 
//   moveItemInArray, 
//   transferArrayItem, 
//   DragDropModule 
// } from '@angular/cdk/drag-drop';

// @Component({
//   selector: 'app-lead-form',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule, DragDropModule],
//   templateUrl: './lead-form.component.html',
//   styleUrl: './lead-form.component.css'
// })
// export class LeadFormComponent implements OnInit {
//   leadForm!: FormGroup;
//   isFormOpen = false;

//   // 1. Dual List ke liye do Arrays
//   availableColumns: string[] = ['Date', 'Type', 'Lead Owner', 'Stage', 'Branch', 'Team', 'Sales Process'];
//   selectedColumns: string[] = ['Organization']; // Default selected

//   constructor(private fb: FormBuilder, private router: Router) {}

//   ngOnInit(): void {
//     this.initForm();
//   }

//   // 🔄 Drag and Drop + Transfer Logic
//   drop(event: CdkDragDrop<string[]>) {
//     if (event.previousContainer === event.container) {
//       // Usi list mein upar-niche karna
//       moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
//     } else {
//       // Ek list se dusri list mein bhejna
//       transferArrayItem(
//         event.previousContainer.data,
//         event.container.data,
//         event.previousIndex,
//         event.currentIndex
//       );
//     }
//     console.log('Selected Columns Order:', this.selectedColumns);
//   }

//   // ➡️ Arrow Function: Available se Selected mein bhejna
//   moveToSelected(index: number) {
//     const item = this.availableColumns.splice(index, 1)[0];
//     this.selectedColumns.push(item);
//   }

//   // ⬅️ Arrow Function: Selected se Available mein bhejna
//   moveToAvailable(index: number) {
//     const item = this.selectedColumns.splice(index, 1)[0];
//     this.availableColumns.push(item);
//   }

//   // --- Baaki Form Methods ---
//   initForm() {
//     this.leadForm = this.fb.group({
//       organization: ['', Validators.required],
//       type: ['New Business'],
//       leadOwner: ['BHARAT JUYAL']
//     });
//   }

//   toggleForm() {
//     this.isFormOpen = !this.isFormOpen;
//   }
// }