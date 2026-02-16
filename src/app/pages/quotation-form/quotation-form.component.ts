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
  // Revenue List: Default ek row ke saath
  revenueRows: any[] = [
    { 
      lob: '', 
      chargeName: '', 
      chargeType: '', 
      basis: '', 
      currency: 'USD', 
      rate: 0, 
      exchangeRate: 1, 
      amount: 0 
    }
  ];

  // Nayi row add karne ka function
  addRevenueRow() {
    this.revenueRows.push({
      lob: '',
      chargeName: '',
      chargeType: '',
      basis: '',
      currency: 'USD',
      rate: 0,
      exchangeRate: 1,
      amount: 0
    });
  }

  // Rate ya Exchange Rate badalne par Amount calculate karne ke liye
  calculateRevenue() {
    this.revenueRows.forEach(row => {
      // Amount = Rate * Exchange Rate
      row.amount = (row.rate || 0) * (row.exchangeRate || 1);
    });
  }

  // Row delete karne ke liye
  removeRow(index: number) {
    if (this.revenueRows.length > 1) {
      this.revenueRows.splice(index, 1);
    }
  }
  // Cost List: Default ek row ke saath
costRows: any[] = [
  { 
    lob: '', 
    chargeName: '', 
    chargeType: '', 
    basis: '', 
    currency: 'USD', 
    rate: 0, 
    exchangeRate: 1, 
    amount: 0 
  }
];

// Nayi row add karne ka function for Cost
addCostRow() {
  this.costRows.push({
    lob: '',
    chargeName: '',
    chargeType: '',
    basis: '',
    currency: 'USD',
    rate: 0,
    exchangeRate: 1,
    amount: 0
  });
}

// Cost calculate karne ke liye
calculateCost() {
  this.costRows.forEach(row => {
    row.amount = (row.rate || 0) * (row.exchangeRate || 1);
  });
}

// Cost row delete karne ke liye
removeCostRow(index: number) {
  if (this.costRows.length > 1) {
    this.costRows.splice(index, 1);
  }
}
  // 1. Variables define karein
pnLRows: any[] = [];
totalRevFinal: number = 0;
totalCostFinal: number = 0;
totalProfitFinal: number = 0;

// 2. Calculation Function
calculateAll() {
  // Pehle Revenue aur Cost ke individual amounts update karein
  this.revenueRows.forEach(row => row.amount = (row.rate || 0) * (row.exchangeRate || 1));
  this.costRows.forEach(row => row.amount = (row.rate || 0) * (row.exchangeRate || 1));

  // Unique Charge Names ki list banayein
  const allCharges = Array.from(new Set([
    ...this.revenueRows.map(r => r.chargeName), 
    ...this.costRows.map(c => c.chargeName)
  ])).filter(name => name && name.trim() !== '');

  // P&L Rows generate karein
  this.pnLRows = allCharges.map(charge => {
    const rev = this.revenueRows
      .filter(r => r.chargeName === charge)
      .reduce((sum, r) => sum + (r.amount || 0), 0);

    const cost = this.costRows
      .filter(c => c.chargeName === charge)
      .reduce((sum, c) => sum + (c.amount || 0), 0);

    const profit = rev - cost;
    const profitPercent = cost !== 0 ? (profit / cost) * 100 : 0;

    // LOB uthane ke liye
    const lob = this.revenueRows.find(r => r.chargeName === charge)?.lob || 
                this.costRows.find(c => c.chargeName === charge)?.lob;

    return {
      lob: lob,
      chargeName: charge,
      revenue: rev,
      cost: cost,
      profit: profit,
      profitPercent: profitPercent
    };
  });

  // Grand Totals calculate karein (Pipes ki zaroorat nahi padegi)
  this.totalRevFinal = this.pnLRows.reduce((sum, p) => sum + p.revenue, 0);
  this.totalCostFinal = this.pnLRows.reduce((sum, p) => sum + p.cost, 0);
  this.totalProfitFinal = this.pnLRows.reduce((sum, p) => sum + p.profit, 0);
}
}