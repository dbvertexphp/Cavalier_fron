import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
// -- Dropdown Control Variables --
  showDropdown = false;
  organizations: any[] = [];
  filteredOrganizations: any[] = [];
  searchTerm = ''; // Search input ke liye
  showLeadDropdown = false;
  leads: any[] = [];
  filteredLeads: any[] = [];
  leadSearchTerm = '';
  // --- Search & Advanced Filter Logic (Fixes 'filters' errors) ---
  filters: any = {
    qtnId: '',
    customerName: '',
    origin: '',
    destination: '',
    status: ''
  };

  quotations: any[] = [];
  quotation: any = this.resetQuotationModel();

  // --- Revenue & Cost Logic ---
  revenueRows: any[] = [];
  costRows: any[] = [];
  pnLRows: any[] = [];

  // P&L Totals
  totalRevFinal: number = 0;
  totalCostFinal: number = 0;
  totalProfitFinal: number = 0;

  // --- Dimensions Modal Logic (Fixes 'dimRows', 'isDimModalOpen' errors) ---
  isDimModalOpen = false;
  appliedDimensions: any[] = [];
  dimRows: any[] = [
    { box: null, l: null, w: null, h: null, unit: 'CMS' }
  ];
quotationss: any = this.resetQuotationModel();
  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef) {
    this.initTableRows();
  }

  ngOnInit() {
    this.loadQuotations();
    this.fetchOrganizations();
    this.fetchLeads();
  }
  // --- Lead API Call ---
 // --- Lead API Call ---
 
fetchLeads() {
  this.http.get<any[]>('http://localhost:5000/api/Leads').subscribe(data => {
    this.leads = data;
  });
}

// --- Lead Search Logic (FIXED) ---
onLeadSearchInput() {
  // 'leadSearchTerm' ki jagah ab 'quotation.lead' use kar rahe hain
  if (this.quotation.lead && this.quotation.lead.length > 0) {
    this.showLeadDropdown = true;
    this.filteredLeads = this.leads.filter(lead =>
      lead.leadNo.toLowerCase().includes(this.quotation.lead.toLowerCase())
    );
  } else {
    this.showLeadDropdown = false;
  }
}

// --- Lead Selection Logic (FIXED) ---
selectLead(lead: any) {
  // Sahi variable 'quotation.lead' mein data daal rahe hain
  this.quotation.lead = lead.leadNo; 
  
  // Dropdown band karo
  this.showLeadDropdown = false;
}
fetchOrganizations() {
    this.http.get<any[]>('http://localhost:5000/api/Organization/list').subscribe(data => {
      this.organizations = data;
    });
  }

  // --- Search Logic ---
 onSearchInput() {
  // 'searchTerm' ki jagah ab 'quotation.organization' use kar rahe hain
  if (this.quotation.organization && this.quotation.organization.length > 0) {
    this.showDropdown = true;
    this.filteredOrganizations = this.organizations.filter(org =>
      org.orgName.toLowerCase().includes(this.quotation.organization.toLowerCase())
    );
  } else {
    this.showDropdown = false;
  }
}

// --- SELECTION LOGIC WITH TIMEOUT (FIXED) ---
selectOrganization(org: any) {
  // 1. Sahi variable 'quotation.organization' mein data daalo
  this.quotation.organization = org.orgName; 
  
  // 2. Organization ka address (textarea)
  setTimeout(() => {
    // Sahi variable 'quotation.organizationAddress' mein data daalo
    this.quotation.organizationAddress = org.address; 
  }, 0);
  
  // Dropdown band karo
  this.showDropdown = false;
}
 
  // --- Methods for Quotation Management ---
  loadQuotations() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (res) => { this.quotations = res; },
      error: (err) => console.error('Failed to load quotations:', err)
    });
  }
getNextQuotationNumber() {
  // API URL ko call karein
  this.http.get('http://localhost:5000/api/Quotations/NextQuotationNo', { responseType: 'text' })
    .subscribe({
      next: (nextNo) => {
        // Response string ("0001") ko model mein set karein
        this.quotation.quotationNo = nextNo;
        console.log("Next Quotation No set to:", nextNo);
      },
      error: (err) => {
        console.error("API Error:", err);
      }
    });
}

  // saveQuotation() {
  //   if (!this.quotation.customerName) {
  //     alert("Error: Customer Name is required!");
  //     return;
  //   }
  //   const request = this.quotation.id > 0 
  //     ? this.http.put(`${this.apiUrl}/${this.quotation.id}`, this.quotation)
  //     : this.http.post(this.apiUrl, this.quotation);

  //   request.subscribe({
  //     next: () => {
  //       alert("Success!");
  //       this.loadQuotations();
  //       this.toggleForm();
  //     },
  //     error: (err) => alert("Save failed!")
  //   });
  // }
saveQuotation() {
    // ... (Data preparation logic)
    this.quotation.revenueData = JSON.stringify(this.revenueRows);
    this.quotation.costData = JSON.stringify(this.costRows);
    this.quotation.dimensionsData = JSON.stringify(this.appliedDimensions);
    
    this.quotation.totalRevenue = this.totalRevFinal;
    this.quotation.totalCost = this.totalCostFinal;
    this.quotation.totalProfit = this.totalProfitFinal;

    const request = this.quotation.id > 0 
      ? this.http.put(`${this.apiUrl}/${this.quotation.id}`, this.quotation)
      : this.http.post(this.apiUrl, this.quotation);

    request.subscribe({
      next: () => {
        alert("Quotation Saved Successfully!");
        
        this.loadQuotations();
        
        // 3. Form band karein
        this.toggleForm();
        
        // 4. Change detection force karein taaki UI turant update ho
        this.cdr.detectChanges();                
      },
      error: (err) => {
        console.error("Error details:", err);
        alert("Save failed! Check console for errors.");
      }
    });
  }
  editQuotation(q: any) {
    this.quotation = { ...q };
    this.isFormOpen = true;
  }

  deleteQuotation(id: number) {
    if (confirm("Are you sure?")) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => this.loadQuotations());
    }
  }

  // --- Filter & Search Methods (Fixes 'searchQuotations', 'clearFilters' errors) ---
  searchQuotations() {
    console.log("Searching with filters:", this.filters);
  }

  clearFilters() {
    this.filters = { qtnId: '', customerName: '', origin: '', destination: '', status: '' };
    this.loadQuotations();
  }

  toggleAdvanceFilter() {
    console.log("Toggle Advance Filter");
  }

  // --- Table Handling ---
  initTableRows() {
    this.revenueRows = [{ lob: '', chargeName: '', chargeType: '', basis: '', currency: 'USD', rate: 0, exchangeRate: 1, amount: 0 }];
    this.costRows = [{ lob: '', chargeName: '', chargeType: '', basis: '', currency: 'USD', rate: 0, exchangeRate: 1, amount: 0 }];
  }

  // Revenue Methods (Fixes 'removeRevenueRow', 'removeRow' errors)
  addRevenueRow() {
    this.revenueRows.push({ lob: '', chargeName: '', chargeType: '', basis: '', currency: 'USD', rate: 0, exchangeRate: 1, amount: 0 });
  }

  removeRevenueRow(index: number) {
    if (this.revenueRows.length > 1) this.revenueRows.splice(index, 1);
    this.calculateAll();
  }

  // Alias for removeRow if used in HTML
  removeRow(index: number) {
    this.removeRevenueRow(index);
  }

  calculateRevenue() {
    this.revenueRows.forEach(row => row.amount = (row.rate || 0) * (row.exchangeRate || 1));
    this.calculateAll();
  }

  // Cost Methods
  addCostRow() {
    this.costRows.push({ lob: '', chargeName: '', chargeType: '', basis: '', currency: 'USD', rate: 0, exchangeRate: 1, amount: 0 });
  }

  removeCostRow(index: number) {
    if (this.costRows.length > 1) this.costRows.splice(index, 1);
    this.calculateAll();
  }

  calculateCost() {
    this.costRows.forEach(row => row.amount = (row.rate || 0) * (row.exchangeRate || 1));
    this.calculateAll();
  }

  calculateAll() {
    const allCharges = Array.from(new Set([
      ...this.revenueRows.map(r => r.chargeName), 
      ...this.costRows.map(c => c.chargeName)
    ])).filter(name => name && name.trim() !== '');

    this.pnLRows = allCharges.map(charge => {
      const rev = this.revenueRows.filter(r => r.chargeName === charge).reduce((sum, r) => sum + (r.amount || 0), 0);
      const cost = this.costRows.filter(c => c.chargeName === charge).reduce((sum, c) => sum + (c.amount || 0), 0);
      return { 
        lob: '', 
        chargeName: charge, 
        revenue: rev, 
        cost: cost, 
        profit: rev - cost, 
        profitPercent: cost !== 0 ? ((rev - cost) / cost) * 100 : 0 
      };
    });

    this.totalRevFinal = this.pnLRows.reduce((sum, p) => sum + p.revenue, 0);
    this.totalCostFinal = this.pnLRows.reduce((sum, p) => sum + p.cost, 0);
    this.totalProfitFinal = this.totalRevFinal - this.totalCostFinal;
  }

  // --- Dimension Modal Methods (Fixes 'openDimModal', 'addNewDimRow' etc.) ---
  openDimModal() { this.isDimModalOpen = true; }
  closeDimModal() { this.isDimModalOpen = false; }
  
  addNewDimRow() {
    this.dimRows.push({ box: null, l: null, w: null, h: null, unit: 'CMS' });
  }

  removeDimRow(index: number) {
    if (this.dimRows.length > 1) this.dimRows.splice(index, 1);
  }

  saveDimensions() {
    this.appliedDimensions = [...this.dimRows];
    this.closeDimModal();
  }

  onFileSelected(event: any) {
    console.log("File selected", event.target.files[0]);
  }

  // --- UI Helpers ---
  toggleForm() {
    this.isFormOpen = !this.isFormOpen;
    if (this.isFormOpen) {
    this.getNextQuotationNumber(); // Naya number layein
  } else {
    this.quotation = this.resetQuotationModel();
  }
    
  }

  neworg() {
    this.router.navigate(['/dashboard/organization-add']);
  }
resetQuotationModel() {
  return {
    id: 0,
    referenceByInquiry: '',
    quotationNo: '',
    organization: '',
    validFrom: new Date().toISOString(),
    validTill: new Date().toISOString(),
    usability: '',
    version: '',
    lineOfBusiness: '',
    cargoStatus: '',
    location: '',
    pricingBy: '',
    salesCoor: '',
    lead: '',
    businessDimensions: '',
    transportMode: '',
    transportType: '',
    shipmentType: '',
    commodity: '',
    description: '',
    humidity: 0,
    grossWeight: 0,
    grossWeightUnit: 'KG',
    netWeight: 0,
    netWeightUnit: 'KG',
    chrgWeight: 0,
    chrgWeightUnit: 'KG',
    numOfPackages: 0,
    packageUnit: 'PCS',
    volumeWeight: 0,
    volumeWeightUnit: 'CBM',
    isServiceRequired: true,
    movement: '',
    awbIssuedBy: '',
    transitDest: '',
    placeOfReceipt: '',
    originPOL: '',
    incoTerms: '',
    carrierAgent: '',
    cargoValue: '',
    placeOfDelivery: '',
    podFinalDest: '',
    pickupAddress: '',
    deliveryAddress: '',
    revenueData: '', // JSON stringify karke bhej sakte ho
    costData: '',    // JSON stringify karke bhej sakte ho
    dimensionsData: '',
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    profitPercentage: 0,
    createdBy: 'Admin'
  };
}
}