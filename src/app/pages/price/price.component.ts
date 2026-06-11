
import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
 

import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http'; 
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { CheckPermissionService } from '../../services/check-permission.service';
import { moveItemInArray, transferArrayItem, CdkDragDrop } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop'; // Ye import ensure karein
import { Subscription } from 'rxjs';
import { BranchService } from '../../services/branch.service';
import { UserService } from '../../services/user.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';
export interface CostBreakdown {
  id?: number;
  inquiryId?: number;
  lob: string;
  chargeName: string;
  chargeType: string;
  basis: string;
  currency: string;
  rate: number;
  exchangeRate: number;
  amount: number;
}
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
  selector: 'app-price',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule, DragDropModule],
  templateUrl: './price.component.html',
  styleUrl: './price.component.css',
})

export class PriceComponent {
 @ViewChild('cargoDateInput') cargoDateInput!: ElementRef<HTMLInputElement>;
 totalCount: number = 0;
 chargesList: any[] = [];
 showCountryDropdown: boolean = false;
countriesList: any[] = []; 
filteredCountries: any[] = [];
selectedCountryName: string = '';
currentPage: number = 1;
pageSize: number = 10;
    getsalescordinate: any[] = [];
    PermissionID:any;
    LeadId:number=0;
    originpinCode:any;
    InquiryId:number=0;
    referenceByInquiryNo:string='';
    organisationId:number=0;
    organisationName:string='';
    // Add these lines in your class variables section
    
paginatedPricings: any[] = []; 
costBreakdowns: any[] = []; // Check if you intended to use 'costRows' instead
    OrganisationId:number=0;
    invoices: any[] = [];
    lastSelectedBranch: string = "";
  isInvoiceModalOpen = false;
documents: any[] = [];
  isDocumentModalOpen = false;
  OrganisationName:string='';
  LeadName:string='';
  // Preview ke liye nayi variables
  isPreviewModalOpen = false;
  agentDetail: any[] = [];
  selectedEmails = new Set<string>();
  currentPreviewUrl: SafeResourceUrl | null = null;
    showincoterms:string="";
    selectcommodityvalue:string="";
    organizationIds:number=0;
    isDeliveryEnabled:boolean=false;
    portsOfDischarge: any[] = [];        // API se aane wala full list
filteredPortsOfDischarge: any[] = [];
originsaveid:number=0;
showPortOfDischargeDropdown: boolean = false;
portsOfLoading: any[] = [];               // Full list from API
filteredPortsOfLoading: any[] = [];
showPortOfLoadingDropdown: boolean = false;
   branchlist:any[]=[];
isPickupEnabled: boolean = false; 
    selectedLeadData: any = null;
    transportModes: any[] = [];

    incoTerms: any[] = [];
    shipmentTypes: any[] = [];
    movementTypes: any[] = [];
    commodityTypes: any[] = [];
    quotationcheck: any = { TransportMode: '',
    shipmentType: '',incoterm: '',movementType: '',commodity: ''};
    
public ports: any[] = [];
addDocument() {
    this.documents.push({ 
      name: '', 
      file: null, 
      fileName: '', 
      previewUrl: null 
    });
  }

removeDocument(index: number) {
  this.documents.splice(index, 1);
}


openCommodityModal() {
    this.isDocumentModalOpen = true;
  }
openDocumentModal() {
  this.isDocumentModalOpen = true;
}
onCommodityChange(event: any) {
  // Yeh aapko ID dega (jo value="" mein set hai)
  const selectedId = event.target.value; 

  // Yeh aapko exact wo TEXT dega jo user ko dropdown mein dikh raha hai
  const selectedText = event.target.options[event.target.selectedIndex].text;
  this.selectcommodityvalue=selectedText;
  console.log("Selected ID:", selectedId);
  console.log("Selected Name/Text:", selectedText);
}

closeDocumentModal() {
  this.isDocumentModalOpen = false;
}


  // Modal Open/Close Functions
  openInvoiceModal() {
    this.isInvoiceModalOpen = true;
  }

  closeInvoiceModal() {
    this.isInvoiceModalOpen = false;
  }

  // Add New Invoice Row
addInvoice() {
    this.invoices.push({ name: '', file: null, fileName: '', previewUrl: null });
  
  this.invoices.push({ 
    name: '', 
    documentPath: null, 
    file: null, 
    isReplacing: false // Yeh line zaroori hai
  });

  }
removeInvoice(index: number) {
    this.invoices.splice(index, 1);
  }
openDocumentPreview(doc: any) {
    if (doc.previewUrl) {
      this.currentPreviewUrl = doc.previewUrl;
      this.isPreviewModalOpen = true;
    }
  }
  closePreviewModal() {
    this.isPreviewModalOpen = false;
    this.currentPreviewUrl = null;
  }

  // Pehle wala modal open/close functions
  // Save button click hone par console me data dikhane ke liye
  saveDocuments() {
    console.log("=== 📦 Commodity Documents List ===");
    
    // Check agar array khali hai
    if (this.documents.length === 0) {
      console.log("Koi document add nahi kiya gaya hai.");
    } else {
      // Har ek document ko loop karke console me dikhana
      this.documents.forEach((doc, index) => {
        console.log(`\n--- Document ${index + 1} ---`);
        console.log("Document Name/Type :", doc.name || 'Name not entered');
        console.log("Original File Name :", doc.fileName || 'No file selected');
        console.log("Actual File Object :", doc.file); // Yeh actual file hai (Image/PDF) jo backend me jayegi
      });
      
      // Poora array ek sath dekhne ke liye
      console.log("\nFull Array Data:", this.documents);
    }

    // Console me print hone ke baad modal close kar do
    this.closeDocumentModal();
  }
  // Handle File Selection
  onInvoiceFileSelected(event: any, index: number) {
    const file = event.target.files[0];
    
    if (file) {
      this.invoices[index].file = file;
      this.invoices[index].fileName = file.name; // Naam UI par dikhane ke liye
      
      // Local file ka URL banana preview ke liye
      const objectUrl = URL.createObjectURL(file);
      
      // Angular ko batana padega ki ye URL safe hai iframe me dikhane ke liye
      this.invoices[index].previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
    }
  }
// test(){
//   alert(this.quotation.TransportType);
// }

// add/remove


// file select

// ================== VOLUME WEIGHT CALCULATION ==================
// ================== VOLUME WEIGHT CALCULATION ==================
// InquiryComponent.ts mein ye add karein
// 1. Single row jo bahar dikhti hai
dimRow: any = { box: 1, l: 0, w: 0, h: 0, unit: 'kgs' };
dimRows: any[] = [];

// Component initialize hote hi dimRow ko array mein daal dein
// ngOnInit() {
//   this.dimRows = [this.dimRow]; 
// }

calculateVolumeWeight() {
  // 1. Sirf calculation karo, dimRows ko mat chhedo!
  const weight = this.calculateSingleVolumeWeight(this.dimRow);
  this.quotation.volumeWeight = parseFloat(weight.toFixed(2));
  this.calculateCBM();

  // 2. Sirf tabhi update karo agar modal open nahi hai (Optional safety)
  // YA PHIR: Sirf pehli row ko update karo, baaki array ko mat overwrite karo!
  if (this.dimRows.length > 0) {
    this.dimRows[0] = { ...this.dimRow }; 
  } else {
    this.dimRows = [{ ...this.dimRow }];
  }
  
  // 3. Calculation logic call karo (Lekin dimRows ko overwrite mat karo)
  this.appliedDimensions = this.dimRows.filter(d => d.l > 0 && d.w > 0 && d.h > 0);
  this.calculateNetWeight();
  this.calculateVolumeWeightLogic();
  this.syncFinalData();
}
// Ye function banaye jo modal ke button se bhi chale aur bahar se bhi
syncFinalData() {
  // Yahan woh logic likhein jo aapke database ya main form ko update karta hai
  // Example: 
  this.quotation.dimensions = JSON.parse(JSON.stringify(this.dimRows));
  console.log("Data Auto-Synced!");
}

// Ye function modal ke 'Apply' button ki zaroorat khatam kar dega
getTotalVolumeWeight(): number {
  let total = 0;
  //  let total = 0;
  if (this.dimRows && this.dimRows.length > 0) {
    this.dimRows.forEach(dim => {
      total += this.calculateSingleVolumeWeight(dim);
    });
  } else {
    total = this.calculateSingleVolumeWeight(this.dimRow);
  }
  return parseFloat(total.toFixed(2));
  // Agar modal mein multiple rows hain toh loop chalega
  // Agar sirf bahar input bhara hai toh bhi ye dimRows[0] se utha lega
  this.dimRows.forEach(dim => {
    total += this.calculateSingleVolumeWeight(dim);
  });
  return total;
}

calculateSingleVolumeWeight(dim: any): number {
  if (!dim.l || !dim.w || !dim.h || dim.l <= 0 || dim.w <= 0 || dim.h <= 0) {
    return 0;
  }
  
  let volumeCm3 = dim.l * dim.w * dim.h;
  if (dim.unit === 'INCH') {
    volumeCm3 = volumeCm3 * 16.387; // Inch to CM3 conversion
  }
  
  // (L * W * H / 6000) * Number of Boxes
  return (dim.box || 1) * (volumeCm3 / 6000);
}
// getTotalVolumeWeight(): number {
  // let total = 0;
  // if (this.dimRows && this.dimRows.length > 0) {
  //   this.dimRows.forEach(dim => {
  //     total += this.calculateSingleVolumeWeight(dim);
  //   });
  // } else {
  //   total = this.calculateSingleVolumeWeight(this.dimRow);
  // }
  // return parseFloat(total.toFixed(2));
// }

// 2. CBM Calculation logic
calculateCBM() {
  if (this.quotation.volumeWeight) {
    // Formula as per your requirement: Volume Weight / 167
    const calculatedCbm = this.quotation.volumeWeight / 167;
    this.quotation.cbm = parseFloat(calculatedCbm.toFixed(3));
  } else {
    this.quotation.cbm = 0;
  }
}
AllSearch(){
  this.onSearch();
  this.cdr.detectChanges();
}
testing(){
 this.onSearch(); 
  this.cdr.detectChanges();
}
calculateNetWeight() {
  // Number() ensures ki hum string nahi, number minus kar rahe hain
  const gross = Number(this.quotation.grossWeightKg) || 0;
  const volume = Number(this.quotation.volumeWeight) || 0;
  
  // Minus karne ke baad sirf 2 decimal tak limit karo
  const result = gross - volume;
  
  // toFixed(2) se 4 digit wali problem khatam ho jayegi
  this.quotation.netWeight = parseFloat(result.toFixed(2));

  // Console mein check karne ke liye
  console.log("Gross:", gross, "Volume:", volume, "Net:", this.quotation.netWeight);
}
calculateChargeableWeight() {
  const gross = Number(this.quotation.grossWeightKg) || 0;
  const volume = Number(this.quotation.volumeWeight) || 0;

  // Jo bhi bada hoga (Math.max), wo chargeableWeight mein jayega
  const higherWeight = Math.max(gross, volume);

  // Result ko 2 decimal points tak set karein
  this.quotation.chargeableWeight = parseFloat(higherWeight.toFixed(2));
}
// Volume weight badalne par CBM aur Net Weight dono update hone chahiye
calculateVolumeWeightLogic() {
  // Numbers mein convert karna zaroori hai
  const gross = Number(this.quotation.grossWeightKg) || 0;
  const volume = Number(this.quotation.volumeWeight) || 0;

  // 1. CBM Calculation (Volume / 167)
  const calculatedCbm = volume / 167;
  this.quotation.cbm = parseFloat(calculatedCbm.toFixed(3));

  // 2. Net Weight Calculation (Volume - Gross)
  const netResult = volume - gross;
  this.quotation.netWeight = parseFloat(netResult.toFixed(2));

  // 3. Chargeable Weight Calculation (Higher of Gross or Volume)
  const higherWeight = Math.max(gross, volume);
  this.quotation.chargeableWeight = parseFloat(higherWeight.toFixed(2));

  console.log("Calculated -> CBM:", this.quotation.cbm, "Net:", this.quotation.netWeight, "Chrg:", this.quotation.chargeableWeight);
}
columnFieldMap: any = {
  'Pricing No.': 'pricingNo',
  'Inquiry Ref.': 'referenceByInquiryNo',
  'Organisation': 'organisationName',
  'Origin': 'originName',
  'Destination': 'finalDestination',
  'Status': 'status'
};

selectedColumns: string[] = ['ID', 'Inquiry No', 'Date', 'Customer', 'Status','LeadName','OrganisationName'];
availableColumns: string[] = ['Mode', 'Origin', 'Destination', 'Sales Person'];
    isFormOpen = false;
    public apiUrl = `${environment.apiUrl}/Pricing`;
inquiries:any[]=[]
    quotations: any[] = [];
    quotation: any = this.resetQuotationModel();
    selectedFile: File | null = null;
    servicesList: any[] = [];
    isDimModalOpen = false;
    appliedDimensions: any[] = []; 
    // dimRows: any[] = [{ box: 1, l: 0, w: 0, h: 0, unit: 'CMS' }];
    inquiry: any = {
    inquiryNo: '',
    customerName: '',
    organization: '',         // Search input ke liye
    organizationAddress: '',
    leadNo: '',
    isDirect: false,
  isIndirect: false,
    origin: '',
    
    // ... baki fields ...
  };
  companyServices:any[]=[]
organizations: any[] = [];
  filteredOrganizations: any[] = [];
  showDropdown: boolean = false;
  leads: any[] = [];
  filteredLeads: any[] = [];
  showLeadDropdown: boolean = false;
  // Origins list fetch karne ke liye
  origins: any[] = [];
  filteredOrigins: any[] = [];
  showOriginDropdown: boolean = false;

  allInquiryNumbers: string[] = [];
  
  coordinators: any[] = [];
  branchesList: any[] = [];
  searchDone: boolean = false; // Shuru mein false rahega
  uploadedDocuments: any[] = [];
    // Ye line add karein
    constructor(private http: HttpClient, private router: Router,private el: ElementRef,private cdr: ChangeDetectorRef,private branchservice:BranchService,public userServices:UserService,public CheckPermissionService:CheckPermissionService,private sanitizer: DomSanitizer,private eRef: ElementRef,private route: ActivatedRoute) {}
orgData: any = null;
  isLoading: boolean = true;
    ngOnInit() {
      this.loadChargeNamesMaster();
      this.route.queryParams.subscribe(params => {
    const editId = params['editId'];
    if (editId) {
      console.log("URL se Edit ID mili:", editId);
      this.loadPricingForEdit(editId);
    }
  });
      const idFromUrl = this.route.snapshot.paramMap.get('id');
    
    // Aapki purani list wali API call kar rahe hain
    this.http.get<any[]>(`${environment.apiUrl}/Organization/list`).subscribe({
      next: (allOrgs) => {
        // List mein se wo wali Org dhoond rahe hain jiski ID match kare
        this.orgData = allOrgs.find(o => o.id == idFromUrl || o.Id == idFromUrl);
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error loading orgs", err);
        this.isLoading = false;
      }
    });
  
      this.PermissionID = Number(localStorage.getItem('permissionID'));
      console.log("Direct API call trigger ho rahi hai...");
   this.getsales();
   this.loadConnectingPortsData();
      this.getbranch();
      this.quotation.chargeableWeightUnit = 'KGS';
      this.quotation.netWeightUnit = 'KGS';
      if (!this.quotation.GrossweightUnit) this.quotation.GrossweightUnit = 'KGS';
      this.quotation.volumeWeightUnit = 'KGS';
      if (!this.quotation.cbmUnit) {
  this.quotation.cbmUnit = 'CBM';
}
this.getPackageUnits();
      this.loadQuotations();
      this.loadPricingNumbers();
      this.portOfLoading();
    this.loadUomList();
      this.getNextInquiryNumber();
      this.fetchOrganizations();
      this.fetchLeads();
      this.fetchOrigins();
      this.loadDropdownData();
    this.loadAllLeadss();
  this.fetchPricingSettings();
  console.log("All Possible Columns:", this.allPossibleColumns);
    this.loadInquiryNumbers();
    this.loadCoordinators(); 
    this.loadBranches();
    this.loadInquirySettings();
    this.fetchCompanyServices();
    this.getTransportModes();
    this.fetchAllCountries();
this.getShipmentTypes();
this.portdischarge();
this.getIncoTerms();
this.getMovementTypes();
this.getCommodityTypes();
console.log("🚀 Page Loading...");
  this.loadBranchess();
  if (this.dimRows.length === 0) {
    this.dimRows = [this.dimRow];
  }
this.quotation.shipmentType = 'Ready';
    
    
    this.setTodayDate();
    }
    getCommodityTypes() {
    // Hits: https://localhost:xxxx/api/CommodityType
    this.http.get<any[]>(`${environment.apiUrl}/CommodityType`).subscribe({
      next: (data) => {
        this.commodityTypes = data;
      },
      error: (err) => console.error('Error fetching Commodities:', err)
    });
  }
  setTodayDate() {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    this.quotation.cargoStatusDate = today;
}
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
portOfLoading() {
  this.http.get<any[]>(`${environment.apiUrl}/PortSetup`).subscribe({
    next: (data) => {
      this.portsOfLoading = data;
      console.log("Port of Loading loaded:", data);
    },
    error: (err) => {
      console.error("Error loading Port of Loading:", err);
    }
  });
}
loadPricingForEdit(id: any) {
  const token = localStorage.getItem('cavalier_token');
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

  // Pura data fetch karne ke liye API call (Aapke controller ka specific GET endpoint)
  this.http.get(`${environment.apiUrl}/Pricing/${id}`, { headers }).subscribe({
    next: (data: any) => {
      if (data) {
        // 1. Quotation object mein data bharo
        this.quotation = { ...data };
        
        // 2. Form open kar do
        this.isFormOpen = true;

        // 3. Agar table data parse karna ho (Jaise Revenue/Cost)
        if (data.costBreakdowns) {
          this.costRows = data.costBreakdowns;
        }
        if (data.multiCarrierBreakdowns) {
          this.multiCarrierRows = data.multiCarrierBreakdowns;
        }

        this.cdr.detectChanges();
        console.log("Edit Form automatically opened for ID:", id);
      }
    },
    error: (err) => {
      console.error("Pricing load fail:", err);
      Swal.fire('Error', 'We encountered a retrieval anomaly during the data fetch; the requested information appears to be devoid of a valid pricing association in our current system configuration.', 'error');
    }
  });
}
// Add these variables in your class
// showPortOfLoadingDropdown = false;x
// filteredPortsOfLoading: any[] = [];
activePOLIndex = -1;

// 1. Unified Search Logic
onPortOfLoadingSearch(type: 'name' | 'code') {
  const searchTerm = (type === 'name' 
    ? (this.quotation.portOfLoading || '') 
    : (this.quotation.portOfLoadingCode || '')).toString().trim().toLowerCase();

  if (searchTerm === '') {
    this.filteredPortsOfLoading = [];
    this.showPortOfLoadingDropdown = false;
    this.activePOLIndex = -1;
    return;
  }

  this.filteredPortsOfLoading = this.portsOfLoading.filter(port => {
    const pName = (port.name || port.portName || port.PortName || port.description || '').toLowerCase();
    const pCode = (port.portCode || '').toLowerCase();
    return pName.includes(searchTerm) || pCode.includes(searchTerm);
  });

  this.showPortOfLoadingDropdown = this.filteredPortsOfLoading.length > 0;
  this.activePOLIndex = -1;
}

// 2. Select Logic
selectPortOfLoading(port: any) {
  if (!port) return;
  this.quotation.portOfLoadingId = Number(port.id || port.Id);
  this.quotation.portOfLoading = port.name || port.portName || port.PortName || '';
  this.quotation.portOfLoadingCode = port.portCode || '';
  this.showPortOfLoadingDropdown = false;
  this.filteredPortsOfLoading = [];
  this.activePOLIndex = -1;
}

// 3. Keyboard Navigation
onPOLKeyDown(event: KeyboardEvent) {
  if (!this.showPortOfLoadingDropdown) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (this.activePOLIndex < this.filteredPortsOfLoading.length - 1) this.activePOLIndex++;
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (this.activePOLIndex > 0) this.activePOLIndex--;
  } else if (event.key === 'Enter') {
    event.preventDefault();
    const selected = this.activePOLIndex >= 0 ? this.filteredPortsOfLoading[this.activePOLIndex] : this.filteredPortsOfLoading[0];
    this.selectPortOfLoading(selected);
  }
}

// 4. Outside Click
// inal Destination Search Logic
// Add these with your other class-level variables
// Add variables
showFinalDestinationDropdown = false;
filteredFinalDestinations: any[] = [];
activeFDIndex = -1;

// 1. Unified Search Logic (Supports Name & Code)
onFinalDestinationSearch(type: 'name' | 'code') {
  const searchTerm = (type === 'name' 
    ? (this.quotation.finalDestination || '') 
    : (this.quotation.finalDestinationCode || '')).toString().trim().toLowerCase();

  if (searchTerm === '') {
    this.filteredFinalDestinations = [];
    this.showFinalDestinationDropdown = false;
    this.activeFDIndex = -1;
    return;
  }

  this.filteredFinalDestinations = this.portsOfLoading.filter(port => {
    const pName = (port.name || port.portName || port.PortName || port.description || '').toLowerCase();
    const pCode = (port.portCode || '').toLowerCase();
    return pName.includes(searchTerm) || pCode.includes(searchTerm);
  });

  this.showFinalDestinationDropdown = this.filteredFinalDestinations.length > 0;
  this.activeFDIndex = -1;
}

// 2. Selection Logic
selectFinalDestination(port: any) {
  if (!port) return;
  this.quotation.finalDestination = port.name || port.portName || port.PortName || '';
  this.quotation.finalDestinationCode = port.portCode || '';
  this.showFinalDestinationDropdown = false;
  this.filteredFinalDestinations = [];
  this.activeFDIndex = -1;
}

// 3. Keyboard Navigation
onFDKeyDown(event: KeyboardEvent) {
  if (!this.showFinalDestinationDropdown) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (this.activeFDIndex < this.filteredFinalDestinations.length - 1) {
      this.activeFDIndex++;
      this.scrollToActiveFD();
    }
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (this.activeFDIndex > 0) {
      this.activeFDIndex--;
      this.scrollToActiveFD();
    }
  } else if (event.key === 'Enter') {
    event.preventDefault();
    const selected = this.activeFDIndex >= 0 ? this.filteredFinalDestinations[this.activeFDIndex] : this.filteredFinalDestinations[0];
    this.selectFinalDestination(selected);
  }
}

private scrollToActiveFD() {
  setTimeout(() => {
    const activeElement = document.querySelector('.bg-gray-100');
    if (activeElement) activeElement.scrollIntoView({ block: 'nearest' });
  }, 0);
}

// 4. Outside Click

// Jab user Ready ya Ready By select kare
onShipmentTypeChange() {
  if (this.quotation.shipmentType === 'Ready') {
    this.setTodayDate();
  } 
  else if (this.quotation.shipmentType === 'Ready By') {

    if (!this.quotation.cargoStatusDate) {
      this.setTodayDate();
    }

    // Better logic to open calendar every time
    setTimeout(() => {
      if (this.cargoDateInput?.nativeElement) {
        const input = this.cargoDateInput.nativeElement;

        // Focus + Click + showPicker (sab try karo)
        input.focus();

        // Small delay for better reliability
        setTimeout(() => {
          input.click();

          // Modern browsers ke liye best method
          try {
            (input as any).showPicker();
          } catch (e) {
            // Fallback
            console.log("showPicker not supported, using click");
          }
        }, 50);
      }
    }, 120);   // Thoda zyada delay diya hai better result ke liye
  }
}
loadChargeNamesMaster() {
  this.http.get<any[]>(`${environment.apiUrl}/Charge`).subscribe({
    next: (data) => {
      this.chargesList = data;
      this.cdr.detectChanges();
    },
    error: (err) => console.error("Error fetching charges:", err)
  });
}
  getbranch() {
    this.branchservice.getBranches().subscribe({
        next: (response: any) => {
            this.branchlist = response;        // insert all response data
            console.log('Branches loaded:', this.branchlist);
        },
        error: (err: any) => {
            console.error('Error fetching branches:', err);
            // Optional: show toast/error message to user
        },
        complete: () => {
            console.log('Branch fetch completed');
        }
    });
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
onLOBChange(event: any) {
  const selectedId = event.target.value;
  const selectedService = this.companyServices.find(s => s.id == selectedId);

  if (!selectedService) return;

  const fullName = selectedService.serviceName.trim();
  this.quotation.lineOfBusinessName = fullName;

  // 1. Existing sync logic
  if (this.costRows && this.costRows.length > 0) {
    this.costRows[0].lob = fullName;
  }

  if (this.multiCarrierRows && this.multiCarrierRows.length > 0) {
    this.multiCarrierRows.forEach((row: any) => {
      row.lob = fullName;
    });
  }

  // 2. Enhanced Logic: Auto-detect Transport Mode AND Transport Type
  // Explicitly defined type string[] to avoid TS7006 error
  const parts: string[] = fullName.split(/[\s\-]+/); 
  
  if (parts.length >= 1) {
    // Mode Detect (e.g., Air, Sea)
    const modeName = parts[0];
    const modeObj = this.transportModes.find(m => m.name.toLowerCase() === modeName.toLowerCase());
    if (modeObj) {
      this.quotation.TransportMode = modeObj.id;
    }

    // Type Detect (e.g., Export, Import)
    const typeKeyword = parts.find(p => ['export', 'import'].includes(p.toLowerCase()));
    if (typeKeyword) {
      // First letter capital karke save karein (Export/Import)
      this.quotation.TransportType = typeKeyword.charAt(0).toUpperCase() + typeKeyword.slice(1).toLowerCase();
    }
  }
  
  this.cdr.detectChanges(); 
}
    getIncoTerms() {
    this.http.get<any[]>(`${environment.apiUrl}/IncoTerms`).subscribe({
      next: (data) => {
        this.incoTerms = data;
      },
      error: (err) => console.error('Error fetching IncoTerms:', err)
    });
  }
  onServiceTypeChange() {
  console.log(`Service Type Changed → Direct: ${this.quotation.isDirect} | Indirect: ${this.quotation.isIndirect}`);
console.log("Direct:", this.quotation.isDirect, "Indirect:", this.quotation.isIndirect);
  // Optional: Agar dono select nahi karna chahte toh logic laga sakte ho
  // Example: Agar Direct true hai to Indirect false kar do (mutually exclusive)
  if (this.quotation.isDirect) this.quotation.isIndirect = false;
  if (this.quotation.isIndirect) this.quotation.isDirect = false;
}
 onIncotermChange(event: any) {
  const selectedIncoterm = event.target.value?.toUpperCase().trim();
     this.showincoterms=selectedIncoterm;
  if (!selectedIncoterm) return;

  this.quotation.incoterm = selectedIncoterm;

  console.log(`Incoterm changed to: ${selectedIncoterm}`);
  if(selectedIncoterm === 'DDP' || selectedIncoterm === 'DDU' || selectedIncoterm === 'DAP'){ 
    this.isDeliveryEnabled = true;
  } 
  else {
    this.isDeliveryEnabled = false;
    this.quotation.deliveryAddress = '';
  }


  // 🔥 Updated Logic as per your requirement
  switch (selectedIncoterm) {
    
    // PORT TO PORT
    case 'FOB':
    
      this.quotation.movementType = 'PORT TO PORT';
      this.isPickupEnabled = false;
      this.quotation.pickupAddress='';
      break;

    // DOOR TO PORT
    case 'EXWORK':
      
      this.quotation.movementType = 'DOOR TO PORT';
      this.isPickupEnabled = true;
      break;

    // DOOR TO DOOR (Default for everything else)
    default:
      this.quotation.movementType = 'DOOR TO DOOR';
      this.isPickupEnabled = false;
      this.quotation.pickupAddress='';
  }

  console.log(`→ Movement Type Auto Selected: ${this.quotation.movementType}`);
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
getShipmentTypes() {
    // This hits: https://localhost:xxxx/api/ShipmentTypes
    this.http.get<any[]>(`${environment.apiUrl}/ShipmentTypes`).subscribe({
      next: (data) => {
        this.shipmentTypes = data;
      },
      error: (err) => console.error('Error fetching Shipment Types:', err)
    });
  }
       // --- Fetch Origins List --
  

fetchCompanyServices() {
    const url = `${environment.apiUrl}/CompanyService`;
    this.http.get<any[]>(url).subscribe({
        next: (data) => {
            this.companyServices = data;
            // Ye logs help karenge check karne mein ki 'serviceName' aa raha hai ya nahi
            console.log("Line of Business loaded:", data); 
            this.cdr.detectChanges();
        },
        error: (err) => console.error("Error loading LOB:", err)
    });
}
 

  // --- Search Logic ---
// PriceComponent mein sirf ek hi `clickout` hona chahiye:



  // 2. Fetch API Updated
  fetchOrigins() {
    const url = `${environment.apiUrl}/origin/all`;
    this.http.get<any[]>(url).subscribe(data => {
      this.origins = data;
    });
  }

  // 3. Search Logic
  onOriginSearchInput() {
    const searchTerm = (this.inquiry.origin || '').toString().trim().toLowerCase();
    if (searchTerm === '') {
      this.showOriginDropdown = false;
      this.filteredOrigins = [];
      return;
    }

    this.filteredOrigins = this.origins.filter(org => {
      return (org.name || '').toLowerCase().includes(searchTerm) || 
             (org.countryName || '').toLowerCase().includes(searchTerm);
    });
    this.showOriginDropdown = true;
  }


  // --- Selection Logic ---
selectOrigin(origin: any) {
  // Mapping logic
  this.originsaveid = origin.id;
  this.originpinCode = origin.countryCode;

  // Origin field update
  this.inquiry.origin = origin.name; 
  
  // FIX: Country auto-fill for BOTH properties (display and underlying data)
  this.quotation.countryName = origin.countryName || origin.country; // Ye template ke liye zaroori hai
  this.quotation.country = origin.countryName || origin.country;     // Ye backend/logic ke liye
  
  this.showOriginDropdown = false;

  console.log("Selected Origin and Country:", origin);

  // Multi-Carrier Grid update
  if (this.multiCarrierRows?.length > 0) {
    this.multiCarrierRows.forEach((row: any) => {
      row.origin = origin.name; 
    });
  }

  this.cdr.detectChanges(); 
}
onOriginKeyDown(event: any) {
    if (event.key === 'Enter' && this.filteredOrigins.length > 0) {
      event.preventDefault();
      this.selectOrigin(this.filteredOrigins[0]);
    }
  }
fetchAgentByPostCode(postCode: string | number) {
  const url = `${environment.apiUrl}/OrgBranch/GetByPostCodeAgent/${postCode}`;
  
  this.http.get<any[]>(url).subscribe({
    next: (res) => {
      this.agentDetail = res; // API ka pura data array mein save
      
      // Force change detection agar zarurat ho
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error("Agent fetch fail ho gaya bhai:", err);
      this.agentDetail = []; // Error aane par array clear
    }
  });
}
toggleSelectAllAgents(event: any): void {
  const isChecked = event.target.checked;
  
  this.agentDetail.forEach(agent => {
    agent.isSelected = isChecked;
    
    // Agar aapka puraana 'onAgentSelect' logic kuch aur fields ya arrays populate karta hai, 
    // toh use bhi yahan sync mein rakhne ke liye pseudo-event bana kar call kar sakte hain:
    const mockEvent = { target: { checked: isChecked } };
    this.onAgentSelect(mockEvent, agent);
  });
}
isAllAgentsSelected(): boolean {
  if (!this.agentDetail || this.agentDetail.length === 0) {
    return false;
  }
  return this.agentDetail.every(agent => agent.isSelected);
}
fetchAgentByLobId(lobId: string | number, countryName: string) {
  if (!lobId) {
    console.warn("⚠️ Operation blocked: Line of Business ID missing.");
    return;
  }

  // Fallback structure sequence filtering array
  const safeCountry = countryName ? encodeURIComponent(countryName.trim()) : '';
  
  // API URL compilation layout routing template architecture
  // Resulting format: api/OrgBranch/GetByLobIdAgent/25?country=India
  const url = `${environment.apiUrl}/OrgBranch/GetByLobIdAgent/${lobId}?country=${safeCountry}`;
  console.log("📡 Dispatching Combined Agent Query Payload:", url);
  
  this.http.get<any[]>(url).subscribe({
    next: (res) => {
      this.agentDetail = res || []; // Master display buffer snapshot update
      this.cdr.detectChanges();     // Force layout visual frame modification refresh
      console.log("✅ Agents/Branches synced for review sequence:", this.agentDetail);
    },
    error: (err) => {
      console.error("❌ Agent dynamic fetch protocol failed:", err);
      this.agentDetail = [];        // Safe error state resetting logic sequential stream
      this.cdr.detectChanges();
    }
  });
}
addToLocalReview() {
  console.log("--- Review Button Clicked ---");

  if (!this.inquiry.organization) {
    Swal.fire('Warning', 'First save or select an organization name!', 'warning');
    return;
  }

  let finalDimensions = [];
  if (this.dimRows && this.dimRows.length > 0) {
    finalDimensions = this.dimRows.filter(d => d.l || d.w || d.h);
  } 
  
  if (finalDimensions.length === 0 && this.appliedDimensions && this.appliedDimensions.length > 0) {
    finalDimensions = [...this.appliedDimensions];
  }

  // Compiling readable data stream summary block mapping matrix array layout configuration
  const completeData = {
    lineOfBusiness: this.getLabel(this.companyServices, this.quotation.lineOfBusinessId),
    commodity: this.getLabel(this.commodityTypes, this.quotation.commodityId),
    incoTerm: this.quotation.incoterm || 'N/A',
    cargoStatus: this.quotation.cargoStatusType || 'Pending',
    noOfPkgs: this.quotation.noOfPkgs || 0,
    grossWeight: this.quotation.grossWeightKg || 0,
    chargeableWeight: this.quotation.chargeableWeight || 0,
    origin: this.inquiry.origin || 'N/A',
    finalDestination: this.quotation.finalDestination || 'N/A',
    pickupAddress: this.quotation.pickupAddress || 'N/A',
    dimensions: finalDimensions
  };

  this.localInquiryList = [completeData];
  
  // 🔥 CORE INTEGRATION MODULE: Fire network hit using the current form configuration parameter keys
  const activeLobId = this.quotation.lineOfBusinessId;
  const currentCountry = this.quotation.country || this.selectedCountryName || '';
  
  this.fetchAgentByLobId(activeLobId, currentCountry);

  this.isPreviewMode = true;
  this.cdr.detectChanges();
}
onAgentSelect(event: any, agent: any) {
  console.log("Agent selection event:", agent);
  const email = agent.emailAddress || agent.emailAddress;
  const branch = agent.branchName || agent.branchName || "Global";

  if (!email) return;

  if (event.target.checked) {
    this.selectedEmails.add(email);
    this.lastSelectedBranch = branch; // Latest branch ko save kar liya
  } else {
    this.selectedEmails.delete(email);
  }
  
  console.log("Current Selection:", Array.from(this.selectedEmails));
  console.log("Selected Branch:", this.lastSelectedBranch);
}
    fetchLeads() {
    const url = `${environment.apiUrl}/Leads`;
    this.http.get<any[]>(url).subscribe(data => {
      this.leads = data;
    });
  }

  // --- Search Logic ---
  onLeadSearchInput() {
    if (this.inquiry.leadNo && this.inquiry.leadNo.length > 3) {
      this.showLeadDropdown = true;
      this.filteredLeads = this.leads.filter(lead =>
        lead.leadNo.toLowerCase().includes(this.inquiry.leadNo.toLowerCase())
      );
    } else {
      this.showLeadDropdown = false;
    }
  }
portdischarge() {
  this.http.get<any[]>(`${environment.apiUrl}/PortSetup`).subscribe({
    next: (data) => {
      this.portsOfDischarge = data;
      console.log("Port of Discharge loaded:", data);
    },
    error: (err) => {
      console.error("Error loading Port of Discharge:", err);
    }
  });
}
// Variables
// showPortOfDischargeDropdown = false;
// filteredPortsOfDischarge: any[] = [];
activePODIndex = -1;

// 1. Unified Search Logic
onPortOfDischargeSearch(type: 'name' | 'code') {
  const searchTerm = (type === 'name' 
    ? (this.quotation.portOfDestination || '') 
    : (this.quotation.portOfDestinationCode || '')).toString().trim().toLowerCase();

  if (searchTerm === '') {
    this.filteredPortsOfDischarge = [];
    this.showPortOfDischargeDropdown = false;
    this.activePODIndex = -1;
    return;
  }

  this.filteredPortsOfDischarge = this.portsOfDischarge.filter(port => {
    const pName = (port.name || port.portName || port.PortName || port.description || '').toLowerCase();
    const pCode = (port.portCode || '').toLowerCase();
    return pName.includes(searchTerm) || pCode.includes(searchTerm);
  });

  this.showPortOfDischargeDropdown = this.filteredPortsOfDischarge.length > 0;
  this.activePODIndex = -1;
}

// 2. Select Logic
selectPortOfDischarge(port: any) {
  if (!port) return;
  this.quotation.portOfDischargeId = Number(port.id || port.Id);
  this.quotation.portOfDestination = port.name || port.portName || port.PortName || '';
  this.quotation.portOfDestinationCode = port.portCode || '';
  this.showPortOfDischargeDropdown = false;
  this.filteredPortsOfDischarge = [];
  this.activePODIndex = -1;
}

// 3. Keyboard Navigation
onPODKeyDown(event: KeyboardEvent) {
  if (!this.showPortOfDischargeDropdown) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (this.activePODIndex < this.filteredPortsOfDischarge.length - 1) this.activePODIndex++;
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (this.activePODIndex > 0) this.activePODIndex--;
  } else if (event.key === 'Enter') {
    event.preventDefault();
    const selected = this.activePODIndex >= 0 ? this.filteredPortsOfDischarge[this.activePODIndex] : this.filteredPortsOfDischarge[0];
    this.selectPortOfDischarge(selected);
  }
}

// 4. Outside Click (Ensure ElementRef is injected)


  // --- Selection Logic ---
//  selectLead(lead: any) {
//   if (!lead) return;

//   // 🔥 Yahan Lead ID console mein dikhega
//   console.log("Selected Lead ID (from list):", lead.id); 

// console.log("Selected Lead's Organization ID:", lead.organisationId);
//   this.inquiry.leadNo = lead.leadNo;
//  // Agar lead ke sath organization ka naam bhi aata hai toh
//   this.showLeadDropdown = false;
// console.log("Lead selected, now fetching full details for Lead ID:", this.LeadId);
// console.log("Lead No set to:", this.OrganisationId);
//   // Pura data fetch karne ke liye call
//   this.loadLeadByLeadNo(lead.leadNo);
// }
    // --- Fetch Organization List ---
  fetchOrganizations() {
    const url = `${environment.apiUrl}/Organization/list`;
    this.http.get<any[]>(url).subscribe(data => {
      this.organizations = data;
    });
  }

  // --- Search Logic ---
  onSearchInput() {
    if (this.inquiry.organization && this.inquiry.organization.length > 3) {
      this.showDropdown = true;
      this.filteredOrganizations = this.organizations.filter(org =>
        org.orgName.toLowerCase().includes(this.inquiry.organization.toLowerCase())
      );
    } else {
      this.showDropdown = false;
    }
  }

  // --- Selection Logic ---
  selectOrganization(org: any) {
    this.inquiry.organization = org.orgName; 
    
    // Address update karein
    setTimeout(() => {
      this.inquiry.organizationAddress = org.address; 
    }, 0);
    
    this.showDropdown = false;
    this.quotation.organizationName = org.name || org.organizationName;
  this.showOrgDropdown = false;
  this.cdr.detectChanges();
  }
    getNextInquiryNumber() {
    // 1. URL ko environment variable se combine karein
    // Ensure you are calling: GET api/Inquiry/NextInquiryNo
    const url = `${environment.apiUrl}/Inquiry/NextInquiryNo`;
    
    // 2. API Call (responseType 'text' use karein kyunki hum sirf number ki string mang rahe hain)
    this.http.get(url, { responseType: 'text' })
      .subscribe({
        next: (nextNo) => {
          // 3. Form ke inquiryNo field mein value set karein
          this.inquiry.inquiryNo = nextNo;
          console.log("Next Inquiry No set to:", nextNo);
        },
        error: (err) => {
          console.error("API Error:", err);
          // Yahan aap user ko error message dikha sakte hain
        }
      });
}

    loadQuotations() {
      this.http.get<any[]>(this.apiUrl).subscribe({
        next: (res) => (this.quotations = res),
        error: (err) => console.error('Failed to load inquiries:', err)
      });
    }

//     onFileSelected(event: any) {
//   const file = event.target.files[0];
//   if (file) {
//     this.selectedFile = file;
//     // 🔥 Important: Database ke column ke liye file ka naam yahan set ho raha hai
//     this.quotation.hazardDocPath = file.name; 
//     console.log("Selected File Name:", file.name);
//   }
// }

onFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    // Nayi file ko array mein add kar rahe hain (Ye static list banayega)
    this.uploadedDocuments.push({
      file: file,
      fileName: file.name
    });

    // Pehli file ka naam purane logic ki tarah set kar rahe hain (Optional)
    if (this.uploadedDocuments.length === 1) {
      this.quotation.hazardDocPath = file.name;
    }

    // Input ko reset karna taaki user dubara wahi button daba sake
    event.target.value = '';
    
    console.log("Documents List:", this.uploadedDocuments);
  }
}

// Static list se file hatane ke liye function
removeDoc(index: number) {
  this.uploadedDocuments.splice(index, 1);
}




    neworg() {
      this.router.navigate(['/dashboard/organization-add']);
    }
deleteQuotation(id: number) {
  if (confirm("Are you sure?")) {
    
    // 1. IMMEDIATE UI UPDATE (Wait mat karo API ka)
    // Maan lo aapka array 'quotations' naam se hai
    this.quotations = this.quotations.filter((q: any) => q.id !== id);
    
    // 2. Angular ko bolo ki turant UI badal de
    this.cdr.detectChanges(); 

    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        console.log("Deleted Successfully!");
        // Backend se sync karne ke liye piche se load kar lo
        this.loadQuotations(); 
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Delete failed", err);
        alert("Delete failed! Refreshing list...");
        this.loadQuotations(); // Agar error aaye toh wapas list le aao
        this.cdr.detectChanges();
      }
    });
  }
}
getFormattedInquiryNo(): string {

  // 1️⃣ Line of Business Name (Air Import -> AI)
  const lobName = this.quotation.lineOfBusinessName || '';
  
  const initials = (lobName || '')
  .split(' ')
  .filter((word: string) => word && word.length > 0)
  .map((word: string) => word.charAt(0))
  .join('')
  .toUpperCase();

  // 2️⃣ Running Number (temporary frontend)
  let number = 1;

  if (this.inquiry.inquiryNo) {
    number = parseInt(this.inquiry.inquiryNo) || 1;
  }

  const formattedNumber = number.toString().padStart(4, '0');

  // 3️⃣ Financial Year
  const now = new Date();
  const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const endYear = startYear + 1;

  const fy = `${startYear.toString().slice(-2)}-${endYear.toString().slice(-2)}`;

  // 4️⃣ Final Format
  return `CAV/INQ/${initials}/${formattedNumber}/${fy}`;
}


    

    toggleForm() {
  this.isFormOpen = !this.isFormOpen;

  if (!this.isFormOpen) {
    // Jab form BAND ho raha ho (Existing logic)
    this.isPreviewMode = false;
    this.quotation = this.resetQuotationModel();
    this.appliedDimensions = [];
    this.dimRows = [{ box: 1, l: 0, w: 0, h: 0, unit: 'CMS' }];
  } else {
    // Jab form KHUL raha ho (New logic for Pricing No)
    // Check karein ki ye New Entry hai (ID nahi hai) ya Edit hai
    if (!this.quotation || !this.quotation.id || this.quotation.id === 0) {
      this.fetchNextPricingNumber();
    }
  }
  
  this.cdr.detectChanges();
}

// Yeh function bhi niche add kar dena agar pehle nahi kiya hai
fetchNextPricingNumber() {
  const token = localStorage.getItem('cavalier_token');
  const headers = { Authorization: `Bearer ${token}` };

  this.http.get(`${environment.apiUrl}/Pricing/GetNextNumber`, { headers }).subscribe({
    next: (res: any) => {
      if (res && res.nextNo) {
        // Form khulne ke turant baad input mein number dikh jayega
        this.quotation.pricingNo = res.nextNo;
        this.cdr.detectChanges();
      }
    },
    error: (err) => {
      console.error("Pricing number fetch error:", err);
    }
  });
}

//    openDimModal() {
//   // Agar dimRows khali hai ya purana data hai toh reset kar do
//   if (!this.dimRows || this.dimRows.length === 0) {
//     this.dimRows = [{
//       box: 1,
//       l: 0,
//       w: 0,
//       h: 0,
//       unit: 'CMS'
//     }];
//   }
  
//   this.isDimModalOpen = true;
// }
//     closeDimModal() { this.isDimModalOpen = false; }
    
//     addNewDimRow() {
//   this.dimRows.push({
//     box: 1,
//     l: 0,
//     w: 0,
//     h: 0,
//     unit: 'CMS'
//   });
  
//   // UI update ke liye
//   this.cdr.detectChanges();
// }
    
//  removeDimRow(i: number) {
//   if (this.dimRows.length > 1) {
//     this.dimRows.splice(i, 1);
//   }
// }

// saveDimensions() {
//   this.appliedDimensions = this.dimRows.filter(d => d.l > 0 && d.w > 0 && d.h > 0);
  
//   // Volume Weight automatically set kar do
//   // this.quotation.volumeWeight = this.getTotalVolumeWeight();

//   console.log("Volume Weight Calculated:", this.quotation.volumeWeight);
  
//   this.closeDimModal();
// }
// ================== MODAL FUNCTIONS ==================

// openDimModal() {
//   if (!this.dimRows || this.dimRows.length === 0) {
//     this.dimRows = [{
//       box: 1,
//       l: 0,
//       w: 0,
//       h: 0,
//       unit: 'CMS'
//     }];
//   }
//   this.isDimModalOpen = true;
// }

closeDimModal() { 
  this.isDimModalOpen = false; 
}

addNewDimRow() {
  this.dimRows.push({
    box: 1,
    l: 0,
    w: 0,
    h: 0,
    unit: 'CMS'
  });
  this.cdr.detectChanges();
}

removeDimRow(i: number) {
  if (this.dimRows.length > 1) {
    this.dimRows.splice(i, 1);
  }
}
onTransportModeChange(){
  alert(this.quotation.TransportMode)
}
// Sahi initialization:
// dimRows: any[] = [];
saveDimensions() {
  // saveDimensions ke start mein:
this.dimRows = [...this.dimRows];
  // 1. Data Filter karo
  this.appliedDimensions = this.dimRows.filter(d => d.l > 0 && d.w > 0 && d.h > 0);
  
  // 2. Main Quotation Dimensions mein poora array daalo
  // (Main UI wali dimRow wahi hai jo dimRows[0] mein hai)
  this.quotation.dimensions = [...this.dimRows];
  
  // 3. UI ke liye dimRow ko index 0 se update karo
  if (this.dimRows.length > 0) {
    this.dimRow = { ...this.dimRows[0] };
  }

  // 4. Calculations (Saare functions ko yahan call karo)
  this.quotation.volumeWeight = this.getTotalVolumeWeight();
  this.calculateCBM();
  this.calculateNetWeight();
  this.calculateVolumeWeightLogic();
  this.syncFinalData();
  this.calculateTotalPackages();
  
  // 5. Modal band karo
  this.closeDimModal();
}
// 4. Save button par calculation trigger karna
openDimModal() {
  // Agar dimRows empty hai, toh dimRow (Main UI) wala data push kar do
  if (!this.dimRows || this.dimRows.length === 0) {
    this.dimRows = [{ ...this.dimRow }];
  }
  this.isDimModalOpen = true;
  this.cdr.detectChanges();
}

// Jab Modal Open ho

    


// editQuotation(q: any) {
//   // environment se URL lekar fresh API call
//   const url = `${environment.apiUrl}/Pricing/${q.id}`;

//   this.http.get(url).subscribe({
//     next: (fullData: any) => {
//       console.log("DEBUG: Fresh API Data received:", fullData);

//       // Mapping logic
//       this.quotation = { ...fullData };

//       // IDs mapping
//       this.quotation.lineOfBusinessId = fullData.lineOfBusinessId ? Number(fullData.lineOfBusinessId) : null;
//       this.quotation.originId = fullData.originId ? Number(fullData.originId) : null;
//       this.quotation.portOfLoadingId = fullData.portOfLoadingId ? Number(fullData.portOfLoadingId) : null;
//       this.quotation.portOfDischargeId = fullData.portOfDischargeId ? Number(fullData.portOfDischargeId) : null;

//       // UI object update
//       this.inquiry = {
//         ...this.inquiry,
//         inquiryNo: fullData.inquiryNo,
//         organization: fullData.customerName || fullData.organization,
//         origin: fullData.origin,
//         leadNo: fullData.leadNo
//       };

//       // --- DOCUMENTS MAPPING ---
//       const allDocs = fullData.pricingDocuments || [];
//       console.log("DEBUG: Total Docs found:", allDocs.length);

//       this.documents = allDocs
//         .filter((d: any) => d.docType === 'Commodity')
//         .map((d: any) => ({
//           id: d.docId,
//           name: d.docType,
//           documentPath: d.docPath,
//           isExisting: true,
//           file: null,
//           isReplacing: false
//         }));

//       this.invoices = allDocs
//         .filter((d: any) => d.docType === 'Invoice')
//         .map((d: any) => ({
//           id: d.docId,
//           name: d.docType,
//           documentPath: d.docPath,
//           isExisting: true,
//           file: null,
//           isReplacing: false
//         }));

//       this.quotation.invoiceList = (this.invoices.length > 0) ? 'Available' : 'Not Available';

//       // Dates & Dimensions
//       if (fullData.receivedDate) {
//         this.quotation.receivedDate = new Date(fullData.receivedDate).toISOString().split('T')[0];
//       }

//       this.appliedDimensions = fullData.dimensions || [];
//       this.dimRows = this.appliedDimensions.length > 0 
//         ? [...this.appliedDimensions] 
//         : [{ box: 1, l: 0, w: 0, h: 0, unit: 'CMS' }];

//       // Modal open
//       this.isFormOpen = true;

//       setTimeout(() => {
//         this.cdr.detectChanges();
//       }, 100);
//     },
//     error: (err) => {
//       console.error("DEBUG: Error fetching data from:", url, err);
//     }
//   });
// }
editQuotation(q: any) {
  const url = `${environment.apiUrl}/Pricing/${q.id}`;

  this.http.get<any>(url).subscribe({
    next: (fullData) => {
      console.log("FULL DATA RECEIVED:", fullData); // Ye check karo, yahan documents dikhne chahiye!

      this.quotation = { ...fullData };

      // YAHAN Galti hoti hai: Backend 'pricingDocuments' bhej raha hai, 
      // par tumne screenshot mein 'pricingDocuments' khali dikhaya hai.
      // Check karo kya backend ne sach mein data diya?
      this.documents = fullData.pricingDocuments.filter((d: any) => d.docType === 'Commodity');
      this.invoices = fullData.pricingDocuments.filter((d: any) => d.docType === 'Invoice');
console.log("Mapped Documents:", this.documents);
      this.isFormOpen = true;
      this.cdr.detectChanges();
    }
  });
}


    resetQuotationModel() {
      return {
        id: 0, 
        customerName: '', 
        branchName: 'MAIN', 
        receivedDate: new Date().toISOString().split('T')[0], 
        location: '', 
        transportMode: 'Air', 
        shipmentType: 'International',
        lineOfBusinessId: null,
        commodityId: 1,
        cargoStatusType: 'Ready',
        
        portOfLoadingId: 1, // Matches pol1 request
        portOfDischargeId: 1, // Matches pod1 request
        noOfPkgs: 1, 
        grossWeightKg: 0, 
        chargeableWeight: 0,
        hazardDocPath: '',
        cargoStatusDate: new Date().toISOString().split('T')[0],
        dimensions: []
      };
    }
    
 
 // Variables define karein
allUniqueServices: string[] = []; 
filteredServices: string[] = [];

loadDropdownData() {
  const token = localStorage.getItem('cavalier_token');

  const headers = {
    Authorization: `Bearer ${token}`
  };

  this.http.get<any[]>(`${environment.apiUrl}/Pricing`, { headers })
    .subscribe({
      next: (data) => {
        // 1. Data se transportMode nikalo aur null values hatao
        const allModes = data.map(item => item.transportMode).filter(m => m);

        // 2. 🔥 Set se duplicates hata kar master list banao
        this.allUniqueServices = [...new Set(allModes)];
        
        console.log("Master Unique List ready:", this.allUniqueServices);
      },
      error: (err) => {
        console.error("Error loading dropdown data:", err);

        if (err.status === 401) {
          alert("Unauthorized! Please login again.");
        }
      }
    });
}

// 🔥 Naya function: Jo typing ke waqt filter karega
// ---- 1. Toggle Service Popup (Token + Headers + Correct Object Mapping) ----
// ---- 1. Toggle Service Popup (Token + Headers + Correct Object Mapping) ----
toggleServicePopup() {
  // FIX: Service popup variable check karo
  if (this.showServicePopup) {
    this.showServicePopup = false;
    this.cdr.detectChanges();
    return;
  }

  const token = localStorage.getItem('cavalier_token'); 
  if (!token) {
    console.warn("Bhai login token nahi mila!");
    return;
  }

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  this.serviceSub?.unsubscribe();

  const fullUrl = `${environment.apiUrl}/Pricing`;
  
  this.serviceSub = this.http.get<any>(fullUrl, { headers }).subscribe({
    next: (res: any) => {
      const rawList = (res && res.data && Array.isArray(res.data)) ? res.data : (Array.isArray(res) ? res : []);

      const uniqueModes: string[] = Array.from(new Set<string>(
        rawList
          .filter((item: any) => item && typeof item.transportMode === 'string' && item.transportMode.trim() !== "")
          .map((item: any) => item.transportMode as string)
      ));

      this.allTransportModes = uniqueModes;
      
      // FIX: Yahan 'allUniqueServices' use karo jo aapne pehle declare kiya hai
      this.allUniqueServices = [...uniqueModes]; 

      this.showServicePopup = true; 
      
      this.cdr.detectChanges(); 
    },
    error: (err) => {
      console.error("Error fetching Inquiry Services", err);
      this.showServicePopup = false;
      this.cdr.detectChanges();
    }
  });
}

// ---- 2. Input change search filter logic ----
onServiceType() {
  const query = this.searchFilters.transportMode ? this.searchFilters.transportMode.trim().toLowerCase() : '';
  console.log('--- ⌨️ Input Box Typing --- Query:', query);

  if (query.length >= 3) {
    this.filteredServices = this.allTransportModes.filter((mode: string) => 
      mode && mode.toLowerCase().includes(query)
    );
    console.log(`Dropdown Matches found: ${this.filteredServices.length}`, this.filteredServices);
  } else {
    this.filteredServices = [];
  }
  this.cdr.detectChanges();
}

// ---- 3. Helper: Item selection handler ----
selectServiceType(val: string) {
  console.log('--- 🎯 Item Selected ---', val);
  this.searchFilters.transportMode = val;
  this.filteredServices = [];
  // FIX: Service popup ko band karenge
  this.showServicePopup = false;
  this.cdr.detectChanges();
}
// Variables declare karein
allUniqueInquiryNos: string[] = []; // Master list (Unique)
filteredInquiryNos: string[] = [];  // Suggestions for UI
// --- Pricing Number Search Variables ---
showPricingPopup: boolean = false;
allUniquePricingNos: string[] = []; 
masterPricingList: string[] = []; // Backup ke liye
filteredPricingNos: string[] = [];
// 1. Isko ngOnInit mein ek hi baar call karo
loadPricingNumbers() {
  const token = localStorage.getItem('cavalier_token');
  const headers = { 'Authorization': `Bearer ${token}` };

  this.http.get<any[]>(`${environment.apiUrl}/Pricing`, { headers }).subscribe({
    next: (data) => {
      const rawNumbers = data
        .map(item => item.pricingNo)
        .filter(n => n);

      this.masterPricingList = [...new Set(rawNumbers)]; // Backup list
      this.allUniquePricingNos = [...this.masterPricingList]; // Display list
    },
    error: (err) => console.error("Error:", err)
  });
}

// 2. Icon click par bina kisi delay ke modal kholna
togglePricingPopup() {
  this.showPricingPopup = !this.showPricingPopup;
  this.allUniquePricingNos = [...this.masterPricingList]; // List reset karo instantly
  
  // 🔥 Ye magic line hai: UI ko turant update karega
  this.cdr.detectChanges(); 
}
// 1. Main Field me type karne par chalne wala function (Inline Dropdown ke liye)


// 2. Modal ke andar search box me type karne par chalne wala function
// ---- 1. Icon (🔍) Clicked - Map response object to string array ----
openPricingModal() {
  console.log('--- 🔍 Icon Clicked: openPricingModal() Triggered ---');
  this.showPricingPopup = true;

  const fullUrl = `${environment.apiUrl}/pricing`; 
  console.log('Fetching directly from target API URL:', fullUrl);

  this.http.get(fullUrl).subscribe({
    next: (response: any) => {
      console.log('Backend API Raw Response:', response);
      
      // FIX: Pehle response.data check karenge, fir usme se sirf pricingNo ki string nikalenge
      if (response && response.data && Array.isArray(response.data)) {
        this.masterPricingList = response.data.map((item: any) => item.pricingNo);
      } else {
        this.masterPricingList = [];
      }
      
      console.log('Master list stored locally (Strings only):', this.masterPricingList);

      // Ab yeh safely spread (...) ho jayega kyunki yeh pure array hai
      this.allUniquePricingNos = [...this.masterPricingList];
      console.log('Modal rendering data sequence ready:', this.allUniquePricingNos);

      this.cdr.detectChanges(); // UI Update
    },
    error: (error: any) => {
      console.error('API call directly failed! Trace:', error);
      this.cdr.detectChanges();
    }
  });
}

// ---- 2. Main Input Change Observer (Dropdown Control) ----
onPricingNoType() {
  const query = this.searchFilters.pricingNo ? this.searchFilters.pricingNo.trim().toLowerCase() : '';
  console.log('--- ⌨️ Main Input Event Tracked ---');
  console.log('Normalized query filter:', query);

  if (query.length >= 3) {
    // FIX: ensure masterPricingList string array hi ho
    this.filteredPricingNos = this.masterPricingList.filter((pNo: any) => 
      pNo && pNo.toLowerCase().includes(query)
    );
    console.log(`Matches found (>= 3 chars): ${this.filteredPricingNos.length}`, this.filteredPricingNos);
  } else {
    this.filteredPricingNos = [];
    console.log('Query string too short (< 3 chars). Dropdown hidden.');
  }
  
  this.cdr.detectChanges(); 
}

// ---- 3. Modal Inner Filtration Control ----
filterPricingList(event: any) {
  const searchTerm = event.target.value ? event.target.value.toLowerCase().trim() : '';
  console.log('--- 📦 Inner Modal Searching ---');
  
  if (!searchTerm) {
    this.allUniquePricingNos = [...this.masterPricingList];
    console.log('Search field empty. Reverted back to full master dataset.');
  } else {
    // FIX: safe check lagaya taaki lowercase crash na ho
    this.allUniquePricingNos = this.masterPricingList.filter((pNo: any) =>
      pNo && pNo.toLowerCase().includes(searchTerm)
    );
    console.log(`Filtered result subset size: ${this.allUniquePricingNos.length}`, this.allUniquePricingNos);
  }
  
  this.cdr.detectChanges(); 
}

// ---- Helper Option Selection Control ----
selectPricingNumber(num: string) {
  console.log('--- 🎯 Selection Event Fired ---', num);
  
  this.searchFilters.pricingNo = num;
  this.filteredPricingNos = [];      // Suggestion List reset
  this.showPricingPopup = false;     // Modal close
  
  this.cdr.detectChanges();
}

// 3. Ek extra helper function (Modal kholte waqt list ko reset karne ke liye)
// Isko aap tab trigger karna jab 🔍 button par click karke modal open ho

// 3. Modal ke andar search - Ab ye bina API ke chalega (Local Search)

// 2. Ye raha wo function jo error de raha hai


loadInquiryNumbers() {
  // 1. Token nikaalna (Local storage se ya jahan aapne save kiya ho)
  const token = localStorage.getItem('cavalier_token'); 

  // 2. Headers create karna
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // 3. Authorized Get Request
  this.http.get<any[]>(`${environment.apiUrl}/Inquiry`, { headers }).subscribe({
    next: (data) => {
      // InquiryNo nikaal kar null/undefined hatao
      const rawNumbers = data
        .map(item => item.inquiryNo)
        .filter(n => n !== null && n !== undefined && n !== '');

      // Duplicates hatao
      this.allUniqueInquiryNos = [...new Set(rawNumbers)];
      
      console.log("Authorized Unique Inquiry Numbers Loaded", this.allUniqueInquiryNos);
    },
    error: (err) => {
      console.error("Authorization failed or API error:", err);
      // Agar token expire ho jaye toh yahan logic handle kar sakte hain
    }
  });
}

onInquiryType() {
  // Query ko authorize/sahi karna (3 words logic)
  const query = this.searchFilters.inquiryNo ? String(this.searchFilters.inquiryNo).trim().toLowerCase() : '';

  if (query.length >= 3) {
    this.filteredInquiryNos = this.allUniqueInquiryNos.filter(num => 
      num && String(num).toLowerCase().includes(query)
    );
  } else {
    this.filteredInquiryNos = []; // 3 se kam par suggestions hide
  }
}
// Variables declare karein
allUniqueCoordinators: string[] = []; // Master list (Unique Names)
filteredCoordinators: string[] = [];  // Suggestions for UI

loadCoordinators() {
  // 1. Authorization Token nikalna
  const token = localStorage.getItem('cavalier_token');

  // 2. Headers mein token set karna
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  this.http.get<any[]>(`${environment.apiUrl}/Inquiry`, { headers }).subscribe({
    next: (data) => {
      // 3. Null check aur string safety ke saath data map karna
      const rawCoords = data
        .map(item => item.salesCoordinator)
        .filter(c => c !== null && c !== undefined && String(c).trim() !== '');

      // 4. Duplicate hatana
      this.allUniqueCoordinators = [...new Set(rawCoords)];
      console.log("Authorized Coordinators Loaded:", this.allUniqueCoordinators.length);
    },
    error: (err) => {
      console.error("Coordinator load error (Auth Fail?):", err);
    }
  });
}

// 🔥 Typing ke waqt filter karne wala function
onCoordinatorType() {
  // 1. Query ko authorize/validate karna
  const query = this.searchFilters.salesCoordinator 
    ? String(this.searchFilters.salesCoordinator).trim().toLowerCase() 
    : '';

  // 2. Logic: Exact 3 ya usse zyada characters par hi suggestions aayenge
  if (query.length >= 3) {
    this.filteredCoordinators = this.allUniqueCoordinators.filter(name => 
      name && String(name).toLowerCase().includes(query)
    );
    console.log("Suggestions Found:", this.filteredCoordinators.length);
  } else {
    // 3. Agar user backspace dabake 3 se kam kar de, toh list turant khali
    this.filteredCoordinators = [];
  }
}
// Variables declare karein
allUniqueBranches: string[] = []; // Master list (Unique Names)
filteredBranches: string[] = [];  // Suggestions for UI

loadBranches() {
  this.http.get<any[]>(`${environment.apiUrl}/Inquiry`).subscribe({
    next: (res) => {
      // 1. Saare branchName nikalo aur duplicates hatane ke liye Set use karo
      // Agar API se array of strings aa raha hai to seedha res use karo
      const rawBranches = res.map(item => item.branchName || item).filter(b => b);
      this.allUniqueBranches = [...new Set(rawBranches)];
      console.log("Unique Branches Loaded");
    },
    error: (err) => console.error("Branch load error:", err)
  });
}

// 🔥 Typing ke waqt trigger hone wala function
onBranchType() {
  const query = this.searchFilters.branchName ? this.searchFilters.branchName.trim().toLowerCase() : '';

  // 2. Logic: 3 letter ke baad suggestions dikhao
  if (query.length >= 3) {
    this.filteredBranches = this.allUniqueBranches.filter(branch => 
      branch.toLowerCase().includes(query)
    );
  } else {
    // 3 se kam par list khali
    this.filteredBranches = [];
  }
}
isAdvanceFilterVisible: boolean = false; // Default mein band rahega

toggleAdvanceFilter() {
  this.isAdvanceFilterVisible = !this.isAdvanceFilterVisible;
}
onClear() {
  // 1. Saari fields ko default values par set karein
  this.searchFilters = {
    transportMode: 'Any',
    inquiryNo: '',
    branchName: '',
    salesCoordinator: '',
    cargoStatus: '(Any)',
    receivedDate: null,
    showMode: 'valid'
  };
  this.searchDone = false;      // "No Data Found" hat jayega
  this.inquiries = [];

  // 2. Clear karne ke baad wapas sara data load karein (bina filter ke)
  this.onSearch(); 
  
  console.log("Filters Cleared!");
}

showCustomPicker: boolean = false;

// 2. Logic for all shortcuts
// Add these variables in your class
showDateDropdown = false;

setQuickDate(range: string) {
  const today = new Date();
  let from = new Date();
  let to = new Date();

  switch (range) {
    case 'today': break;
    case 'yesterday': from.setDate(today.getDate() - 1); to.setDate(today.getDate() - 1); break;
    case 'lastWeek': from.setDate(today.getDate() - 7); break;
    case 'lastMonth': from.setMonth(today.getMonth() - 1); break;
    case 'lastYear': from.setFullYear(today.getFullYear() - 1); break;
  }

  // Format YYYY-MM-DD for input fields
  this.searchFilters.fromDate = from.toISOString().split('T')[0];
  this.searchFilters.toDate = to.toISOString().split('T')[0];
  
  this.showDateDropdown = false;
  this.onSearch(); // Auto search after selection
}
pricings: any[] = [];             // Master display list
     // Table mein jo loop ho raha hai
  allPricingData: any[] = [];       // Backend se aaya hua full search result
  

  // --- Pagination Variables ---
 

  // --- Filter Model ---
  searchFilters: any = {
    pricingNo: '',
    transportMode: '',
    organisationName: '',
    fromDate: null,
    toDate: null,
    branchIds: [],
    status: -1
  };




// 2. Updated Search Function with Date
onSearch() {
  // 1. Agar filters khali hain, to simple loadPricings (GET) call karo
  const isBlank = !this.searchFilters.pricingNo && 
                  !this.searchFilters.transportMode && 
                  !this.searchFilters.organisationName && 
                  (this.searchFilters.status === "" || this.searchFilters.status === null) && 
                  !this.searchFilters.fromDate && 
                  !this.searchFilters.toDate &&
                  (!this.searchFilters.branchIds || this.searchFilters.branchIds.length === 0);

  if (isBlank) {
    this.currentPage = 1; 
    // Yahan apni default loading method call karein, e.g., this.loadPricings();
    return;
  }

  // 2. SEARCH WALA LOGIC (POST)
  const token = localStorage.getItem('cavalier_token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  let statusValue = -1;
  if (this.searchFilters.status !== "" && this.searchFilters.status !== null) {
    statusValue = Number(this.searchFilters.status);
  }

  const payload = {
    pricingNo: this.searchFilters.pricingNo || "",
    transportMode: this.searchFilters.transportMode || "",
    organisationName: this.searchFilters.organisationName || "",
    status: statusValue,
    fromDate: this.searchFilters.fromDate || null,
    toDate: this.searchFilters.toDate || null,
    branchIds: this.searchFilters.branchIds && this.searchFilters.branchIds.length > 0 ? this.searchFilters.branchIds : []
  };

  this.http.post<any[]>(`${environment.apiUrl}/Pricing/Search`, payload, { headers })
    .subscribe({
      next: (res: any) => {
        const rawData = Array.isArray(res) ? res : (res.data || []);
        
        this.pricings = rawData.map((item: any) => ({
          ...item,
          pricingNo: item.pricingNo || item.PricingNo || 'N/A',
          customerName: item.organisationName || item.customerName || 'N/A',
          inquiryNo: item.referenceByInquiryNo || item.inquiryNo || '-',
          transportMode: item.transportMode || '-',
          status: (item.status === 1 || item.status === true) ? 1 : 0,
          branchName: item.branchName || 'N/A'
        }));

        this.currentPage = 1;
        this.totalCount = this.pricings.length;
        this.paginatedPricings = this.pricings.slice(0, this.pageSize);
        
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("❌ Search failed:", err);
        this.pricings = [];
        this.paginatedPricings = [];
        this.totalCount = 0;
        this.cdr.detectChanges();
      }
    });
}
onPageChange(page: number) {
  this.currentPage = page;

  // Agar 'pricings' array mein data hai aur 'searchFilters' empty hai, 
  // toh hum "All" mode mein hain (Server-side pagination)
  const isSearchActive = this.pricings.length > 0 && 
                         (this.searchFilters.pricingNo || 
                          this.searchFilters.organisationName || 
                          this.searchFilters.transportMode || 
                          this.searchFilters.status !== "" || 
                          this.searchFilters.branchIds?.length > 0);

  if (isSearchActive) {
    // Client-side pagination (Search result ko slice karo)
    const startIndex = (page - 1) * this.pageSize;
    this.paginatedPricings = this.pricings.slice(startIndex, startIndex + this.pageSize);
  } else {
    // Server-side pagination (All data ke liye API call karo)
    this.onSearch(); 
  }
  
  this.cdr.detectChanges();
}


AllSearchprice(){
alert("All Price Search");
return;

}
  // --- Pagination Logic ---
  

  // --- Placeholder
isExportOpen = false;

toggleExportMenu() {
  this.isExportOpen = !this.isExportOpen;
}

// Click bahar ho toh dropdown band ho jaye
@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {
  this.isExportOpen = false;
}

printInquiries() {
  this.generatePrintLayout('print');
}

downloadInquiriesPDF() {
  this.isExportOpen = false;
  const printData = this.quotations.slice(0, 20);

  const element = document.createElement('div');
  element.style.padding = '40px';
  element.style.width = '1000px'; // Fixed width for better resolution
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  element.style.backgroundColor = '#ffffff';

  let rowsHtml = '';
  printData.forEach((q, index) => {
    // Zebra crossing effect (alternate row color)
    const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
    rowsHtml += `
      <tr style="background-color: ${bgColor}; border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px; color: #111827; font-weight: 600;">${q.id}</td>
        <td style="padding: 12px; color: #4b5563;">${q.inquiryNo}</td>
        <td style="padding: 12px; color: #4b5563;">${q.receivedDate ? new Date(q.receivedDate).toLocaleDateString('en-GB') : ''}</td>
        <td style="padding: 12px; color: #111827; text-transform: uppercase; font-size: 11px;">${q.customerName || ''}</td>
        <td style="padding: 12px; color: #4b5563;">${q.transportMode || ''}</td>
        <td style="padding: 12px;">
          <span style="background-color: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold;">
            ${q.cargoStatus || 'PENDING'}
          </span>
        </td>
      </tr>`;
  });

  element.innerHTML = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #4a3f3f; padding-bottom: 10px; margin-bottom: 20px;">
        <div>
          <h1 style="margin: 0; color: #4a3f3f; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Inquiry Report</h1>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 12px;">Generated on: ${new Date().toLocaleString()}</p>
        </div>
        <div style="text-align: right;">
          <h3 style="margin: 0; color: #111827;">Cavalier Logistics</h3>
          <p style="margin: 0; color: #6b7280; font-size: 10px;">Confidential Document</p>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <thead>
          <tr style="background-color: #4a3f3f; color: #ffffff; text-align: left;">
            <th style="padding: 15px 12px; font-size: 12px; text-transform: uppercase; border-top-left-radius: 4px;">ID</th>
            <th style="padding: 15px 12px; font-size: 12px; text-transform: uppercase;">Inquiry No</th>
            <th style="padding: 15px 12px; font-size: 12px; text-transform: uppercase;">Date</th>
            <th style="padding: 15px 12px; font-size: 12px; text-transform: uppercase;">Customer Name</th>
            <th style="padding: 15px 12px; font-size: 12px; text-transform: uppercase;">Mode</th>
            <th style="padding: 15px 12px; font-size: 12px; text-transform: uppercase; border-top-right-radius: 4px;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div style="margin-top: 30px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 10px;">
        <p style="color: #9ca3af; font-size: 10px;">This is a system generated report and does not require a physical signature.</p>
      </div>
    </div>
  `;

  document.body.appendChild(element);

  html2canvas(element, { 
    scale: 3, // Higher scale for crystal clear text
    useCORS: true,
    backgroundColor: '#ffffff'
  }).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Center the image if it's smaller than the page
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    pdf.save(`Inquiry_Summary_${new Date().getTime()}.pdf`);
    
    document.body.removeChild(element);
  });
}

private generatePrintLayout(mode: string) {
  this.isExportOpen = false;
  const printData = this.quotations.slice(0, 20);
  
  let rows = '';
  printData.forEach(q => {
    rows += `
      <tr>
        <td>${q.id}</td>
        <td><b>${q.inquiryNo}</b></td>
        <td>${q.receivedDate ? new Date(q.receivedDate).toLocaleDateString('en-GB') : ''}</td>
        <td style="text-transform: uppercase;">${q.customerName || ''}</td>
        <td>${q.transportMode || ''}</td>
        <td>${q.cargoStatus || ''}</td>
      </tr>`;
  });

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Inquiry_Records_${new Date().getTime()}</title>
          <style>
            @page { size: A4 landscape; margin: 10mm; }
            body { font-family: 'Segoe UI', sans-serif; margin: 20px; color: #333; }
            h2 { text-align: center; text-transform: uppercase; color: #4a3f3f; border-bottom: 2px solid #4a3f3f; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 12px 8px; text-align: left; font-size: 12px; }
            th { background-color: #f4f4f4; font-weight: bold; }
            tr:nth-child(even) { background-color: #fafafa; }
          </style>
        </head>
        <body>
          <h2>Inquiry Records Summary</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Inquiry No</th>
                <th>Date</th>
                <th>Customer Name</th>
                <th>Mode</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <script>
            window.onload = function() { 
              window.print(); 
              setTimeout(function() { window.close(); }, 100); 
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
downloadLeadsExcel() {
  this.isExportOpen = false;

  // Check karein ki data hai ya nahi
  if (!this.quotations || this.quotations.length === 0) {
    alert("Excel ke liye koi data nahi mila!");
    return;
  }

  // 1. Data prepare karein (Jo columns aapke table mein hain)
  const excelData = this.quotations.map(q => {
    return {
      'ID': q.id || '-',
      'Inquiry No': q.inquiryNo || '-',
      'Received Date': q.receivedDate ? new Date(q.receivedDate).toLocaleDateString('en-GB') : '-',
      'Customer Name': q.customerName || '-',
      'Transport Mode': q.transportMode || '-',
      'Status': q.cargoStatus || 'PENDING',
      'Branch': q.branchName || '-',
      'Coordinator': q.salesCoordinator || '-',
      'Shipment Type': q.shipmentType || '-'
    };
  });

  // 2. Worksheet create karein
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

  // 3. Columns ki width set karein taaki Excel saaf dikhe
  const colWidths = [
    { wch: 8 },  // ID
    { wch: 15 }, // Inquiry No
    { wch: 15 }, // Date
    { wch: 30 }, // Customer Name
    { wch: 15 }, // Mode
    { wch: 12 }, // Status
    { wch: 15 }, // Branch
    { wch: 20 }, // Coordinator
    { wch: 15 }  // Shipment Type
  ];
  ws['!cols'] = colWidths;

  // 4. Workbook banayein aur save karein
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inquiry Records');

  // File download trigger karein
  XLSX.writeFile(wb, `Inquiry_Report_${new Date().getTime()}.xlsx`);
}
// --- Pagination Variables ---
// Ek page par kitne records dikhane hain
protected readonly Math = Math; // Template mein Math functions use karne ke liye

// Computed property: Ye table mein sirf current page ka data filter karke bhejega
get paginatedInquiries(): any[] {
  const startIndex = (this.currentPage - 1) * this.pageSize;
  return this.quotations.slice(startIndex, startIndex + this.pageSize);
}

// Total pages calculate karne ke liye


// Page badalne ka function


// Page size badalne par page 1 par reset karein
onPageSizeChange() {
  this.currentPage = 1;
  this.cdr.detectChanges();
}
loadInquirySettings() {
  this.http.get<any>(`${environment.apiUrl}/InquiryColumnSettings`).subscribe(res => {
    if (res && res.selectedColumns) {
      this.selectedColumns = JSON.parse(res.selectedColumns);
      this.availableColumns = JSON.parse(res.availableColumns);
    }
  });
}
onCargoStatusChange() {
  if (this.quotation.cargoStatusType === 'Ready') {
    this.setTodayDate();
  } 
  else if (this.quotation.cargoStatusType === 'Ready By') {

    if (!this.quotation.cargoStatusDate) {
      this.setTodayDate();
    }

    setTimeout(() => {
      if (this.cargoDateInput?.nativeElement) {
        const input = this.cargoDateInput.nativeElement;

        input.focus();

        setTimeout(() => {
          input.click();

          try {
            (input as any).showPicker();
          } catch (e) {
            console.log("showPicker not supported");
          }
        }, 50);
      }
    }, 120);
  }
   
}
dropColumn(event: CdkDragDrop<string[]>) {
  if (event.previousContainer === event.container) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  } else {
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }

  // Auto-save to Database
  const payload = {
    id: 1,
    selectedColumns: JSON.stringify(this.selectedColumns),
    availableColumns: JSON.stringify(this.availableColumns)
  };
  this.http.post(`${environment.apiUrl}/InquiryColumnSettings/save`, payload).subscribe();
}
// inquiry.component.ts ke andar
showColumnModal: boolean = false; // Isko class properties mein add karein
// Variables declare karein
showServicePopup: boolean = false;
allTransportModes: string[] = [];
private serviceSub?: Subscription;

// 1. Icon click par popup toggle logic


// Popup se select karne par
selectServiceFromPopup(val: string) {
  this.searchFilters.transportMode = val;
  this.showServicePopup = false;
  this.cdr.detectChanges();
}

// 3. ngOnDestroy mein cleanup
ngOnDestroy() {
  // Purani subscriptions ke saath isse bhi add karein
  this.serviceSub?.unsubscribe();
   this.inqSub?.unsubscribe();
   this.branchSub?.unsubscribe();
    this.coordinatorSub?.unsubscribe();

}
// Variables declare karein
showInquiryPopup: boolean = false;
allInquiryNos: string[] = [];
private inqSub?: Subscription;

// 1. Icon click par toggle logic
toggleInquiryPopup() {
  if (this.showInquiryPopup) {
    this.showInquiryPopup = false;
    this.cdr.detectChanges();
    return;
  }

  // 1. Token nikaalo
  const token = localStorage.getItem('cavalier_token'); 
  if (!token) {
    console.warn("Bhai login token nahi mila!");
    return;
  }

  // 2. Headers mein pass karo
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  this.inqSub?.unsubscribe();

  // 3. API Call with Headers
  this.inqSub = this.http.get<any[]>(`${environment.apiUrl}/Inquiry`, { headers }).subscribe({
    next: (res) => {
      // Inquiry No. nikalna aur Unique banana
      const uniqueInqs = [...new Set(
        res
          .filter(item => item.inquiryNo && item.inquiryNo.trim() !== "")
          .map(item => item.inquiryNo)
      )];

      this.allInquiryNos = uniqueInqs;
      this.showInquiryPopup = true;
      this.cdr.detectChanges(); 
      console.log("Inquiry list loaded with token");
    },
    error: (err) => {
      console.error("Error fetching Inquiries", err);
      this.showInquiryPopup = false;
      this.cdr.detectChanges();
    }
  });
}

selectInquiryFromPopup(val: string) {
  this.searchFilters.inquiryNo = val;
  this.showInquiryPopup = false;
  this.cdr.detectChanges();
}
// Variables declare karein
showBranchPopup: boolean = false;
allCustomerNames: string[] = [];
private branchSub?: Subscription;

// 1. Icon click par popup toggle logic
toggleBranchPopup() {
  if (this.showBranchPopup) {
    this.showBranchPopup = false;
    this.cdr.detectChanges();
  } else {
    this.branchSub?.unsubscribe();

    // API call to Inquiry (ya jo bhi aapka endpoint hai)
    this.branchSub = this.http.get<any[]>(`${environment.apiUrl}/Inquiry`).subscribe({
      next: (res) => {
        // customerName nikalna, empty values hatana aur Duplicates khatam karna
        const uniqueCustomers = [...new Set(
          res
            .filter(item => item.customerName && item.customerName.trim() !== "") // Sample mein 'organization' naam tha
            .map(item => item.customerName) 
        )];

        this.allCustomerNames = uniqueCustomers;
        this.showBranchPopup = true;
        this.cdr.detectChanges(); // Fast UI refresh
      },
      error: (err) => {
        console.error("Error fetching customers", err);
        this.cdr.detectChanges();
      }
    });
  }
}

// 2. Popup se select karne par
selectBranchFromPopup(val: string) {
  this.searchFilters.branchName = val;
  this.showBranchPopup = false;
  this.cdr.detectChanges();
}

// Variables declare karein
showCoordinatorPopup: boolean = false;
allCoordinators: string[] = [];
private coordinatorSub?: Subscription;

// 1. Icon click par popup toggle logic
toggleCoordinatorPopup() {
  if (this.showCoordinatorPopup) {
    this.showCoordinatorPopup = false;
    this.cdr.detectChanges();
    return;
  }

  // 1. Token nikaalo
  const token = localStorage.getItem('cavalier_token'); 
  if (!token) {
    console.warn("Bhai login token nahi mila!");
    return;
  }

  // 2. Headers mein pass karo
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  this.coordinatorSub?.unsubscribe();

  // 3. API Call with Headers
  this.coordinatorSub = this.http.get<any[]>(`${environment.apiUrl}/Inquiry`, { headers }).subscribe({
    next: (res) => {
      // SalesCoordinator nikalna, empty values filter karna aur Duplicates hatana
      const uniqueCoords = [...new Set(
        res
          .filter(item => item.salesCoordinator && item.salesCoordinator.trim() !== "")
          .map(item => item.salesCoordinator)
      )];

      this.allCoordinators = uniqueCoords;
      this.showCoordinatorPopup = true;
      this.cdr.detectChanges(); 
      console.log("Coordinator list loaded with token");
    },
    error: (err) => {
      console.error("Error fetching Coordinators", err);
      this.showCoordinatorPopup = false;
      this.cdr.detectChanges();
    }
  });
}

// Popup se select karne par
selectCoordinatorFromPopup(val: string) {
  this.searchFilters.salesCoordinator = val;
  this.showCoordinatorPopup = false;
  this.cdr.detectChanges();
}

// 3. Subscription Cleanup in ngOnDestroy

// 1. Naya variable add karein
isPreviewMode = false;

// 2. Review Mode toggle karne ka function
toggleReview() {
  // Calling the unified structural dynamic data flow layout matrix system architecture
  this.addToLocalReview();
}

// 3. Wapas edit mode mein jaane ke liye
// backToEdit() {
//   this.isPreviewMode = false;
// }

// 1. Naya variable add karein
// isPreviewMode = false;
// 1. Array define karein review list ke liye
localInquiryList: any[] = [];
// isPreviewMode: boolean = false;

// 2. Review Mode toggle karne ka function (With Data Mapping)
// addToLocalReview() {
//   console.log("--- Review Button Clicked ---");

//   if (!this.inquiry.organization) {
//     alert("firstly save org");
//     return;
//   }

//   // 1. Check Modal Data (dimRows)
//   console.log("1. Raw dimRows from Modal:", this.dimRows);

//   // 2. Check Applied Data (appliedDimensions)
//   console.log("2. Raw appliedDimensions:", this.appliedDimensions);

//   let finalDimensions = [];

//   // Agar dimRows array hai aur usme data hai
//   if (this.dimRows && this.dimRows.length > 0) {
//     // Filter kar rhe hain taaki khali rows na aayein
//     finalDimensions = this.dimRows.filter(d => d.l || d.w || d.h);
//     console.log("3. Filtered Dimensions from dimRows:", finalDimensions);
//   } 
  
//   // Agar dimRows khali tha, toh appliedDimensions check karo
//   if (finalDimensions.length === 0 && this.appliedDimensions && this.appliedDimensions.length > 0) {
//     finalDimensions = [...this.appliedDimensions];
//     console.log("4. Using appliedDimensions instead:", finalDimensions);
//   }

//   if (finalDimensions.length === 0) {
//     console.warn("⚠️ No dimensions found anywhere!");
//   }

//   const completeData = {
//     lineOfBusiness: this.getLabel(this.companyServices, this.quotation.lineOfBusinessId),
//     commodity: this.getLabel(this.commodityTypes, this.quotation.commodityId),
//     incoTerm: this.quotation.incoTerm || 'N/A',
//     cargoStatus: this.quotation.cargoStatus || 'Pending',
//     noOfPkgs: this.quotation.noOfPkgs || 0,
//     grossWeight: this.quotation.grossWeightKg || 0,
//     chargeableWeight: this.quotation.chargeableWeight || 0,
//     origin: this.inquiry.origin || 'N/A',
//     finalDestination: this.quotation.finalDestination || 'N/A',
//     pickupAddress: this.quotation.pickupAddress || 'N/A',
//     dimensions: finalDimensions // Snapshot mein save kiya
//   };

//   this.localInquiryList = [completeData];
//   console.log("5. Final Snapshot Saved:", this.localInquiryList);
  
//   this.isPreviewMode = true;
// }

  // Readable Snapshot banana (IDs ko Labels mein convert karke)
//   const completeData = {
//     // Admin & References
//     leadNo: this.inquiry.leadNo || 'N/A',
//     branchName: this.quotation.branchName || 'N/A',
//     inquiryNo: this.inquiry.inquiryNo || 'N/A',
//     location: this.quotation.location || 'N/A',
//     receivedDate: this.quotation.receivedDate,
    
//     // Customer & Business
//     organization: this.inquiry.organization,
//     partyRole: this.getSimpleLabel(this.quotation.partyRole),
//     lineOfBusiness: this.getLabel(this.companyServices, this.quotation.lineOfBusinessId), 
//     quotedBy: this.quotation.createdBy || 'Current User',
//     pricingBy: this.quotation.pricingBy || 'N/A',
    
//     // Cargo Details
//     transportMode: this.quotation.transportMode || 'N/A',
//     shipmentType: this.quotation.shipmentType || 'N/A',
//     commodity: this.getLabel(this.commodityTypes, this.quotation.commodityId),
//     cargoStatus: this.quotation.cargoStatus || 'Pending',
//     hazardDoc: this.quotation.hazardDocPath || 'None',
    
//     // Weights
//     grossWeight: this.quotation.grossWeightKg || 0,
//     netWeight: this.quotation.netWeightKg || 0,
//     chargeableWeight: this.quotation.chargeableWeight || 0,
//     noOfPkgs: this.quotation.noOfPkgs || 0,
    
//     // Forwarding & Movement
//     incoTerm: this.quotation.incoTerm || 'N/A',
//     movementType: this.quotation.movementType || 'N/A',
//     origin: this.inquiry.origin || 'N/A',
//     portOfLoading: this.getLabel(this.ports, this.quotation.portOfLoadingId),
//     portOfDischarge: this.getLabel(this.ports, this.quotation.portOfDischargeId),
//     finalDestination: this.quotation.finalDestination || 'N/A',
//     pickupAddress: this.quotation.pickupAddress || 'N/A',
//     invoiceStatus: this.quotation.invoiceStatus || 'N/A',
    
//     // Dimensions
//     dimensions: this.appliedDimensions.length > 0 ? [...this.appliedDimensions] : []
//   };

//   this.localInquiryList = [completeData]; // Update snapshot
//   this.isPreviewMode = true; 
// }

// 3. Wapas edit mode mein jaane ke liye
backToEdit() {
  this.isPreviewMode = false;
}

// 4. Helper function to get Label from ID (Handles different list structures)
getLabel(list: any[], id: any): string {
  if (!id || !list || list.length === 0) return 'N/A';
  
  const found = list.find(x => 
    x.id == id || 
    x.serviceId == id || 
    x.commodityId == id || 
    x.portId == id ||
    x.value == id
  );

  return found ? (found.serviceName || found.commodityName || found.name || found.portName || found.text) : id;
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
// 5. Helper for simple strings
getSimpleLabel(val: any): string {
  return val ? val : 'N/A';
}// Variables wahi use karein jo HTML mein *ngIf aur *ngFor mein hain
showInquiryDropdown: boolean = false;
filteredInquiries: any[] = [];
loadAllLeads() {
  if (this.showInquiryDropdown) {
    this.showInquiryDropdown = false;
    return;
  }

  const url = `${environment.apiUrl}/Leads`;
  
  this.http.get<any[]>(url).subscribe({
    next: (res) => {
      this.filteredInquiries = res; 
      this.showInquiryDropdown = true; 
      
      // Ye line UI ko turant refresh kar degi
      this.cdr.detectChanges(); 
      
      console.log(res, "Leads response loaded");
    },
    error: (err) => {
      console.error("Leads load karne mein error:", err);
      this.showInquiryDropdown = false;
      this.cdr.detectChanges(); // Error case mein bhi UI update karein
    }
  });
}

// Variables define karein
showOrgDropdown: boolean = false;
organizationList: any[] = [];

// Constructor mein CDR inject hona chahiye


loadAllOrganizations() {
  // Toggle logic
  if (this.showOrgDropdown) {
    this.showOrgDropdown = false;
    this.cdr.detectChanges();
    return;
  }
  
  // 1. Token nikaalo
  const token = localStorage.getItem('cavalier_token'); 
  if (!token) {
    console.warn("Bhai login token nahi mila!");
    return;
  }

  const url = `${environment.apiUrl}/Organization/list`;
  
  this.http.get<any[]>(url).subscribe({
    next: (res) => {
      this.organizationList = res; 
      this.showOrgDropdown = true; 
      
      // CDR: UI ko turant refresh karne ke liye
      this.cdr.detectChanges(); 
      
      console.log(res, "Organization list loaded");
    },
    error: (err) => {
      console.error("Org load error:", err);
      this.showOrgDropdown = false;
      this.cdr.detectChanges();
    }
  });
}

filterTransportModes(event: any) {
  // Baad mein logic likh lena
}
filterInquiryList(event: any) {
  // Baad mein logic likh lena
}
filterCoordinatorList(event: any) {
  // Baad mein logic likh lena
}
isSearchModalOpen: boolean = false;
loadAllLeadss() {
  // Toggle logic
  if (this.showInquiryDropdown || this.showLeadDropdown) {
    this.showInquiryDropdown = true;
    this.showLeadDropdown = true;
    this.isSearchModalOpen = true;
    this.cdr.detectChanges();
    return;
  }

  // 1. Token nikaalo
  const token = localStorage.getItem('cavalier_token'); 
  if (!token) {
    console.warn("Bhai login token nahi mila!");
    return;
  }

  // 2. Headers set karo
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  const url = `${environment.apiUrl}/leads`; // Ya jo bhi tumhara Leads ka endpoint ho
  
  // 3. API Call with Token
  this.http.get<any[]>(url, { headers }).subscribe({
    next: (res) => {
      this.filteredInquiries = res; 
      this.showInquiryDropdown = true; 
      this.cdr.detectChanges(); 
      console.log("Leads loaded with token");
    },
    error: (err) => {
      console.error("Error fetching leads:", err);
      this.showInquiryDropdown = false;
      this.cdr.detectChanges();
    }
  });
}

// Selection Function
// selectInquiry(inq: any) {
//   if (!inq) {
//     console.warn("Invalid lead selected");
//     return;
//   }

//   // 🔥 Yahan Lead ID console mein dikhega
//   console.log("Selected Lead ID (from Modal):", inq);
//  this.LeadId = inq.id;
//   this.OrganisationId = inq.organisationId; 
//   this.OrganisationName = inq.organizationName;
//   this.LeadName = inq.leadNo;
//   console.log("Selected Lead's Organisation ID:", inq.organisationId);
//   this.inquiry.leadNo = inq.leadNo || inq.inquiryNo;
//   this.showInquiryDropdown = false;
//   this.isSearchModalOpen = false;

//   // Full data load karne ke liye
//   this.loadLeadByLeadNo(this.inquiry.leadNo);
// }
// ================== LOAD FULL LEAD BY LEADNO ==================
// ================== LOAD FULL LEAD BY LEADNO ==================
// loadLeadByLeadNo(leadNo: string) {
//   if (!leadNo) return;

//   const url = `${environment.apiUrl}/Leads/byLeadNo?leadNo=${encodeURIComponent(leadNo)}`;

//   this.http.get<any>(url).subscribe({
//     next: (leadData) => {
//       console.log("✅ Full Lead Data Received:", leadData);

//       this.selectedLeadData = leadData;

//       // Form auto-fill
//       this.inquiry.leadNo = leadData.leadNo || leadData.LeadNo;

//       if (leadData.organizationName) {
//         this.inquiry.organization = leadData.organizationName;
//         this.quotation.organizationName = leadData.organizationName;
//       }
//       if (leadData.organisationId) {
//         this.organizationIds = leadData.organisationId;
//       }

//       if (leadData.location) this.quotation.location = leadData.location;
//       if (leadData.branch) this.quotation.branchName = leadData.branch;
//       if (leadData.type) this.quotation.type = leadData.type;
// if (leadData.salesCoordinator) {
//         // Lead se "25" jaise ID aa raha hai
//         this.quotation.salesCoordinator = leadData.salesCoordinator.toString(); 
//         // .toString() isliye taaki type match ho (agar sc.id number hai toh bhi safe rahe)
//       }
//       this.cdr.detectChanges();
//     },
//     error: (err) => {
//       console.error("❌ Error fetching lead:", err);
//       if (err.status === 404) {
//         alert(`Lead ${leadNo} not found!`);
//       } else {
//         alert("Failed to load lead details");
//       }
//     }
//   });
// }
branchList: any[] = [];           
filteredBranchSuggestions: any[] = []; 
isBranchModalOpen: boolean = false;
branchSearchText: string = '';  // Main Input ke liye
modalSearchText: string = '';   // Modal ke andar search ke liye


loadBranchess() {
  const fullUrl = `${environment.apiUrl}/branch/list`;
  console.log("📡 Calling API:", fullUrl);

  this.http.get(fullUrl).subscribe({
    next: (res: any) => {
      console.log("✅ API Raw Response:", res);

      // Data formats handle karna
      const data = Array.isArray(res) ? res : (res.data || res.result || []);
      console.log("📊 Extracted Data Array:", data);

      if (data.length === 0) {
        console.warn("⚠️ Warning: API returned empty array!");
      }

      this.branchList = data.map((b: any) => ({ 
        ...b, 
        isSelected: false 
      }));

      this.filteredBranchSuggestions = [...this.branchList];
      console.log("📋 branchList mapped & ready:", this.branchList);
    },
    error: (err) => {
      console.error("❌ API Load Failed!", err);
    }
  });
}

// Main Input ki search (Dropdown ke liye)
onBranchSearch() {
  const search = this.branchSearchText.toLowerCase().trim();
  console.log("🔍 Main Input Search Text:", search);

  if (!search) {
    this.filteredBranchSuggestions = [...this.branchList];
    console.log("🔄 Search empty, reset list to:", this.filteredBranchSuggestions.length);
    return;
  }

  this.filteredBranchSuggestions = this.branchList.filter(b => 
    b.branchName?.toLowerCase().includes(search) || 
    b.branchCode?.toLowerCase().includes(search)
  );

  console.log("🎯 Main Search Results Found:", this.filteredBranchSuggestions.length);
}

// Modal ke andar ki search
onModalSearch() {
  const search = this.modalSearchText.toLowerCase().trim();
  console.log("🔍 Modal Search Text:", search);

  if (!search) {
    this.filteredBranchSuggestions = [...this.branchList];
    console.log("🔄 Modal Search empty, showing all:", this.filteredBranchSuggestions.length);
    return;
  }

  this.filteredBranchSuggestions = this.branchList.filter(b => 
    b.branchName?.toLowerCase().includes(search) || 
    b.branchCode?.toLowerCase().includes(search)
  );

  console.log("🎯 Modal Search Results Found:", this.filteredBranchSuggestions.length);
}

toggleBranchModal() { 
  this.isBranchModalOpen = !this.isBranchModalOpen; 
  console.log("📦 Modal Status:", this.isBranchModalOpen ? "OPENED" : "CLOSED");

  if (this.isBranchModalOpen) {
    this.modalSearchText = ''; 
    this.filteredBranchSuggestions = [...this.branchList]; 
    console.log("💎 Data available for Modal:", this.filteredBranchSuggestions.length);
    
    if (this.filteredBranchSuggestions.length === 0) {
      console.error("🚨 Error: branchList is empty when opening modal!");
    }
  }
}

toggleBranchSelection(branch: any) { 
  branch.isSelected = !branch.isSelected; 
  console.log(`✅ Toggled Branch: ${branch.branchName} | Selected: ${branch.isSelected}`);
}

confirmSelection() {
  console.log("🆗 Confirming Selection...");
  
  // 1. Saari selected branches nikaalo
  const selectedBranches = this.branchList.filter(b => b.isSelected);
  console.log("📍 Selected Branches:", selectedBranches);

  if (selectedBranches.length > 0) {
    // 2. 🔥 Sabki IDs ka array banao (Multiple select ke liye)
    // Map karke check karo ki property 'id' hai ya 'branchId'
    this.searchFilters.branchIds = selectedBranches.map(b => b.branchId || b.id);
    
    // 3. Input box mein saare selected names dikhao (comma separated)
    this.branchSearchText = selectedBranches.map(b => b.branchName).join(', ');
    
    // Agar aapka backend purana hai aur sirf ek ID leta hai, 
    // toh purani property bhi set rakhte hain (safe side)
    this.searchFilters.branchId = selectedBranches[0].branchId || selectedBranches[0].id;

  } else {
    // Agar kuch select nahi kiya toh sab khali
    this.searchFilters.branchIds = [];
    this.searchFilters.branchId = '';
    this.branchSearchText = '';
  }

  console.log("📝 Input field updated to:", this.branchSearchText);
  console.log("🆔 Array of IDs saved in filters:", this.searchFilters.branchIds);

  this.isBranchModalOpen = false;

  // 4. Search function ko call karo taaki table refresh ho jaye
  this.onSearch();
}

selectBranchFromDropdown(branch: any) {
  console.log("🖱️ Direct dropdown selection:", branch.branchName);
  branch.isSelected = true;
  this.confirmSelection(); 
  this.filteredBranchSuggestions = []; 
}
// isFormOpen: boolean = true;
showCostTable: boolean = false;
showMultiCarrierTable: boolean = false;
toggleTable(value: boolean) {
  console.log("Button clicked! Setting showCostTable to:", value);
  this.showCostTable = value;
}
services = [
    { serviceName: 'Standard' },
    { serviceName: 'Express' },
    { serviceName: 'Economy' }
  ];

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

  // 3. Cost Rows ka Array
  
  // costRows: any[] = [
  //   {
  //     lob: 'Standard',
  //     chargeName: '',
  //     chargeType: '',
  //     basis: '',
  //     currency: 'INR',
  //     rate: 0,
  //     exchangeRate: 1,
  //     amount: 0
  //   }
  // ];



  // --- LOGIC FUNCTIONS ---

  // Nayi row add karne ke liye
//   showAlert(type: string, id: any) {
//   // Agar ID null ya undefined hai toh handle karne ke liye
//   const displayId = id ? id : 'N/A';

//   if (type === 'Organisation ID') {
//     const orgId = id ? id : 'N/A';
//     this.router.navigate(['/dashboard/organization-add'], { 
//       queryParams: { highlightId: orgId } 
//     });
//   } 
//   else if (type === 'Lead ID') {
//     const leadId = id ? id : 'N/A';
//     this.router.navigate(['/dashboard/salescrm/lead'], { 
//       queryParams: { highlightId: leadId } 
//     });
//   }
//   else {
//     alert('Action performed: ' + type);
//   }
// }
addCostRow() {
  const newRow: any = {
    lob: 'Standard',
    chargeName: '',
    chargeType: 'Prepaid',
    basis: '',
    basisUnit: 'KG',    // Bina interface mein likhe yahan add ho jayega
    basisValue: 1,      // Bina interface mein likhe yahan add ho jayega
    currency: 'INR',
    rate: 0,
    exchangeRate: 1,
    amount: 0
  };
  this.costRows.push(newRow);
}

  // Row delete karne ke liye (Index base par)
  removeCostRow(index: number) {
    if (this.costRows.length > 1) {
      this.costRows.splice(index, 1);
      this.calculateCost(); // Delete ke baad total recalculate karne ke liye
    }
  }

  // Calculation Logic: Amount = Rate * Exchange Rate
// calculateCost() {
//   this.costRows.forEach((row: any) => { // Yahan 'any' cast kar diya
//     const basisVal = Number(row.basisValue) || 0;
//     const rate = Number(row.rate) || 0;
   
    
//     row.amount = basisVal * rate;
//   });
// }
calculateCost() {
  const chargeableWeight = Number(this.quotation.chargeableWeight) || 0;

  this.costRows.forEach((row: any) => {
    const rate = Number(row.rate) || 0;
    const exchangeRate = Number(row.exchangeRate) || 1; // Agar exchange rate empty hai to 1 le lo

    // Sahi formula: Weight * Rate * Ex. Rate
    row.amount = chargeableWeight * rate * exchangeRate;
  });

  // Agar UI update nahi ho raha, to ye line jaruri hai
  this.cdr.detectChanges();
}
openCalendar(input: HTMLInputElement) {
  try {
    // Cast to any to bypass strict TS check
    (input as any).showPicker();
  } catch (error) {
    // Fallback agar browser support na kare
    input.click();
  }
}
  // Final Save Logic
  applyCost() {
    console.log('Final Cost Data:', this.costRows);
    this.showCostTable = false; // Table close karke wapas form par
  }
// showCostTable: boolean = false; // Toggle handle karne ke liye
costRows: CostBreakdown[] = [
  { lob: 'Standard', chargeName: '', chargeType: 'Prepaid', basis: 'Per KG', currency: 'INR', rate: 0, exchangeRate: 1, amount: 0 }
];
  
  // Initial empty row
  multiCarrierRows: any[] = [this.createEmptyRow()];



 createEmptyRow() {
  return {
    id: 0,
    forwarder: '',
    origin: '',
    lob: 'Standard',           // Added for DB mapping
    chargeName: '',            // Added for DB mapping
    chargeType: 'Prepaid',     // Added for DB mapping
    currency: 'USD',
    airFreight: 0,
    fsc: 'INC',
    airline: '',
    type: 'INDIRECT',          // Default Indirect as per requirement
    cutoff: '',
    schedule: '',              // Flight Date/Schedule
    exWorks: 0,
    doCharges: 0,
    ccFee: 0,
    rate: 0,                   // Added for DB mapping
    exchangeRate: 1,           // Added for DB mapping
    totalCost: 0,
    remark: ''
  };
}

  calculateMultiTotal(i: number) {
    const r = this.multiCarrierRows[i];
    r.totalCost = (Number(r.airFreight) || 0) + 
                  (Number(r.exWorks) || 0) + 
                  (Number(r.doCharges) || 0) + 
                  (Number(r.ccFee) || 0);
  }
calculateIndirectCost(index: number) {
  const row = this.multiCarrierRows[index];
  if (row) {
    const basisValue = Number(row.basisValue) || 0;
    const rate = Number(row.rate) || 0;
    
    // Multi Carrier Formula calculation -> Basis Value * Rate
    row.amount = basisValue * rate;
  }
  this.cdr.detectChanges();
}
calculateMasterIndirectTotal(index: number) {
  const mRow = this.multiCarrierRows[index];
  if (mRow) {
    const chrgWeight = Number(this.quotation.chargeableWeight) || 0;
    const airfreightCost = Number(mRow.airFreight) || 0;
    const inputRate = Number(mRow.rate) || 0;
    const exchangeVal = Number(mRow.exchangeRate) || 1;

    // Premium Logic: Airfreight + (Chargeable Weight * Rate * Ex. Rate)
    mRow.totalCost = airfreightCost + (chrgWeight * inputRate * exchangeVal);
  }
  this.cdr.detectChanges();
}
addMultiCarrierRow() {
  const emptyRow = this.createEmptyRow();
  
  // 🔥 EXTENSION SECURITY: Nayi row bante hi existing active master filters check karega
  if (this.quotation.lineOfBusinessName) {
    emptyRow.lob = this.quotation.lineOfBusinessName; // Auto-selects active LOB inside new cell
  }
  if (this.inquiry.origin) {
    emptyRow.origin = this.inquiry.origin; // Direct validation match for origin
  }
  
  this.multiCarrierRows.push(emptyRow);
  this.cdr.detectChanges();
}

  removeMultiCarrierRow(index: number) {
    if (this.multiCarrierRows.length > 1) {
      this.multiCarrierRows.splice(index, 1);
    } else {
      this.multiCarrierRows[0] = this.createEmptyRow();
    }
  }

  applyAndSave() {
  // Is function ki ab zaroorat nahi padegi kyunki hum saveQuotation me sab bhej rahe hain.
  // Bas modal band karne ke liye aap iska use kar sakte hain.
  this.showMultiCarrierTable = false;
  alert('Carrier details added to Inquiry!');
}

loadPricings() {
  const token = localStorage.getItem('cavalier_token');
  const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

  // Pass pageNumber and pageSize as Query Params
  const url = `${environment.apiUrl}/Pricing?pageNumber=${this.currentPage}&pageSize=${this.pageSize}`;

  this.http.get(url, { headers }).subscribe({
    next: (res: any) => {
      // Backend returns { totalCount, data, ... }
      this.pricings = res.data; 
      this.totalCount = res.totalCount;
      this.cdr.detectChanges();
    },
    error: (err) => console.error("Error loading pricings:", err)
  });
}

// Function to handle page change
setPage(page: number) {
  if (page < 1 || page > this.totalPages) return;
  this.currentPage = page;
  this.onSearch();  // Fetch new data from server
}

get totalPages(): number {
  return Math.ceil(this.totalCount / this.pageSize) || 1;
}
updatePagination() {
  const startIndex = (this.currentPage - 1) * this.pageSize;
  const endIndex = startIndex + this.pageSize;
  
  // 'pricings' se data nikaal kar 'paginatedPricings' mein daalna
  this.paginatedPricings = this.pricings.slice(startIndex, endIndex);
}
saveQuotation() {
  if (!this.inquiry.organization) { 
    Swal.fire('Warning', 'Organization Name is required!', 'warning');
    return;
  }

  // Cost Breakdowns & MultiCarrier Payload mapping
  const costData = (this.costRows && this.costRows.length > 0 ? this.costRows : (this.costBreakdowns || [])).map((cb: any) => ({
    lob: cb.lob || '', chargeType: cb.chargeType || 'Prepaid', basis: cb.basis || '',
    chargeName: cb.chargeName || cb.charge || '', currency: cb.currency || 'INR',
    rate: Number(cb.rate) || 0, exchangeRate: Number(cb.exchangeRate) || 1, amount: Number(cb.amount) || 0
  }));

  const multiCarrierData = (this.multiCarrierRows || []).map((mcb: any) => ({
    id: Number(mcb.id) || 0, forwarder: mcb.forwarder || '', origin: mcb.origin || '',
    lob: mcb.lob || 'Standard', chargeName: mcb.chargeName || '', chargeType: mcb.chargeType || 'Prepaid',
    currency: mcb.currency || 'USD', airFreight: Number(mcb.airFreight) || 0, fsc: mcb.fsc || '',
    airline: mcb.airline || '', type: mcb.type || 'INDIRECT', cutoff: mcb.cutoff || '',
    schedule: mcb.schedule || '', exWorks: Number(mcb.exWorks) || 0, doCharges: Number(mcb.doCharges) || 0,
    ccFee: Number(mcb.ccFee) || 0, rate: Number(mcb.rate) || 0, exchangeRate: Number(mcb.exchangeRate) || 1,
    totalCost: Number(mcb.totalCost) || 0, remark: mcb.remark || ''
  }));

  const processedDocuments = (this.documents || []).map(d => ({ name: d.name, documentPath: (d.documentPath && !d.isReplacing) ? d.documentPath : null }));
  const processedInvoices = (this.invoices || []).map(i => ({ name: i.name, documentPath: (i.documentPath && !i.isReplacing) ? i.documentPath : null }));

  // Parent Payload Object
  const payload: any = {
    ...this.quotation, 
    invoiceList: this.quotation.invoiceList || '', 
    
    // Port Code Mapping
    CodeOfPOL: this.quotation.portOfLoadingCode || '',
    CodeOfPOD: this.quotation.portOfDestinationCode || '',
    CodeOfFinalDest: this.quotation.finalDestinationCode || '',
    
    // POD Origin mapping added here
    podOrigin: String(this.quotation.podOrigin || ''),
    
    inquiryNo: String(this.quotation.inquiryNo || this.inquiry.inquiryNo || ''),
    referenceByInquiryNo: this.referenceByInquiryNo || this.quotation.inquiryNo || this.inquiry.inquiryNo || null,
    
    transportMode: String(this.quotation.TransportMode || this.quotation.transportMode || ''), 
    transportType: String(this.quotation.TransportType || this.quotation.transportType || ''),
    serviceType: String(this.quotation.TransportType || this.quotation.transportType || ''), 
    
    shipmentType: (this.quotation.shipmentType || this.inquiry.shipmentType || "").toString(),
    countryName: (this.quotation.countryName || this.selectedCountryName || "").toString(),     
    connectingPortIds: Array.isArray(this.quotation.connectingPortIds) ? this.quotation.connectingPortIds.join(',') : (this.quotation.connectingPortIds || ""),
    
    OrganisationId: this.organisationId || 0,
    OrganisationName: this.organisationName || this.inquiry.organization,
    customerName: this.inquiry.organization,
    InquiryId: this.InquiryId || 0,
    pricingNo: this.quotation.pricingNo || null,
    originName: this.inquiry.origin || this.quotation.originPOL,

    portOfLoadingId: this.quotation.portOfLoadingId ? Number(this.quotation.portOfLoadingId) : null,
    portOfDischargeId: this.quotation.portOfDischargeId ? Number(this.quotation.portOfDischargeId) : null,
    lineOfBusinessId: this.quotation.lineOfBusinessId ? Number(this.quotation.lineOfBusinessId) : null,
    commodityId: this.quotation.commodity ? Number(this.quotation.commodity) : null,
    originId: this.originsaveid ? Number(this.originsaveid) : null,

    grossWeightKg: Number(this.quotation.grossWeightKg) || 0,
    chargeableWeight: Number(this.quotation.chargeableWeight) || 0,
    volumeWeight: Number(this.quotation.volumeWeight) || 0,
    cbm: Number(this.quotation.cbm) || 0,
    noOfPkgs: Number(this.quotation.noOfPkgs) || 0,

    CostBreakdowns: costData, 
    MultiCarrierBreakdowns: multiCarrierData,
    dimensions: this.appliedDimensions || [],
    
    commodityDocs: processedDocuments,
    packageInvoiceDocs: processedInvoices,

    salesCoordinator: (this.quotation.salesCoordinator || "").toString(),
    cargoStatus: (this.quotation.cargoStatus || this.quotation.cargoStatusType || 'Ready').toString(),
    cargoValue: (this.quotation.cargoValue || "0").toString(),
    cargoCurrency: (this.quotation.currency || 'INR').toString(),
    createdBy: 'admin@cavalierlogistic.in'
  };

  const keysToDelete = ['TransportMode', 'TransportType', 'SalesCoordinator', 'GrossWeight', 'GrossweightUnit', 'costBreakdowns', 'multiCarrierBreakdowns', 'existingInvoices'];
  keysToDelete.forEach(key => delete payload[key]);

  const formData = new FormData();
  formData.append('pricingData', JSON.stringify(payload));

  this.documents.forEach((d) => { if (d.file) { formData.append('docFiles', d.file); formData.append('docTypes', 'Commodity'); }});
  this.invoices.forEach((i) => { if (i.file) { formData.append('invoiceFiles', i.file); formData.append('invoiceNames', i.name || i.fileName); }});

  const token = localStorage.getItem('cavalier_token');
  const httpOptions = { headers: { Authorization: `Bearer ${token}` } };
  const pricingApiUrl = `${environment.apiUrl}/Pricing`;

  const action = this.quotation.id > 0 
    ? this.http.put(`${pricingApiUrl}/${this.quotation.id}`, formData, httpOptions)
    : this.http.post(pricingApiUrl, formData, httpOptions);

  action.subscribe({
    next: (res: any) => {
      this.sendBulkEmails(res.id);
      Swal.fire('Saved!', 'Pricing saved successfully!', 'success');
      this.onSearch();  
      this.isFormOpen = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error("❌ API SAVE FAILED:", err);
      Swal.fire('Error', err.error?.message || "Internal Entity Error.", 'error');
    }
  });
}
// Variables
// 1. Add new document slot


// 2. File select handler
onFileSelecteds(event: any, index: number) {
  const file = event.target.files[0];
  if (file) {
    this.documents[index].file = file;
    // Agar replace kar rahe the, to isReplacing ko false kar do
    this.documents[index].isReplacing = false; 
  }
}

// 3. Save button logic inside Modal
saveDocumentChanges() {
  // Yahan validate kar sakte ho ki sabhi documents ke naam/files bhare hain
  console.log("Documents saved to local state:", this.documents);
  this.isDocumentModalOpen = false;
  // Optional: Swal.fire('Success', 'Documents prepared', 'success');
}

// 4. Remove document

isModalOpen = false;
// selectedInquiryCarriers: any[] = []; // Iski zaroorat nahi agar aap direct array use kar rahe ho

// Button click par ye chalega
openMultiCarrierModal() {
  // Agar aapka data 'multiCarrierRows' naam ke array mein hai
  if (this.multiCarrierRows && this.multiCarrierRows.length > 0) {
    this.isModalOpen = true;
    this.cdr.detectChanges();
  } else {
    alert("Abhi koi carrier data add nahi kiya gaya hai!");
  }
}

closeModal() {
  this.isModalOpen = false;
}


showRowModal = false;
selectedInquiryId: any = null;

// Double click par call hone wala function
handleRowDblClick(id: any) {
  this.selectedInquiryId = id;
  this.showRowModal = true;
}

closeRowModal() {
  this.showRowModal = false;
  this.selectedInquiryId = null;
}  
toggleStatus(q: any) {
  // 1. Authorization Token
  const token = localStorage.getItem('cavalier_token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  // 2. URL Setup
  const url = `${environment.apiUrl}/Pricing/ToggleStatus/${q.id}`;

  // Current state save kar lo (error handle karne ke liye)
  const previousStatus = q.status;

  // 3. API Call
  this.http.patch(url, {}, { headers }).subscribe({
    next: (res: any) => {
      // Backend (res.newStatus) se sync kar rahe hain
      q.status = res.newStatus;
      
      // UI update trigger
      this.cdr.detectChanges();
      
      console.log(`✅ Status changed for ID ${q.id}:`, res.newStatus);
    },
    error: (err) => {
      console.error("❌ Status update fail:", err);
      
      // Error par wapas purani state set karo taaki UI galat na dikhe
      q.status = previousStatus;
      
      alert("Error while change status!");
      
      // UI ko revert karne ke liye forcefully update
      this.cdr.detectChanges();
    }
  });
}// --- Variables Section ---


fetchAllCountries() {
  const apiUrl = 'https://restcountries.com/v3.1/all?fields=name,cca2'; // Specific fields mangayi taaki payload fast load ho
  console.log("📡 Triggering External Country API Fetch Sequence...");

  this.http.get<any[]>(apiUrl).subscribe({
    next: (data) => {
      if (data && Array.isArray(data)) {
        this.countriesList = data.map(country => ({
          name: country.name?.common || '',
          id: country.cca2 || ''
        }))
        .filter(c => c.name !== '') // Khali data filter out kiya
        .sort((a, b) => a.name.localeCompare(b.name));
        
        console.log(`✅ Total ${this.countriesList.length} Countries successfully cached in memory.`);
      } else {
        this.loadFallbackCountries();
      }
    },
    error: (err) => {
      console.error('⚠️ Country API Failed, turning on secure local fallback list. Reason:', err);
      this.loadFallbackCountries(); // API fail hone par system automatic is list ko active kar dega
    }
  });
}

// 📦 Hardcoded Fallback Master List - Agar internet down ho ya API block ho, toh yeh backup chalega
loadFallbackCountries() {
  const fallback = [
    { id: 'IN', name: 'India' }, { id: 'US', name: 'United States' }, 
    { id: 'AE', name: 'United Arab Emirates' }, { id: 'GB', name: 'United Kingdom' },
    { id: 'SA', name: 'Saudi Arabia' }, { id: 'QA', name: 'Qatar' }, 
    { id: 'OM', name: 'Oman' }, { id: 'KW', name: 'Kuwait' },
    { id: 'DE', name: 'Germany' }, { id: 'FR', name: 'France' }, 
    { id: 'CA', name: 'Canada' }, { id: 'AU', name: 'Australia' },
    { id: 'SG', name: 'Singapore' }, { id: 'MY', name: 'Malaysia' }, 
    { id: 'CN', name: 'China' }, { id: 'JP', name: 'Japan' },
    { id: 'ZA', name: 'South Africa' }, { id: 'NL', name: 'Netherlands' }, 
    { id: 'IT', name: 'Italy' }, { id: 'ES', name: 'Spain' }
  ];
  this.countriesList = fallback.sort((a, b) => a.name.localeCompare(b.name));
  console.log("🔒 Fallback Dataset successfully mounted onto the framework configuration.");
}

// 🔍 2. Pura dynamic local filtering logic (Jo bina delay ke output dega)
onCountrySearch() {
  const searchTerm = this.quotation.country?.trim().toLowerCase() || '';
  
  // Agar user input delete karke poora khali kar de
  if (!searchTerm) {
    this.filteredCountries = [];
    this.showCountryDropdown = false;
    return;
  }

  // Pure data filter flow mapping
  this.filteredCountries = this.countriesList.filter(c => 
    c.name.toLowerCase().includes(searchTerm)
  );

  // Suggestions list sirf tabhi khulegi jab elements match honge
  this.showCountryDropdown = this.filteredCountries.length > 0;
  this.cdr.detectChanges(); // UI tracking broadcast engine trigger
}

// ✅ 3. Option Selection Handler
selectCountry(country: any) {
  if (!country) return;
this.quotation.countryName = country.name; // Ye line verify karo
  this.quotation.country = country.name;     // UI input template mapping
  this.quotation.countryId = country.id;     // Database parameters tracking mapping
  this.selectedCountryName = country.name;   // Payload payload tracking parameter synchronization
  
  this.showCountryDropdown = false;          // Instant close dropdown menu
  this.filteredCountries = [];               // Stream flush
  
  console.log("🎯 Selected Country metadata compilation active:", this.selectedCountryName);
  this.cdr.detectChanges();                  // View update forced
}
  // 🎯 Alert dikhane ka function (Lead/Org ID ke liye)
  // showAlert(title: string, id: any) {
  //   alert(`${title}: ${id || 'N/A'}`);
  // }// --- Variables (Same as yours) ---
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
// public invoices: any[] = [];
commodityDocuments: any[] = [];
  packageOrInvoiceDocuments: any[] = [];
selectInquiry(inq: any) {
  if (!inq || !inq.inquiryNo) {
    console.error("❌ Inquiry No missing!");
    return;
  }
  
  this.InquiryId = inq.id || 0;
  this.referenceByInquiryNo = inq.inquiryNo || 0;
  this.organisationId = inq.organisationId || 0;
  this.organisationName = inq.organisationName || '';

  const inquiryNo = inq.inquiryNo?.trim();
  const url = `${environment.apiUrl}/Inquiry/by-no?inquiryNo=${inquiryNo}`;

  this.http.get<any>(url).subscribe({
    next: (data) => {
      console.log("✅ Actual API Data:", data);

      // --- 1. Basic & Organization ---
      this.quotation.referenceByInquiry = data.inquiryNo || '';
      this.quotation.customerName = data.customerName || '';
      this.quotation.organization = data.organisationName || '';
      if (this.inquiry) this.inquiry.organization = data.organisationName || '';
      this.quotation.branchName = data.branchName || '';
      this.quotation.location = data.location || '';
      this.quotation.partyRole = data.partyRole || '';

      // --- 2. Documents ---
      this.commodityDocuments = data.commodityDocuments || [];
      this.packageOrInvoiceDocuments = data.packageOrInvoiceDocuments || [];
      this.documents = (data.commodityDocuments || []).map((doc: any) => ({
        id: doc.id, name: doc.name || 'Document', documentPath: doc.documentPath,
        isExisting: true, file: null, isReplacing: false
      }));
      this.invoices = (data.packageOrInvoiceDocuments || []).map((doc: any) => ({
        id: doc.id, name: doc.name || 'Document', documentPath: doc.documentPath,
        isExisting: true, file: null, isReplacing: false
      }));
      this.quotation.invoiceList = (this.invoices.length > 0) ? 'Available' : 'Not Available';

      // --- 3. LOB & Transport ---
      this.quotation.lineOfBusinessId = data.lineOfBusinessId ? Number(data.lineOfBusinessId) : null;
      if (data.transportMode) {
        const modeObj = this.transportModes.find(m =>
          m.name.toLowerCase() === data.transportMode.toLowerCase() || m.id == data.transportMode
        );
        this.quotation.TransportMode = modeObj ? modeObj.id : data.transportMode;
      }
      this.quotation.TransportType = data.transportType || '';

      // --- 4. Pricing ---
      this.quotation.salesCoordinator = data.salesCoordinator ? Number(data.salesCoordinator) : null;
      this.quotation.commodity = data.commodityId ? Number(data.commodityId) : null;
      this.quotation.pricingDoneBy = data.pricingDoneBy || '';
      this.quotation.qtnDoneBy = data.qtnDoneBy || '';
      this.quotation.businessDimensions = data.businessDimensions || '';

      // --- 5. Movement & Ports ---
      this.quotation.shipmentType = data.shipmentType?.toString() || '';
      this.quotation.movementType = data.movementType || '';
      this.inquiry.origin = data.originName || '';
      this.originsaveid = data.originId || null;
      this.originpinCode = data.originCountryCode || '';

      // POL
      this.quotation.portOfLoadingId = data.portOfLoadingId ? Number(data.portOfLoadingId) : null;
      this.quotation.portOfLoadingCode = data.codeOfPOL || '';
      const polMatch = this.portsOfLoading?.find(p => p && Number(p.id) === Number(data.portOfLoadingId));
      this.quotation.portOfLoading = polMatch ? (polMatch.portName || polMatch.name) : (data.portOfLoadingName || '');

      // POD
      this.quotation.portOfDischargeId = data.portOfDischargeId ? Number(data.portOfDischargeId) : null;
      this.quotation.portOfDestinationCode = data.codeOfPOD || '';
      const podMatch = this.portsOfDischarge?.find(p => p && Number(p.id) === Number(data.portOfDischargeId));
      this.quotation.portOfDestination = podMatch ? (podMatch.portName || podMatch.name) : (data.portOfDischargeName || '');

      this.quotation.finalDestination = data.finalDestination || '';
      this.quotation.finalDestinationCode = data.codeOfFinalDest || '';
      this.quotation.isDirect = data.isDirect === true;
      this.quotation.isIndirect = data.isIndirect === true;
// --- 5. Movement & Ports wale section mein add karein ---
this.quotation.podOrigin = data.podOrigin || ''; // Yeh line add karein
      // --- 6. Connecting Ports (FIXED MAPPING) ---
      this.selectedConnectingPorts = [];
      this.quotation.connectingPortIds = [];
      const rawCP = data.connectingPortIds || data.ConnectingPortIds;
      if (rawCP) {
        const idsArray = Array.isArray(rawCP) ? rawCP : rawCP.toString().split(',').map(Number);
        this.quotation.connectingPortIds = idsArray;
        
        this.selectedConnectingPorts = idsArray.map((id: number) => {
          const masterPort = this.filteredConnectingPorts?.find(p => Number(p.id) === id);
          return {
            id: id,
            portName: masterPort ? (masterPort.portName || masterPort.name) : `Port ID: ${id}`,
            portCode: masterPort ? masterPort.portCode : 'N/A'
          };
        });
      }
 try {
      if (data.receivedDate) this.quotation.receivedDate = new Date(data.receivedDate).toISOString().split('T')[0];
      if (data.cargoStatusDate) this.quotation.cargoStatusDate = new Date(data.cargoStatusDate).toISOString().split('T')[0];
      if (data.repliedDate && data.repliedDate !== '2000-02-12T00:00:00') this.quotation.repliedDate = new Date(data.repliedDate).toISOString().split('T')[0];
    } catch (dateErr) { console.error('Date parsing issue:', dateErr); }
      // --- 7. Rest of Logic ---
      this.quotation.incoterm = data.incoterm || '';
      if (this.quotation.incoterm) this.onIncotermChange({ target: { value: this.quotation.incoterm } });

      this.quotation.noOfPkgs = data.noOfPkgs || 0;
      this.quotation.grossWeightKg = data.grossWeightKg || 0;
      this.quotation.chargeableWeight = data.chargeableWeight || 0;
      this.quotation.volumeWeight = data.volumeWeight || 0;
      this.quotation.description = data.description || '';
      this.quotation.cargoValue = data.cargoValue || '';
      this.quotation.currency = data.cargoCurrency || '';

      if (data.cargoStatusDate) this.quotation.cargoReadyDate = data.cargoStatusDate.split('T')[0];

      if (data.dimensions?.length > 0) {
        this.dimRows = data.dimensions.map((d: any) => ({ box: d.box || 0, l: d.l || 0, w: d.w || 0, h: d.h || 0, unit: d.unit || 'CMS' }));
        this.dimRow = { ...this.dimRows[0] };
      } else {
        this.dimRow = { box: 0, l: 0, w: 0, h: 0, unit: 'CMS' };
        this.dimRows = [];
      }
      this.calculateVolumeWeight();

      this.quotation.countryName = data.countryName || '';
      this.quotation.country = data.countryName || '';
      this.quotation.countryId = data.countryId || null;

      this.showInquiryDropdown = false;
      this.showCountryDropdown = false;
      this.showPortOfDischargeDropdown = false;
      this.showOriginDropdown = false;

      this.cdr.detectChanges(); 
      if (this.quotation.lineOfBusinessId) this.onLOBChange({ target: { value: this.quotation.lineOfBusinessId } });

      setTimeout(() => { this.cdr.detectChanges(); }, 200);
    },
    error: (err) => console.error("❌ API Error:", err)
  });
}
isHazard(): boolean {

  // 1. Agar selectcommodityvalue mein seedha 'Hazard' likha hai

  const val = (this.selectcommodityvalue || '').toLowerCase();

  if (['hazard', 'hazardous'].includes(val)) return true;



  // 2. Agar quotation.commodity (ID) se check karna hai

  // Aapke commodityTypes array mein se hazard wali entry dhund rahe hain

  const selectedType = this.commodityTypes?.find(t => t.id == this.quotation?.commodity);

  if (selectedType) {

    const name = (selectedType.name || '').toLowerCase();

    return ['hazard', 'hazardous'].includes(name);

  }



  return false;

}
saveInvoices() {
  console.log("Updating local invoices array:", this.invoices);
  
  // 1. Validation (Optional): Check karo ki har invoice ka naam hai ya nahi
  const isValid = this.invoices.every(inv => inv.name && inv.name.trim() !== '');
  
  if (!isValid) {
    alert("Please provide a name for all invoices.");
    return;
  }

  // 2. Local State update ho chuki hai (kyunki tumne [(ngModel)] use kiya hai),
  // bas hume modal band karna hai.
  this.isInvoiceModalOpen = false;
  
  // 3. Optional: Agar kuch specific formatting karni ho toh yahan kar sakte ho.
  console.log("Local state updated successfully.");
}
 token:string='';
 inquiryList: any[] = [];
   allInquiries: any[] = [];
gettoken(){
  this.token = localStorage.getItem('cavalier_token') || '';
  return this.token;
}
loadInquiryList() {
  // Toggle logic
  if (this.showInquiryDropdown) {
    this.showInquiryDropdown = false;
    this.cdr.detectChanges();
    return;
  }

  const cavalierToken = localStorage.getItem('cavalier_token');
  if (!cavalierToken) {
    Swal.fire({
      icon: 'warning',
      title: 'Session Expired',
      text: 'Your login token is missing. Please log in again.',
    });
    return;
  }

  // 1. Loading Start
  Swal.fire({
    title: 'Loading Inquiries',
    text: 'Please wait while we fetch the data...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  const startTime = new Date().getTime(); // Request start time note karo
  const url = `${environment.apiUrl}/Inquiry`;

  this.http.get<any[]>(url, {
    headers: {
      'Authorization': `Bearer ${cavalierToken}`,
      'Content-Type': 'application/json'
    }
  }).subscribe({
    next: (res) => {
      const endTime = new Date().getTime();
      const duration = endTime - startTime;
      
      // Agar request 1 second (1000ms) se jaldi complete hui, toh bacha hua time wait karo
      const delay = duration < 1000 ? (1000 - duration) : 0;

      setTimeout(() => {
        this.inquiryList = res || [];
        this.filteredInquiries = res || [];
        this.showInquiryDropdown = this.inquiryList.length > 0;
        
        this.cdr.detectChanges(); // UI update trigger
        Swal.close(); // Swal band karo
      }, delay);
    },
    error: (err) => {
      Swal.close();
      console.error("Inquiry fetch error:", err);
      
      this.showInquiryDropdown = false;
      this.cdr.detectChanges();

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load inquiry list, please try again.',
        confirmButtonColor: '#d33'
      });
    }
  });
}
// Blur issue fix karne ke liye delay function
hideDropdownWithDelay() {
  setTimeout(() => {
    this.showInquiryDropdown = false;
  }, 200);
}
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
// TS File ke andar
generateTemporaryPricingNo() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // Months 0-11 hote hain
  
  let financialYear = "";
  if (month >= 4) {
    // April ya uske baad: 2024-25 format
    financialYear = `${year.toString().slice(-2)}-${(year + 1).toString().slice(-2)}`;
  } else {
    // Jan-March: 2023-24 format
    financialYear = `${(year - 1).toString().slice(-2)}-${year.toString().slice(-2)}`;
  }

  // Naya temporary number (Controller save karte waqt real number de dega)
  this.quotation.pricingNo = `CAV/PRC/${financialYear}/---`;
}
openPricingForm(inquiryData: any) {
  this.isFormOpen = true;
  this.inquiry = inquiryData; // Purana data map karein
  this.generateTemporaryPricingNo(); // Pricing No set karein
}
redirectdata(type: any, id: any) {
  // 1. Guard clause: Architectural Validation (Id check)
  if (!id) {
    Swal.fire({
      icon: 'warning',
      title: 'Reference Identifier Omission',
      text: 'The redirection sequence cannot be instantiated due to the absence of a valid operational reference. Please cross-verify the data integrity with our technical support infrastructure.',
      confirmButtonColor: '#4a3f3f'
    });
    return; // Navigation block ho gaya
  }

  // 2. Toast notification configuration
  const Toast = Swal.mixin({
    toast: true,
    // position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true
  });

  // 3. Routing Logic (Strict condition checking)
  if (type === 'org') {
    Toast.fire({
      icon: 'info',
      title: 'Synchronizing organizational parameters...'
    });
    this.router.navigate(['/dashboard/organization-add'], { 
      queryParams: { highlightId: id } 
    });
  } 
  else if (type === 'inq') {
    Toast.fire({
      icon: 'info',
      title: 'Fetching inquiry metadata for modification...'
    });
    this.router.navigate(['/dashboard/salescrm/inquiry'], { 
      queryParams: { editId: id } 
    });
  } 
  else {
    // 4. Fallback for Protocol Deviation (Jab type mismatch ho)
    Swal.fire({
      icon: 'error',
      title: 'Protocol Deviation',
      text: 'The requested routing protocol is currently incompatible with existing system configurations. Should this persistence anomaly continue, please escalate the matter to the technical support department.',
      confirmButtonColor: '#4a3f3f'
    });
    // Yahan navigate nahi hoga kyunki hum else block mein hain
  }
}
// 1. Edit Function
// editPricing(pricing: any) {
//   console.log("Editing Pricing Entry Data:", pricing);
//   if (!pricing) return;

//   // --- Documents Mapping (Integration) ---
// const allDocs = pricing.pricingDocuments || pricing.PricingDocuments || [];
// console.log("DEBUG: Total Docs from API:", allDocs.length);

// this.documents = allDocs
//   .filter((d: any) => (d.docType || d.DocType || '').toLowerCase() === 'commodity')
//   .map((d: any) => ({
//     id: d.docId || d.DocId,
//     name: 'Commodity Document', // Yahan tum 'Commodity' ya file ka naam set kar sakte ho
//     documentPath: d.docPath || d.DocPath,
//     isExisting: true
//   }));

// this.invoices = allDocs
//   .filter((d: any) => (d.docType || d.DocType || '').toLowerCase() === 'invoice')
//   .map((d: any) => ({
//     id: d.docId || d.DocId,
//     name: 'Invoice Document',
//     documentPath: d.docPath || d.DocPath,
//     isExisting: true
//   }));

// console.log("DEBUG: Final Array (Commodity):", this.documents);
// console.log("DEBUG: Final Array (Invoices):", this.invoices);

// // UI Force Refresh
// this.cdr.detectChanges();

//   // Saare background data ko ek jagah safe nikaal lo
//   const rawCbm = pricing.cbm || pricing.volume || pricing.totalCbm || pricing.cbmWeight || pricing.cbm_weight;
//   const rawVolWeight = pricing.volumeWeight || pricing.volume_weight || pricing.volumetricWeight || (this.quotation && this.quotation.volumeWeight);
//   const rawCommodityId = pricing.commodityId || pricing.commodityID || pricing.commodity_id || pricing.commodity;
//   const rawCommodityName = pricing.commodityName || pricing.commodity_name || pricing.commodity || '';

//   // 1. Data Copying (Deep Merge Safety)
//   if (!this.quotation) this.quotation = {};
//   this.quotation = { ...this.quotation, ...pricing };

//   // 2. Transport Mode Fix
//   if (pricing.transportMode && this.transportModes) {
//     const modeObj = this.transportModes.find(m => m && m.name && m.name.toLowerCase() === pricing.transportMode.toLowerCase());
//     this.quotation.TransportMode = modeObj ? modeObj.id : pricing.transportMode;
//   }

//   // 3. Transport Type & Currency Fix
//   this.quotation.TransportType = pricing.transportType;
//   this.quotation.currency = pricing.cargoCurrency;

//   // 4. Origin Display
//   if (!this.inquiry) this.inquiry = {};
//   this.inquiry.origin = pricing.originName || pricing.origin;
//   this.originsaveid = pricing.originId;

//   // ========================================================
//   // 🎯 DB SPECIFIC AUTOFILL FIELDS & DROPDOWN ID FIXING
//   // ========================================================
//   const dbPortOfLoadingId = pricing['[PortOfLoadingId]'] || pricing.portOfLoadingId || pricing.PortOfLoadingId || null;
//   const dbPortOfDischargeId = pricing['[PortOfDischargeId]'] || pricing.portOfDischargeId || pricing.PortOfDischargeId || null;
//   const dbPlaceOfDelivery = pricing['[PlaceOfDelivery]'] || pricing.placeOfDelivery || pricing.PlaceOfDelivery || "";
//   const dbCountryName = pricing['[CountryName]'] || pricing.countryName || pricing.CountryName || "";

//   // Dropdown safe matching ke liye IDs ko Hamesha String banao
//   this.quotation.portOfLoadingId = dbPortOfLoadingId ? dbPortOfLoadingId.toString() : null;
//   this.quotation.portOfDischargeId = dbPortOfDischargeId ? dbPortOfDischargeId.toString() : null;
  
//   // HTML Binding text variable fallback
//   this.quotation.originPOL = pricing.originName || pricing.origin || "";
//   this.quotation.placeOfDelivery = dbPlaceOfDelivery;
//   this.quotation.country = dbCountryName; 
//   this.quotation.countryName = dbCountryName;
//   this.quotation.countryId = pricing.countryId || null;

//   // --- Master Array Se Names Filter Karke Text Boxes Me Bharo ---
//   if (dbPortOfLoadingId && this.filteredConnectingPorts) {
//     const foundPol = this.filteredConnectingPorts.find(p => p.id.toString() === dbPortOfLoadingId.toString());
//     this.quotation.portOfLoading = foundPol ? foundPol.name : (pricing.portOfLoadingName || '');
//   } else {
//     this.quotation.portOfLoading = pricing.portOfLoadingName || "";
//   }

//   if (dbPortOfDischargeId && this.filteredConnectingPorts) {
//     const foundPod = this.filteredConnectingPorts.find(p => p.id.toString() === dbPortOfDischargeId.toString());
//     this.quotation.portOfDischarge = foundPod ? foundPod.name : (pricing.portOfDischargeName || '');
//     this.quotation.portOfDestination = this.quotation.portOfDischarge;
//   } else {
//     this.quotation.portOfDischarge = pricing.portOfDischargeName || "";
//     this.quotation.portOfDestination = pricing.portOfDischargeName || "";
//   }

//   // --- CONNECTING PORTS MAPPING ---
//   const rawCP = pricing.connectingPortIds || pricing.ConnectingPortIds;
//   const cPortIds = typeof rawCP === 'string' ? rawCP.split(',').map(id => Number(id.trim())) : (Array.isArray(rawCP) ? rawCP : []);
//   this.quotation.connectingPortIds = cPortIds;
  
//   if (this.filteredConnectingPorts) {
//     this.selectedConnectingPorts = this.filteredConnectingPorts.filter(p => cPortIds.includes(Number(p.id)));
//   }

//   // 6. Org & Ref
//   this.inquiry.organization = pricing.organisationName || pricing.customerName;
//   this.quotation.referenceByInquiry = pricing.referenceByInquiryNo;

//   // 7. Dates
//   if (pricing.receivedDate) this.quotation.receivedDate = pricing.receivedDate.split('T')[0];
//   if (pricing.cargoStatusDate) this.quotation.cargoStatusDate = pricing.cargoStatusDate.split('T')[0];

//   // 8. COMMODITY IMMEDIATE ASSIGNMENT
//   if (rawCommodityId) {
//     this.quotation.commodity = Number(rawCommodityId);
//   }
//   this.selectcommodityvalue = rawCommodityName;

//   // 9. CBM INITIAL ASSIGNMENT & CALCULATION
//   if (rawVolWeight) {
//     this.quotation.volumeWeight = Number(rawVolWeight);
//   }

//   if (rawCbm && Number(rawCbm) > 0) {
//     this.quotation.cbm = parseFloat(Number(rawCbm).toFixed(3));
//   } else if (this.quotation.volumeWeight && Number(this.quotation.volumeWeight) > 0) {
//     const calc = Number(this.quotation.volumeWeight) / 167;
//     this.quotation.cbm = parseFloat(calc.toFixed(3));
//   } else {
//     this.quotation.cbm = 0;
//   }

//   this.quotation.weight = pricing.weight || pricing.grossWeightKg || pricing.grossWeight || 0;
//   this.quotation.cbmUnit = pricing.cbmUnit || 'CBM';

//   // 10. Tables Grid Data
//   this.costRows = pricing.costBreakdowns && pricing.costBreakdowns.length > 0 ? [...pricing.costBreakdowns] : [{ lob: 'Standard', chargeName: '', chargeType: 'Prepaid', basis: 'Per KG', currency: 'INR', rate: 0, exchangeRate: 1, amount: 0 }];
//   this.multiCarrierRows = pricing.multiCarrierBreakdowns && pricing.multiCarrierBreakdowns.length > 0 ? [...pricing.multiCarrierBreakdowns] : [this.createEmptyRow()];

//   // 11. Dimensions
//   if (pricing.dimensions && Array.isArray(pricing.dimensions) && pricing.dimensions.length > 0) {
//     this.dimRows = [...pricing.dimensions];
//     this.dimRow = { ...pricing.dimensions[0] };
//     this.appliedDimensions = [...pricing.dimensions];
//   } else {
//     this.dimRows = [];
//     this.dimRow = {};
//     this.appliedDimensions = [];
//   }

//   this.isFormOpen = true;
//   this.cdr.detectChanges();

//   // ========================================================
//   // 🎯 ULTIMATE TEMPLATE SYNC 
//   // ========================================================
//   setTimeout(() => {
//     if (rawCommodityId) this.quotation.commodity = Number(rawCommodityId);
//     this.selectcommodityvalue = rawCommodityName;

//     const freshVolWeight = this.quotation.volumeWeight || rawVolWeight;
//     if (rawCbm && Number(rawCbm) > 0) {
//       this.quotation.cbm = parseFloat(Number(rawCbm).toFixed(3));
//     } else if (freshVolWeight && Number(freshVolWeight) > 0) {
//       const coreCalc = Number(freshVolWeight) / 167;
//       this.quotation.cbm = parseFloat(coreCalc.toFixed(3));
//     }

//     if (dbPortOfLoadingId) this.quotation.portOfLoadingId = dbPortOfLoadingId.toString();
//     if (dbPortOfDischargeId) this.quotation.portOfDischargeId = dbPortOfDischargeId.toString();
//     if (dbPlaceOfDelivery) this.quotation.placeOfDelivery = dbPlaceOfDelivery;
//     if (dbCountryName) {
//       this.quotation.country = dbCountryName; 
//       this.quotation.countryName = dbCountryName;
//     }

//     // Re-sync Connecting Ports in Timeout
//     if (this.filteredConnectingPorts) {
//         this.selectedConnectingPorts = this.filteredConnectingPorts.filter(p => this.quotation.connectingPortIds.includes(Number(p.id)));
//     }

//     if (pricing.countryId && typeof this.selectCountry === 'function') {
//       this.selectCountry({ id: pricing.countryId, name: dbCountryName });
//     }

//     console.log("🔥 Sync Finished! Documents, Ports, and Commodity Synchronized.");
//     this.cdr.detectChanges();
//   }, 400); 
// }
editPricing(pricing: any) {
  console.log("Editing Pricing Entry Data:", pricing);
  if (!pricing) return;

  const pricingId = pricing.id || pricing.PricingId;
  const fullDataUrl = `${environment.apiUrl}/Pricing/${pricingId}`;

  this.http.get<any>(fullDataUrl).subscribe(
    (fullData: any) => {
      console.log("DEBUG: Full Data fetched from API:", fullData);
      
      pricing = fullData; // Updated with full data

      // --- Documents Mapping (Original) ---
      const allDocs = pricing.pricingDocuments || pricing.PricingDocuments || [];
      this.documents = allDocs
        .filter((d: any) => (d.docType || d.DocType || '').toLowerCase() === 'commodity')
        .map((d: any) => ({ id: d.docId || d.DocId, name: 'Commodity Document', documentPath: d.docPath || d.DocPath, isExisting: true }));

      this.invoices = allDocs
        .filter((d: any) => (d.docType || d.DocType || '').toLowerCase() === 'invoice')
        .map((d: any) => ({ id: d.docId || d.DocId, name: 'Invoice Document', documentPath: d.docPath || d.DocPath, isExisting: true }));
      
      this.cdr.detectChanges();

      // --- BAAKI KA PURA LOGIC ---
      const rawCbm = pricing.cbm || pricing.volume || pricing.totalCbm || pricing.cbmWeight || pricing.cbm_weight;
      const rawVolWeight = pricing.volumeWeight || pricing.volume_weight || pricing.volumetricWeight || (this.quotation && this.quotation.volumeWeight);
      const rawCommodityId = pricing.commodityId || pricing.commodityID || pricing.commodity_id || pricing.commodity;
      const rawCommodityName = pricing.commodityName || pricing.commodity_name || pricing.commodity || '';

      if (!this.quotation) this.quotation = {};
      this.quotation = { ...this.quotation, ...pricing };

      if (pricing.transportMode && this.transportModes) {
        const modeObj = this.transportModes.find(m => m && m.name && m.name.toLowerCase() === pricing.transportMode.toLowerCase());
        this.quotation.TransportMode = modeObj ? modeObj.id : pricing.transportMode;
      }

      this.quotation.TransportType = pricing.transportType;
      this.quotation.currency = pricing.cargoCurrency;

      if (!this.inquiry) this.inquiry = {};
      this.inquiry.origin = pricing.originName || pricing.origin;
      this.originsaveid = pricing.originId;

      // --- POL / POD / FINAL DESTINATION MAPPING ---
      const dbPortOfLoadingId = pricing['[PortOfLoadingId]'] || pricing.portOfLoadingId || pricing.PortOfLoadingId || null;
      const dbPortOfDischargeId = pricing['[PortOfDischargeId]'] || pricing.portOfDischargeId || pricing.PortOfDischargeId || null;
      
      this.quotation.portOfLoadingId = dbPortOfLoadingId ? dbPortOfLoadingId.toString() : null;
      this.quotation.portOfDischargeId = dbPortOfDischargeId ? dbPortOfDischargeId.toString() : null;
      
      // Code Mapping
      this.quotation.portOfLoadingCode = pricing.codeOfPOL || pricing.CodeOfPOL || "";
      this.quotation.portOfDestinationCode = pricing.codeOfPOD || pricing.CodeOfPOD || "";
      this.quotation.finalDestinationCode = pricing.codeOfFinalDest || pricing.CodeOfFinalDest || "";
      this.quotation.finalDestination = pricing.finalDestination || "";

      this.quotation.originPOL = pricing.originName || pricing.origin || "";
      this.quotation.placeOfDelivery = pricing['[PlaceOfDelivery]'] || pricing.placeOfDelivery || pricing.PlaceOfDelivery || "";
      this.quotation.country = pricing['[CountryName]'] || pricing.countryName || pricing.CountryName || ""; 
      this.quotation.countryName = this.quotation.country;
      this.quotation.countryId = pricing.countryId || null;
// --- 7. Dates (Updated with Replied Date Logic) ---
      try {
        if (pricing.receivedDate) 
          this.quotation.receivedDate = new Date(pricing.receivedDate).toISOString().split('T')[0];
        
        if (pricing.cargoStatusDate) 
          this.quotation.cargoStatusDate = new Date(pricing.cargoStatusDate).toISOString().split('T')[0];
        
        // Yahan 'repliedDate' check ho raha hai
        if (pricing.repliedDate && pricing.repliedDate !== '2000-02-12T00:00:00' && pricing.repliedDate !== '0001-01-01T00:00:00') {
          this.quotation.repliedDate = new Date(pricing.repliedDate).toISOString().split('T')[0];
        } else {
          this.quotation.repliedDate = null; // Agar date valid nahi hai to null kar do
        }
      } catch (dateErr) { 
        console.error('Date parsing issue:', dateErr); 
      }
      // POL Logic: Check list first, fallback to API name
      if (dbPortOfLoadingId && this.filteredConnectingPorts && this.filteredConnectingPorts.length > 0) {
        const foundPol = this.filteredConnectingPorts.find(p => p.id.toString() === dbPortOfLoadingId.toString());
        this.quotation.portOfLoading = foundPol ? (foundPol.portName || foundPol.name) : (pricing.portOfLoadingName || '');
      } else {
        this.quotation.portOfLoading = pricing.portOfLoadingName || "";
      }

      // POD Logic: Check list first, fallback to API name
      if (dbPortOfDischargeId && this.filteredConnectingPorts && this.filteredConnectingPorts.length > 0) {
        const foundPod = this.filteredConnectingPorts.find(p => p.id.toString() === dbPortOfDischargeId.toString());
        this.quotation.portOfDischarge = foundPod ? (foundPod.portName || foundPod.name) : (pricing.portOfDischargeName || '');
        this.quotation.portOfDestination = this.quotation.portOfDischarge;
      } else {
        this.quotation.portOfDischarge = pricing.portOfDischargeName || "";
        this.quotation.portOfDestination = pricing.portOfDischargeName || "";
      }

      // Connecting Ports
      const rawCP = pricing.connectingPortIds || pricing.ConnectingPortIds;
      const cPortIds = typeof rawCP === 'string' ? rawCP.split(',').map((id: any) => Number(id.trim())) : (Array.isArray(rawCP) ? rawCP : []);
      this.quotation.connectingPortIds = cPortIds;
      if (this.filteredConnectingPorts && this.filteredConnectingPorts.length > 0) {
        this.selectedConnectingPorts = this.filteredConnectingPorts
          .filter(p => cPortIds.includes(Number(p.id)))
          .map(p => ({
            id: p.id,
            portName: p.portName || p.name,
            portCode: p.portCode || '---'
          }));
      }

      this.inquiry.organization = pricing.organisationName || pricing.customerName;
      this.quotation.referenceByInquiry = pricing.referenceByInquiryNo;

      if (pricing.receivedDate) this.quotation.receivedDate = pricing.receivedDate.split('T')[0];
      if (pricing.cargoStatusDate) this.quotation.cargoStatusDate = pricing.cargoStatusDate.split('T')[0];

      if (rawCommodityId) this.quotation.commodity = Number(rawCommodityId);
      this.selectcommodityvalue = rawCommodityName;

      if (rawVolWeight) this.quotation.volumeWeight = Number(rawVolWeight);
      if (rawCbm && Number(rawCbm) > 0) {
        this.quotation.cbm = parseFloat(Number(rawCbm).toFixed(3));
      } else if (this.quotation.volumeWeight && Number(this.quotation.volumeWeight) > 0) {
        this.quotation.cbm = parseFloat((Number(this.quotation.volumeWeight) / 167).toFixed(3));
      } else {
        this.quotation.cbm = 0;
      }

      this.quotation.weight = pricing.weight || pricing.grossWeightKg || pricing.grossWeight || 0;
      this.quotation.cbmUnit = pricing.cbmUnit || 'CBM';

      this.costRows = pricing.costBreakdowns && pricing.costBreakdowns.length > 0 ? [...pricing.costBreakdowns] : [{ lob: 'Standard', chargeName: '', chargeType: 'Prepaid', basis: 'Per KG', currency: 'INR', rate: 0, exchangeRate: 1, amount: 0 }];
      this.multiCarrierRows = pricing.multiCarrierBreakdowns && pricing.multiCarrierBreakdowns.length > 0 ? [...pricing.multiCarrierBreakdowns] : [this.createEmptyRow()];

      if (pricing.dimensions && Array.isArray(pricing.dimensions) && pricing.dimensions.length > 0) {
        this.dimRows = [...pricing.dimensions];
        this.dimRow = { ...pricing.dimensions[0] };
        this.appliedDimensions = [...pricing.dimensions];
      } else {
        this.dimRows = [];
        this.dimRow = {};
        this.appliedDimensions = [];
      }

      this.isFormOpen = true;
      this.cdr.detectChanges();

      setTimeout(() => {
        this.cdr.detectChanges();
        console.log("🔥 Sync Finished!");
      }, 400);
    },
    (err) => console.error("Error fetching full data:", err)
  );
}
// Keep it safe for other components calling it

sendBulkEmails(inqId: number) {
  const payload = {
   toEmails: Array.from(this.selectedEmails),
    inquiryId: inqId,
    branchName: this.lastSelectedBranch
  };

  const token = localStorage.getItem('cavalier_token');
  const headers = { Authorization: `Bearer ${token}` };

  // 🔥 STEP 1: Sending Animation wala Modal kholna
  Swal.fire({
    title: 'Processing...',
    html: `
      <div class="email-loader">
        <div class="envelope-wrapper">
          <div class="envelope"></div>
        </div>
        <p style="margin-top:20px; font-weight:bold; color:#4a3f3f;">Email is sending, please wait...</p>
      </div>
    `,
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading(); // Ye standard loader dikhayega
    },
    // Custom style for your premium look
    customClass: {
      popup: 'premium-popup',
    }
  });

  // 🔥 STEP 2: Actual API Call
  this.http.post(`${this.apiUrl}/SendBulkEmail`, payload, { headers }).subscribe({
    next: (res: any) => {
      // ✅ SUCCESS: Success wala Animation dikhana
      Swal.fire({
        icon: 'success',
        title: 'Sent Successfully!',
       text: 'Emails sent and Inquiry saved successfully.',
        timer: 3000,
        showConfirmButton: false,
        timerProgressBar: true
      }).then(() => {
        // 🔥 YAHAN REDIRECT HOGA 🔥
        this.router.navigate(['/dashboard/Price']);
      });
    },
    error: (err) => {
      // ❌ ERROR: Error message dikhana
      Swal.fire({
        icon: 'error',
        title: 'Email Failed',
        text: err.error?.message || 'Something went wrong while sending email.',
        confirmButtonColor: '#4a3f3f'
      });
    }
  });
}
// 2. Delete Function
// deletePricing(id: number) {
//   if (confirm("Are you sure you want to delete this pricing?")) {
//     const token = localStorage.getItem('cavalier_token');
//     const httpOptions = {
//       headers: { Authorization: `Bearer ${token}` }
//     };

//     this.http.delete(`${environment.apiUrl}/api/Pricing/${id}`, httpOptions).subscribe({
//       next: () => {
//         alert("Pricing deleted successfully!");
//         this.onSearch();  // Table refresh karein
//       },
//       error: (err) => {
//         console.error("Delete Error:", err);
//         alert("Failed to delete pricing.");
//       }
//     });
//   }
// }
openNewQuotation() {
  this.quotation = {}; // Reset form or initialize
  
  // Yahan 'pricingsList' ki jagah 'pricings' kar diya hai
  if (this.pricings && this.pricings.length > 0) {
    // 1. Saare Pricing Numbers ki list nikaalo
    const numbers = this.pricings
      .map((p: any) => {
        // Agar format 'PR-101' hai toh digit nikaalo, warna direct number lo
        const val = p.pricingNo || p.PricingNo;
        const match = val?.toString().match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      })
      .filter((n: number) => !isNaN(n));

    // 2. Sabse bada number dhundo
    const maxNo = Math.max(...numbers, 0);

    // 3. Agla number set karo
    this.quotation.pricingNo = (maxNo + 1).toString(); 
  } else {
    this.quotation.pricingNo = "1"; // Agar list khali hai toh 1 se start
  }

  this.isFormOpen = true;
  this.cdr.detectChanges();
}
deletePricing(id: number) {
  if (!id) {
    Swal.fire('Error', 'Invalid Pricing ID', 'error');
    return;
  }

  Swal.fire({
    title: 'Are you sure?',
    text: "Do you really want to delete this pricing record? This action cannot be undone.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      const token = localStorage.getItem('cavalier_token');
      const httpOptions = { 
        headers: { Authorization: `Bearer ${token}` } 
      };

      // API Call to delete pricing
      this.http.delete(`${environment.apiUrl}/Pricing/${id}`, httpOptions).subscribe({
        next: (res: any) => {
          // 1. Show success message in English
          Swal.fire('Deleted!', 'The record has been successfully deleted.', 'success');
          
          // 2. Filter out the deleted item from the local array
          this.pricings = this.pricings.filter(p => (p.id || p.Id) !== id);
          
          // 3. Trigger Change Detection manually to refresh the table UI
          this.cdr.detectChanges(); 
        },
        error: (err) => {
          console.error("Delete error:", err);
          const errorMsg = err.error?.message || 'Something went wrong on the server.';
          Swal.fire('Error!', 'Failed to delete: ' + errorMsg, 'error');
        }
      });
    }
  });
}
goToOrganization(id: any) {
  if (id) {
    // Ye Angular router ko bypass karke browser se redirect karega
    window.location.href = `/dashboard/organization-add/${id}`;
  }
}
calculateTotalPackages() {
  if (this.dimRows && this.dimRows.length > 0) {
    this.quotation.noOfPkgs = this.dimRows.reduce((total: number, dim: any) => {
      return total + (Number(dim.box) || 0);
    }, 0);
  }
}
updatePreview() {
  // Yeh function sirf Angular ko refresh karne ka trigger deta hai
  // Agar values update nahi ho rahi hain, toh ChangeDetectorRef use karo:
  this.cdr.detectChanges(); 
  
  console.log("Current Dimensions List:", this.dimRows);
}
selectedPricingColumns: string[] = []; 

pricingColumnFieldMap: any = {
  'Pricing No': 'pricingNo',
  'Organisation': 'organisationName',
  'Inquiry No': 'inquiryNo',
  'Customer': 'customerName',
  'Location': 'location',
 
  'Incoterm': 'incoterm',
  'Movement': 'movementType',
  'Commodity': 'businessDimensions',
  'Status': 'status'
};





// 1. Backend se settings laane ke liye
fetchPricingSettings() {
  this.http.get(`${environment.apiUrl}/PricingColumnSettings`).subscribe({
    next: (res: any) => {
      if (res && res.selectedColumns) {
        this.selectedPricingColumns = JSON.parse(res.selectedColumns);
      }
    },
    error: (err) => console.error("Error loading settings:", err)
  });
}

// 2. Drag & Drop aur API Save ke liye
dropPricingColumn(event: CdkDragDrop<string[]>) {
  moveItemInArray(this.selectedPricingColumns, event.previousIndex, event.currentIndex);
  this.savePricingSettings();
}

savePricingSettings() {
  const payload = {
    Id: 1, // Controller logic ke hisaab se
    AvailableColumns: JSON.stringify(this.selectedPricingColumns),
    SelectedColumns: JSON.stringify(this.selectedPricingColumns)
  };

  this.http.post(`${environment.apiUrl}/PricingColumnSettings/save`, payload).subscribe({
    next: () => console.log("Pricing settings saved successfully!"),
    error: (err) => console.error("Error saving settings:", err)
  });
}

// Component ke andar
isColumnModalOpen: boolean = false; // Initial state false honi chahiye

toggleColumnSelector() {
  this.isColumnModalOpen = !this.isColumnModalOpen;
  console.log("Modal state is now:", this.isColumnModalOpen); // F12 (Console) mein check karo
}
// 1. Column list jo tum dikhana chahte ho
allPossibleColumns: string[] = ['Pricing No', 'Organisation', 'Inquiry No', 'Customer', 'Location', 'Incoterm', 'Movement', 'Commodity', 'Status'];

// 2. Modal/Selector toggle state
// isColumnModalOpen: boolean = false; 

// toggleColumnSelector() {
//   this.isColumnModalOpen = !this.isColumnModalOpen;
// }

// 3. Checkbox toggle logic
toggleColumn(colName: string) {
  const index = this.selectedPricingColumns.indexOf(colName);
  if (index > -1) {
    this.selectedPricingColumns.splice(index, 1); // Remove kar do
  } else {
    this.selectedPricingColumns.push(colName);    // Add kar do
  }
  this.savePricingSettings(); // Auto-save ho jayega
}
// Component ke andar
// allPossibleColumns: string[] = [
//   'Pricing No', 'Organisation', 'Inquiry No', 'Customer', 
//   'Location', 'Route', 'Incoterm', 'Movement', 'Commodity', 'Status'
// ];
// State variables
isOrgModalOpen = false;


// Open Modal
openOrgModal() {
  this.loadAllOrganizations();
  this.isOrgModalOpen = true;
}

// Select Organization and close
selectAndClose(org: any) {
  this.inquiry.organization = org.orgName || org.organizationName;
  this.isOrgModalOpen = false;
  this.showDropdown = false;
  this.showOrgDropdown = false;
}

// Standard select for dropdown


// Input handling
// onSearchInput() {
//   const query = this.inquiry.organization;
//   if (query && query.length >= 3) {
//     // Apni filtering logic yahan likho
//     this.filteredOrganizations = this.organizationList.filter(o => 
//       o.orgName?.toLowerCase().includes(query.toLowerCase())
//     );
//     this.showDropdown = this.filteredOrganizations.length > 0;
//   } else {
//     this.showDropdown = false;
//   }
// }
// Component mein ye function use karein
getTotalPackageCount() {
  return this.dimRows.reduce((sum, item) => sum + (Number(item.box) || 0), 0);
}
getGroupedDimensions(): DimGroup[] {
  // Yahan type define kar di taaki TS7034 error na aaye
  const groups: DimGroup[] = [];

  this.dimRows.forEach((dim: any, index: number) => {
    const dimString = `${dim.l || 0}x${dim.w || 0}x${dim.h || 0} ${dim.unit || 'CMS'}`;
    
    // find() method ab return karega 'DimGroup | undefined'
    let foundGroup = groups.find(g => g.dimString === dimString);
    
    if (foundGroup) {
      foundGroup.indices.push(index + 1);
      foundGroup.totalBoxQty += Number(dim.box || 0);
    } else {
      groups.push({
        dimString: dimString,
        l: dim.l || 0, 
        w: dim.w || 0, 
        h: dim.h || 0, 
        unit: dim.unit || 'CMS',
        indices: [index + 1],
        totalBoxQty: Number(dim.box || 0)
      });
    }
  });
  
  return groups;
}
// quotation: any = { grossWeightKg: '', GrossweightUnit: 'KGS' }; // Default KGS
  unitsList: any[] = [];
  showModal: boolean = false;
 // Variables
uomList: any[] = [];
isUomModalOpen: boolean = false;
// ... baaki modals bhi yahan define hain

loadUomList() {
  this.http.get<any[]>(`${environment.apiUrl}/Uom/list`).subscribe({
    next: (data) => {
      this.uomList = data; // Yahan ensure karein ki data array format mein aaye
    },
    error: (err) => console.error("Error loading UOMs:", err)
  });
}
// isUomModalOpen: boolean = false; 

  // Ye function public hona chahiye
  toggleUomModal() {
    this.isUomModalOpen = !this.isUomModalOpen;
  }
// Gross Weight ke liye select
selectUom(uom: any) {
  this.quotation.GrossweightUnit = uom.shortCode; 
  this.isUomModalOpen = false;
  this.calculateVolumeWeightLogic(); // Calculation update karna zaroori hai
}
// Net Weight ke liye modal state
isNetUomModalOpen: boolean = false;

// Net Weight select function
selectNetUom(uom: any) {
  this.quotation.netWeightUnit = uom.shortCode;
  this.isNetUomModalOpen = false;
}

// Toggle function
toggleNetUomModal() {
  this.isNetUomModalOpen = !this.isNetUomModalOpen;
}
// Variable initialize karein
isChargeableUomModalOpen: boolean = false;

// Toggle function
toggleChargeableUomModal() {
  this.isChargeableUomModalOpen = !this.isChargeableUomModalOpen;
}

// Select function
selectChargeableUom(uom: any) {
  this.quotation.chargeableWeightUnit = uom.shortCode;
  this.isChargeableUomModalOpen = false;
  // Agar koi calculation hai toh yahan call karein
}
// Modal state
isVolumeUomModalOpen: boolean = false;

// Toggle function
toggleVolumeUomModal() {
  this.isVolumeUomModalOpen = !this.isVolumeUomModalOpen;
}

// Select function
selectVolumeUom(uom: any) {
  this.quotation.volumeWeightUnit = uom.shortCode;
  this.isVolumeUomModalOpen = false;
  this.calculateVolumeWeightLogic(); // Calculation trigger
}
// Naya row add karne ke liye function
addNewDimensionRow() {
  this.dimRows.push({ box: 0, l: 0, w: 0, h: 0, unit: 'KGS' }); // Default KGS
  this.updatePreview();
}

// Modal Toggle
toggleDimModal() {
  this.isDimModalOpen = !this.isDimModalOpen;
}
fixExistingRows() {
  if (this.dimRows && this.dimRows.length > 0) {
    this.dimRows.forEach(row => {
      // Agar unit set nahi hai, toh default KGS de do
      if (!row.unit) {
        row.unit = 'KGS';
      }
    });
  }
}
packageUnits: any[] = [];
  // isModalOpen = false;
  getPackageUnits() {
    this.http.get(`${environment.apiUrl}/PackageBox/list`).subscribe((res: any) => {
      this.packageUnits = res;
    });
  }
isUnitModalOpen = false;
toggleUnitModal(event: Event) {
    event.stopPropagation(); // Click event ko bubble hone se rokne ke liye
    this.isUnitModalOpen = !this.isUnitModalOpen;
  }

  // Click outside to close modal
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isUnitModalOpen = false;
        this.showOriginDropdown = false;
    this.showCountryDropdown = false;
    }
      if (this.el && !this.el.nativeElement.contains(event.target)) {
    this.showPortOfLoadingDropdown = false;
  }
    if (this.el && !this.el.nativeElement.contains(event.target)) {
    this.showPortOfDischargeDropdown = false;
  }
    if (this.el && !this.el.nativeElement.contains(event.target)) {
    this.showFinalDestinationDropdown = false;
  }
  }
}
