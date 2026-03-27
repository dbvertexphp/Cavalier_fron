import { CheckPermissionService } from './../../services/check-permission.service';

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import {
CdkDragDrop,
moveItemInArray,
transferArrayItem
} from '@angular/cdk/drag-drop';

import { DragDropModule } from '@angular/cdk/drag-drop';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { HostListener } from '@angular/core'; 
import * as XLSX from 'xlsx';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-quotation-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule, DragDropModule],
  templateUrl: './quotation-form.component.html',
})
export class QuotationFormComponent implements OnInit {
  PermissionID:any;
  currentPage: number = 1;
  pageSize: number = 10;
  
  searchDone: boolean = false;
  isFormOpen = false;
 private apiEndpoint = `${environment.apiUrl}/Quotations`;
// -- Dropdown Control Variables --
companyServices:any[]=[]
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
services: any[] = [];
private serviceApiUrl = environment.apiUrl + '/CompanyService';
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
revenueRows: any[] = [{ lob: '', chargeName: '', chargeType: 'Prepaid', basis: '', currency: 'USD', rate: 0, exchangeRate: 1, amount: 0 }];
costRows: any[] = [{ lob: '', chargeName: '', chargeType: 'Prepaid', basis: '', currency: 'USD', rate: 0, exchangeRate: 1, amount: 0 }];
pnLRows: any[] = [];
currencies = [
 { value: 'USD', label: 'US dollar' },
    { value: 'EUR', label: 'Euro' },
    { value: 'INR', label: 'Indian rupee' },
    { value: 'AED', label: 'United Arab Emirates dirham' },
    { value: 'GBP', label: 'Pound sterling' },
    { value: 'JPY', label: 'Japanese yen' },
    { value: 'AFN', label: 'Afghan afghani' },
    { value: 'ALL', label: 'Albanian lek' },
    { value: 'AMD', label: 'Armenian dram' },
    { value: 'ANG', label: 'Netherlands Antillean guilder' },
    { value: 'AOA', label: 'Angolan kwanza' },
    { value: 'ARS', label: 'Argentine peso' },
    { value: 'AUD', label: 'Australian dollar' },
    { value: 'AWG', label: 'Aruban florin' },
    { value: 'AZN', label: 'Azerbaijani manat' },
    { value: 'BAM', label: 'Bosnia and Herzegovina convertible mark' },
    { value: 'BBD', label: 'Barbadian dollar' },
    { value: 'BDT', label: 'Bangladeshi taka' },
    { value: 'BGN', label: 'Bulgarian lev' },
    { value: 'BHD', label: 'Bahraini dinar' },
    { value: 'BIF', label: 'Burundian franc' },
    { value: 'BMD', label: 'Bermudian dollar' },
    { value: 'BND', label: 'Brunei dollar' },
    { value: 'BOB', label: 'Bolivian boliviano' },
    { value: 'BRL', label: 'Brazilian real' },
    { value: 'BSD', label: 'Bahamian dollar' },
    { value: 'BTN', label: 'Bhutanese ngultrum' },
    { value: 'BWP', label: 'Botswana pula' },
    { value: 'BYN', label: 'Belarusian ruble' },
    { value: 'BZD', label: 'Belize dollar' },
    { value: 'CAD', label: 'Canadian dollar' },
    { value: 'CDF', label: 'Congolese franc' },
    { value: 'CHF', label: 'Swiss franc' },
    { value: 'CLP', label: 'Chilean peso' },
    { value: 'CNY', label: 'Chinese yuan' },
    { value: 'COP', label: 'Colombian peso' },
    { value: 'CRC', label: 'Costa Rican colón' },
    { value: 'CUC', label: 'Cuban convertible peso' },
    { value: 'CUP', label: 'Cuban peso' },
    { value: 'CVE', label: 'Cape Verdean escudo' },
    { value: 'CZK', label: 'Czech koruna' },
    { value: 'DJF', label: 'Djiboutian franc' },
    { value: 'DKK', label: 'Danish krone' },
    { value: 'DOP', label: 'Dominican peso' },
    { value: 'DZD', label: 'Algerian dinar' },
    { value: 'EGP', label: 'Egyptian pound' },
    { value: 'ERN', label: 'Eritrean nakfa' },
    { value: 'ETB', label: 'Ethiopian birr' },
    { value: 'FJD', label: 'Fijian dollar' },
    { value: 'FKP', label: 'Falkland Islands pound' },
    { value: 'GEL', label: 'Georgian lari' },
    { value: 'GGP', label: 'Guernsey pound' },
    { value: 'GHS', label: 'Ghanaian cedi' },
    { value: 'GIP', label: 'Gibraltar pound' },
    { value: 'GMD', label: 'Gambian dalasi' },
    { value: 'GNF', label: 'Guinean franc' },
    { value: 'GTQ', label: 'Guatemalan quetzal' },
    { value: 'GYD', label: 'Guyanese dollar' },
    { value: 'HKD', label: 'Hong Kong dollar' },
    { value: 'HNL', label: 'Honduran lempira' },
    { value: 'HRK', label: 'Croatian kuna' },
    { value: 'HTG', label: 'Haitian gourde' },
    { value: 'HUF', label: 'Hungarian forint' },
    { value: 'IDR', label: 'Indonesian rupiah' },
    { value: 'ILS', label: 'Israeli new shekel' },
    { value: 'IMP', label: 'Manx pound' },
    { value: 'IQD', label: 'Iraqi dinar' },
    { value: 'IRR', label: 'Iranian rial' },
    { value: 'ISK', label: 'Icelandic króna' },
    { value: 'JEP', label: 'Jersey pound' },
    { value: 'JMD', label: 'Jamaican dollar' },
    { value: 'JOD', label: 'Jordanian dinar' },
    { value: 'KES', label: 'Kenyan shilling' },
    { value: 'KGS', label: 'Kyrgyzstani som' },
    { value: 'KHR', label: 'Cambodian riel' },
    { value: 'KID', label: 'Kiribati dollar' },
    { value: 'KMF', label: 'Comorian franc' },
    { value: 'KPW', label: 'North Korean won' },
    { value: 'KRW', label: 'South Korean won' },
    { value: 'KWD', label: 'Kuwaiti dinar' },
    { value: 'KYD', label: 'Cayman Islands dollar' },
    { value: 'KZT', label: 'Kazakhstani tenge' },
    { value: 'LAK', label: 'Lao kip' },
    { value: 'LBP', label: 'Lebanese pound' },
    { value: 'LKR', label: 'Sri Lankan rupee' },
    { value: 'LRD', label: 'Liberian dollar' },
    { value: 'LSL', label: 'Lesotho loti' },
    { value: 'LYD', label: 'Libyan dinar' },
    { value: 'MAD', label: 'Moroccan dirham' },
    { value: 'MDL', label: 'Moldovan leu' },
    { value: 'MGA', label: 'Malagasy ariary' },
    { value: 'MKD', label: 'Macedonian denar' },
    { value: 'MMK', label: 'Burmese kyat' },
    { value: 'MNT', label: 'Mongolian tögrög' },
    { value: 'MOP', label: 'Macanese pataca' },
    { value: 'MRU', label: 'Mauritanian ouguiya' },
    { value: 'MUR', label: 'Mauritian rupee' },
    { value: 'MVR', label: 'Maldivian rufiyaa' },
    { value: 'MWK', label: 'Malawian kwacha' },
    { value: 'MXN', label: 'Mexican peso' },
    { value: 'MYR', label: 'Malaysian ringgit' },
    { value: 'MZN', label: 'Mozambican metical' },
    { value: 'NAD', label: 'Namibian dollar' },
    { value: 'NGN', label: 'Nigerian naira' },
    { value: 'NIO', label: 'Nicaraguan córdoba' },
    { value: 'NOK', label: 'Norwegian krone' },
    { value: 'NPR', label: 'Nepalese rupee' },
    { value: 'NZD', label: 'New Zealand dollar' },
    { value: 'OMR', label: 'Omani rial' },
    { value: 'PAB', label: 'Panamanian balboa' },
    { value: 'PEN', label: 'Peruvian sol' },
    { value: 'PGK', label: 'Papua New Guinean kina' },
    { value: 'PHP', label: 'Philippine peso' },
    { value: 'PKR', label: 'Pakistani rupee' },
    { value: 'PLN', label: 'Polish złoty' },
    { value: 'PYG', label: 'Paraguayan guaraní' },
    { value: 'QAR', label: 'Qatari riyal' },
    { value: 'RON', label: 'Romanian leu' },
    { value: 'RSD', label: 'Serbian dinar' },
    { value: 'RUB', label: 'Russian ruble' },
    { value: 'RWF', label: 'Rwandan franc' },
    { value: 'SAR', label: 'Saudi riyal' },
    { value: 'SEK', label: 'Swedish krona' },
    { value: 'SGD', label: 'Singapore dollar' },
    { value: 'SOS', label: 'Somali shilling' },
    { value: 'SRD', label: 'Surinamese dollar' },
    { value: 'SSP', label: 'South Sudanese pound' },
    { value: 'THB', label: 'Thai baht' },
    { value: 'TRY', label: 'Turkish lira' },
    { value: 'TWD', label: 'New Taiwan dollar' },
    { value: 'TZS', label: 'Tanzanian shilling' },
    { value: 'UAH', label: 'Ukrainian hryvnia' },
    { value: 'UGX', label: 'Ugandan shilling' },
    { value: 'UYU', label: 'Uruguayan peso' },
    { value: 'UZS', label: 'Uzbekistani soʻm' },
    { value: 'VES', label: 'Venezuelan bolívar soberano' },
    { value: 'VND', label: 'Vietnamese đồng' },
    { value: 'ZAR', label: 'South African rand' },
    { value: 'ZMW', label: 'Zambian kwacha' }
];
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
  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef,public CheckPermissionService:CheckPermissionService) {
    this.initTableRows();
  }
  showColumnModal = false;
availableColumns:string[] = [];

selectedColumns: string[] = [
'id',
'quotationNo',
'organization',
'lineOfBusiness',
'transportMode',
'transportType',
'cargoStatus'
];
openColumnModal(){
  this.showColumnModal = true;
}
closeColumnModal(){
  this.showColumnModal = false;
}
sortOrders:any = {};
  ngOnInit() {
      this.PermissionID = Number(localStorage.getItem('permissionID'));
    this.loadColumnSettings();
    this.loadQuotations();
    this.fetchOrganizations();
    this.fetchLeads();
    this.getNextQuotationNumber();
    this.fetchInquiries();
    this.loadSearchSuggestions();
    this.fetchCompanyServices()
    this.fetchLOBs();
  }
  
fetchLOBs() {
    this.http.get<any[]>(this.serviceApiUrl).subscribe({
      next: (res) => {
        this.services = res; 
        console.log('LOBs loaded:', this.services); // Testing ke liye
      },
      error: (err) => console.error('Error fetching LOBs', err)
    });
  }

fetchCompanyServices() {
        const url = `${environment.apiUrl}/CompanyService`;
        this.http.get<any[]>(url).subscribe({
            next: (data) => {
                this.companyServices = data;
                console.log("Line of Business loaded:", data);
                this.cdr.detectChanges();
            },
            error: (err) => console.error("Error loading LOB:", err)
        });
    }

  fetchInquiries() {
  const url = `${environment.apiUrl}/Inquiry`;
  this.http.get<any[]>(url).subscribe(data => {
    this.allInquiries = data;
  });
}
drop(event:CdkDragDrop<string[]>){

if(event.previousContainer === event.container){

moveItemInArray(
event.container.data,
event.previousIndex,
event.currentIndex
);

}else{

transferArrayItem(
event.previousContainer.data,
event.container.data,
event.previousIndex,
event.currentIndex
);

}

console.log("Available Columns:",this.availableColumns);
console.log("Selected Columns:",this.selectedColumns);

this.cdr.detectChanges();

const payload = {

availableColumns: JSON.stringify(this.availableColumns),
selectedColumns: JSON.stringify(this.selectedColumns)

};

this.http.post(`${environment.apiUrl}/QuotationColumnSetting/save`,payload)

.subscribe({

next:(res)=>{

console.log("Column Settings Saved:",res);

},

error:(err)=>{

console.error("Save error",err);

}

});

}

loadColumnSettings(){

this.http.get<any>(`${environment.apiUrl}/QuotationColumnSetting`)

.subscribe({

next:(res)=>{

if(res){

this.availableColumns = JSON.parse(res.availableColumns || '[]');

this.selectedColumns = JSON.parse(res.selectedColumns || '[]');

}

this.cdr.detectChanges();

console.log("Available:",this.availableColumns);
console.log("Selected:",this.selectedColumns);

},

error:(err)=>{

console.error("Load error",err);

}

});

}

columnFieldMap:any = {

'ID':'id',

'Quotation No':'quotationNo',

'Organization':'organization',

'Lead':'lead',

'LOB':'lineOfBusiness',

'Transport Mode':'transportMode',

'Transport Type':'transportType',

'Status':'cargoStatus',

'AWB Issued By':'awbIssuedBy',

'Business Dimensions':'businessDimensions',

'Cargo Value':'cargoValue',

'Carrier Agent':'carrierAgent',

'Chargeable Weight':'chrgWeight',

'Chargeable Weight Unit':'chrgWeightUnit',

'Commodity':'commodity',

'Cost Data':'costData',

'Created By':'createdBy',

'Delivery Address':'deliveryAddress',

'Description':'description',

'Dimensions Data':'dimensionsData',

'Gross Weight':'grossWeight',

'Gross Weight Unit':'grossWeightUnit',

'Humidity':'humidity',

'Inco Terms':'incoTerms',

'Service Required':'isServiceRequired',

'Location':'location',

'Movement':'movement',

'Net Weight':'netWeight',

'Net Weight Unit':'netWeightUnit',

'Number Of Packages':'numOfPackages',

'Origin POL':'originPOL',

'Package Unit':'packageUnit',

'Pickup Address':'pickupAddress',

'Place Of Delivery':'placeOfDelivery',

'Place Of Receipt':'placeOfReceipt',

'POD Final Destination':'podFinalDest',

'Pricing By':'pricingBy',

'Profit Percentage':'profitPercentage',

'Reference By Inquiry':'referenceByInquiry',

'Revenue Data':'revenueData',

'Sales Coordinator':'salesCoor',

'Shipment Type':'shipmentType',

'Total Cost':'totalCost',

'Total Profit':'totalProfit',

'Total Revenue':'totalRevenue',

'Transit Destination':'transitDest',

'Usability':'usability',

'Valid From':'validFrom',

'Valid Till':'validTill',

'Version':'version',

'Volume Weight':'volumeWeight',

'Volume Weight Unit':'volumeWeightUnit'

};

sortColumn(column:string){

  const field = this.columnFieldMap[column];

  if(!this.sortOrders[column]){
    this.sortOrders[column] = 'asc';
  }else{
    this.sortOrders[column] = this.sortOrders[column] === 'asc' ? 'desc' : 'asc';
  }

  const order = this.sortOrders[column];

  this.quotations.sort((a:any,b:any)=>{

    let valA = a[field];
    let valB = b[field];

    if(valA == null) return 1;
    if(valB == null) return -1;

    if(typeof valA === 'string'){
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if(order === 'asc'){
      return valA > valB ? 1 : -1;
    }else{
      return valA < valB ? 1 : -1;
    }

  });

  this.cdr.detectChanges();
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
  this.quotation.referenceByInquiry = inq.inquiryNo;
  this.showInquiryDropdown = false;
  this.quotation.referenceByInquiry = inq.inquiryNo; // Ref number set kiya
  
  // OPTIONAL: Agar aap chahte ho ki Inquiry select karte hi 
  // Customer Name bhi auto-fill ho jaye:
  this.quotation.customerName = inq.customerName;
  
  this.showInquiryDropdown = false;
    this.quotation.referenceByInquiry = inq.inquiryNo;
  this.showInquiryDropdown = false;
  this.cdr.detectChanges(); // UI Update
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
get totalPages(): number {
  return Math.ceil(this.quotations.length / this.pageSize) || 1;
}
fetchOrganizations() {
    // 2. URL ko environment variable se combine karein
   const url = `${environment.apiUrl}/Organization/list`;
    
    this.http.get<any[]>(url).subscribe(data => {
      this.organizations = data;
      console.log(data)
    });
  }
get paginatedQuotations(): any[] {
  const start = (this.currentPage - 1) * this.pageSize;
  return this.quotations.slice(start, start + this.pageSize);
}
previousPage() {
  if (this.currentPage > 1) {
    this.currentPage--;
    // this.cdr.detectChanges();   // mostly zarurat nahi padti
  }
}

nextPage() {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
  }
}

goToPage(page: number) {
  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page;
  }
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
      next: (res) => { this.quotations = res; 
        console.log("Quotations Data:", this.quotations);
      },
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

saveQuotation() {
    // ... (Aapki validation logic yahan rahegi)

    // Data preparation for Backend
    this.quotation.revenueData = JSON.stringify(this.revenueRows);
    this.quotation.costData = JSON.stringify(this.costRows);
    this.quotation.dimensionsData = JSON.stringify(this.appliedDimensions);
    
    this.quotation.totalRevenue = this.totalRevFinal;
    this.quotation.totalCost = this.totalCostFinal;
    this.quotation.totalProfit = this.totalProfitFinal;

    // 4. API Call - Swagger ke mutabiq Edit ke liye /update/id use kiya hai
    const request = this.quotation.id > 0 
      ? this.http.put(`${this.apiEndpoint}/update/${this.quotation.id}`, this.quotation)
      : this.http.post(this.apiEndpoint, this.quotation);

    request.subscribe({
      next: () => {
        alert(this.quotation.id > 0 ? "Quotation Updated Successfully!" : "Quotation Saved Successfully!");
        this.loadQuotations();
        this.toggleForm();
        this.cdr.detectChanges();                
      },
      error: (err) => {
        console.error("Error details:", err);
        alert("Save failed! Check console for errors.");
      }
    });
}

editQuotation(q: any) {
  this.isFormOpen = true;

  // 1. Basic details copy
  this.quotation = { ...q };

  // 2. Date Formatting Fix (ISO to yyyy-MM-dd)
  // Input type="date" ke liye string ko slice karna zaroori hai
  if (q.validFrom) {
    this.quotation.validFrom = q.validFrom.split('T')[0];
  }
  if (q.validTill) {
    this.quotation.validTill = q.validTill.split('T')[0];
  }

  // 3. Revenue Table data
  const revData = q.revenueData || q.RevenueData;
  if (revData) {
    try {
      this.revenueRows = typeof revData === 'string' ? JSON.parse(revData) : revData;
    } catch (e) { console.error("Error revenueData", e); }
  }

  // 4. Cost Table data
  const cstData = q.costData || q.CostData;
  if (cstData) {
    try {
      this.costRows = typeof cstData === 'string' ? JSON.parse(cstData) : cstData;
    } catch (e) { console.error("Error costData", e); }
  }

  // 5. Dimensions data
  const dimData = q.dimensionsData || q.DimensionsData;
  if (dimData) {
    try {
      this.appliedDimensions = typeof dimData === 'string' ? JSON.parse(dimData) : dimData;
      this.dimRows = this.appliedDimensions.length > 0 ? [...this.appliedDimensions] : [{ box: null, l: null, w: null, h: null, unit: 'CMS' }];
    } catch (e) { console.error("Error dimensionsData", e); }
  }

  // 6. Totals refresh
  setTimeout(() => {
    this.calculateAll();
    this.cdr.detectChanges();
  }, 100);
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

  addRevenueRow() { const currentLOB = this.quotation.lineOfBusiness;
  this.revenueRows.push({ lob:currentLOB, chargeName: '', chargeType: 'Prepaid', basis: '', currency: 'USD', rate: 0, exchangeRate: 1, amount: 0 });
}

removeRow(index: number) {
  this.revenueRows.splice(index, 1);
  this.calculateAll();
}

calculateRevenue() {
  this.revenueRows.forEach(row => {
    row.amount = (row.rate || 0) * (row.exchangeRate || 1);
  });
  this.calculateAll();
}

// 3. Cost Functions
addCostRow() {const currentLOB = this.quotation.lineOfBusiness;
  this.costRows.push({ lob: currentLOB, chargeName: '', chargeType: 'Prepaid', basis: '', currency: 'USD', rate: 0, exchangeRate: 1, amount: 0 });
}

removeCostRow(index: number) {
  this.costRows.splice(index, 1);
  this.calculateAll();
}

calculateCost() {
  this.costRows.forEach(row => {
    row.amount = (row.rate || 0) * (row.exchangeRate || 1);
  });
  this.calculateAll();
}

// 4. Profit & Loss Summary Logic (Real-time merge)
calculateAll() {
  this.pnLRows = [];
  this.totalRevFinal = 0;
  this.totalCostFinal = 0;

  // 1. Dono tables se unique Charge Names ki list nikalna
  const allCharges = new Set([
    ...this.revenueRows.map(r => r.chargeName),
    ...this.costRows.map(c => c.chargeName)
  ]);

  allCharges.forEach(charge => {
    // Agar charge name khali hai toh skip karein
    if (!charge || charge.trim() === '') return;

    // 2. Revenue calculation is specific charge ke liye
    const revForCharge = this.revenueRows
      .filter(r => r.chargeName === charge)
      .reduce((sum, curr) => sum + (Number(curr.amount) || 0), 0);

    // 3. Cost calculation is specific charge ke liye
    const costForCharge = this.costRows
      .filter(c => c.chargeName === charge)
      .reduce((sum, curr) => sum + (Number(curr.amount) || 0), 0);

    // 4. LOB priority set karna (Pehle Revenue row se, fir Cost se, varna Main Header se)
    const revRow = this.revenueRows.find(r => r.chargeName === charge);
    const costRow = this.costRows.find(c => c.chargeName === charge);
    
    const finalLOB = revRow?.lob || costRow?.lob || this.quotation.lineOfBusiness || 'N/A';

    // 5. Profit calculation
    const profit = revForCharge - costForCharge;
    const profitPercent = revForCharge !== 0 ? (profit / revForCharge) * 100 : 0;

    // 6. Summary row mein push karna
    this.pnLRows.push({
      lob: finalLOB, // Ye automatic sync ho jayega ab
      chargeName: charge,
      revenue: revForCharge,
      cost: costForCharge,
      profit: profit,
      profitPercent: profitPercent
    });

    // 7. Grand Totals update karna
    this.totalRevFinal += revForCharge;
    this.totalCostFinal += costForCharge;
  });

  // Final Profit & Loss
  this.totalProfitFinal = this.totalRevFinal - this.totalCostFinal;
  
  // UI ko force refresh karne ke liye (Safety check)
  this.cdr.detectChanges();
}

// 5. Final Save Logic (JSON conversion for DTO)
prepareQuotationPayload() {
  const payload = {
    // ... baki sari fields ...
    revenueData: JSON.stringify(this.revenueRows),
    costData: JSON.stringify(this.costRows),
    totalRevenue: this.totalRevFinal,
    totalCost: this.totalCostFinal,
    totalProfit: this.totalProfitFinal,
    profitPercentage: this.totalRevFinal !== 0 ? (this.totalProfitFinal / this.totalRevFinal) * 100 : 0
  };
  return payload;
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
  validFrom: null,
  showMode: 'all',
  status: 'Any'
};

// Table ka data
// 1. Naya array variable define karein (class level par)
lineOfBusinessList: string[] = [];
filteredLOBs: string[] = []; // Ye UI mein dikhega

loadSearchSuggestions() {
  this.http.get<any[]>(`${environment.apiUrl}/Quotations`)
    .subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          // --- Aapka purana logic START ---
          this.quotationNoList = [...new Set(data.map(q => q.quotationNo).filter(val => val))];
          this.quotedByList = [...new Set(data.map(q => q.salesCoor).filter(val => val && val.trim() !== ''))];
          this.organizationList = [...new Set(data.map(q => q.organization).filter(val => val))];
          // --- Aapka purana logic END ---

          // 🔥 Naya Logic: Line of Business (Services) ko unique filter karo
          this.lineOfBusinessList = [...new Set(data
            .map(q => q.lineOfBusiness)
            .filter(val => val && val.trim() !== '')
          )];

          this.cdr.detectChanges(); 
        }
      },
      error: (err) => console.error("Fetch Error:", err)
    });
}

// 🔥 Typing Filter: Jo 3 characters ke baad suggestions dikhayega
onLOBType() {
  const query = this.searchFilters.lineOfBusiness ? this.searchFilters.lineOfBusiness.trim().toLowerCase() : '';
  
  if (query.length >= 3) {
    this.filteredLOBs = this.lineOfBusinessList.filter(lob => 
      lob.toLowerCase().includes(query)
    );
  } else {
    this.filteredLOBs = []; // 3 se kam par list khali
  }
}
// Variables list mein add karein
filteredQuotationNos: string[] = []; 

// 🔥 Typing logic: 3 characters ke baad suggestions filter honge
onQuotationNoType() {
  const query = this.searchFilters.quotationNo ? this.searchFilters.quotationNo.trim().toLowerCase() : '';
  
  if (query.length >= 3) {
    // quotationNoList (Master list) se filter karke suggestions banayein
    this.filteredQuotationNos = this.quotationNoList.filter(qNo => 
      qNo.toLowerCase().includes(query)
    );
  } else {
    // 3 se kam characters par dropdown khali rahega
    this.filteredQuotationNos = [];
  }
}
// Variables list mein add karein
filteredOrgSuggestions: string[] = []; 

// 🔥 Typing logic: 3 characters ke baad hi filter chalega
onOrgType() {
  const query = this.searchFilters.organization ? this.searchFilters.organization.trim().toLowerCase() : '';
  
  if (query.length >= 3) {
    // organizationList (Unique master list) se filter karein
    this.filteredOrgSuggestions = this.organizationList.filter(org => 
      org.toLowerCase().includes(query)
    );
  } else {
    // 3 characters se kam par suggestions band
    this.filteredOrgSuggestions = [];
  }
}
// Variables list mein add karein
filteredQuotedBySuggestions: string[] = []; 

// 🔥 Typing logic: 3 characters ke baad suggestions filter honge
onQuotedByType() {
  const query = this.searchFilters.quotedBy ? this.searchFilters.quotedBy.trim().toLowerCase() : '';
  
  if (query.length >= 3) {
    // quotedByList (Master list) se matching names filter karein
    this.filteredQuotedBySuggestions = this.quotedByList.filter(item => 
      item.toLowerCase().includes(query)
    );
  } else {
    // 3 characters se kam par dropdown khali
    this.filteredQuotedBySuggestions = [];
  } 
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
// --- Export Logic Variables ---
isExportOpen = false;

@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {
  this.isExportOpen = false;
}

// 1. PDF DOWNLOAD LOGIC
downloadInquiriesPDF() {
  this.isExportOpen = false;

  if (!this.quotations || this.quotations.length === 0) {
    alert("Table mein data nahi hai!");
    return;
  }

  const doc = new jsPDF('l', 'mm', 'a4');
  const startX = 10;
  let startY = 25;
  const colCount = this.selectedColumns.length;
  const colWidth = 277 / colCount;

  // Title
  doc.setFontSize(16);
  doc.setTextColor(74, 63, 63);
  doc.text("INQUIRY RECORDS SUMMARY", 110, 15);

  // Header Background
  doc.setFillColor(74, 63, 63);
  doc.rect(startX, startY, 277, 10, 'F');

  // Header Text
  doc.setFontSize(7); // Font size thoda chota rakha hai taaki overlap na ho
  doc.setTextColor(255, 255, 255);

  this.selectedColumns.forEach((col, i) => {
    // Header label dikhao
    doc.text(col.toUpperCase(), startX + (i * colWidth) + 2, startY + 7);
  });

  // Table Body
  doc.setTextColor(0, 0, 0);
  startY += 10;

  this.quotations.slice(0, 50).forEach((q, rowIndex) => {
    // Page break logic
    if (startY > 185) {
      doc.addPage();
      startY = 20;
    }

    // Zebra stripes
    if (rowIndex % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(startX, startY, 277, 8, 'F');
    }

    this.selectedColumns.forEach((col, colIndex) => {
      // MAGIC FIX: Yahan hum direct data key check karenge aur mapping bhi
      const fieldKey = this.columnFieldMap[col] || col; 
      let val = q[fieldKey];

      // Agar value object hai toh use string banao, warna '-' dikhao
      let displayVal = (val !== null && val !== undefined) ? val.toString() : '-';
      
      // Text wrapping/clipping taaki headers ke sath match kare
      if (displayVal.length > 20) displayVal = displayVal.substring(0, 17) + "...";
      
      doc.text(displayVal, startX + (colIndex * colWidth) + 2, startY + 5);
      
      // Vertical cell lines
      doc.setDrawColor(220, 220, 220);
      doc.line(startX + (colIndex * colWidth), startY, startX + (colIndex * colWidth), startY + 8);
    });

    // Horizontal line after each row
    doc.line(startX, startY + 8, startX + 277, startY + 8);
    startY += 8;
  });

  doc.save(`Quotation_Report_${new Date().getTime()}.pdf`);
}

// 2. PRINT LOGIC
printRecords() {
  this.isExportOpen = false;

  // 1. Data Check
  if (!this.quotations || this.quotations.length === 0) {
    alert("Print karne ke liye data nahi hai!");
    return;
  }

  // 2. Prepare dynamic HTML for printing
  const activeCols = this.selectedColumns;
  let tableHeader = `<tr style="background-color: #4a3f3f; color: white;">`;
  activeCols.forEach(col => {
    tableHeader += `<th style="padding: 10px; border: 1px solid #ddd; text-align: left; font-size: 12px;">${col}</th>`;
  });
  tableHeader += `</tr>`;

  let tableRows = '';
  this.quotations.forEach((q, idx) => {
    tableRows += `<tr>`;
    activeCols.forEach(col => {
      const fieldKey = this.columnFieldMap[col] || col;
      let val = q[fieldKey] !== null && q[fieldKey] !== undefined ? q[fieldKey] : '-';
      
      // Date format check
      if (typeof val === 'string' && val.includes('T') && !isNaN(Date.parse(val))) {
        val = new Date(val).toLocaleDateString('en-GB');
      }
      tableRows += `<td style="padding: 8px; border: 1px solid #eee; font-size: 11px;">${val}</td>`;
    });
    tableRows += `</tr>`;
  });

  // 3. Create a new Print Window
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Quotation Records Print</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            h2 { text-align: center; color: #4a3f3f; }
            .footer { margin-top: 20px; text-align: right; font-size: 10px; color: #666; }
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h2>INQUIRY RECORDS SUMMARY</h2>
          <p style="text-align: center; font-size: 12px;">Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>${tableHeader}</thead>
            <tbody>${tableRows}</tbody>
          </table>
          <div class="footer">Cavalier Logistics - Internal Document</div>
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // 4. Trigger Print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }
}
downloadQuotationsExcel() {
  this.isExportOpen = false;

  if (!this.quotations || this.quotations.length === 0) {
    alert("Excel ke liye koi data nahi hai!");
    return;
  }

  // 1. Data Prepare karein (Sirf Selected Columns ke basis par)
  const excelData = this.quotations.map(q => {
    let row: any = {};
    
    this.selectedColumns.forEach(col => {
      // columnFieldMap se sahi key uthayein (e.g., 'Quotation No' -> 'quotationNo')
      const fieldKey = this.columnFieldMap[col] || col;
      let val = q[fieldKey];

      // Date formatting check
      if (val && typeof val === 'string' && val.includes('T') && !isNaN(Date.parse(val))) {
        val = new Date(val).toLocaleDateString('en-GB');
      }

      row[col] = (val !== null && val !== undefined) ? val : '-';
    });
    
    return row;
  });

  // 2. Worksheet banayein
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

  // 3. Columns ki width thodi set kar dete hain
  const colWidths = this.selectedColumns.map(() => ({ wch: 20 }));
  ws['!cols'] = colWidths;

  // 4. Workbook create karke save karein
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Quotations Data');

  XLSX.writeFile(wb, `Quotations_Report_${new Date().getTime()}.xlsx`);
}
// --- Pagination Variables ---
// currentPage: number = 1;
 // Ek page par kitne records dikhane hain
protected readonly Math = Math; // Template mein Math use karne ke liye

// Computed property jo table ko sirf current page ka data degi
// get paginatedQuotations(): any[] {
//   const startIndex = (this.currentPage - 1) * this.pageSize;
//   return this.quotations.slice(startIndex, startIndex + this.pageSize);
// }

// get totalPages(): number {
//   return Math.ceil(this.quotations.length / this.pageSize) || 1;
// }

setPage(page: number) {
  if (page < 1 || page > this.totalPages) return;
  this.currentPage = page;
  this.cdr.detectChanges();
}
//line of buisnes go on lob
onHeaderLOBChange() {
  // 1. Pehle value ko ek variable mein le lo aur check karo
  const newLOB = this.quotation.lineOfBusiness || '';
  console.log("Header LOB Changed to:", newLOB); // Debugging ke liye

  // 2. Revenue rows ko update karo (sirf agar rows exist karti hain)
  if (this.revenueRows && this.revenueRows.length > 0) {
    this.revenueRows.forEach(row => {
      row.lob = newLOB;
    });
  }

  // 3. Cost rows ko update karo
  if (this.costRows && this.costRows.length > 0) {
    this.costRows.forEach(row => {
      row.lob = newLOB;
    });
  }

  // 4. P&L Summary recalculate karo
  this.calculateAll();

  // 5. UI ko force refresh karo
  this.cdr.detectChanges();
}

onPageSizeChange() {
  this.currentPage = 1; // Size badalne par pehle page par le jao
  this.cdr.detectChanges();
}

showQuotePicker: boolean = false;
setQuoteQuickDate(type: string) {
  const today = new Date();
  let targetDate = new Date();

  switch (type) {
    case 'tomorrow': targetDate.setDate(today.getDate() + 1); break;
    case 'yesterday': targetDate.setDate(today.getDate() - 1); break;
    case 'nextWeek': targetDate.setDate(today.getDate() + 7); break;
    case 'lastWeek': targetDate.setDate(today.getDate() - 7); break;
    case 'nextMonth': targetDate.setMonth(today.getMonth() + 1); break;
    case 'lastMonth': targetDate.setMonth(today.getMonth() - 1); break;
    default: targetDate = today; 
  }

  // Formatting to YYYY-MM-DD (Input field isko hi samajhti hai)
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;

  // Aapke ngModel waale variable ko update karega
  // Line 1365 ko replace karein:
this.searchFilters.validFrom = formattedDate as any;

  this.showQuotePicker = false; // Menu band
  this.cdr.detectChanges();     // UI refresh
}showPopup: boolean = false;
  allQuotationNos: string[] = [];
  private quotationSub?: Subscription;

  // Constructor mein sirf CDR aur HTTP inject kiya hai
  

  // 1. Icon click par popup toggle (Same Logic + CDR)
  togglePopup() {
    if (this.showPopup) {
      this.showPopup = false;
      this.cdr.detectChanges(); // UI update for closing
    } else {
      // Purani subscription agar koi pending ho toh cancel kar dein
      this.quotationSub?.unsubscribe();

      this.quotationSub = this.http.get<any[]>(`${environment.apiUrl}/Quotations`).subscribe({
        next: (res) => {
          this.allQuotationNos = res.map(q => q.quotationNo);
          this.showPopup = true;
          // CDR: Data aate hi UI ko force update karega
          this.cdr.detectChanges(); 
        },
        error: (err) => {
          console.error("Error fetching all quotations", err);
          this.cdr.detectChanges();
        }
      });
    }
  }

  // 2. Popup se select karne par (Same Logic + CDR)
  selectFromPopup(val: string) {
    this.searchFilters.quotationNo = val;
    this.showPopup = false;
    this.cdr.detectChanges(); // UI update for selection
  }

  // 3. Component band hote hi sab saaf (Destroy Logic)
  ngOnDestroy() {
    if (this.quotationSub) {
      this.quotationSub.unsubscribe();
      console.log('Quotation subscription cleaned up');
        this.lobSub?.unsubscribe(); // Services subscription bhi clear karein
         this.quotedBySub?.unsubscribe(); // Teeno subscriptions clear
    }
  }
  // Variables declare karein
showLOBPopup: boolean = false;
allLOBs: string[] = [];
private lobSub?: Subscription;

// 1. Services icon click par toggle logic
toggleLOBPopup() {
  if (this.showLOBPopup) {
    this.showLOBPopup = false;
    this.cdr.detectChanges();
  } else {
    this.lobSub?.unsubscribe();

    // Maan lete hain endpoint /LinesOfBusiness hai (ya jo bhi aapka correct endpoint ho)
    this.lobSub = this.http.get<any[]>(`${environment.apiUrl}/Quotations`).subscribe({
      next: (res) => {
        // Response se string array nikalna
        this.allLOBs = res.map(item => item.name || item.lineOfBusiness || item); 
        this.showLOBPopup = true;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error("Error fetching LOBs", err);
        this.cdr.detectChanges();
      }
    });
  }
}

// 2. Popup se select karne par
selectLOBFromPopup(val: string) {
  this.searchFilters.lineOfBusiness = val;
  this.showLOBPopup = false;
  this.cdr.detectChanges();
}

// ngOnDestroy mein cleanup add kar dena
// Variables declare karein
showQuotedByPopup: boolean = false;
allSalesCoors: string[] = [];
private quotedBySub?: Subscription;

// 1. Icon click par popup toggle logic
toggleQuotedByPopup() {
  if (this.showQuotedByPopup) {
    this.showQuotedByPopup = false;
    this.cdr.detectChanges();
  } else {
    this.quotedBySub?.unsubscribe();

    // API Call (Maan lete hain endpoint /SalesCoordinators hai, aap apna endpoint check kar lena)
    this.quotedBySub = this.http.get<any[]>(`${environment.apiUrl}/Quotations`).subscribe({
      next: (res) => {
        // API response se sales coordinator ka naam nikal rahe hain
        this.allSalesCoors = res.map(item => item.salesCoor || item.userName || item); 
        this.showQuotedByPopup = true;
        this.cdr.detectChanges(); // UI Update
      },
      error: (err) => {
        console.error("Error fetching SalesCoors", err);
        this.cdr.detectChanges();
      }
    });
  }
}

// 2. Popup se select karne par
selectQuotedByFromPopup(val: string) {
  this.searchFilters.quotedBy = val;
  this.showQuotedByPopup = false;
  this.cdr.detectChanges();
}

// 3. Cleanup in ngOnDestroy
getAllInquiries() {
  // Agar list pehle se khuli hai to band kar de, varna API call kare
  if (this.showInquiryDropdown) {
    this.showInquiryDropdown = false;
  } else {
    const url = `${environment.apiUrl}/Inquiry`;
    this.http.get<any[]>(url).subscribe({
      next: (res) => {
        this.filteredInquiries = res; // Saari inquiries list mein aa jayengi
        this.showInquiryDropdown = true; // Dropdown show ho jayega
      },
      error: (err) => {
        console.error("Inquiry load karne mein error aaya:", err);
      }
    });
  }
}

// Ye function ensure karein ki aapki file mein hai taaki error na aaye
// selectInquiry(inq: any) {
//   this.quotation.referenceByInquiry = inq.inquiryNo;
//   this.showInquiryDropdown = false;
// }
// Variables
inquiryList: any[] = [];




loadInquiryList() {
  // Toggle feature: Agar khula hai to band kar do
  if (this.showInquiryDropdown) {
    this.showInquiryDropdown = false;
    this.cdr.detectChanges();
    return;
  }

  const url = `${environment.apiUrl}/Inquiry`;
  
  this.http.get<any[]>(url).subscribe({
    next: (res) => {
      this.inquiryList = res; 
      this.showInquiryDropdown = true; 
      
      // CDR: UI ko turant refresh karne ke liye taaki list foran dikhe
      this.cdr.detectChanges(); 
      
      console.log(res, "Inquiry data loaded successfully");
    },
    error: (err) => {
      console.error("Inquiry fetch error:", err);
      this.showInquiryDropdown = false;
      this.cdr.detectChanges();
    }
  });
}


}