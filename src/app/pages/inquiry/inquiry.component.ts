import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-inquiry',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
  templateUrl: './inquiry.component.html',
  styleUrl: './inquiry.component.css',
})
export class InquiryComponent implements OnInit {
  isFormOpen = false;
  private apiUrl = 'http://localhost:5000/api/Quotations';

  quotations: any[] = [];
  quotation: any = this.resetQuotationModel();
  selectedFile: File | null = null; // File store karne ke liye variable

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadQuotations();
  }

  // File Upload Handle karne wala function
  handleFileUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      console.log('Selected file:', file.name);
      // Aap yahan alert ya notification bhi dikha sakte hain
    }
  }

  loadQuotations() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (res) => (this.quotations = res),
      error: (err) => console.error('Failed to load quotations:', err)
    });
  }

  saveQuotation() {
    if (!this.quotation.customerName) {
      alert("Error: Organization is required!");
      return;
    }

    const action = this.quotation.id > 0 
      ? this.http.put(`${this.apiUrl}/${this.quotation.id}`, this.quotation)
      : this.http.post(this.apiUrl, this.quotation);

    action.subscribe({
      next: () => {
        alert("Success: Inquiry Saved Successfully!");
        this.loadQuotations();
        this.toggleForm();
      },
      error: (err) => alert("Error: Operation failed!")
    });
  }

  editQuotation(q: any) {
    this.quotation = { ...q };
    // Formate dates for HTML5 input fields
    if (this.quotation.validFrom) this.quotation.validFrom = this.quotation.validFrom.split('T')[0];
    if (this.quotation.validTill) this.quotation.validTill = this.quotation.validTill.split('T')[0];
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
    if (!this.isFormOpen) {
      this.quotation = this.resetQuotationModel();
      this.selectedFile = null; // Form close hote hi file reset
    }
  }

  resetQuotationModel() {
    return {
      id: 0, 
      qtnId: '', 
      customerName: '', 
      contactPerson: '',
      validFrom: null, 
      validTill: null,
      usability: 'Single',
      version: '1',
      partyRole: '',
      location: 'DELHI',
      salesCoordinator: '',
      qtnDoneBy: 'BHARAT JUYAL',
      pricingDoneBy: '',
      
      // Cargo Details
      transportMode: 'Air',
      shipmentType: 'International',
      description: '',
      noOfPkgs: 0,
      grossWeightKg: 0,
      chargeableWeightKg: 0,
      commodityHawb: '',
      
      // Movement
      origin: '',
      portOfLoading: '',
      portOfDestination: '',
      finalDestination: '',
      incoterm: 'EXW',
      inquiryOutcome: 'Pending'
    };
  }

  neworg() {
    this.router.navigate(['/dashboard/organization-add']);
  }
}