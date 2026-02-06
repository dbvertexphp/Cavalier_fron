import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
  
  // NOTE: Apne .NET project ka sahi port (7165) Properties/launchSettings.json se check kar lena
  // Is URL ko exact copy karein
private apiUrl = 'http://localhost:5000/api/Quotations';

  quotations: any[] = [];
  quotation: any = this.resetQuotationModel();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadQuotations();
  }

  /**
   * API se saari quotations load karne ke liye.
   * Console log check karein agar data table mein nahi dikh raha.
   */
  loadQuotations() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (res) => {
        console.log('--- API Response Success ---');
        console.log('Data Received:', res); // Yahan check karein array aa raha hai ya nahi
        this.quotations = res;
      },
      error: (err) => {
        console.error('--- API Error ---');
        console.error('Data load fail! Kya API running hai?', err);
      }
    });
  }

  /**
   * Naya Quotation save karne ke liye POST request.
   */
  saveQuotation() {
    if (!this.quotation.customerName) {
      alert("Customer Name zaroori hai!");
      return;
    }

    console.log('Saving Quotation:', this.quotation);

    this.http.post(this.apiUrl, this.quotation).subscribe({
      next: (res) => {
        alert("Quotation Saved Successfully!");
        this.loadQuotations(); // Table refresh karein
        this.toggleForm();     // Form close karein
      },
      error: (err) => {
        console.error('Save error:', err);
        alert("Server error! Kya aapne CORS enable kiya hai .NET mein?");
      }
    });
  }

  /**
   * Quotation delete karne ke liye.
   */
  deleteQuotation(id: number) {
    if (confirm("Kya aap ise sach mein delete karna chahte hain?")) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          console.log(`Deleted ID: ${id}`);
          this.loadQuotations(); // List refresh
        },
        error: (err) => console.error('Delete error:', err)
      });
    }
  }

  /**
   * Form open/close toggle logic.
   */
  toggleForm() {
    this.isFormOpen = !this.isFormOpen;
    // Jab form close ho toh model reset kar dein
    if (!this.isFormOpen) {
      this.quotation = this.resetQuotationModel();
    }
  }

  /**
   * Quotation object ko default values ke saath reset karna.
   */
  resetQuotationModel() {
    return {
      id: 0,
      qtnId: '',
      customerName: '',
      consigneeName: '',
      qtnDateTime: null,
      qtnDoneBy: '',
      qtnValidity: null,
      qtnRemarks: '',
      inquiryId: '',
      inquiryOutcome: 'Pending',
      inqReceivedDate: null,
      pricingDoneBy: '',
      inqRepliedDate: null,
      noOfRevisions: 0,
      inquiryRemarks: '',
      salesPerson: '',
      salesManager: '',
      reportingHead: '',
      opsManager: '',
      opsHandledBy: '',
      cargoType: 'GENERAL',
      commodityHawb: '',
      portOfLoading: '',
      portOfDestination: '',
      incoterm: 'EXW',
      packagingType: '',
      noOfPkgs: 0,
      grossWeightKg: 0,
      chargeableWeightKg: 0,
      jobNo: '',
      jobDate: null,
      isActive: true
    };
  }
}