// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router, RouterModule } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { HttpClient, HttpClientModule } from '@angular/common/http';

// @Component({
//   selector: 'app-quotation-form',
//   standalone: true,
//   imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
//   templateUrl: './quotation-form.component.html',
// })
// export class QuotationFormComponent implements OnInit {
//   isFormOpen = false;
//   private apiUrl = 'http://localhost:5000/api/Quotations';

//   quotations: any[] = [];
//   quotation: any = this.resetQuotationModel();

//   constructor(private http: HttpClient,private router: Router) {}

//   ngOnInit() {
//     this.loadQuotations();
//   }

// createNewOrganization() {
//   console.log("Navigating to Add Organization...");
//   // Sahi path yahan update kiya gaya hai
//   this.router.navigate(['/dashboard/crm/organization-add']); 
// }

//   loadQuotations() {
//     this.http.get<any[]>(this.apiUrl).subscribe({
//       next: (res) => {
//         this.quotations = res;
//       },
//       error: (err) => console.error('Failed to load quotations:', err)
//     });
//   }

//   saveQuotation() {
//     if (!this.quotation.customerName) {
//       alert("Error: Customer Name is required!");
//       return;
//     }

//     if (this.quotation.id > 0) {
//       this.http.put(`${this.apiUrl}/${this.quotation.id}`, this.quotation).subscribe({
//         next: () => {
//           alert("Success: Quotation Updated Successfully!");
//           this.loadQuotations();
//           this.toggleForm();
//         },
//         error: (err) => alert("Error: Update failed! Please check your data.")
//       });
//     } else {
//       this.http.post(this.apiUrl, this.quotation).subscribe({
//         next: () => {
//           alert("Success: Quotation Saved Successfully!");
//           this.loadQuotations();
//           this.toggleForm();
//         },
//         error: (err) => alert("Error: Save failed! Check backend logs.")
//       });
//     }
//   }

//   editQuotation(q: any) {
//     this.quotation = { ...q };
//     // Date formatting for HTML inputs (YYYY-MM-DD)
//     if (this.quotation.qtnValidity) this.quotation.qtnValidity = this.quotation.qtnValidity.split('T')[0];
//     if (this.quotation.jobDate) this.quotation.jobDate = this.quotation.jobDate.split('T')[0];
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
//     if (!this.isFormOpen) this.quotation = this.resetQuotationModel();
//   }

//   resetQuotationModel() {
//     return {
//       id: 0, qtnId: '', customerName: '', consigneeName: '', qtnDateTime: null,
//       qtnDoneBy: '', qtnValidity: null, qtnRemarks: '', inquiryId: '',
//       inquiryOutcome: 'Pending', inqReceivedDate: null, pricingDoneBy: '',
//       inqRepliedDate: null, noOfRevisions: 0, inquiryRemarks: '',
//       salesPerson: '', salesManager: '', reportingHead: '', opsManager: '',
//       opsHandledBy: '', cargoType: 'GENERAL', commodityHawb: '',
//       portOfLoading: '', portOfDestination: '', incoterm: 'EXW',
//       packagingType: '', noOfPkgs: 0, grossWeightKg: 0, chargeableWeightKg: 0,
//       jobNo: '', jobDate: null, isActive: true
//     };
//   }
//   neworg(){
// this.router.navigate(['/dashboard/crm/organization-add']);
//   }
// }


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-quotation-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
  templateUrl: './quotation-form.component.html',
})
export class QuotationFormComponent implements OnInit {
  isFormOpen = false;
  private apiUrl = 'http://localhost:5000/api/Quotations';

  quotations: any[] = [];
  quotation: any = this.resetQuotationModel();

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadQuotations();
  }

  createNewOrganization() {
    this.router.navigate(['/dashboard/crm/organization-add']); 
  }

  loadQuotations() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (res) => { this.quotations = res; },
      error: (err) => console.error('Failed to load quotations:', err)
    });
  }

  saveQuotation() {
    if (!this.quotation.customerName) {
      alert("Error: Customer Name is required!");
      return;
    }

    const request = this.quotation.id > 0 
      ? this.http.put(`${this.apiUrl}/${this.quotation.id}`, this.quotation)
      : this.http.post(this.apiUrl, this.quotation);

    request.subscribe({
      next: () => {
        alert(`Success: Quotation ${this.quotation.id > 0 ? 'Updated' : 'Saved'} Successfully!`);
        this.loadQuotations();
        this.toggleForm();
      },
      error: (err) => alert("Error: Operation failed! Check backend logs.")
    });
  }

  editQuotation(q: any) {
    this.quotation = { ...q };
    // Formatting dates for HTML inputs
    const dateFields = ['qtnValidity', 'jobDate', 'validTill', 'cargoReadyDate'];
    dateFields.forEach(field => {
      if (this.quotation[field]) this.quotation[field] = this.quotation[field].split('T')[0];
    });
    this.isFormOpen = true;
  }

  deleteQuotation(id: number) {
    if (confirm("Are you sure you want to delete this record?")) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          alert("Success: Record Deleted!");
          this.loadQuotations();
        },
        error: (err) => console.error('Delete error:', err)
      });
    }
  }

  toggleForm() {
    this.isFormOpen = !this.isFormOpen;
    if (!this.isFormOpen) this.quotation = this.resetQuotationModel();
  }

  resetQuotationModel() {
    return {
      id: 0,
      // Section 1: Basic & Usability (Image 20)
      qtnId: '', qtnDateTime: null, customerName: '', consigneeName: '',
      validFrom: null, validTill: null, usability: 'Single', version: '',
      partyRole: '', cargoStatus: 'Ready By', cargoReadyDate: null,
      quotedBy: '', salesCoor: '', location: 'DELHI', pricingBy: '',
      qtnRemarks: '',

      // Section 2: Cargo Details (Image 21)
      lead: '', transportMode: 'Air', transportType: 'Export', shipmentType: 'International',
      cargoType: 'Loose', businessDims: '', stuffType: 'Any', commodity: '',
      commodityType: 'Non-Hazardous', description: '', humidityPercent: 0,
      grossWeight: 0, netWeight: 0, 
      dimL: 0, dimW: 0, dimH: 0, dimUnit: 'CMS',
      packages: 0, volume: 0, volumeWeight: 0, chrgWeight: 0, vehicleType: '',

      // Section 3: Forwarding & Movement (Image 22)
      serviceForwarding: false, serviceCustoms: false,
      movementType: 'Door-to-Door', incoterm: 'EXW', awbIssuedBy: '',
      carrier: '', transitDays: '', cargoValue: '', movementRemark: '',
      origin: '', portOfDischarge: '', placeOfReceipt: '', placeOfDelivery: '',
      portOfLoading: '', finalDestination: '', tradeLane: '',
      
      // Addresses
      pickupOrg: '', pickupAddress: '',
      deliveryOrg: '', deliveryAddress: '',

      // Carbon Emissions
      preCarriageEmission: 0, onCarriageEmission: 0, mainCarriageEmission: 0,

      // Old fields compatibility
      inquiryId: '', inquiryOutcome: 'Pending', salesPerson: '', 
      jobNo: '', jobDate: null, isActive: true
    };
  }

  neworg() {
    this.router.navigate(['/dashboard/organization-add']);
  }
}