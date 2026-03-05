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

  constructor(private http: HttpClient, private router: Router) {
    this.initTableRows();
  }

  ngOnInit() {
    this.loadQuotations();
  }

  // --- Methods for Quotation Management ---
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
        alert("Success!");
        this.loadQuotations();
        this.toggleForm();
      },
      error: (err) => alert("Save failed!")
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
    if (!this.isFormOpen) this.quotation = this.resetQuotationModel();
  }

  neworg() {
    this.router.navigate(['/dashboard/organization-add']);
  }

  resetQuotationModel() {
    return {
      id: 0, qtnId: '', customerName: '', consigneeName: '',
      validTill: null, cargoStatus: 'Ready By', cargoReadyDate: null,
      origin: '', portOfLoading: '', portOfDischarge: '', finalDestination: '',
      pickupOrg: '', pickupAddress: '', deliveryOrg: '', deliveryAddress: '',
      serviceForwarding: false, movementType: 'Door-to-Door', incoterm: 'EXW'
    };
  }
}