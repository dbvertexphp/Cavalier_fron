import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-quotation-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
  templateUrl: './quotation-form.component.html',
})
export class QuotationFormComponent implements OnInit {
  // --- ADDED: For Date Shortcuts Panel ---
  showQuoPicker: boolean = false;
  searchDone: boolean = false;
  isFormOpen = false;
 private apiEndpoint = `${environment.apiUrl}/Quotations`;
// -- Dropdown Control Variables --
  showDropdown = false;
  organizations: any[] = [];
  filteredOrganizations: any[] = [];
  searchTerm = ''; // Search input ke liye
  showLeadDropdown = false;
  leads: any[] = [];
  filteredLeads: any[] = [];
  leadSearchTerm = '';
  allInquiries: any[] = [];
filteredInquiries: any[] = [];
companyServices: any[] = []
showInquiryDropdown: boolean = false;
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


  showAdvanceFilter: boolean = false;
quotedByList: string[] = []; // Suggestions ke liye
organizationList: string[] = [];
  quotationNoList: string[] = [];
quotationss: any = this.resetQuotationModel();
  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef) {
    this.initTableRows();
  }

  ngOnInit() {
    this.loadQuotations();
    this.fetchOrganizations();
    this.fetchLeads();
    this.getNextQuotationNumber();
    this.fetchInquiries();
    this.loadSearchSuggestions();
    this.fetchCompanyServices();
  }
  fetchInquiries() {
  const url = `${environment.apiUrl}/Inquiry`;
  this.http.get<any[]>(url).subscribe(data => {
    this.allInquiries = data;
  });
}
  // 2. Search Logic
onInquirySearchInput() {
  if (this.quotation.referenceByInquiry && this.quotation.referenceByInquiry.length > 0) {
    this.showInquiryDropdown = true;
    const searchTerm = this.quotation.referenceByInquiry.toLowerCase();
    
    this.filteredInquiries = this.allInquiries.filter(inq =>
      // InquiryNo ya CustomerName dono se search kar sakte hain
      (inq.inquiryNo && inq.inquiryNo.toLowerCase().includes(searchTerm)) ||
      (inq.customerName && inq.customerName.toLowerCase().includes(searchTerm))
    );
  } else {
    this.showInquiryDropdown = false;
  }
}

// 3. Selection Logic
selectInquiry(inq: any) {
  this.quotation.referenceByInquiry = inq.inquiryNo; // Ref number set kiya
  
  // OPTIONAL: Agar aap chahte ho ki Inquiry select karte hi 
  // Customer Name bhi auto-fill ho jaye:
  this.quotation.customerName = inq.customerName;
  
  this.showInquiryDropdown = false;
}
  // --- Lead API Call ---
 // --- Lead API Call ---
 
fetchLeads() {
    // 2. URL ko environment se access karein
    const url = `${environment.apiUrl}/Leads`;
    
    this.http.get<any[]>(url).subscribe(data => {
      this.leads = data;
      console.log(data)
    });
  }
//------------
// 1. Check karein ye array class ke upar hai na

// 2. Function jo pehle likha tha wahi rahega
fetchCompanyServices() {
  const url = `${environment.apiUrl}/CompanyService `;
  this.http.get<any[]>(url).subscribe({
    next: (data) => {
      this.companyServices = data;
      this.cdr.detectChanges(); 
    },
    error: (err) => console.error("Error loading services", err)
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
    // 2. URL ko environment variable se combine karein
   const url = `${environment.apiUrl}/Organization/list`;
    
    this.http.get<any[]>(url).subscribe(data => {
      this.organizations = data;
      console.log(data)
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
    this.http.get<any[]>(this.apiEndpoint).subscribe({
      next: (res) => { this.quotations = res; },
      error: (err) => console.error('Failed to load quotations:', err)
    });
  }
getNextQuotationNumber() {
    // 2. URL ko environment variable se combine karein
 const url = `${environment.apiUrl}/Quotations/NextQuotationNo`;
    
    // 3. API Call (responseType 'text' sahi hai agar string aati hai)
    this.http.get(url, { responseType: 'text' })
      .subscribe({
        next: (nextNo) => {
          this.quotation.quotationNo = nextNo;
          console.log("Next Quotation No set to:", nextNo);
        },
        error: (err) => {
          console.error("API Error:", err);
          // Yahan aap user ko error message dikha sakte hain
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
      ? this.http.put(`${this.apiEndpoint}/${this.quotation.id}`, this.quotation)
      : this.http.post(this.apiEndpoint, this.quotation);

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
      this.http.delete(`${this.apiEndpoint}/${id}`).subscribe(() => this.loadQuotations());
    }
  }

  // --- Filter & Search Methods (Fixes 'searchQuotations', 'clearFilters' errors) ---
  searchQuotations() {
    console.log("Searching with filters:", this.filters);
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
searchFilters = {
  lineOfBusiness: 'Any',
  quotationNo: '',
  organization: '',
  quotedBy: '',    // HTML mein isse bind karein
  salesCoor: '',   // Backend mapping ke liye
  cargoStatus: 'Any',
  //validFrom: null,
  validFrom: null as any,
  showMode: 'all',
  status: 'Any'
};

// Table ka data
loadSearchSuggestions() {
  this.http.get<any[]>(`${environment.apiUrl}/Quotations`)
    .subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          console.log("Raw Data from Backend:", data); // Check karne ke liye ki salesCoor me kya aa raha hai

          // 1. Quotation Numbers
          this.quotationNoList = [...new Set(data
            .map(q => q.quotationNo)
            .filter(val => val))];

          // 2. Quoted By (salesCoor) - Safe Mapping
          this.quotedByList = [...new Set(data
            .map(q => q.salesCoor) 
            .filter(val => val && val.trim() !== '') 
          )];

          // 3. Organizations
          this.organizationList = [...new Set(data
            .map(q => q.organization)
            .filter(val => val))];

          console.log("Quoted By List:", this.quotedByList);
          
          // Sabse Important: UI ko force update karo
          this.cdr.detectChanges(); 
        }
      },
      error: (err) => console.error("Fetch Error:", err)
    });
}
onSearch() {
  let filtersToSend: any = { ...this.searchFilters };

  // 🔥 MAGIC LOGIC: Agar Quotation No likha hai, toh baaki filters ko saaf kar do
  const searchInput = this.searchFilters.quotationNo?.toString().trim();

  if (searchInput && searchInput !== "") {
    // Sirf Quotation No bhejo, baaki sab empty taaki backend sirf isse search kare
    filtersToSend = {
      quotationNo: searchInput,
      lineOfBusiness: '',
      organization: '',
      salesCoor: '',
      cargoStatus: '',
      validFrom: null,
      showMode: '',
      status: ''
    };
    console.log("🎯 Hard Searching for Quotation No only:", searchInput);
  } else {
    // Agar Quo No khali hai, tab normal filters chalne do
    filtersToSend.salesCoor = this.searchFilters.quotedBy || "";
    if (filtersToSend.lineOfBusiness === 'Any') filtersToSend.lineOfBusiness = '';
    if (filtersToSend.cargoStatus === 'Any') filtersToSend.cargoStatus = '';
    if (filtersToSend.status === 'Any') filtersToSend.status = '';
    if (filtersToSend.showMode === 'all') filtersToSend.showMode = '';
    if (!filtersToSend.validFrom) filtersToSend.validFrom = null;
  }

  this.http.post<any[]>(`${this.apiEndpoint}/Search`, filtersToSend)
    .subscribe({
      next: (response) => {
        // Agar data aaya, toh wahi dikhao
        this.quotations = response || [];
        
        // Sorting (Just in case multiple results aayein)
        if (searchInput && this.quotations.length > 0) {
          const lowerInput = searchInput.toLowerCase();
          this.quotations.sort((a, b) => {
            const valA = (a.quotationNo || a.QuotationNo || "").toString().toLowerCase();
            return valA === lowerInput ? -1 : 1;
          });
        }

        this.cdr.detectChanges();
        console.log("✅ Data on table:", this.quotations);
      },
      error: (err) => {
        console.error("❌ API Error:", err);
        alert("Search failed!");
      }
    });
}

  // --- ADDED: Date Shortcut Logic for Quotation Filter ---
setQuoQuickDate(type: string) {
  const today = new Date();
  let targetDate = new Date();

  switch (type) {
    case 'tomorrow': targetDate.setDate(today.getDate() + 1); break;
    case 'yesterday': targetDate.setDate(today.getDate() - 1); break;
    case 'nextWeek': targetDate.setDate(today.getDate() + 7); break;
    case 'lastWeek': targetDate.setDate(today.getDate() - 7); break;
    case 'nextMonth': targetDate.setMonth(today.getMonth() + 1); break;
    case 'lastMonth': targetDate.setMonth(today.getMonth() - 1); break;
    default: targetDate = today; // Today
  }

  // Format YYYY-MM-DD
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  
  // Update Quotation search filters
  this.searchFilters.validFrom = `${year}-${month}-${day}`;

  this.showQuoPicker = false; // Panel band karein
  this.onSearch();            // Turant search trigger karein
  this.cdr.detectChanges();   // UI refresh
}
  toggleAdvanceFilter() {
    this.showAdvanceFilter = !this.showAdvanceFilter;
  }
clearFilters() {
  // 1. Saare filters ko default par reset karo
  this.searchFilters = {
    lineOfBusiness: 'Any',
    quotationNo: '',
    organization: '',
    quotedBy: '',
    salesCoor: '',
    cargoStatus: 'Any',
    validFrom: null,
    showMode: 'all',
    status: 'Any'
  };
  this.searchDone = false;      // "No Data Found" hat jayega
  this.quotations = [];
  console.log("Filters cleared!");

  // 2. Suggestions wapas load karein (Dropdowns ke liye)
  this.loadSearchSuggestions(); 
  
  // 3. Table ka data reset karne ke liye Initial Call
  this.fetchInitialQuotations(); 
}

// Ek simple function jo bina filter ke saara data laye
fetchInitialQuotations() {
  this.http.get<any[]>(`${this.apiEndpoint}/GetAll`) // Ya jo bhi aapka main GET route ho
    .subscribe({
      next: (res) => {
        this.quotations = res || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Could not reset table:", err)
    });
}
resetFilters() {
  // 1. Saare variables ko default (initial) values par set karein
  this.searchFilters = {
    lineOfBusiness: 'Any',
    quotationNo: '',
    organization: '',
    quotedBy: '',
    salesCoor: '',
    cargoStatus: 'Any',
    validFrom: null,
    showMode: 'all',
    status: 'Any'
  };

  console.log("Filters Resetting...");

  // 2. Backend ko 'Empty' filters bhejein taaki wo "ALL" data return kare
  const resetPayload = {
    lineOfBusiness: '',
    quotationNo: '',
    organization: '',
    salesCoor: '',
    cargoStatus: '',
    validFrom: null,
    showMode: '',
    status: ''
  };

  // 3. Search API ko call karein saara data wapas laane ke liye
  this.http.post<any[]>(`${this.apiEndpoint}/Search`, resetPayload)
    .subscribe({
      next: (response) => {
        this.quotations = response || []; // Pura data table mein wapas aa gaya
        console.log("✅ Table Data Restored:", this.quotations.length, "rows");
        this.cdr.detectChanges(); // UI Update
      },
      error: (err) => {
        console.error("❌ Reset Error:", err);
        // Agar Search API fail ho, toh loadSearchSuggestions wala data use kar lo
        this.loadSearchSuggestions(); 
      }
    });
}
}
