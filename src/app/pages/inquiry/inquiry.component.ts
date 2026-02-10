import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-inquiry',
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
  templateUrl: './inquiry.component.html',
  styleUrl: './inquiry.component.css',
})
export class InquiryComponent {
 isFormOpen = false;
  private apiUrl = 'http://localhost:5000/api/Quotations';

  quotations: any[] = [];
  quotation: any = this.resetQuotationModel();

  constructor(private http: HttpClient,private router: Router) {}

  ngOnInit() {
    this.loadQuotations();
  }

createNewOrganization() {
  console.log("Navigating to Add Organization...");
  // Sahi path yahan update kiya gaya hai
  this.router.navigate(['/dashboard/crm/organization-add']); 
}

  loadQuotations() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (res) => {
        this.quotations = res;
      },
      error: (err) => console.error('Failed to load quotations:', err)
    });
  }

  saveQuotation() {
    if (!this.quotation.customerName) {
      alert("Error: Customer Name is required!");
      return;
    }

    if (this.quotation.id > 0) {
      this.http.put(`${this.apiUrl}/${this.quotation.id}`, this.quotation).subscribe({
        next: () => {
          alert("Success: Quotation Updated Successfully!");
          this.loadQuotations();
          this.toggleForm();
        },
        error: (err) => alert("Error: Update failed! Please check your data.")
      });
    } else {
      this.http.post(this.apiUrl, this.quotation).subscribe({
        next: () => {
          alert("Success: Quotation Saved Successfully!");
          this.loadQuotations();
          this.toggleForm();
        },
        error: (err) => alert("Error: Save failed! Check backend logs.")
      });
    }
  }

  editQuotation(q: any) {
    this.quotation = { ...q };
    // Date formatting for HTML inputs (YYYY-MM-DD)
    if (this.quotation.qtnValidity) this.quotation.qtnValidity = this.quotation.qtnValidity.split('T')[0];
    if (this.quotation.jobDate) this.quotation.jobDate = this.quotation.jobDate.split('T')[0];
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
      id: 0, qtnId: '', customerName: '', consigneeName: '', qtnDateTime: null,
      qtnDoneBy: '', qtnValidity: null, qtnRemarks: '', inquiryId: '',
      inquiryOutcome: 'Pending', inqReceivedDate: null, pricingDoneBy: '',
      inqRepliedDate: null, noOfRevisions: 0, inquiryRemarks: '',
      salesPerson: '', salesManager: '', reportingHead: '', opsManager: '',
      opsHandledBy: '', cargoType: 'GENERAL', commodityHawb: '',
      portOfLoading: '', portOfDestination: '', incoterm: 'EXW',
      packagingType: '', noOfPkgs: 0, grossWeightKg: 0, chargeableWeightKg: 0,
      jobNo: '', jobDate: null, isActive: true
    };
  }
  neworg(){
this.router.navigate(['/dashboard/crm/organization-add']);
  }
}
