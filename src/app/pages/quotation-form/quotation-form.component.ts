import { Permission } from './../employee/employee.component';
import { CheckPermissionService } from './../../services/check-permission.service';

import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { UserService } from '../../services/user.service';
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
import { forkJoin, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
interface DimGroup {
  dimString: string;
  l: number;
  w: number;
  h: number;
  unit: string;
  indices: number[];
  totalBoxQty: number;
}
@Component({
  selector: 'app-quotation-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule, DragDropModule],
  templateUrl: './quotation-form.component.html',
})
export class QuotationFormComponent implements OnInit {
  @ViewChild('cargoReadyDateInput') cargoReadyDateInput!: ElementRef;
  token:string='';
  isPreviewMode = false;
agentDetail: any[] = [];
selectedEmails = new Set<string>();
lastSelectedBranch: string = "";
  getsalescordinate: any[] = [];
    shipmentTypes: any[] = [];
    portOfLoadingList: any[] = [];
portOfDischargeList: any[] = [];
    commodityTypes: any[] = [];
  PermissionID:any;
  currentPage: number = 1;
  pageSize: number = 10;
  searchDone: boolean = false;
  isFormOpen = false;
  transportModes: any[] = [];
   movementTypes: any[] = [];
  isPickupEnabled: boolean = false;
  selectedBranchIds: number[] = []; 
 public apiEndpoint = `${environment.apiUrl}/Quotations`;
 apiUrl = environment.apiUrl;
// -- Dropdown Control Variables --
companyServices:any[]=[]
isDeliveryEnabled:boolean=false;
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
  incoTerms: any[] = [];
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
revenueRows: any[] = [{ lob: '', chargeName: '', chargeType: 'Prepaid', basis: '',  rate: 0, exchangeRate: 1, amount: 0 }];
costRows: any[] = [{ lob: '', chargeName: '', chargeType: 'Prepaid', basis: '',  rate: 0, exchangeRate: 1, amount: 0 }];
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

portsOfLoading: any[] = []; // Yahan API ka data save hoga
filteredFinalDestinations: any[] = [];
showFinalDestinationDropdown = false;
  showAdvanceFilter: boolean = false;
quotedByList: string[] = []; // Suggestions ke liye
organizationList: string[] = [];
  quotationNoList: string[] = [];
quotationss: any = this.resetQuotationModel();
  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef,public CheckPermissionService:CheckPermissionService,public userServices:UserService, private eRef: ElementRef) {
    this.initTableRows();
  }
  showColumnModal = false;
availableColumns:string[] = [];

selectedColumns: string[] = [

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
    // Data load hone ke baad ye logic chalao
if (!this.quotation.grossWeightUnit) {
  this.quotation.grossWeightUnit = 'KGS';
}
if (!this.quotation.netWeightUnit) {
      this.quotation.netWeightUnit = 'KGS';
  }
  // Data milne ke baad ye check zaroor lagao
if (!this.quotation.chargeableWeightUnit) {
  this.quotation.chargeableWeightUnit = 'KGS'; 
}
    this.loadPortsFromApi();
    this.loadPortOfLoadings();
    this.fetchOrigins();
    this.initializeAllUnits();
    this.getPackageUnits();
    this.checkHazardStatus()
    if (!this.quotation.grossWeightUnit) this.quotation.grossWeightUnit = 'KGS';
    if (!this.quotation.netWeightUnit) this.quotation.netWeightUnit = 'KGS';
    this.setDefaultUnits()
    this.loadUomList();
  this.loadPortOfDischarges();
    this.loadConnectingPortsData()
    this.loadPricingList();
    this.getTransportModes();
    this.getCommodityTypes();
    this.getIncoTerms();
    this.getMovementTypes();
    this.getShipmentTypes();
this.getsales();
  this.gettoken();

    this.loadBranchess();

      this.PermissionID = Number(localStorage.getItem('permissionID'));
    this.loadColumnSettings();
    
    this.fetchOrganizations();
    this.fetchLeads();
    this.getNextQuotationNumber();
    this.fetchInquiries();
    this.loadSearchSuggestions();
    this.fetchCompanyServices()
    this.fetchLOBs();
  }
  onCargoStatusChange2() {
  if (this.quotation.cargoStatus === 'Ready') {
    this.setTodayDate2();
  } 
  else if (this.quotation.cargoStatus === 'Ready By') {

    if (!this.quotation.cargoReadyDate) {
      this.setTodayDate2();
    }

    setTimeout(() => {
      const input = this.cargoReadyDateInput?.nativeElement;

      if (input) {
        input.focus();

        setTimeout(() => {
          input.click();
          try {
            input.showPicker();
          } catch (e) {
            console.log("showPicker not supported");
          }
        }, 50);
      }
    }, 100);
  }
}
setTodayDate2() {
  const today = new Date().toISOString().split('T')[0];
  this.quotation.cargoReadyDate = today;
}
AllSearch(){
this.loadQuotations();
this.cdr.detectChanges();
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
showPricingDetails(item: any) {
  const pId = item.pricingId || item.PricingId;
  
  if (pId) {
    // Dashboard/Price page par navigate karein aur 'editId' query parameter bhejien
    this.router.navigate(['/dashboard/Price'], { queryParams: { editId: pId } });
  } else {
    Swal.fire('Error', 'Pricing ID nahi mili is record ke liye.', 'error');
  }
}
toggleReview() {
  if (!this.quotation.organization) {
    alert("Please select or save organization first");
    return;
  }
  
  // Pricing ki tarah assigned branches fetch karne ke liye (agar origin/country code available hai)
  // Note: Agar quotation me originPort code milta hai toh fetchAgentByPostCode call karein
  this.isPreviewMode = true;
}
backToEdit() {
  this.isPreviewMode = false;
}
fetchAgentByPostCode(postCode: string) {
  const url = `${environment.apiUrl}/OrgBranch/GetByPostCodeAgent/${postCode}`;
  this.http.get<any[]>(url).subscribe({
    next: (res) => {
      this.agentDetail = res;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error("Agent fetch fail:", err);
      this.agentDetail = [];
    }
  });
}

// 3. Branch Selection Logic
onAgentSelect(event: any, agent: any) {
  const email = agent.email || agent.Email;
  const branch = agent.branchName || agent.BranchName || "Global";
  if (!email) return;

  if (event.target.checked) {
    this.selectedEmails.add(email);
    this.lastSelectedBranch = branch;
  } else {
    this.selectedEmails.delete(email);
  }
}
getMovementTypes() {
    // Hits: https://localhost:xxxx/api/MovementTypes
    this.http.get<any[]>(`${environment.apiUrl}/MovementTypes`).subscribe({
      next: (data) => {
        this.movementTypes = data;
      },
      error: (err) => console.error('Error fetching Movement Types:', err)
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
'Reference By Inquiry':'referenceByInquiry',

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



// 'Revenue Data':'revenueData',

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
onIncotermChange(selectedIncoterm: any) {
  // Check karo agar value null/undefined toh nahi
  if (!selectedIncoterm) return;

  // Value ko process karo
  const val = selectedIncoterm.toUpperCase().trim();
  this.quotation.incoterm = val;

  console.log(`Incoterm changed to: ${val}`);

  // Delivery enabled logic
  if (val === 'DDP' || val === 'DDU' || val === 'DAP') {
    this.isDeliveryEnabled = true;
  } else {
    this.isDeliveryEnabled = false;
    this.quotation.deliveryAddress = '';
  }

  // Switch Case logic
  switch (val) {
    case 'FOB':
      this.quotation.movementType = 'PORT TO PORT';
      this.isPickupEnabled = false;
      this.quotation.pickupAddress = '';
      break;

    case 'EXWORK':
      this.quotation.movementType = 'DOOR TO PORT';
      this.isPickupEnabled = true;
      break;

    default:
      this.quotation.movementType = 'DOOR TO DOOR';
      this.isPickupEnabled = false;
      this.quotation.pickupAddress = '';
  }
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
// 3. Selection Logic - UPDATED & IMPROVED
selectInquiry(inq: any) {
  if (!inq || !inq.inquiryNo) {
    console.error("Invalid inquiry data");
    return;
  }
console.log(inq);
  // Basic fields
  this.quotation.referenceByInquiry = inq.inquiryNo || '';
  this.quotation.customerName = inq.customerName || '';
  this.quotation.organization = inq.customerName || '';

  this.showInquiryDropdown = false;
  this.cdr.detectChanges();

  const inquiryNo = inq.inquiryNo?.trim();
  if (!inquiryNo) return;

  const url = `${environment.apiUrl}/Inquiry/by-no?inquiryNo=${inquiryNo}`;

  this.http.get<any>(url).subscribe({
    next: (fullData) => {
      console.log("✅ Full Inquiry Data:", fullData);

      // --- Transport & Movement Logic ---
      if (fullData.transportMode) {
        const modeFromApi = fullData.transportMode.trim();
        const matchedMode = this.transportModes?.find(m => 
          m.name.toLowerCase() === modeFromApi.toLowerCase()
        );
        this.quotation.transportMode = matchedMode ? matchedMode.name : modeFromApi;
      } else {
        this.quotation.transportMode = '';
      }

      if (fullData.transportType) {
        this.quotation.transportType = fullData.transportType.trim();
      } else if (this.quotation.transportMode?.toUpperCase() === 'AIR' || this.quotation.transportMode?.toUpperCase() === 'SEA') {
        this.quotation.transportType = 'Export';
      } else {
        this.quotation.transportType = '';
      }

      this.quotation.shipmentType = fullData.shipmentType || '';
      this.quotation.movementType = fullData.movementType ? fullData.movementType.trim() : (fullData.movement ? fullData.movement.trim() : '');

      // --- Weight, Packages & CBM AUTO-FILL ---
      this.quotation.noOfPkgs = fullData.noOfPkgs || 0;
      this.quotation.grossWeightKg = fullData.grossWeightKg || 0;
      this.quotation.netWeight = fullData.netWeight || 0;
      this.quotation.chargeableWeight = fullData.chargeableWeight || 0;
      this.quotation.volumeWeight = fullData.volumeWeight || 0;
      this.quotation.chargeableWeightKg = fullData.volumeWeight || '';

      // 🔥 CBM WEIGHT CALCULATION LOGIC
      // Pehle check karega API mein value hai kya, agar nahi hai toh formula use karega
      const apiCbm = fullData.cbm || fullData.cbmWeight || fullData.totalCbm;
      
      if (apiCbm) {
        this.quotation.cbm = apiCbm;
      } else if (this.quotation.volumeWeight) {
        // Aapka formula: Volume Weight / 167
        const calculatedCbm = this.quotation.volumeWeight / 167;
        this.quotation.cbm = parseFloat(calculatedCbm.toFixed(3));
      } else {
        this.quotation.cbm = 0;
      }

      this.quotation.cbmUnit = fullData.cbmUnit || 'CBM';

      // --- Remaining Fields ---
      this.quotation.businessDimensions = fullData.businessDimensions || fullData.businessDim || fullData.commodityName || '';
      this.quotation.incoterm = fullData.incoterm || fullData.incoTerms || '';
      this.quotation.description = fullData.description || '';
      this.quotation.pickupAddress = fullData.pickupAddress || '';
      this.quotation.placeOfDelivery = fullData.placeOfDelivery || '';
      this.quotation.podFinalDest = fullData.finalDestination || '';
      this.quotation.location = fullData.location || '';
      this.quotation.currency = (fullData.cargoCurrency || '').trim();
      this.quotation.cargoValue = fullData.cargoValue || '';

      // IDs & Names
      this.quotation.originPOL = fullData.originName || '';
      this.quotation.portOfLoading = fullData.portOfLoadingName || '';
      this.quotation.portOfDischarge = fullData.portOfDischargeName || '';
      this.quotation.commodity = fullData.commodity ? String(fullData.commodity) : "";
      // this.quotation.lineOfBusiness = fullData.lineOfBusiness ? Number(fullData.lineOfBusiness) : 0;
      // Sales & Status
      this.quotation.salesCoordinator = fullData.salesCoordinator ? Number(fullData.salesCoordinator) : null;
      this.quotation.pricingBy = fullData.pricingDoneBy || '';
      this.quotation.qtnDoneBy = fullData.qtnDoneBy || '';
      this.quotation.cargoStatus = fullData.cargoStatus || 'Ready';

      const statusDate = fullData.cargoStatusDate ? fullData.cargoStatusDate.split('T')[0] : null;
      this.quotation.cargoReadyDate = null;
      setTimeout(() => { this.quotation.cargoReadyDate = statusDate; }, 0);

      this.quotation.validTill = fullData.validTill || '';
      this.quotation.version = fullData.version || '';

      // --- Dimensions Autofill ---
      if (fullData?.dimensions?.length > 0) {
        const dims = fullData.dimensions;
        const mainDim = dims.find((d: any) => d.id === 0) || dims[0];
        if (mainDim) {
          this.quotation.dimBox = mainDim.box ?? 0;
          this.quotation.dimL = mainDim.l ?? 0;
          this.quotation.dimW = mainDim.w ?? 0;
          this.quotation.dimH = mainDim.h ?? 0;
          this.quotation.dimUnit = mainDim.unit ?? 'CMS';
        }
        this.dimRows = dims.filter((d: any) => d.id !== 0).map((d: any) => ({
          box: d.box ?? null, l: d.l ?? null, w: d.w ?? null, h: d.h ?? null, unit: d.unit ?? 'CMS'
        }));
      } else {
        this.dimRows = [{ box: null, l: null, w: null, h: null, unit: 'CMS' }];
      }

      this.cdr.detectChanges();
      console.log("✅ Quotation Auto-filled & CBM Calculated successfully!");
    },
    error: (err) => {
      console.error("❌ Error fetching full inquiry:", err);
      alert("Failed to load inquiry details.");
    }
  });
} 
  // --- Lead API Call ---
 // --- Lead API Call ---
  getCommodityTypes() {
     // Hits: https://localhost:xxxx/api/CommodityType
     this.http.get<any[]>(`${environment.apiUrl}/CommodityType`).subscribe({
       next: (data) => {
         this.commodityTypes = data;
       },
       error: (err) => console.error('Error fetching Commodities:', err)
     });
   }
fetchLeads() {
    // 2. URL ko environment se access karein
    const url = `${environment.apiUrl}/Leads`;
    
    this.http.get<any[]>(url).subscribe(data => {
      this.leads = data;
      console.log(data)
    });
  }
getShipmentTypes() {
    // This hits: https://localhost:xxxx/api/ShipmentTypes
    this.http.get<any[]>(`${environment.apiUrl}/ShipmentTypes`).subscribe({
      next: (data) => {
        this.shipmentTypes = data;
      },
      error: (err) => console.error('Error fetching Shipment Types:', err)
    });
  }
  navigateToNewOrg(event?: MouseEvent) {
    if (event) {
      event.stopImmediatePropagation();
    }

      // NEW click karte hi dropdown band

    this.router.navigate(['/dashboard/organization-add'], {
      state: { isFormOpen: true }
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
  const token = localStorage.getItem('cavalier_token');

  const httpOptions = {
    headers: new HttpHeaders({
      Authorization: `Bearer ${token}`
    })
  };

  this.http.get<any[]>(this.apiEndpoint, httpOptions).subscribe({
    next: (res) => { 
      this.quotations = res; 
      this.cdr.detectChanges(); // Ensure UI updates after data load
      console.log("Quotations Data:", this.quotations);
    },
    error: (err) => {
      console.error('Failed to load quotations:', err);

      if (err.status === 401) {
        alert("Unauthorized! Please login again.");
      }
    }
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
generateQuotationNo(): string {

  const lobName = this.quotation.lineOfBusiness || '';

  // 1️⃣ Initials (Air Import -> AI)
  const initials = (lobName || '')
    .split(' ')
    .filter((w: string) => w)
    .map((w: string) => w.charAt(0))
    .join('')
    .toUpperCase();

  // 2️⃣ Running number (temporary frontend)
  let number = 1;

  if (this.quotation.quotationNo) {
    const parts = this.quotation.quotationNo.split('/');
    if (parts.length >= 4) {
      number = parseInt(parts[3]) + 1 || 1;
    }
  }

  const formattedNumber = number.toString().padStart(4, '0');

  // 3️⃣ Financial Year
  const now = new Date();
  const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const endYear = startYear + 1;

  const fy = `${startYear.toString().slice(-2)}-${endYear.toString().slice(-2)}`;

  // 4️⃣ Final format
  return `CAV/QTN/${initials}/${formattedNumber}/${fy}`;
}
saveQuotation() {
  const token = localStorage.getItem('cavalier_token');
  if (!token) {
    Swal.fire('Error', 'Session expire ho gaya hai. Login karein.', 'error');
    return;
  }

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
  const httpOptions = { headers };

  const validRevenueRows = this.revenueRows.filter(r => r.chargeName && r.chargeName.trim() !== '');
  const validCostRows = this.costRows.filter(c => c.chargeName && c.chargeName.trim() !== '');

  if (validRevenueRows.length === 0 && validCostRows.length === 0) {
    Swal.fire('Incomplete Data', 'Valid Revenue or Cost items required!', 'warning');
    return;
  }

  // --- Start SweetAlert Loading Animation ---
  Swal.fire({
    title: 'Processing Quotation...',
    html: '<b>Step 1:</b> Saving main records...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  // 🔥 MAPPING LOGIC: Frontend variables ko Backend Model keys se match kiya hai
  const payload = {
    ...this.quotation,
    // ✅ Direct/Indirect added here
    isDirect: Boolean(this.quotation.isDirect),
    isIndirect: Boolean(this.quotation.isIndirect),
    
// 🔥 NAYI FIELDS ADDED TO PAYLOAD
    country: this.quotation.country || "",
    finalDestinationCode: this.quotation.finalDestinationCode || "",
    podOrigin: this.quotation.podOrigin || "",

    pricingId: this.quotation.pricingId ? Number(this.quotation.pricingId) : null,
    organisationId: this.quotation.organisationId ? Number(this.quotation.organisationId) : null,
    organisationName: this.quotation.organisationName || this.quotation.organization,
    // 1. Reference by Pricing
    referenceByInquiry: this.quotation.referencePricingNo, 
    
    // 2. Sales Coordinator (ID to String)
    salesCoor: String(this.quotation.salesCoordinator || ""), 
    
    // 3. No of Package & Weights (Numeric Conversion)
    numOfPackages: Number(this.quotation.noOfPkgs || 0),
    grossWeight: Number(this.quotation.grossWeightKg || 0),
    chrgWeight: Number(this.quotation.chargeableWeight || 0),
    volumeWeight: Number(this.quotation.volumeWeight || 0),
    
    // 4. IncoTerms & Movement
    incoTerms: this.quotation.incoterm, 
    movement: this.quotation.movementType, 
    
    // 5. Carrier & Transit Days
    awbIssuedBy: this.quotation.awbIssuedBy, 
    transitDest: this.quotation.transitDays ? `${this.quotation.transitDest} (${this.quotation.transitDays} Days)` : this.quotation.transitDest,
    
    // 6. Cargo Value Currency merge
    cargoValue: `${this.quotation.currency} ${this.quotation.cargoValue}`,
    
    // 7. Pickup & Delivery Address merge (Org + Address)
    pickupAddress: `Org: ${this.quotation.pickupOrg || ""}, Addr: ${this.quotation.pickupAddress || ""}`,
    deliveryAddress: `Org: ${this.quotation.deliveryOrg || ""}, Addr: ${this.quotation.deliveryAddress || ""}`,

    // JSON Data (✅ DIMENSIONS DATA UPDATED TO PASS REAL VALUE NOW)
    revenueData: JSON.stringify(this.revenueRows),
    costData: JSON.stringify(this.costRows),
    dimensionsData: this.dimRows && this.dimRows.length > 0 ? JSON.stringify(this.dimRows) : "",
    
    // Total Calculations
    totalRevenue: this.totalRevFinal,
    totalCost: this.totalCostFinal,
    totalProfit: this.totalProfitFinal,
    lineOfBusiness: String(this.quotation.lineOfBusiness),
    commodity: String(this.quotation.commodity),
documents: this.documents.map(d => ({ fileName: d.name, filePath: d.documentPath })),
    // ✅ FIXED PLACEMENT: Inko object ke sabse aakhiri mein rakha hai taaki ...this.quotation ki string values is numeric conversion ko override na kar sakein.
    portOfLoadingId: (this.quotation.portOfLoadingId !== null && this.quotation.portOfLoadingId !== undefined && this.quotation.portOfLoadingId !== '') ? Number(this.quotation.portOfLoadingId) : null,
    portOfDischargeId: (this.quotation.portOfDischargeId !== null && this.quotation.portOfDischargeId !== undefined && this.quotation.portOfDischargeId !== '') ? Number(this.quotation.portOfDischargeId) : null,
    
    // ✅ CONNECTING PORTS MAPPING (Array of objects to comma-separated ID string)
    connectingPortIds: this.selectedConnectingPorts && this.selectedConnectingPorts.length > 0 
        ? this.selectedConnectingPorts.map(p => p.id).join(',') 
        : ""
  };

  // 📝 CONSOLE LOG: Isse aap Inspect Element -> Console me pura payload check kar sakte hain api hit hone se pehle
  console.log("🚀 FINAL PAYLOAD BEING SENT TO BACKEND:", payload);

  // 1. API Step 1: Save Quotation
  const request = this.quotation.id > 0 
    ? this.http.put(`${this.apiEndpoint}/update/${this.quotation.id}`, payload, httpOptions)
    : this.http.post(this.apiEndpoint, payload, httpOptions);

  request.subscribe({
    next: (res: any) => {
      const savedQtnId = res?.id || res?.data?.id || this.quotation.id;

      Swal.update({
        title: 'Revenue is Saving... ⏳',
        html: '<b>Step 2:</b> Syncing Revenue items...'
      });

      // 2. Prepare Revenue Payload
      const revenuePayload = validRevenueRows.map(r => ({
        quotationId: savedQtnId,
        lob: String(r.lob || payload.lineOfBusiness || ""),
        chargeName: r.chargeName,
        chargeType: r.chargeType,
        basis: r.basis,
        cur: r.currency,
        rate: Number(r.rate) || 0,
        exchangeRate: Number(r.exchangeRate) || 1,
        amount: Number(r.amount) || 0
      }));

      this.http.post(`${this.apiEndpoint}/SaveQuotationRevenue`, revenuePayload, httpOptions).subscribe({
        next: () => {
          Swal.update({
            title: 'Cast Is Saving... ⏳',
            html: '<b>Step 3:</b> Finalizing Cost breakdowns...'
          });

          // 3. Prepare Cost Payload
          const costPayload = validCostRows.map(c => ({
            quotationId: savedQtnId,
            lob: String(c.lob || payload.lineOfBusiness || ""),
            chargeName: c.chargeName,
            chargeType: c.chargeType,
            basis: c.basis,
            cur: c.currency,
            rate: Number(c.rate) || 0,
            exchangeRate: Number(c.exchangeRate) || 1,
            amount: Number(c.amount) || 0
          }));

          this.http.post(`${this.apiEndpoint}/SaveQuotationCost`, costPayload, httpOptions).subscribe({
            next: () => {
              Swal.update({
                title: 'Cost Analysis Ready ✅',
                html: '<b>Step 4:</b> Generating P&L Summary...'
              });

              // 4. Prepare PnL Summary
              const pnlPayload = this.pnLRows.map(p => ({
                quotationId: savedQtnId,
                lob: String(p.lob || ""),
                chargeName: p.chargeName,
                revenue: Number(p.revenue) || 0,
                cost: Number(p.cost) || 0,
                profit: Number(p.profit) || 0,
                profitPercentage: Number(p.profitPercent) || 0
              }));

              this.http.post(`${this.apiEndpoint}/SavePnLSummary`, pnlPayload, httpOptions).subscribe({
                next: () => {
                  Swal.fire({
                    icon: 'success',
                    title: 'All Done! 🚀',
                    text: 'SuccessFully Save!',
                    timer: 2000,
                    showConfirmButton: false
                  });
// ✅ YE LINE ADD KI HAI
                  setTimeout(() => { window.location.reload(); }, 2000);
                  this.loadQuotations();
                  this.toggleForm();
                  this.cdr.detectChanges();
                },
                error: () => Swal.fire('Error', 'PnL Summary save fail hui.', 'warning')
              });
            },
            error: () => Swal.fire('Error', 'Cost save fail hua.', 'error')
          });
        },
        error: () => Swal.fire('Error', 'Revenue save fail hua.', 'error')
      });
    },
    error: (err) => {
      console.error(err);
      Swal.fire('Failed', 'Main Quotation save nahi ho saki.', 'error');
    }
  });
}
// Naya function: Pehle API call karega fir autofill
loadQuotationForEdit(id: number) {
  const token = localStorage.getItem('cavalier_token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  // 1. Backend ki specific ID wali API call (Jo aapne upar di hai)
  this.http.get<any>(`${this.apiEndpoint}/${id}`, { headers }).subscribe({
    next: (data) => {
      console.log("✅ Fresh Quotation Data Received:", data);
      // 2. Data milte hi aapka existing autofill logic trigger kar do
      this.editQuotation(data);
      this.cdr.detectChanges(); // Ensure UI updates with new data
    },
    error: (err) => {
      console.error("❌ Error fetching quotation:", err);
      Swal.fire('Error', 'Data load karne mein problem aayi!', 'error');
    }
  });
}

// Aapka existing editQuotation logic (Isme koi change nahi, bas call upar se ho rahi hai)
editQuotation(q: any) {
  console.warn("Editing Quotation Data:", q);
  
  // 1. Form Open karein
  this.isFormOpen = true;

  // 2. Base Model Mapping
  this.quotation = {
    ...q,
    chargeableWeight: q.chrgWeight || 0,
    grossWeightKg: q.grossWeight || q.grossWeightKg || 0,
    salesCoordinator: q.salesCoor ? Number(q.salesCoor) : null,
    commodity: q.commodity ? Number(q.commodity) : null,
    lineOfBusiness: q.lineOfBusiness ? q.lineOfBusiness.toString() : "",
    awbIssuedBy: q.awbIssuedBy || "", 
    isServiceRequired: q.isServiceRequired === true,
    chargeableWeightKg: Number(q.volumeWeight) || 0,
    volumeWeightUnit: q.volumeWeightUnit || "KGS",
    cbm: q.cbmWeight || (Number(q.volumeWeight) ? parseFloat((q.volumeWeight / 167).toFixed(3)) : 0),
    movementType: q.movement || q.movementType || '',
    incoterm: q.incoTerms || q.incoterm || '',
    referencePricingNo: q.referenceByInquiry || '',
    noOfPkgs: q.numOfPackages !== undefined ? q.numOfPackages : 0,
    pkgUnit: q.packageUnit || q.pkgUnit || 'PKGS',
    portOfLoadingId: (q.portOfLoadingId !== null && q.portOfLoadingId !== undefined && q.portOfLoadingId !== '' && !isNaN(Number(q.portOfLoadingId))) ? Number(q.portOfLoadingId) : null,
    portOfDischargeId: (q.portOfDischargeId !== null && q.portOfDischargeId !== undefined && q.portOfDischargeId !== '' && !isNaN(Number(q.portOfDischargeId))) ? Number(q.portOfDischargeId) : null
  };

  // 3. Connecting Ports Mapping (Auto-populate for UI)
 // 3. Connecting Ports Mapping (Auto-populate for UI)
console.log("🔍 Debugging Connecting Ports Input:", q.connectingPortIds);
this.selectedConnectingPorts = [];
this.quotation.connectingPortIds = []; 

if (q.connectingPortIds) {
  const idsArray = typeof q.connectingPortIds === 'string' 
    ? q.connectingPortIds.split(',').map((x: any) => x.trim()).filter((x: any) => x !== '')
    : (Array.isArray(q.connectingPortIds) ? q.connectingPortIds : [q.connectingPortIds]);

  this.quotation.connectingPortIds = idsArray.map((id: any) => Number(id));

  this.selectedConnectingPorts = idsArray.map((id: any) => {
    const trimmedId = id.toString().trim();
    // Yahan ensure karo ki filteredConnectingPorts available ho
    const masterPort = this.filteredConnectingPorts?.find(p => p.id.toString() === trimmedId);
    
    // 🔥 FIX: Yahan 'portName' use karo taaki HTML mein show ho
    const portObj = {
      id: trimmedId,
      portName: masterPort ? masterPort.portName || masterPort.name : `Port ID: ${trimmedId}`,
      portCode: masterPort ? masterPort.portCode : '',
      cpType: 'Transit'
    };
    return portObj;
  });
  console.log("✅ Populated selectedConnectingPorts:", this.selectedConnectingPorts);
}
  // 4. Cargo Value Splitting
  if (q.cargoValue) {
    const amountMatch = q.cargoValue.match(/(\d+(\.\d+)?)/);
    if (amountMatch) {
      const amount = amountMatch[0];
      this.quotation.currency = q.cargoValue.replace(amount, '').trim();
      this.quotation.cargoValue = parseFloat(amount);
    }
  } else {
    this.quotation.currency = '';
    this.quotation.cargoValue = null;
  }
// q.documents database se aayega, hum use local 'documents' array mein load kar rahe hain
  if (q.documents && Array.isArray(q.documents)) {
    this.documents = q.documents.map((doc: any) => ({
      id: doc.id,
      name: doc.fileName, // Backend se 'fileName' aa raha hai
      documentPath: doc.filePath, // Backend se 'filePath' aa raha hai
      file: null, // Edit karte waqt purani file null rehti hai
      isReplacing: false
    }));
  } else {
    this.documents = []; // Agar koi document nahi hai
  }
  // 5. Transit Destination & Days
  if (q.transitDest && q.transitDest.includes('(')) {
    const daysMatch = q.transitDest.match(/\((.*?) Days\)/);
    this.quotation.transitDays = (daysMatch && daysMatch[1]) ? daysMatch[1].trim() : '';
    this.quotation.transitDest = q.transitDest.split(' (')[0].trim();
  } else {
    this.quotation.transitDest = q.transitDest || '';
    this.quotation.transitDays = '';
  }

  // 6. Address Splitting
  if (q.pickupAddress && q.pickupAddress.includes(', Addr:')) {
    const pParts = q.pickupAddress.split(', Addr:');
    this.quotation.pickupOrg = pParts[0].replace('Org:', '').trim();
    this.quotation.pickupAddress = pParts[1].trim();
  } else {
    this.quotation.pickupAddress = q.pickupAddress || '';
  }

  if (q.deliveryAddress && q.deliveryAddress.includes(', Addr:')) {
    const dParts = q.deliveryAddress.split(', Addr:');
    this.quotation.deliveryOrg = dParts[0].replace('Org:', '').trim();
    this.quotation.deliveryAddress = dParts[1].trim();
  } else {
    this.quotation.deliveryAddress = q.deliveryAddress || '';
  }

  // 7. Date Formatting
  if (q.validFrom) this.quotation.validFrom = q.validFrom.split('T')[0];
  if (q.validTill) this.quotation.validTill = q.validTill.split('T')[0];
  if (q.cargoStatus === 'Ready' || q.cargoStatus === 'Ready By') {
     this.quotation.cargoReadyDate = q.validFrom ? q.validFrom.split('T')[0] : null;
  }

  // 8. Tables Data
  this.revenueRows = q.revenueData ? (typeof q.revenueData === 'string' ? JSON.parse(q.revenueData) : q.revenueData) : [];
  this.costRows = q.costData ? (typeof q.costData === 'string' ? JSON.parse(q.costData) : q.costData) : [];

  // 9. Dimensions
  const dimData = q.dimensionsData || q.DimensionsData;
  this.dimRows = dimData ? (typeof dimData === 'string' ? JSON.parse(dimData) : dimData) : [{ box: null, l: null, w: null, h: null, unit: 'CMS' }];
  
  if (this.dimRows.length > 0) {
    this.quotation.dimBox = this.dimRows[0].box;
    this.quotation.dimL = this.dimRows[0].l;
    this.quotation.dimW = this.dimRows[0].w;
    this.quotation.dimH = this.dimRows[0].h;
  }

  // 10. Final UI Refresh & Sync
  setTimeout(() => {
    // Trigger POL/POD name mapping for the display logic
    this.onPolChange();
    this.onPodChange();

    if (this.updateTotalPackagesFromDims) this.updateTotalPackagesFromDims();
    else this.calculateAll();
    
    // Force UI update
    this.cdr.detectChanges();
    console.log("🏁 UI Refresh triggered for Quotation Edit");
  }, 200);
}

// Constructor mein inject karein


deleteQuotation(id: number) {
  if (confirm("Are you sure?")) {
    this.http.delete(`${this.apiEndpoint}/${id}`).subscribe({
      next: () => {
        // 2. Data load hone ke baad manual refresh trigger karein
        this.loadQuotations();
        
        // 3. Ek chota sa delay de kar Angular ko force karein UI update ke liye
        setTimeout(() => {
          this.cdr.detectChanges();
          console.log("UI Refreshed!");
        }, 100);
      },
      error: (err) => {
        console.error("Delete Error:", err);
        this.cdr.detectChanges();
      }
    });
  }
}

  // --- Filter & Search Methods (Fixes 'searchQuotations', 'clearFilters' errors) ---
  searchQuotations() {
    console.log("Searching with filters:", this.filters);
  }





  // --- Table Handling ---
  initTableRows() {
    this.revenueRows = [{ lob: '', chargeName: '', chargeType: '', basis: '',  rate: 0, exchangeRate: 1, amount: 0 }];
    this.costRows = [{ lob: '', chargeName: '', chargeType: '', basis: '',  rate: 0, exchangeRate: 1, amount: 0 }];
  }

  addRevenueRow() { const currentLOB = this.quotation.lineOfBusiness;
  this.revenueRows.push({ lob:currentLOB, chargeName: '', chargeType: 'Prepaid', basis: '', 
     rate: 0, exchangeRate: 1, amount: 0 });
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
  this.costRows.push({ lob: currentLOB, chargeName: '', chargeType: 'Prepaid', basis: '',  rate: 0, exchangeRate: 1, amount: 0 });
}

removeCostRow(index: number) {
  this.costRows.splice(index, 1);
  this.calculateAll();
}

calculateCost() {
  this.costRows.forEach(row => {
    row.amount = (row.rate || 0) * (this.quotation.chargeableWeight || 1);
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
openDimModal() {
    // 1. Agar API se data dimRows mein aa chuka hai, toh use chhedo mat!
    // Sirf tab update karo jab dimRows khali ho.
    if (this.dimRows && this.dimRows.length > 0) {
        // Data pehle se hai, kuch mat karo.
    } 
    // 2. Agar API se data nahi aaya, tab hi quotation wali backup values dekho
    else if (this.quotation.allDimensions && this.quotation.allDimensions.length > 0) {
        this.dimRows = JSON.parse(JSON.stringify(this.quotation.allDimensions));
    } 
    // 3. Agar kuch bhi nahi hai, tab hi default row dikhao
    else {
        this.dimRows = [{ box: 0, l: 0, w: 0, h: 0, unit: 'CMS' }];
    }

    this.isDimModalOpen = true;
    this.cdr.detectChanges();
}



// Ye helper function zarur check karna

 closeDimModal() { this.isDimModalOpen = false; }
  




  // 1. Main screen se 1st row mein sync karne ke liye
syncOuterBoxToFirstRow() {
  // Ensure array initialized hai
  if (!this.dimRows || this.dimRows.length === 0) {
    this.dimRows = [{ box: 0, l: 0, w: 0, h: 0, unit: 'CMS' }];
  }

  // 1st row ko screen ke values se update karo
  this.dimRows[0].box = this.quotation.dimBox;
  this.dimRows[0].l = this.quotation.dimL;
  this.dimRows[0].w = this.quotation.dimW;
  this.dimRows[0].h = this.quotation.dimH;
  this.dimRows[0].unit = this.quotation.dimUnit;

  // Calculation update
  if (this.updateTotalPackagesFromDims) this.updateTotalPackagesFromDims();
  this.updatePreview();
}

// 2. Nayi row add karne ke liye
addNewDimRow() {
  this.dimRows.push({ box: 0, l: 0, w: 0, h: 0, unit: 'CMS' });
}

// 3. Modal Save karne ke liye
saveDimensions() {
  if (this.dimRows && this.dimRows.length > 0) {
    // 1st row ka data wapas main quotation fields mein daalo
    this.quotation.dimBox = this.dimRows[0].box;
    this.quotation.dimL = this.dimRows[0].l;
    this.quotation.dimW = this.dimRows[0].w;
    this.quotation.dimH = this.dimRows[0].h;
    this.quotation.dimUnit = this.dimRows[0].unit;

    // Full array save karo
    this.quotation.allDimensions = JSON.parse(JSON.stringify(this.dimRows));
  }

  // UI aur Calculations refresh
  if (this.updateTotalPackagesFromDims) this.updateTotalPackagesFromDims();
  this.updatePreview();
  this.closeDimModal();
}

// 4. Row remove karne ke liye (Safety check ke saath)
removeDimRow(index: number) {
  if (this.dimRows.length > 1) {
    this.dimRows.splice(index, 1);
  } else {
    // Agar last row hai toh clear kar do, delete mat karo
    this.dimRows[0] = { box: 0, l: 0, w: 0, h: 0, unit: 'CMS' };
  }
}

  // onFileSelected(event: any) {
  //   console.log("File selected", event.target.files[0]);
  // }

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
    salesCoordinator: '',
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
    movementType:'',
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
  // --- Authorization Logic Start ---
  const token = localStorage.getItem('cavalier_token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
  // --- Authorization Logic End ---

  this.http.get<any[]>(`${environment.apiUrl}/Quotations`, { headers })
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
  // --- Authorization Logic Start ---
  const token = localStorage.getItem('cavalier_token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
  // --- Authorization Logic End ---

  // 🔥 Selected Branches collect karo
  this.selectedBranchIds = this.branchList
    .filter(b => b.isSelected)
    .map(b => b.id || b.branchId);

  let filtersToSend: any = { 
    ...this.searchFilters,
    selectedBranchIds: this.selectedBranchIds
  };

  const searchInput = this.searchFilters.quotationNo?.toString().trim();

  if (searchInput && searchInput !== "") {
    filtersToSend = {
      quotationNo: searchInput,
      selectedBranchIds: this.selectedBranchIds,
      lineOfBusiness: '',
      organization: '',
      salesCoor: '',
      cargoStatus: '',
      validFrom: null,
      showMode: '',
      Status: -1 
    };
  } else {
    filtersToSend.salesCoor = this.searchFilters.quotedBy || "";
    if (filtersToSend.lineOfBusiness === 'Any') filtersToSend.lineOfBusiness = '';
    if (filtersToSend.cargoStatus === 'Any') filtersToSend.cargoStatus = '';
    
    const statusValue: any = this.searchFilters.status;
    if (statusValue == null || statusValue == -1 || statusValue == '-1' || statusValue === '' || statusValue === 'Any') {
        filtersToSend.Status = -1; 
    } else {
        filtersToSend.Status = Number(statusValue); 
    }

    if (filtersToSend.showMode === 'all') filtersToSend.showMode = '';
    if (!filtersToSend.validFrom) filtersToSend.validFrom = null;
  }

  delete filtersToSend.status; 

  // --- ForkJoin ke saath Data aur HOD List fetch karo ---
  forkJoin({
    searchResult: this.http.post<any[]>(`${this.apiEndpoint}/Search`, filtersToSend, { headers }),
    hodList: this.userServices.getHodList()
  }).subscribe({
    next: (res) => {
      const { searchResult, hodList } = res;
      
      // HOD map banao (Lookup Table)
      const hodMap = new Map(hodList.map((h: any) => [String(h.id), h.name]));

      // Mapping Logic: ID ki jagah Name replace karo
      this.quotations = (searchResult || []).map(item => ({
        ...item,
        // Yahan 'salesCoor' field ko update kar rahe hain
        salesCoor: hodMap.get(String(item.salesCoor)) || item.salesCoor
      }));

      // Sorting Logic (Original code ka hissa)
      if (searchInput && this.quotations.length > 0) {
        const lowerInput = searchInput.toLowerCase();
        this.quotations.sort((a, b) => {
          const valA = (a.quotationNo || a.QuotationNo || "").toString().toLowerCase();
          return valA === lowerInput ? -1 : 1;
        });
      }

      this.cdr.detectChanges();
      console.log("✅ Data filtered with Names:", this.quotations);
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
getTransportModes() {
    // Using environment.apiUrl + your controller route
    const url = `${environment.apiUrl}/TransportModes`;
    
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.transportModes = data;
      },
      error: (err) => console.error('API Error:', err)
    });
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
getsales(): void {
  console.log('Fetching Sales Coordinators from HOD list API...');

  this.userServices.getHodList().subscribe({
    next: (data: any[]) => {
      // Yahan check karo ki data aa raha hai ya nahi
      console.log('HOD/Sales Coord data received:', data);
      
      this.getsalescordinate = data; 
      this.cdr.detectChanges(); 
    },
    error: (err) => {
      console.error('Error loading HOD list:', err);
    }
  });
}
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
    this.cdr.detectChanges(); // Core frame pipeline refresh sync processing context lock trigger block
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
    this.pageSize = Number(this.pageSize); // Safe casting processing numerical strings parsing layout context algorithm rules
    this.currentPage = 1;                  // Revert target display pointers pointer safe mode parameter grid point layer view index 1
    
    // Bounds limit matching safeguard mechanism logic tracking check elements structure sequence context loop
    const maxSafetyPages = Math.ceil(this.quotations.length / this.pageSize) || 1;
    if (this.currentPage > maxSafetyPages) {
      this.currentPage = maxSafetyPages;
    }
    
    this.cdr.detectChanges(); // View context changes data execution layer engine updates matrix array cycle block frame reload lock
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

    // --- Authorization Logic Start ---
    const token = localStorage.getItem('cavalier_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    // --- Authorization Logic End ---

    // Headers ko request mein add kiya
    this.quotationSub = this.http.get<any[]>(`${environment.apiUrl}/Quotations`, { headers }).subscribe({
      next: (res) => {
        console.log("✅ Quotation API Response:", res);

        // Map karke sirf quotationNo nikalna aur kachra (null/objects) saaf karna
        this.allQuotationNos = res
          .map(q => q.quotationNo)
          .filter(val => val && typeof val !== 'object' && val.toString() !== '[object Object]');

        // Unique values rakhne ke liye (Duplicate hatane ke liye)
        this.allQuotationNos = [...new Set(this.allQuotationNos)];

        this.showPopup = true;
        
        // CDR: Data aate hi UI ko force update karega
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error("❌ Error fetching all quotations", err);
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

    const token = localStorage.getItem('cavalier_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.lobSub = this.http.get<any[]>(`${environment.apiUrl}/Quotations`, { headers }).subscribe({
      next: (res) => {
        console.log("✅ Raw Data Check:", res);

        // 1. Pehle data extract karo aur check karo ki null/object toh nahi aa raha
        const cleanedList = res.map(item => {
          // Agar item khud object hai, toh uska lob nikaalo
          const lobValue = item?.lineOfBusiness || item?.name;
          
          // Agar lobValue fir bhi object hai ya null hai, toh string "N/A" ya empty do
          if (typeof lobValue === 'object' || !lobValue) {
            return null; 
          }
          return lobValue.toString().trim();
        });

        // 2. 🔥 MAGIC FILTER: Null values ko hatao, duplicates hatao aur sirf asli string rakho
        this.allLOBs = [...new Set(cleanedList)]
          .filter(val => val !== null && val !== '' && val !== '[object Object]');

        console.log("📂 Final Cleaned LOBs:", this.allLOBs);

        this.showLOBPopup = true;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error("❌ Error:", err);
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

    // --- Authorization Logic ---
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('cavalier_token') || ''}`,
      'Content-Type': 'application/json'
    });

    // --- ForkJoin: Quotations + HOD List dono ek saath ---
    this.quotedBySub = forkJoin({
      quotations: this.http.get<any[]>(`${environment.apiUrl}/Quotations`, { headers }),
      hodList: this.userServices.getHodList()
    }).subscribe({
      next: (res) => {
        const { quotations, hodList } = res;
        
        // HOD Map banao (id -> name)
        const hodMap = new Map(hodList.map((h: any) => [String(h.id), h.name]));

        // 1. Map karke IDs ko Names mein badlo aur saaf karo
        const cleanedCoors = quotations.map(item => {
          // item.salesCoor apki ID hai
          const id = item.salesCoor ? String(item.salesCoor).trim() : null;
          
          // Agar ID match ho gayi toh Name lo, nahi toh original ID
          const val = id ? (hodMap.get(id) || id) : null;
          
          return (val && typeof val !== 'object') ? val.toString().trim() : null;
        });

        // 2. Duplicates hatana aur valid values filter karna
        this.allSalesCoors = [...new Set(cleanedCoors)]
          .filter(val => val !== null && val !== '' && val !== '[object Object]');

        console.log("📂 Final SalesCoors List with Names:", this.allSalesCoors);

        this.showQuotedByPopup = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("❌ Error fetching data", err);
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

gettoken(){
  this.token = localStorage.getItem('cavalier_token') || '';
  return this.token;
}


loadInquiryList() {
  // Toggle feature
  if (this.showInquiryDropdown) {
    this.showInquiryDropdown = false;
    this.cdr.detectChanges();
    return;
  }

  const url = `${environment.apiUrl}/Inquiry`;

  this.http.get<any[]>(url, {
    headers: {
      Authorization: `Bearer ${this.token}`
    }
  }).subscribe({
    next: (res) => {
      this.inquiryList = res;
      this.showInquiryDropdown = true;

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
branchList: any[] = [];           
  filteredBranchSuggestions: any[] = []; 
  isBranchModalOpen: boolean = false;
  branchSearchText: string = '';
  loadBranchess() {
    // Yahan apna pura URL direct daal do (Environment se ya hardcoded check karne ke liye)
  const fullUrl = `${environment.apiUrl}/branch/list`;// <-- BHAI YAHAN APNA PURA URL DAAL DE

    this.http.get(fullUrl).subscribe({
      next: (res: any) => {
        console.log("API Success Response:", res);

        // API response format handle karna
        const data = Array.isArray(res) ? res : (res.data || res.result || []);
        
        this.branchList = data.map((b: any) => ({ 
          ...b, 
          isSelected: false 
        }));

        this.filteredBranchSuggestions = [...this.branchList];
      },
      error: (err) => {
        console.error("Direct Call Failed! Error details:", err);
      }
    });
  }

  // Baki logic (Search, Toggle, Confirm) wahi rahega jo pehle tha...
  onBranchSearch() {
    const search = this.branchSearchText.toLowerCase().trim();
    this.filteredBranchSuggestions = this.branchList.filter(b => 
      b.branchName?.toLowerCase().includes(search)
    );
  }
getIncoTerms() {
    this.http.get<any[]>(`${environment.apiUrl}/IncoTerms`).subscribe({
      next: (data) => {
        this.incoTerms = data;
      },
      error: (err) => console.error('Error fetching IncoTerms:', err)
    });
  }
  toggleBranchModal() { this.isBranchModalOpen = !this.isBranchModalOpen; }
  toggleBranchSelection(branch: any) { branch.isSelected = !branch.isSelected; }
  
 confirmSelection() {
  this.isBranchModalOpen = false;

  // 1. Pehle selected branches ki list nikaalo
  const selected = this.branchList.filter(b => b.isSelected);
  console.log("Final Selected Branches:", selected);

  // 2. 🔥 Input field (branchSearchText) mein saare selected names comma se join karke daal do
  if (selected.length > 0) {
    this.branchSearchText = selected.map(b => b.branchName).join(', ');
  } else {
    this.branchSearchText = '';
  }

  // 3. Search function call karo (Jo humne pehle update kiya tha payload ke liye)
  this.onSearch(); 
}

selectBranchFromDropdown(branch: any) {
  // 1. Is branch ko select mark karo (agar pehle se nahi hai)
  branch.isSelected = true;
  
  // 2. Dropdown ko hide karne ke liye list clear karo
  this.filteredBranchSuggestions = []; 

  // 3. Confirm selection wala logic chala do taaki input box update ho jaye aur search ho jaye
  this.confirmSelection();
}
showRowModal = false;
selectedQuotationId: any = null;
selectedQuotationData: any = null; // Edit ke liye pura object pass karne ke liye

handleRowDblClick(quotation: any) {
  this.selectedQuotationId = quotation.id;
  this.selectedQuotationData = quotation;
  this.showRowModal = true;
}

closeRowModal() {
  this.showRowModal = false;
  this.selectedQuotationId = null;
  this.selectedQuotationData = null;
}
toggleStatus(q: any) {
  const token = localStorage.getItem('cavalier_token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  const url = `${environment.apiUrl}/Quotations/ToggleStatus/${q.id}`;

  this.http.patch(url, {}, { headers }).subscribe({
    next: (res: any) => {
      // Backend se jo naya status aaya (1 ya 0), usey assign karein
      q.status = res.newStatus;
      
      // Forcefully UI refresh karne ke liye
      this.cdr.detectChanges(); 
      
      console.log('Status updated successfully:', res.newStatus);
    },
    error: (err) => {
      console.error('Error:', err);
      alert('Status update nahi ho paya!');
    }
  });
}
// Variables for Pricing Reference
pricingList: any[] = [];
filteredPricings: any[] = [];
showPricingDropdown: boolean = false;
// pricingList: any[] = [];
// 1. Dropdown kholne ya list refresh karne ke liye

loadPricingList() {
  this.showPricingDropdown = true;
  this.http.get(`${environment.apiUrl}/Pricing/GetPricingList`).subscribe({
    next: (res: any) => {
      this.pricingList = res;
      this.filteredPricings = res;
      this.showPricingDropdown = !this.showPricingDropdown;
    },
    error: (err) => console.error("Error fetching pricing list", err)
  });
}
onBlur() {
  // 200ms ka gap rakhein taaki click/mousedown trigger ho sake
  setTimeout(() => {
    this.showPricingDropdown = false;
  }, 200);
}
// 2. Search filter logic (Jab user type kare)
onPricingSearchInput() {
  this.showPricingDropdown = true;
  const searchText = this.quotation.referencePricingNo?.toLowerCase() || '';
  
  if (searchText.length > 0) {
    this.showPricingDropdown = true;
    this.filteredPricings = this.pricingList.filter(p => 
      p.pricingNo.toLowerCase().includes(searchText) || 
      (p.organisationName && p.organisationName.toLowerCase().includes(searchText))
    );
  } else {
    this.showPricingDropdown = false;
  }
}

inquiry: any; 
  multiCarrierRows: any[] = [];
// 3. Item select hone par data fetch aur auto-fill karne ke liye
isLoadingPricing: boolean = false; // Variable declare karein
documents: any[] = [];
  invoices: any[] = [];
 calculateCBM() {
  // Yahan check karo ki tum chargeableWeightKg use kar rahe ho ya volumeWeight
  const volWeight = Number(this.quotation.chargeableWeightKg) || 0;
  
  if (volWeight > 0) {
    this.quotation.cbm = parseFloat((volWeight / 167).toFixed(3));
  } else {
    this.quotation.cbm = 0;
  }
}
selectPricing(prc: any) {
  if (!prc || !prc.pricingNo) {
    console.error("Invalid pricing data");
    return;
  }

  this.showPricingDropdown = false;
  this.cdr.detectChanges();

  const pricingNo = prc.pricingNo?.trim();
  const url = `${environment.apiUrl}/Pricing/GetByPricingNo/${encodeURIComponent(pricingNo)}`;

  this.http.get<any>(url).subscribe({
    next: (p) => {
      console.log("✅ API FULL DATA:", p);

      // --- 1. Basic Info ---
      this.quotation.referencePricingNo = p.PricingNo || prc.pricingNo || '';
      this.quotation.customerName = p.OrganisationName || prc.customerName || '';
      this.quotation.organization = p.organisationName || '';
      this.quotation.organizationId = p.organisationId || null;
      this.quotation.pricingId = p.id || p.pricingId || prc.id;
      this.quotation.podOrigin=p.podOrigin || p.PodOrigin || '';
      this.quotation.salesCoordinator = Number(p.SalesCoordinatorId || p.salesCoordinator || 0);
      
      // --- Pricing By (Fixed) ---
      setTimeout(() => {
        this.quotation.pricingBy = p.pricingDoneBy || p.PricingDoneBy || '';
        this.cdr.detectChanges();
      }, 100);
// 2. Multi-Carrier Breakdown Mapping (Backend Table Match)
    if (p.multiCarrierBreakdowns && Array.isArray(p.multiCarrierBreakdowns)) {
        this.multiCarrierRows = p.multiCarrierBreakdowns.map((m: any) => ({
            forwarder: m.forwarder || m.Forwarder || '',
            origin: m.origin || m.Origin || '',
            currency: m.currency || m.Currency || '',
            airFreight: Number(m.airFreight || m.AirFreight || 0),
            fsc: Number(m.fsc || m.Fsc || 0),
            airline: m.airline || m.Airline || '',
            type: m.type || m.Type || '',
            cutoff: m.cutoff || m.Cutoff || '',
            schedule: m.schedule || m.Schedule || '',
            exWorks: Number(m.exWorks || m.ExWorks || 0),
            doCharges: Number(m.doCharges || m.DoCharges || 0),
            ccFee: Number(m.ccFee || m.CcFee || 0),
            totalCost: Number(m.totalCost || m.TotalCost || 0),
            remark: m.remark || m.Remark || ''
        }));
    } else {
        this.multiCarrierRows = [];
    }

    // 3. Single Carrier Cost Mapping
    if (p.costBreakdowns && Array.isArray(p.costBreakdowns)) {
        this.costRows = p.costBreakdowns.map((c: any) => ({
            lob: c.lob || c.Lob || '',
            chargeName: c.chargeName || c.ChargeName || '',
            chargeType: c.chargeType || c.ChargeType || '',
            currency: c.currency || c.Currency || '',
            rate: Number(c.rate || c.Rate || 0),
            amount: Number(c.amount || c.Amount || 0)
        }));
    }

    // Force UI Refresh
    this.cdr.detectChanges();
    console.log("MultiCarrier Data Loaded:", this.multiCarrierRows);
    // 1. Multi-Carrier Breakdown Mapping (With all new fields)
    if (p.multiCarrierBreakdowns && Array.isArray(p.multiCarrierBreakdowns)) {
        this.multiCarrierRows = p.multiCarrierBreakdowns.map((m: any) => ({
            forwarder: m.forwarder || m.Forwarder || '',
            origin: m.origin || m.Origin || '',
            lob: m.lob || m.Lob || '', // Naya field add kiya
            chargeName: m.chargeName || m.ChargeName || '',
            chargeType: m.chargeType || m.ChargeType || '',
            // chargeableWeight ko main screen se utha rahe hain (jaisa HTML mein hai)
            airFreight: Number(m.airFreight || m.AirFreight || 0),
            fsc: m.fsc || m.Fsc || '',
            airline: m.airline || m.Airline || '',
            cutoff: m.cutoff || m.Cutoff || '',
            schedule: m.schedule || m.Schedule || '', // Date format handle karna
            currency: m.currency || m.Currency || '',
            rate: Number(m.rate || m.Rate || 0),
            exchangeRate: Number(m.exchangeRate || m.ExchangeRate || 1), // Default 1
            totalCost: Number(m.totalCost || m.TotalCost || 0),
            remark: m.remark || m.Remark || ''
        }));
    }

    // 2. Single Carrier Cost Mapping (CostBreakdowns table)
    if (p.costBreakdowns && Array.isArray(p.costBreakdowns)) {
        this.costRows = p.costBreakdowns.map((c: any) => ({
            lob: c.lob || c.Lob || '',
            chargeName: c.chargeName || c.ChargeName || '',
            chargeType: c.chargeType || c.ChargeType || '',
            currency: c.currency || c.Currency || '',
            rate: Number(c.rate || c.Rate || 0),
            exchangeRate: Number(c.exchangeRate || c.ExchangeRate || 1), // Naya field
            amount: Number(c.amount || c.Amount || 0)
        }));
    } else {
        // Default empty row agar data na ho
        this.costRows = [{ lob: '', chargeName: '', chargeType: '', currency: '', rate: 0, exchangeRate: 1, amount: 0 }];
    }

    // --- IMPORTANT: Logic Trigger ---
    // API se data load hone ke baad calculations trigger karna zaroori hai
    this.calculateCost(); 
    
    this.cdr.detectChanges();
    console.log("Tables Updated:", { cost: this.costRows, multi: this.multiCarrierRows });
      // --- Business Dimensions ---
      this.quotation.businessDimensions = p.businessDimensions || p.BusinessDimensions || ''; 

      // --- 2. Transport & Mode (FIXED) ---
      // Agar API ID bhej raha hai (1002), to use name mein convert karna padega
      const apiMode = p.transportMode || p.TransportMode || '';
      const matchedMode = this.transportModes?.find(m => m.id == apiMode || m.name.toLowerCase() == apiMode.toLowerCase());
      this.quotation.transportMode = matchedMode ? matchedMode.name : apiMode;
      
      this.quotation.transportType = p.transportType || p.TransportType || '';
      this.quotation.shipmentType = p.shipmentType || p.ShipmentType || '';
// --- 6. Weights, Packages & CBM ---
this.quotation.grossWeightKg = Number(p.grossWeightKg || 0);
this.quotation.volumeWeight = Number(p.volumeWeight || 0);
this.quotation.cbm = parseFloat(Number(p.cbm || 0).toFixed(3));
this.quotation.netWeight = Number(p.netWeight || p.NetWeight || 0);
    this.quotation.netWeightUnit = p.netWeightUnit || p.NetWeightUnit || 'KGS';
console.log("🚀 API se aaya data:", p);

    // 1. Cargo Value
// Cargo Value set karo
    this.quotation.cargoValue = p.cargoValue || p.CargoValue || 0;

    // Currency Logic
    const apiCurrency = (p.cargoCurrency || p.Currency || p.currency || '').trim();
    
    const options = [
        "₹ INR - Indian Rupee", "$ USD - United States Dollar", "€ EUR - Euro",
        "£ GBP - British Pound Sterling", "د.إ AED - UAE Dirham", "$ SGD - Singapore Dollar",
        "$ CAD - Canadian Dollar", "$ AUD - Australian Dollar", "¥ JPY - Japanese Yen",
        "¥ CNY - Chinese Yuan", "CHF - Swiss Franc", "R$ BRL - Brazilian Real"
    ];

    const match = options.find(o => o.includes(apiCurrency));
    const finalCurrency = match ? match : apiCurrency;

    // 🔥 TIMEOUT ZARURI HAI
    setTimeout(() => {
        this.quotation.currency = finalCurrency;
        this.cdr.detectChanges(); // UI Refresh
    }, 100);
    console.log("Currency set to:", this.quotation.currency);
    // 2. Currency (Jo tumne dropdown mein options rakhe hain)
    // Agar API sirf "USD" bhej raha hai, toh humein dropdown ke value se match karana hoga
    // const apiCurrency = p.currency || p.cargoCurrency || ''; 
    
    // // Logic: Agar API se "USD" aaya hai, toh dropdown ki " $ USD - United States Dollar" wali value set karo
    // if (apiCurrency) {
    //     const found = [
    //         "₹ INR - Indian Rupee", "$ USD - United States Dollar", "€ EUR - Euro",
    //         "£ GBP - British Pound Sterling", "د.إ AED - UAE Dirham", "$ SGD - Singapore Dollar",
    //         "$ CAD - Canadian Dollar", "$ AUD - Australian Dollar", "¥ JPY - Japanese Yen",
    //         "¥ CNY - Chinese Yuan", "CHF - Swiss Franc"
    //     ].find(val => val.includes(apiCurrency));
        
    //     this.quotation.currency = found || apiCurrency;
    // }

    // 3. Force UI Update
    this.cdr.detectChanges();
    // --- Place of Delivery Mapping ---
// API response object 'p' mein check karo ki key kya hai. 
// Aksar 'placeOfDelivery', 'PlaceOfDelivery', ya 'deliveryPlace' hoti hai.
this.quotation.placeOfDelivery = p.placeOfDelivery || p.PlaceOfDelivery || p.deliveryPlace || '';
// --- POL Mapping ---
// 1. ID Map karo
const polId = p.portOfLoadingId || p.PortOfLoadingId || null;
this.quotation.portOfLoadingId = polId;

// 2. Code Map karo (Agar API mein code aa raha hai)
this.quotation.portOfLoadingCode = p.portOfLoadingCode || p.PortOfLoadingCode || '';

// 3. IMPORTANT: Agar POL change hone par API se kuch trigger hota hai (jaise rates fetch karna), 
// toh onPolChange() ko manually call karo
if (polId) {
    this.onPolChange();
}

// 4. Force Update
this.cdr.detectChanges();
// Force UI Update
// --- POD & Final Destination Mapping ---

// 1. POD Mapping
const podId = p.portOfDischargeId || p.PortOfDischargeId || null;
this.quotation.portOfDischargeId = podId;
this.quotation.portOfDischargeCode = p.portOfDischargeCode || p.PortOfDischargeCode || '';

// Agar POD change hone par kuch logic trigger hota hai (jaise rates), toh function call karo
if (podId) {
    this.onPodChange();
}

// 2. Final Destination Mapping
// Yahan hum code aur name dono set kar rahe hain
this.quotation.finalDestinationCode = p.CodeOfFinalDest || p.codeOfFinalDest || ''; 
console.log("Final Destination Code Set To:", this.quotation.finalDestinationCode);
this.quotation.podFinalDest = p.podFinalDest || p.FinalDestination || '';

// 3. Force UI Update
this.cdr.detectChanges();
// Documents Mapping Logic
    const allDocs = p.pricingDocuments || p.PricingDocuments || [];
    
    // Sirf 'Commodity' type ke docs ko 'this.documents' mein daal rahe hain
    this.documents = allDocs
        .filter((d: any) => (d.docType || d.DocType || '').toLowerCase() === 'commodity')
        .map((d: any) => ({ 
            id: d.docId || d.DocId, 
            name: d.documentName || 'Commodity Document', // Agar API se name aa raha hai
            documentPath: d.docPath || d.DocPath, 
            isExisting: true 
        }));

    this.cdr.detectChanges();
// DIMENSIONS ARRAY MAPPING (Modal aur Inputs dono ke liye)
    if (p.dimensions && p.dimensions.length > 0) {
        this.quotation.dimBox = p.dimensions[0].box;
        this.quotation.dimL = p.dimensions[0].l;
        this.quotation.dimW = p.dimensions[0].w;
        this.quotation.dimH = p.dimensions[0].h;
        this.quotation.dimUnit = p.dimensions[0].unit;

        this.dimRows = p.dimensions.map((d: any) => ({
            box: d.box, l: d.l, w: d.w, h: d.h, unit: d.unit
        }));
    } else {
        this.dimRows = [{ box: 0, l: 0, w: 0, h: 0, unit: 'CMS' }];
    }

    // 3. UI Refresh
    this.cdr.detectChanges();
    if (p.dimensions && p.dimensions.length > 0) {
        
        // --- A. Main Screen ke inputs ke liye ---
        const firstDim = p.dimensions[0];
        this.quotation.dimBox = firstDim.box;
        this.quotation.dimL = firstDim.l;
        this.quotation.dimW = firstDim.w;
        this.quotation.dimH = firstDim.h;
        this.quotation.dimUnit = firstDim.unit;

        // --- B. Modal (dimRows) ke liye ---
        // Hum map karke naya array reference bana rahe hain taaki Angular detect kare
        this.dimRows = p.dimensions.map((d: any) => ({
            box: d.box,
            l: d.l,
            w: d.w,
            h: d.h,
            unit: d.unit
        }));

    } else {
        // Agar dimensions khali hain
        this.dimRows = [{ box: 0, l: 0, w: 0, h: 0, unit: 'CMS' }];
    }

    // 2. Force Sync & Refresh (Zaroori hai)
    this.syncOuterBoxToFirstRow(); 
    this.updatePreview();
    
    // Angular ke Change Detection ko batana padega ki data change hua hai
    this.cdr.detectChanges();
this.cdr.detectChanges();

    // Chargeable Weight mapping
    this.quotation.chargeableWeight = Number(p.chargeableWeight || p.ChargeableWeight || 0);
    this.quotation.chargeableWeightUnit = p.chargeableWeightUnit || p.ChargeableWeightUnit || 'KGS';

    // Calculation (Agar Chargeable Weight change hone par CBM update karna ho)
    // this.calculateCBM(); 

    // UI Update force karo
    this.cdr.detectChanges();
// Package mapping (Small case keys)
this.quotation.noOfPkgs = Number(p.noOfPkgs || 0);

// PkgUnit ke liye case-insensitive match (taaki dropdown select ho jaye)
const apiUnit = p.noOfPkgsUnit || '';
const matchedUnit = this.packageUnits?.find(u => u.name.toLowerCase() === apiUnit.toLowerCase());
this.quotation.pkgUnit = matchedUnit ? matchedUnit.name : apiUnit;
// --- 6. Weights, Volume & CBM ---
/// --- 6. Weights & CBM ---
this.quotation.chargeableWeightKg = Number(p.volumeWeight || p.ChargeableWeight || 0);
this.quotation.volumeWeightUnit = p.chargeWeightUnit || p.VolumeWeightUnit || 'KGS';
// --- Description Mapping ---
    this.quotation.description = p.description || p.Description || '';

    // ... (baki code) ...

    // UI Refresh
    this.cdr.detectChanges();
    const apiInco = p.incoterm || p.Incoterm || '';

// Logic: Agar API se ID aa rahi hai ya Name, ye match kar lega
const matchedInco = this.incoTerms?.find(i => 
    i.name.toLowerCase() === apiInco.toString().toLowerCase() || 
    i.id == apiInco
);

this.quotation.incoterm = matchedInco ? matchedInco.name : apiInco;

// --- IMPORTANT: Trigger Change Event ---
// Kyunki tumne (ngModelChange) mein onIncotermChange() call kiya hai, 
// use API load hone ke baad bhi manually trigger karna padega:
this.onIncotermChange(this.quotation.incoterm);
this.updatePreview();
// --- Movement Type Mapping ---
const apiMove = p.movementType || p.MovementType || '';

// Logic: API value ko movementTypes array mein search karo
const matchedMove = this.movementTypes?.find(m => 
    m.name.toLowerCase() === apiMove.toString().toLowerCase()
);

// Agar match mila toh name set karo, nahi toh API wali value hi rehne do
this.quotation.movementType = matchedMove ? matchedMove.name : apiMove;
console.log("Movement Type Set To:", this.quotation.movementType);
// API se aaye hue data ko use karke CBM ko 0.1 second baad update karenge
setTimeout(() => {
    this.calculateCBM(); // Calculation logic
    this.updatePreview(); // Preview update
    this.cdr.detectChanges(); // View force refresh
}, 100);

// UI Update force karo

// Trigger preview update after setting values
this.updatePreview();
      // --- 3. Cargo, Commodity & Currency ---
      this.quotation.cargoValue = p.cargoValue || p.CargoValue || p.value || 0;
      this.quotation.currency = (p.cargoCurrency || p.Currency || p.currency || '').trim();
      this.quotation.commodity = Number(p.commodityId || p.CommodityId || p.commodity || 0);

      // --- 4. Route, Country & Location ---
      this.quotation.originPOL = p.originName || p.origin || '';
      this.quotation.podFinalDest = p.finalDestination || p.FinalDestination || '';
      this.quotation.placeOfDelivery = p.placeOfDelivery || p.PlaceOfDelivery || '';
      this.quotation.country = p.countryName || p.CountryName || '';
      this.quotation.countryId = p.countryId || p.CountryId || null;
      this.quotation.location = p.location || p.Location || '';

      // --- 5. Connecting Ports ---
      const cpIds = p.connectingPortIds || p.ConnectingPortIds;
      if (cpIds) {
        const idsArray = cpIds.toString().split(',').map((x: any) => Number(x.trim())).filter((x: any) => !isNaN(x));
        this.quotation.connectingPortIds = idsArray;
        this.selectedConnectingPorts = this.filteredConnectingPorts?.filter(port => idsArray.includes(Number(port.id))) || [];
      }

      // --- 6. Weights & CBM ---
      this.quotation.grossWeightKg = Number(p.grossWeightKg || p.GrossWeightKg || 0);
      this.quotation.volumeWeight = Number(p.volumeWeight || p.VolumeWeight || 0);
      this.quotation.cbm = parseFloat(Number(p.cbm || p.TotalCbm || 0).toFixed(3));

      // --- 7. Business & Sales Info ---
      this.quotation.lineOfBusiness = p.lineOfBusinessId || p.LineOfBusinessId || '';
      this.quotation.cargoStatus = p.cargoStatus || p.CargoStatus || 'Ready';
      
      if (p.cargoReadyDate || p.CargoReadyDate) {
        const rawDate = p.cargoReadyDate || p.CargoReadyDate;
        this.quotation.cargoReadyDate = new Date(rawDate).toISOString().split('T')[0];
      }
      
      this.quotation.isDirect = p.isDirect !== undefined ? p.isDirect : (p.IsDirect || false);
      this.quotation.isIndirect = p.isIndirect !== undefined ? p.isIndirect : (p.IsIndirect || false);
      
      // --- 8. Trigger UI Events ---
      this.onPolChange();
      this.onPodChange();
      this.onHeaderLOBChange();
      this.onCargoStatusChange2();
      this.updatePreview();
      
      if (this.calculateAll) this.calculateAll();
      
      this.cdr.detectChanges();
      this.cdr.markForCheck();
    },
    error: (err) => console.error("❌ API Error:", err)
  });
}
onPricingFocus() {
  if (this.quotation.referencePricingNo) {
    this.showPricingDropdown = true;
  }
}

// 5. Bahar click karte hi dropdown automatic band ho jaye (200ms delay ke sath taaki click event trigger ho sake)
onPricingBlur() {
  setTimeout(() => {
    this.showPricingDropdown = false;
  }, 200);
}
 allConnectingPorts: any[] = []; 
filteredConnectingPorts: any[] = [];
selectedConnectingPorts: any[] = []; 
isCPModalOpen: boolean = false;
cpSearchTerm: string = '';

// Load Data (Directly from your single ConnectingPort API)
loadConnectingPortsData() {
  // API URL update kar diya hai
  this.http.get<any[]>(`${environment.apiUrl}/PortSetup`).subscribe({
    next: (data) => {
      // API se aaye hue data ko map kiya taaki agar portType missing ho toh default 'AIRPORT' mile
      this.allConnectingPorts = data.map(p => ({
        ...p,
        portType: p.portType || 'AIRPORT' 
      }));
      this.filteredConnectingPorts = [...this.allConnectingPorts];
      console.log("Ports Loaded:", this.allConnectingPorts);
      this.cdr.detectChanges();
    }
  });
}

getPortsByType(type: string) {
  return this.filteredConnectingPorts.filter(p => p.portType === type);
}

selectConnectingPort(port: any) {
  const index = this.selectedConnectingPorts.findIndex(p => p.id === port.id);
  if (index === -1) this.selectedConnectingPorts.push(port);
  else this.selectedConnectingPorts.splice(index, 1);
  this.cdr.detectChanges();
}

removeConnectingPort(port: any) {
  this.selectedConnectingPorts = this.selectedConnectingPorts.filter(p => p.id !== port.id);
  this.cdr.detectChanges();
}

onSearchingConnectingPorts() {
  const term = this.cpSearchTerm.toLowerCase().trim();
  this.filteredConnectingPorts = this.allConnectingPorts.filter(p => 
    p.portName.toLowerCase().includes(term) || p.portCode.toLowerCase().includes(term)
  );
}

toggleConnectingPortModal() {
  this.isCPModalOpen = !this.isCPModalOpen;
}

isPortSelected(port: any): boolean {
  return this.selectedConnectingPorts.some(p => p.id === port.id);
}
// 1. Properties declare karein (agar pehle se nahi ki hain)
// portOfLoadingList: any[] = [];
// portOfDischargeList

// 2. Direct environment file se API URL pick karne ke liye methods:
loadPortOfLoadings() {
  const token = localStorage.getItem('cavalier_token');
  const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

  // 📝 Direct environment.apiEndpoint use kiya hai bina kisi service ke
  this.http.get(`${environment.apiUrl}/PortSetup`, { headers }).subscribe({
    next: (data: any) => {
      this.portOfLoadingList = data || [];
      console.log("⚓ POL Data Loaded directly from Environment:", this.portOfLoadingList);
    },
    error: (err) => console.error("Error loading POL:", err)
  });
}

loadPortOfDischarges() {
  const token = localStorage.getItem('cavalier_token');
  const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

  // 📝 Direct environment.apiEndpoint use kiya hai bina kisi service ke
  this.http.get(`${environment.apiUrl}/PortSetup`, { headers }).subscribe({
    next: (data: any) => {
      this.portOfDischargeList = data || [];
      console.log("⚓ POD Data Loaded directly from Environment:", this.portOfDischargeList);
    },
    error: (err) => console.error("Error loading POD:", err)
  });

}
// 1. Jab modal ke andar boxes badlenge - tab bahar wale num of packages aur first element box ko autofill karega
updateTotalPackagesFromDims() {
  if (!this.dimRows || this.dimRows.length === 0) return;

  // 1. Sync Logic: 1st row hamesha outer view ke sath match honi chahiye
  // Isse UI aur Data sync rahenge
  this.dimRows[0].box = this.quotation.dimBox || 0;
  this.dimRows[0].l = this.quotation.dimL || 0;
  this.dimRows[0].w = this.quotation.dimW || 0;
  this.dimRows[0].h = this.quotation.dimH || 0;
  this.dimRows[0].unit = this.quotation.dimUnit || 'CMS';

  // 2. Calculation Logic: Sirf dimRows ka use karein
  const totalBoxes = this.dimRows.reduce((sum, row) => {
    return sum + (row && row.box ? Number(row.box) : 0);
  }, 0);

  // 3. Update main state
  this.quotation.noOfPkgs = totalBoxes;

  // 4. UI Refresh
  if (this.cdr) {
    this.cdr.detectChanges();
  }
}

// 2. Agar koi direct main UI screen par "Dimensions BOX" change kare toh modal ki pehli row update ho jaye

// Jab POL dropdown change ho
onPolChange() {
  const selectedPol = this.portOfLoadingList.find(p => p.id == this.quotation.portOfLoadingId);
  this.quotation.portOfLoading = selectedPol ? (selectedPol.portName || selectedPol.name) : '';
   this.quotation.portOfLoadingCode = selectedPol ? selectedPol.portCode : '';
  this.cdr.detectChanges();
}

// Jab POD dropdown change ho
onPodChange() {
  const selectedPod = this.portOfDischargeList.find(p => p.id == this.quotation.portOfDischargeId);
  this.quotation.portOfDischarge = selectedPod ? (selectedPod.portName || selectedPod.name) : '';
  this.quotation.portOfDestination = this.quotation.portOfDischarge; // Syncing
  this.quotation.portOfDischargeCode = selectedPod ? selectedPod.portCode : '';
  this.cdr.detectChanges();
}
updatePreview() {
  this.quotation = { ...this.quotation };
  this.calculateTotalRevenue()
}
calculateTotalRevenue(): number {
  return this.revenueRows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
}
getServiceName(id: any): string {
  if (!id || !this.companyServices) return '-';
  const service = this.companyServices.find(s => s.id == id);
  return service ? service.serviceName : '-';
}
getCommodityName(id: any): string {
  if (!id || !this.commodityTypes) return '-';
  const item = this.commodityTypes.find(t => t.id == id);
  return item ? item.name : '-';
}
// Helper function to check if selected is Hazard
// 1. Hazard Check
isHazard(): boolean {
  // Check if commodity exists and its name is 'HAZARD' (Case insensitive)
  const selected = this.commodityTypes?.find(c => c.id == this.quotation.commodity);
  return selected?.name?.toUpperCase() === 'HAZARDOUS';
}

// 2. Modal Handlers
isDocumentModalOpen: boolean = false;

openDocumentModal() {
  this.isDocumentModalOpen = true;
}

closeDocumentModal() {
  this.isDocumentModalOpen = false;
}

// 3. Document Array Management
addDocument() {
  this.documents.push({ id: 0, name: '', file: null, documentPath: '', isReplacing: false });
}

removeDocument(index: number) {
  this.documents.splice(index, 1);
}
saveDocumentChanges() {
  // Is logic se files temporary store ho jayengi, main saveQuotation ke time upload hogi
  this.closeDocumentModal();
  Swal.fire('Success', 'Documents prepared for saving.', 'success');
}
// onCommodityChange(event: any) {
//   this.quotation.commodity = event.target.value;
//   // UI ko force update karne ke liye agar view update na ho
//   this.cdr.detectChanges(); 
// }
onFileSelected(event: any, index: number) {
  if (event.target.files.length > 0) {
    this.documents[index].file = event.target.files[0];
  }
}
// Helper function logic

// Component property
isHazardous: boolean = false;

onCommodityChange(event: any) {
  this.quotation.commodity = event.target.value;
  this.checkHazardStatus();
}

checkHazardStatus() {
  if (!this.commodityTypes || !this.quotation.commodity) {
    this.isHazardous = false;
    return;
  }
  const selected = this.commodityTypes.find(c => String(c.id) === String(this.quotation.commodity));
  this.isHazardous = selected?.name?.trim().toUpperCase() === 'HAZARDOUS';
}

// Component initialize hote waqt bhi check karo

// File select hote hi Modal mein refresh karne ke liye
getTotalPackageCount() {
  return this.dimRows.reduce((sum, item) => sum + (Number(item.box) || 0), 0);
}
getGroupedDimensionsFromQuotation(): DimGroup[] {
  const allDims = [];
  
  // 1. MAIN SCREEN DATA IGNORED: 
  // Yeh pehla block ab sirf tab chalega jab allDimensions empty ho (fallback).
  // Agar aap chahte hain ki main screen ka data ALWAYS ignore ho, 
  // toh is block ko hata dein ya false kar dein.
  if (!this.quotation.allDimensions || this.quotation.allDimensions.length === 0) {
    if (this.quotation.dimBox) {
      allDims.push({
        box: this.quotation.dimBox,
        l: this.quotation.dimL,
        w: this.quotation.dimW,
        h: this.quotation.dimH,
        unit: this.quotation.dimUnit || 'CMS'
      });
    }
  }
  
  // 2. Baki dimensions (Modal wala data) add karo
  if (this.quotation.allDimensions && this.quotation.allDimensions.length > 0) {
    allDims.push(...this.quotation.allDimensions);
  }

  const groups: DimGroup[] = [];
  
  allDims.forEach((dim, index) => {
    const dimString = `${dim.l || 0}x${dim.w || 0}x${dim.h || 0} ${dim.unit || 'CMS'}`;
    let foundGroup = groups.find(g => g.dimString === dimString);
    
    if (foundGroup) {
      foundGroup.indices.push(index + 1);
      foundGroup.totalBoxQty += Number(dim.box || 0);
    } else {
      groups.push({
        dimString: dimString,
        l: dim.l || 0, w: dim.w || 0, h: dim.h || 0, unit: dim.unit || 'CMS',
        indices: [index + 1],
        totalBoxQty: Number(dim.box || 0)
      });
    }
  });
  
  return groups;
}
uomList: any[] = [];
loadUomList() {
  this.http.get<any[]>(`${environment.apiUrl}/Uom/list`).subscribe({
    next: (data) => {
      this.uomList = data;
      
      // Default Unit Logic
      if (!this.quotation.grossWeightUnit) {
        this.quotation.grossWeightUnit = 'KGS';
      }
      if (!this.quotation.netWeightUnit) {
        this.quotation.netWeightUnit = 'KGS';
      }
      if (!this.quotation.chargeableWeightUnit) {
        this.quotation.chargeableWeightUnit = 'KGS';
      }

      this.updatePreview();
      
      // UI ko force update karne ke liye
      this.cdr.detectChanges(); 
    },
    error: (err) => console.error("Error loading UOMs:", err)
  });
}
isUomModalOpen: boolean = false;

toggleUomModal() {
  this.isUomModalOpen = !this.isUomModalOpen;
}

selectUom(uom: any) {
  this.quotation.grossWeightUnit = uom.shortCode;
  this.isUomModalOpen = false;
  this.updatePreview(); // Preview update karne ke liye
}
initializeAllUnits() {
  if (this.uomList.length > 0) {
    const defaultUnit = 'KGS'; 
    
    // Check agar 'KGS' list mein available hai, nahi toh list ki pehli value le lo
    const targetUnit = this.uomList.some(u => u.shortCode === defaultUnit) 
                       ? defaultUnit 
                       : this.uomList[0].shortCode;

    // Har field ke liye logic
    if (!this.quotation.grossWeightUnit) this.quotation.grossWeightUnit = targetUnit;
    if (!this.quotation.netWeightUnit) this.quotation.netWeightUnit = targetUnit;
    if (!this.quotation.chargeableWeightUnit) this.quotation.chargeableWeightUnit = targetUnit;
    if (!this.quotation.volumeWeightUnit) this.quotation.volumeWeightUnit = targetUnit;
    if (!this.quotation.cbmUnit) this.quotation.cbmUnit = 'CBM'; // CBM ke liye fix
  }
}
// 1. Modal State
isNetUomModalOpen: boolean = false;

// 2. Toggle Function
toggleNetUomModal() {
  this.isNetUomModalOpen = !this.isNetUomModalOpen;
}

// 3. Selection Function
selectNetUom(uom: any) {
  this.quotation.netWeightUnit = uom.shortCode;
  this.isNetUomModalOpen = false;
}

// 4. Update the initialization logic (Inside setDefaultUnits)
// Aapka pehle se bana hua setDefaultUnits function update karein
setDefaultUnits() {
  if (this.uomList && this.uomList.length > 0) {
    // Default KGS set karne ka logic
    if (!this.quotation.grossWeightUnit) this.quotation.grossWeightUnit = 'KGS';
    if (!this.quotation.netWeightUnit) this.quotation.netWeightUnit = 'KGS';
    // ... baaki fields
  }
}
isChargeableUomModalOpen: boolean = false;
isVolumeUomModalOpen: boolean = false;
setDefaultVolumeUnit() {
  // Check karein agar unit pehle se set nahi hai
  if (!this.quotation.volumeWeightUnit && this.uomList.length > 0) {
    // KGS dhoondo ya pehli unit set karo
    const kgs = this.uomList.find(u => u.shortCode === 'KGS');
    this.quotation.volumeWeightUnit = kgs ? 'KGS' : this.uomList[0].shortCode;
  }
}
packageUnits: any[] = [];
getPackageUnits() {
    this.http.get(`${environment.apiUrl}/PackageBox/list`).subscribe((res: any) => {
      // API response se list set karo
      this.packageUnits = res; 
    });
  }
  // 1. Data load karne ka function (API Call)
loadPortsFromApi() {
  this.http.get<any[]>(`${environment.apiUrl}/PortSetup`).subscribe({
    next: (data) => {
      // API ka data 'portsOfLoading' master list mein store ho jayega
      this.portsOfLoading = data; 
      console.log("Final Destination API Data Loaded:", data);
    },
    error: (err) => {
      console.error("Error loading ports from API:", err);
      Swal.fire('Error', 'Unable to fetch port data.', 'error');
    }
  });
}

// 2. Search logic (Search term ke basis par filter karega)
// Variables
highlightedIndex: number = -1;

// 1. Search Logic (Name aur Code dono ke liye)
onFinalDestinationSearch() {
  const searchTerm = (this.quotation.podFinalDest || '').toString().trim().toLowerCase();
  this.performSearch(searchTerm);
}

// 2. Code Input Logic (Auto-fill + List show)
onCodeInput() {
  const code = (this.quotation.finalDestinationCode || '').toString().trim().toLowerCase();
  
  // Auto-fill logic
  const match = this.portsOfLoading.find(p => p.portCode?.toString().toLowerCase() === code);
  if (match) {
    this.quotation.podFinalDest = match.portName || match.name;
  }
  
  // Dropdown show logic
  if (code !== '') {
    this.performSearch(code);
  } else {
    this.showFinalDestinationDropdown = false;
  }
}

// Common Search Helper
performSearch(term: string) {
  this.highlightedIndex = -1;
  this.filteredFinalDestinations = this.portsOfLoading.filter(port => {
    const name = (port.name || port.portName || '').toLowerCase();
    const code = (port.portCode || '').toLowerCase();
    return name.includes(term) || code.includes(term);
  });
  this.showFinalDestinationDropdown = this.filteredFinalDestinations.length > 0;
}

// // Selection Logic
selectFinalDestination(port: any) {
  if (!port) return;
  this.quotation.podFinalDest = port.portName || port.name || '';
  this.quotation.finalDestinationCode = port.portCode || '';
  this.showFinalDestinationDropdown = false;
  this.filteredFinalDestinations = [];
  this.highlightedIndex = -1;
}

// 3. Keyboard Navigation
onFinalKeyDown(event: KeyboardEvent) {
  if (!this.showFinalDestinationDropdown) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (this.highlightedIndex < this.filteredFinalDestinations.length - 1) this.highlightedIndex++;
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (this.highlightedIndex > 0) this.highlightedIndex--;
  } else if (event.key === 'Enter') {
    event.preventDefault();
    if (this.highlightedIndex > -1) {
      this.selectFinalDestination(this.filteredFinalDestinations[this.highlightedIndex]);
    }
  }
}

// 4. Selection Logic
// selectFinalDestination(port: any) {
//   if (!port) return;
//   this.quotation.podFinalDest = port.portName || port.name || '';
//   this.quotation.finalDestinationCode = port.portCode || '';
//   this.showFinalDestinationDropdown = false;
//   this.filteredFinalDestinations = [];
//   this.highlightedIndex = -1;
// }
origins: any[] = [];
  countries: any[] = []; // Agar alag se country list chahiye
  filteredOrigins: any[] = [];
  filteredCountries: any[] = [];
  showOriginDropdown = false;
  showCountryDropdown = false;
// --- Origin Logic ---
fetchOrigins() {
    const url = `${environment.apiUrl}/origin/all`;
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.origins = data;
        this.filteredOrigins = data; // Initally saara data dikha sakte hain
      },
      error: (err) => console.error('Error fetching origins:', err)
    });
  }
onOriginSearch() {
  const term = (this.quotation.originPOL || '').toLowerCase();
  this.filteredOrigins = this.origins.filter(o => o.name.toLowerCase().includes(term));
  this.showOriginDropdown = true;
}

selectOrigin(org: any) {
  this.quotation.originPOL = org.name;
  this.quotation.country = org.countryName; // Origin se country apne aap fill hogi
  this.showOriginDropdown = false;
  this.showCountryDropdown = false;
}

onOriginKeyDown(event: any) {
  if (event.key === 'Enter' && this.filteredOrigins.length > 0) {
    this.selectOrigin(this.filteredOrigins[0]);
  }
}

// --- Country Logic (Separate) ---
onCountrySearch() {
  const term = (this.quotation.country || '').toLowerCase();
  this.filteredCountries = this.countries.filter(c => c.name.toLowerCase().includes(term));
  this.showCountryDropdown = true;
}

selectCountry(country: any) {
  this.quotation.country = country.name;
  this.showCountryDropdown = false;
}

// --- Click Outside to Close ---
@HostListener('document:click', ['$event'])
clickout(event: any) {
  if (!this.eRef.nativeElement.contains(event.target)) {
    this.showOriginDropdown = false;
    this.showCountryDropdown = false;
  }
}

}