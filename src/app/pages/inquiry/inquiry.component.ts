// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { FormsModule } from '@angular/forms';
// import { Router, RouterModule } from '@angular/router';
// import { environment } from '../../../environments/environment';

// @Component({
//   selector: 'app-inquiry',
//   standalone: true,
//   imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
//   templateUrl: './inquiry.component.html',
//   styleUrl: './inquiry.component.css',
// })
// export class InquiryComponent implements OnInit {
//   isFormOpen = false;
//   private apiUrl = `${environment.apiUrl}/Inquiry`;

//   quotations: any[] = [];
//   quotation: any = this.resetQuotationModel();
//   selectedFile: File | null = null;

//   // Dimensions Modal Logic
//   isDimModalOpen = false;
//   appliedDimensions: any[] = []; 
//   dimRows: any[] = [
//     { box: null, l: null, w: null, h: null, unit: 'CMS' }
//   ];

//   constructor(private http: HttpClient, private router: Router) {}

//   ngOnInit() {
//     this.loadQuotations();
//   }

//   loadQuotations() {
//     this.http.get<any[]>(this.apiUrl).subscribe({
//       next: (res) => (this.quotations = res),
//       error: (err) => console.error('Failed to load inquiries:', err)
//     });
//   }

//   onFileSelected(event: any) {
//     const file = event.target.files[0];
//     if (file) {
//       this.selectedFile = file;
//     }
//   }

//   // SAVE LOGIC - Validation error fix karne ke liye logic
//   saveQuotation() {
//     if (!this.quotation.customerName) {
//       alert("Error: Organization (Customer Name) is required!");
//       return;
//     }

//     // Backend models ke sath dimensions sync karna
//     this.quotation.dimensions = this.appliedDimensions;

//     // Payload copy banayein taaki asli model kharab na ho
//     const payload = { ...this.quotation };

//     // FIX: Agar ID fields mein number nahi hai (text likha hai), toh unhe null set karein
//     // Kyunki Backend 'int?' (Number) expect kar raha hai
//     if (typeof payload.originId !== 'number') payload.originId = null;
//     if (typeof payload.portOfLoadingId !== 'number') payload.portOfLoadingId = null;
//     if (typeof payload.portOfDischargeId !== 'number') payload.portOfDischargeId = null;
//     if (typeof payload.commodityId !== 'number') payload.commodityId = null;

//     const action = this.quotation.id > 0 
//       ? this.http.put(`${this.apiUrl}/${this.quotation.id}`, payload)
//       : this.http.post(this.apiUrl, payload);

//     action.subscribe({
//       next: (res: any) => {
//         alert("Success: Inquiry Saved Successfully!");
//         this.loadQuotations();
//         this.toggleForm();
//       },
//       error: (err) => {
//         console.error('Save error details:', err);
//         // User ko batayein ki exact galti kya hai
//         const errorMsg = err.error?.title || err.error?.message || "Backend validation error.";
//         alert("Error: Operation failed! " + errorMsg);
//       }
//     });
//   }

//   editQuotation(q: any) {
//     this.quotation = { ...q };
//     if (this.quotation.receivedDate) this.quotation.receivedDate = this.quotation.receivedDate.split('T')[0];
//     if (this.quotation.repliedDate) this.quotation.repliedDate = this.quotation.repliedDate.split('T')[0];
    
//     if (q.dimensions && q.dimensions.length > 0) {
//       this.appliedDimensions = [...q.dimensions];
//       this.dimRows = JSON.parse(JSON.stringify(q.dimensions));
//     }
//     this.isFormOpen = true;
//   }

//   deleteQuotation(id: number) {
//     if (confirm("Are you sure you want to delete this record?")) {
//       this.http.delete(`${this.apiUrl}/${id}`).subscribe({
//         next: () => {
//           alert("Success: Record Deleted!");
//           this.loadQuotations();
//         },
//         error: (err) => console.error('Delete error:', err)
//       });
//     }
//   }

//   toggleForm() {
//     this.isFormOpen = !this.isFormOpen;
//     if (!this.isFormOpen) {
//       this.quotation = this.resetQuotationModel();
//       this.appliedDimensions = [];
//       this.dimRows = [{ box: null, l: null, w: null, h: null, unit: 'CMS' }];
//     }
//   }

//   // Dimensions Modal Functions
//   openDimModal() { this.isDimModalOpen = true; }
//   closeDimModal() { this.isDimModalOpen = false; }

//   addNewDimRow() {
//     this.dimRows.push({ box: null, l: null, w: null, h: null, unit: 'CMS' });
//   }

//   removeDimRow(index: number) {
//     if (this.dimRows.length > 1) {
//       this.dimRows.splice(index, 1);
//     }
//   }

//   saveDimensions() {
//     const validDims = this.dimRows.filter(d => d.box && d.l && d.w && d.h);
//     if (validDims.length > 0) {
//       this.appliedDimensions = JSON.parse(JSON.stringify(validDims));
//       this.closeDimModal();
//     } else {
//       alert("Please fill in all dimension fields.");
//     }
//   }

//   resetQuotationModel() {
//     return {
//       id: 0, 
//       customerName: '', 
//       branchName: '',
//       receivedDate: null, 
//       repliedDate: null,
//       partyRole: '',
//       location: 'DELHI',
//       salesCoordinator: '',
//       qtnDoneBy: 'BHARAT JUYAL',
//       pricingDoneBy: '',
//       transportMode: 'Air',
//       shipmentType: 'International',
//       description: '',
//       noOfPkgs: 0,
//       grossWeightKg: 0,
//       chargeableWeight: 0,
//       // ID fields null initialize karein
//       originId: null,
//       portOfLoadingId: null,
//       portOfDischargeId: null,
//       commodityId: null,
//       finalDestination: '',
//       incoterm: 'EXW',
//       dimensions: []
//     };
//   }

//   neworg() {
//     this.router.navigate(['/dashboard/organization-add']);
//   }
// }

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http'; 
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-inquiry',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
  templateUrl: './inquiry.component.html',
  styleUrl: './inquiry.component.css',
})
export class InquiryComponent implements OnInit {
  isFormOpen = false;
  private apiUrl = `${environment.apiUrl}/Inquiry`;

  quotations: any[] = [];
  quotation: any = this.resetQuotationModel();
  selectedFile: File | null = null;

  isDimModalOpen = false;
  appliedDimensions: any[] = []; 
  dimRows: any[] = [{ box: 1, l: 0, w: 0, h: 0, unit: 'CMS' }];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadQuotations();
  }

  loadQuotations() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (res) => (this.quotations = res),
      error: (err) => console.error('Failed to load inquiries:', err)
    });
  }

  // --- Helpers for HTML Template ---
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  neworg() {
    this.router.navigate(['/dashboard/organization-add']);
  }

  deleteQuotation(id: number) {
    if (confirm("Are you sure?")) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
        alert("Deleted!");
        this.loadQuotations();
      });
    }
  }

  // --- SAVE LOGIC (Database NULL Error Fix) ---
  saveQuotation() {
    if (!this.quotation.customerName) {
      alert("Customer Name is required!");
      return;
    }

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    // Yahan hum wo fields fill kar rahe hain jo aapki image mein NULL error de rahe the
    const payload = {
      ...this.quotation,
      // Default values taaki SQL INSERT fail na ho
      cargoStatus: this.quotation.cargoStatus || 'Pending',
      chargeableWeightUnit: this.quotation.chargeableWeightUnit || 'KGS',
      grossWeightUnit: this.quotation.grossWeightUnit || 'KGS',
      netWeightUnit: this.quotation.netWeightUnit || 'KGS',
      volumeWeightUnit: this.quotation.volumeWeightUnit || 'KGS',
      noOfPkgsUnit: this.quotation.noOfPkgsUnit || 'PKGS',
      hazardDocPath: this.quotation.hazardDocPath || 'N/A',
      invoiceDocPath: this.quotation.invoiceDocPath || 'N/A',
      invoiceList: this.quotation.invoiceList || 'Not Available',
      movementType: this.quotation.movementType || 'Port-to-Port',
      pickupAddress: this.quotation.pickupAddress || 'N/A',
      createdBy: 'admin@cavalierlogistic.in', // Aapka saved email
      qtnId: this.quotation.qtnId || ('QTN-' + Math.floor(Math.random() * 10000)),
      dimensions: this.appliedDimensions
    };

    console.log("Saving Inquiry Data:", payload);

    const action = this.quotation.id > 0 
      ? this.http.put(`${this.apiUrl}/${this.quotation.id}`, payload, httpOptions)
      : this.http.post(this.apiUrl, payload, httpOptions);

    action.subscribe({
      next: () => {
        alert("Success: Saved in Database!");
        this.loadQuotations();
        this.toggleForm();
      },
      error: (err) => {
        console.error("Full Error Object:", err);
        // Displaying inner message for better debugging
        const errMsg = err.error?.message || "Server Error: Database constraint failed.";
        alert("Failed to save: " + errMsg);
      }
    });
  }

  toggleForm() {
    this.isFormOpen = !this.isFormOpen;
    if (!this.isFormOpen) {
      this.quotation = this.resetQuotationModel();
      this.appliedDimensions = [];
    }
  }

  openDimModal() { this.isDimModalOpen = true; }
  closeDimModal() { this.isDimModalOpen = false; }
  addNewDimRow() { this.dimRows.push({ box: 1, l: 0, w: 0, h: 0, unit: 'CMS' }); }
  removeDimRow(i: number) { if (this.dimRows.length > 1) this.dimRows.splice(i, 1); }

  saveDimensions() {
    this.appliedDimensions = this.dimRows.filter(d => d.l > 0);
    this.closeDimModal();
  }

  editQuotation(q: any) {
    this.quotation = { ...q };
    this.appliedDimensions = q.dimensions || [];
    this.isFormOpen = true;
  }

  resetQuotationModel() {
    return {
      id: 0, customerName: '', branchName: '', 
      receivedDate: new Date().toISOString().split('T')[0], 
      location: 'DELHI', transportMode: 'Air', shipmentType: 'International',
      noOfPkgs: 0, grossWeightKg: 0, chargeableWeight: 0,
      origin: '', portOfLoading: '', portOfDischarge: '', dimensions: []
    };
  }
}