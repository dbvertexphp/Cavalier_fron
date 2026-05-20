
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
@Component({
  selector: 'app-price',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule, DragDropModule],
  templateUrl: './price.component.html',
  styleUrl: './price.component.css',
})

export class PriceComponent {
 @ViewChild('cargoDateInput') cargoDateInput!: ElementRef<HTMLInputElement>;
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
onFileSelecteds(event: any, index: number) {
    const file = event.target.files[0];
    
    if (file) {
      this.documents[index].file = file;
      this.documents[index].fileName = file.name; // Naam UI (Chhote badge) par dikhane ke liye
      
      // Local file ka temporary URL banana preview ke liye
      const objectUrl = URL.createObjectURL(file);
      
      // Angular ko batana ki ye iframe me dikhane ke liye safe hai
      this.documents[index].previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
    }
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
dimRow: any = { box: 1, l: 0, w: 0, h: 0, unit: 'CMS' };
dimRows: any[] = [];

// Component initialize hote hi dimRow ko array mein daal dein
// ngOnInit() {
//   this.dimRows = [this.dimRow]; 
// }

calculateVolumeWeight() {
  // 1. Pehle weight aur CBM calculate karein (Purana logic)
  const weight = this.calculateSingleVolumeWeight(this.dimRow);
  this.quotation.volumeWeight = parseFloat(weight.toFixed(2));
  this.calculateCBM();

  // 2. AUTO-SAVE LOGIC (Bina Apply Button ke Preview aur Payload update karega)
  // Hum current single row ko array mein dalenge aur filters trigger karenge
  this.dimRows = [{ ...this.dimRow }];
  
  // 3. Wahi logic jo aapne Save Button (Apply) par likha hai:
  this.appliedDimensions = this.dimRows.filter(d => d.l > 0 && d.w > 0 && d.h > 0);
  
  this.calculateNetWeight();
  this.calculateVolumeWeightLogic();
  this.syncFinalData(); // Yeh function hi payload/preview ko finalize karta hai
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
    private apiUrl = `${environment.apiUrl}/Pricing`;
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
    constructor(private http: HttpClient, private router: Router,private cdr: ChangeDetectorRef,private branchservice:BranchService,public userServices:UserService,public CheckPermissionService:CheckPermissionService,private sanitizer: DomSanitizer,private eRef: ElementRef,private route: ActivatedRoute) {}
orgData: any = null;
  isLoading: boolean = true;
    ngOnInit() {
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
      this.loadPricings();
      this.loadQuotations();
      this.loadPricingNumbers();
      this.portOfLoading();
      this.getNextInquiryNumber();
      this.fetchOrganizations();
      this.fetchLeads();
      this.fetchOrigins();
      this.loadDropdownData();
    this.loadAllLeadss();
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
  // Teri API call
  this.userServices.getUsers('onlyuserdata').subscribe({
    next: (data: any) => {
      // API se aane wala data leadOwners mein assign kar diya
      this.getsalescordinate = data; 
      console.log('Lead Owners loaded:', this.getsalescordinate);
          this.cdr.detectChanges(); 
    },
    error: (err) => {
      console.error('Error loading users:', err);
    }
  });
}
portOfLoading() {
  this.http.get<any[]>(`${environment.apiUrl}/PortOfLoading`).subscribe({
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
      Swal.fire('Error', 'Data load karne mein problem aayi.', 'error');
    }
  });
}
onPortOfLoadingSearch() {
  const searchTerm = (this.quotation.portOfLoading || '').toString().trim().toLowerCase();

  if (searchTerm === '') {
    this.showPortOfLoadingDropdown = false;
    this.filteredPortsOfLoading = [];
    return;
  }

  this.filteredPortsOfLoading = this.portsOfLoading.filter(port => {
    const portName = port.name || port.portName || port.PortName || port.description || '';
    return portName.toString().toLowerCase().includes(searchTerm);
  });

  this.showPortOfLoadingDropdown = true;
}
selectPortOfLoading(port: any) {
  if (!port) return;
  
  this.quotation.portOfLoading = port.name || port.portName || port.PortName || '';
  this.showPortOfLoadingDropdown = false;
  this.filteredPortsOfLoading = [];
}
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

  // 🔥 NAYA LOGIC: Table (costRows) mein LOB auto-fill karne ke liye
  if (this.costRows && this.costRows.length > 0) {
    // Agar aap chahte hain ki sirf pehli row update ho:
    this.costRows[0].lob = fullName;

    // Ya agar aap chahte hain ki table ki saari rows ka LOB badal jaye:
    // this.costRows.forEach(row => row.lob = fullName);
  }

  // Baaki aapka purana logic (Transport Mode wagera wala) yahan niche rahega...
  const parts = fullName.split(/[\s\-]+/);
  if (parts.length >= 1) {
    const modeName = parts[0];
    const modeObj = this.transportModes.find(m => m.name.toLowerCase() === modeName.toLowerCase());
    if (modeObj) {
      this.quotation.TransportMode = modeObj.id;
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
  fetchOrigins() {
    // API Path: /api/Origin
    const url = `${environment.apiUrl}/PortSetup`;
    this.http.get<any[]>(url).subscribe(data => {
      this.origins = data;
      console.log(data)
    });
  }

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
onOriginSearchInput() {
  const searchTerm = (this.inquiry.origin || '').toString().trim().toLowerCase();

  if (searchTerm === '') {
    this.showOriginDropdown = false;
    this.filteredOrigins = [];
    return;
  }

  this.filteredOrigins = this.origins.filter(org => {
    // API response ke mutabiq 'portName' use karein
    const originName = org.portName || ''; 
    return originName.toLowerCase().includes(searchTerm);
  });

  this.showOriginDropdown = true;
}


  // --- Selection Logic ---
 selectOrigin(origin: any) {
  // 1. Basic UI aur Selection update
  this.originsaveid = origin.id;
  this.originpinCode = origin.pinCode;
  this.inquiry.origin = origin.portName; 
  this.showOriginDropdown = false;


  console.log("Selected Origin pinCode:", origin);

  // 2. Agar pinCode valid hai toh API call karein
  if (this.originpinCode) {
    this.fetchAgentByPostCode(this.originpinCode);
  } else {
    this.agentDetail = []; // Clear array if no pincode
    console.warn("Pincode missing for this origin!");
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
onAgentSelect(event: any, agent: any) {
  const email = agent.email || agent.Email;
  const branch = agent.branchName || agent.BranchName || "Global";

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
  this.http.get<any[]>(`${environment.apiUrl}/PortOfDischarge`).subscribe({
    next: (data) => {
      this.portsOfDischarge = data;
      console.log("Port of Discharge loaded:", data);
    },
    error: (err) => {
      console.error("Error loading Port of Discharge:", err);
    }
  });
}
onPortOfDischargeSearch() {
  const searchTerm = (this.quotation.portOfDestination || '').toString().trim().toLowerCase();

  if (searchTerm === '') {
    this.showPortOfDischargeDropdown = false;
    this.filteredPortsOfDischarge = [];
    return;
  }

  this.filteredPortsOfDischarge = this.portsOfDischarge.filter(port => {
    const portName = port.name || port.portName || port.PortName || port.description || '';
    return portName.toString().toLowerCase().includes(searchTerm);
  });

  this.showPortOfDischargeDropdown = true;
}
selectPortOfDischarge(port: any) {
  if (!port) return;
  
  this.quotation.portOfDestination = port.name || port.portName || port.PortName || '';
  this.showPortOfDischargeDropdown = false;
  this.filteredPortsOfDischarge = [];
}

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

// 4. Save button par calculation trigger karna
saveDimensions() {
  this.appliedDimensions = this.dimRows.filter(d => d.l > 0 && d.w > 0 && d.h > 0);
  
  // Modal save hote hi total weight ko field mein daal do
  this.quotation.volumeWeight = this.getTotalVolumeWeight();
  this.calculateCBM();
  this.calculateNetWeight();
  this.calculateVolumeWeightLogic();
  this.syncFinalData();
  this.closeDimModal();
}

// Jab Modal Open ho
openDimModal() {
  // Agar modal pehli baar khul raha hai, toh bahar wali row ka data modal mein copy kar do
  if (!this.dimRows || this.dimRows.length === 0) {
    this.dimRows = [{ ...this.dimRow }];
  }
  this.isDimModalOpen = true;
}
    
   editQuotation(q: any) {
  // 1. Backend data ko model mein map karein
  this.quotation = { ...q };

  // 2. IMPORTANT: IDs ko numbers mein convert karein (Mapping Fix)
  this.quotation.lineOfBusinessId = q.lineOfBusinessId ? Number(q.lineOfBusinessId) : null;
  this.quotation.originId = q.originId ? Number(q.originId) : null;
  this.quotation.portOfLoadingId = q.portOfLoadingId ? Number(q.portOfLoadingId) : null;
  this.quotation.portOfDischargeId = q.portOfDischargeId ? Number(q.portOfDischargeId) : null;

  // 3. UI object (this.inquiry) ko update karein 
  // Agar aapke HTML mein [ngModel]="inquiry.origin" hai toh ye zaroori hai
  this.inquiry = {
    ...this.inquiry, // purani properties bachane ke liye
    inquiryNo: q.inquiryNo,
    organization: q.customerName || q.organization,
    origin: q.origin, // text representation
    leadNo: q.leadNo
  };

  // 4. Dates handling
  if (q.receivedDate) {
    this.quotation.receivedDate = new Date(q.receivedDate).toISOString().split('T')[0];
  }

  // 5. Dimensions parsing
  this.appliedDimensions = q.dimensions || [];
  this.dimRows = this.appliedDimensions.length > 0 
    ? [...this.appliedDimensions] 
    : [{ box: 1, l: 0, w: 0, h: 0, unit: 'CMS' }];

  // 6. Modal open karein
  this.isFormOpen = true;

  // 7. Forcefully Angular ko batayein ki data update hua hai
  setTimeout(() => {
    this.cdr.detectChanges();
  }, 100);
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
onServiceType() {
  const query = this.searchFilters.transportMode ? this.searchFilters.transportMode.trim().toLowerCase() : '';

  // 3. Logic: 3 letter ke baad hi filter karke suggestions dikhao
  if (query.length >= 3) {
    this.filteredServices = this.allUniqueServices.filter(mode => 
      mode.toLowerCase().includes(query)
    );
  } else {
    // 3 se kam characters par list ko khali rakho
    this.filteredServices = [];
  }
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

// 3. Modal ke andar search - Ab ye bina API ke chalega (Local Search)
filterPricingList(event: any) {
  const searchTerm = event.target.value.toLowerCase().trim();
  
  if (!searchTerm) {
    this.allUniquePricingNos = [...this.masterPricingList];
  } else {
    this.allUniquePricingNos = this.masterPricingList.filter(pNo =>
      pNo.toLowerCase().includes(searchTerm)
    );
  }
  this.cdr.detectChanges(); // Fast Update
}
// 2. Ye raha wo function jo error de raha hai
onPricingNoType() {
  const query = this.searchFilters.pricingNo ? this.searchFilters.pricingNo.trim().toLowerCase() : '';

  if (query.length >= 3) {
    this.filteredPricingNos = this.allUniquePricingNos.filter((pNo: string) => 
      pNo.toLowerCase().includes(query)
    );
  } else {
    this.filteredPricingNos = [];
  }
  
  // Agar ChangeDetectorRef use kar rahe ho toh:
  this.cdr.detectChanges(); 
}

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
setQuickDate(type: string) {
  const today = new Date();
  let targetDate = new Date();

  switch (type) {
    case 'tomorrow':
      targetDate.setDate(today.getDate() + 1);
      break;
    case 'yesterday':
      targetDate.setDate(today.getDate() - 1);
      break;
    case 'nextWeek':
      targetDate.setDate(today.getDate() + 7);
      break;
    case 'lastWeek':
      targetDate.setDate(today.getDate() - 7);
      break;
    case 'nextMonth':
      targetDate.setMonth(today.getMonth() + 1);
      break;
    case 'lastMonth':
      targetDate.setMonth(today.getMonth() - 1);
      break;
    default:
      targetDate = today;
  }

  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  
  // Value assign ki
  this.searchFilters.receivedDate = `${year}-${month}-${day}`;
  
  this.showCustomPicker = false;

  // Change detect karke search call karein taaki payload updated date le
  this.cdr.detectChanges(); 
  this.onSearch();
}
pricings: any[] = [];             // Master display list
     // Table mein jo loop ho raha hai
  allPricingData: any[] = [];       // Backend se aaya hua full search result
  

  // --- Pagination Variables ---
  currentPage: number = 1;
  pageSize: number = 10;

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
  const token = localStorage.getItem('cavalier_token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  // Status mapping
  let statusValue = -1;
  if (this.searchFilters.status !== "" && this.searchFilters.status !== null) {
    statusValue = Number(this.searchFilters.status);
  }

  // 🔥 Payload for Multiple Branches
  const payload = {
    pricingNo: this.searchFilters.pricingNo || "",
    transportMode: this.searchFilters.transportMode || "",
    organisationName: this.searchFilters.organisationName || "",
    status: statusValue,
    receivedDate: this.searchFilters.receivedDate || null,
    
    // 🔥 Yahan array ja raha hai [1, 2, 3] types
    // Agar selectedBranchIds khali hai toh empty array ya 0 bhej sakte ho logic ke hisab se
    branchIds: this.searchFilters.branchIds && this.searchFilters.branchIds.length > 0 
               ? this.searchFilters.branchIds 
               : [] 
  };

  console.log("🚀 Payload with Branches:", payload);

  this.http.post<any[]>(`${environment.apiUrl}/Pricing/Search`, payload, { headers })
    .subscribe({
      next: (res: any) => {
        const rawData = Array.isArray(res) ? res : (res.data || []);
        
        // Data Mapping
        this.pricings = rawData.map((item: any) => ({
          ...item,
          pricingNo: item.pricingNo || item.PricingNo || 'N/A',
          customerName: item.organisationName || item.customerName || 'N/A',
          inquiryNo: item.referenceByInquiryNo || item.inquiryNo || '-',
          transportMode: item.transportMode || '-',
          status: (item.status === 1 || item.status === true) ? 1 : 0,
          // Agar UI par branch name dikhana hai toh:
          branchName: item.branchName || 'N/A'
        }));

        this.paginatedPricings = [...this.pricings];
        this.cdr.detectChanges();
        console.log("✅ Results found:", this.paginatedPricings.length);
      },
      error: (err) => {
        console.error("❌ Search failed:", err);
        this.pricings = [];
        this.paginatedPricings = [];
        this.cdr.detectChanges();
      }
    });
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
get totalPages(): number {
  return Math.ceil(this.quotations.length / this.pageSize) || 1;
}

// Page badalne ka function
setPage(page: number) {
  if (page < 1 || page > this.totalPages) return;
  this.currentPage = page;
  this.cdr.detectChanges();
}

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
toggleServicePopup() {
  if (this.showServicePopup) {
    this.showServicePopup = false;
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

  this.serviceSub?.unsubscribe();

  // 3. API Call with Headers
  this.serviceSub = this.http.get<any[]>(`${environment.apiUrl}/Pricing`, { headers }).subscribe({
    next: (res) => {
      // transportMode nikalna aur Duplicates hatana
      const uniqueModes = [...new Set(
        res
          .filter(item => item.transportMode && item.transportMode.trim() !== "")
          .map(item => item.transportMode)
      )];
console.log("Unique Transport Modes:", uniqueModes,res);
      this.allTransportModes = uniqueModes;
      this.showServicePopup = true;
      this.cdr.detectChanges(); 
      console.log("Transport modes loaded with token");
    },
    error: (err) => {
      console.error("Error fetching Inquiry Services", err);
      this.showServicePopup = false;
      this.cdr.detectChanges();
    }
  });
}

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
  if (!this.inquiry.organization) {
    alert("firstly save org");
    
    return;
  }
  console.log('testing of ids', this.organizationIds);
  this.isPreviewMode = true;
  
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
addToLocalReview() {
  console.log("--- Review Button Clicked ---");

  if (!this.inquiry.organization) {
    alert("firstly save org");
    return;
  }

  // 1. Check Modal Data (dimRows)
  console.log("1. Raw dimRows from Modal:", this.dimRows);

  // 2. Check Applied Data (appliedDimensions)
  console.log("2. Raw appliedDimensions:", this.appliedDimensions);

  let finalDimensions = [];

  // Agar dimRows array hai aur usme data hai
  if (this.dimRows && this.dimRows.length > 0) {
    // Filter kar rhe hain taaki khali rows na aayein
    finalDimensions = this.dimRows.filter(d => d.l || d.w || d.h);
    console.log("3. Filtered Dimensions from dimRows:", finalDimensions);
  } 
  
  // Agar dimRows khali tha, toh appliedDimensions check karo
  if (finalDimensions.length === 0 && this.appliedDimensions && this.appliedDimensions.length > 0) {
    finalDimensions = [...this.appliedDimensions];
    console.log("4. Using appliedDimensions instead:", finalDimensions);
  }

  if (finalDimensions.length === 0) {
    console.warn("⚠️ No dimensions found anywhere!");
  }

  const completeData = {
    lineOfBusiness: this.getLabel(this.companyServices, this.quotation.lineOfBusinessId),
    commodity: this.getLabel(this.commodityTypes, this.quotation.commodityId),
    incoTerm: this.quotation.incoTerm || 'N/A',
    cargoStatus: this.quotation.cargoStatus || 'Pending',
    noOfPkgs: this.quotation.noOfPkgs || 0,
    grossWeight: this.quotation.grossWeightKg || 0,
    chargeableWeight: this.quotation.chargeableWeight || 0,
    origin: this.inquiry.origin || 'N/A',
    finalDestination: this.quotation.finalDestination || 'N/A',
    pickupAddress: this.quotation.pickupAddress || 'N/A',
    dimensions: finalDimensions // Snapshot mein save kiya
  };

  this.localInquiryList = [completeData];
  console.log("5. Final Snapshot Saved:", this.localInquiryList);
  
  this.isPreviewMode = true;
}

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
    { label: 'INR', value: 'INR' },
    { label: 'USD', value: 'USD' },
    { label: 'AED', value: 'AED' }
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
  showAlert(type: string, id: any) {
  // Agar ID null ya undefined hai toh handle karne ke liye
  const displayId = id ? id : 'N/A';

  if (type === 'Organisation ID') {
    const orgId = id ? id : 'N/A';
    this.router.navigate(['/dashboard/organization-add'], { 
      queryParams: { highlightId: orgId } 
    });
  } 
  else if (type === 'Lead ID') {
    const leadId = id ? id : 'N/A';
    this.router.navigate(['/dashboard/salescrm/lead'], { 
      queryParams: { highlightId: leadId } 
    });
  }
  else {
    alert('Action performed: ' + type);
  }
}
  addCostRow() {
    this.costRows.push({
      lob: 'Standard', // Default value
      chargeName: '',
      chargeType: '',
      basis: '',
      currency: 'INR',
      rate: 0,
      exchangeRate: 1,
      amount: 0
    });
  }

  // Row delete karne ke liye (Index base par)
  removeCostRow(index: number) {
    if (this.costRows.length > 1) {
      this.costRows.splice(index, 1);
      this.calculateCost(); // Delete ke baad total recalculate karne ke liye
    }
  }

  // Calculation Logic: Amount = Rate * Exchange Rate
  calculateCost() {
    this.costRows.forEach(row => {
      if (row.rate && row.exchangeRate) {
        row.amount = row.rate * row.exchangeRate;
      } else {
        row.amount = 0;
      }
    });
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
      currency: 'USD',
      airFreight: 0,
      fsc: 'INC',
      airline: '',
      type: 'DIRECT',
      cutoff: '',
      schedule: '',
      exWorks: 0,
      doCharges: 0,
      ccFee: 0,
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

  addMultiCarrierRow() {
    this.multiCarrierRows.push(this.createEmptyRow());
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
  const httpOptions = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const pricingApiUrl = `${environment.apiUrl}/Pricing`;

  this.http.get<any[]>(pricingApiUrl, httpOptions).subscribe({
    next: (data) => {
      // 1. Sabse pehle main array mein data daalein
      this.pricings = data || []; 
      
      // 2. Ab Pagination wala array bharo jo table mein dikhta hai
      this.updatePagination(); 

      console.log("Pricings loaded and paginated:", this.paginatedPricings);
      this.cdr.detectChanges(); // UI refresh
    },
    error: (err) => {
      console.error("Error fetching pricings:", err);
    }
  });
}
updatePagination() {
  const startIndex = (this.currentPage - 1) * this.pageSize;
  const endIndex = startIndex + this.pageSize;
  
  // 'pricings' se data nikaal kar 'paginatedPricings' mein daalna
  this.paginatedPricings = this.pricings.slice(startIndex, endIndex);
}
saveQuotation() {
  if (!this.inquiry.organization) { 
    alert("Organization Name is required!");
    return;
  }

  // 1. Cost Breakdowns Mapping
  const costData = (this.costRows && this.costRows.length > 0 ? this.costRows : (this.costBreakdowns || [])).map((cb: any) => ({
    lob: cb.lob || '', 
    chargeType: cb.chargeType || '',
    basis: cb.basis || '',
    chargeName: cb.chargeName || cb.charge || '',
    currency: cb.currency || 'INR',
    rate: Number(cb.rate) || 0,
    exchangeRate: Number(cb.exchangeRate || (cb as any).exRate) || 1, 
    amount: Number(cb.amount) || 0
  }));

  // 2. Multi Carrier Mapping
  const multiCarrierData = (this.multiCarrierRows || []).map((mcb: any) => ({
    forwarder: mcb.forwarder || '',
    origin: mcb.origin || '',
    currency: mcb.currency || 'INR',
    airFreight: Number(mcb.airFreight) || 0,
    fsc: mcb.fsc || '',
    airline: mcb.airline || '',
    type: mcb.type || 'DIRECT',
    cutoff: mcb.cutoff || '',
    schedule: mcb.schedule || '',
    exWorks: Number(mcb.exWorks) || 0,
    doCharges: Number(mcb.doCharges) || 0,
    ccFee: Number(mcb.ccFee) || 0,
    totalCost: Number(mcb.totalCost) || 0,
    remark: mcb.remark || ''
  }));

  // 3. Payload Preparation (Types fixed as per Backend)
  const payload: any = {
    ...this.quotation, 
    
    // 🔥 TRANSPORT FIX: Explicitly toString() ensure karega ki text hi jaye
    transportMode: (this.quotation.transportMode || this.inquiry.transportMode || "").toString(), 
    transportType: (this.quotation.transportType || this.quotation.TransportType || this.inquiry.transportType || "").toString(),
    serviceType: (this.quotation.transportType || this.quotation.TransportType || this.inquiry.transportType || "").toString(), 
    shipmentType: (this.quotation.shipmentType || this.inquiry.shipmentType || "").toString(),

    // 🔥 COUNTRY NAME FIX: Null check hata kar empty string or actual value
    countryName: (this.selectedCountryName || this.quotation.countryName || this.inquiry.country || "").toString(),

    // 🔥 BACKEND TYPE FIX: OrganisationId aksar string hota hai database mein
    OrganisationId: this.organisationId || 0,
    OrganisationName: this.organisationName,
    customerName: this.inquiry.organization,
    InquiryId:this.InquiryId || 0,
    pricingNo: this.quotation.pricingNo || null,
    referenceByInquiryNo: this.referenceByInquiryNo || null,
    qtnId: this.quotation.qtnId || ('QTN-' + Math.floor(1000 + Math.random() * 9000)),
    originName: this.inquiry.origin || this.quotation.originPOL,

    // Numeric IDs (Inhe Number rehne do, ye IDs int? hote hain)
    portOfLoadingId: this.quotation.portOfLoadingId ? Number(this.quotation.portOfLoadingId) : null,
    portOfDischargeId: this.quotation.portOfDischargeId ? Number(this.quotation.portOfDischargeId) : null,
    lineOfBusinessId: this.quotation.lineOfBusinessId ? Number(this.quotation.lineOfBusinessId) : null,
    commodityId: this.quotation.commodity ? Number(this.quotation.commodity) : null,
    originId: this.originsaveid ? Number(this.originsaveid) : null,

    // Weight & Measures
    grossWeightKg: Number(this.quotation.grossWeightKg || this.quotation.grossWeight) || 0,
    grossWeightUnit: this.quotation.grossWeightUnit || this.quotation.GrossweightUnit || 'KGS',
    noOfPkgs: Number(this.quotation.noOfPkgs) || 0,

    // Relationships
    costBreakdowns: costData, 
    multiCarrierBreakdowns: multiCarrierData,
    dimensions: this.appliedDimensions || [],

    // String Field Fixes
    salesCoordinator: (this.quotation.salesCoordinator?.name || this.quotation.salesCoordinator || "").toString(),
    cargoStatus: (this.quotation.cargoStatus || this.quotation.cargoStatusType || 'Ready').toString(),
    cargoValue: (this.quotation.cargoValue || "0").toString(), // 🔥 Mandatory string fix
    cargoCurrency: (this.quotation.currency || 'INR').toString(),
    createdBy: 'admin@cavalierlogistic.in'
  };

  // 4. Final Cleanup: Delete keys that cause confusion in JSON
  const keysToDelete = [
    'TransportMode', 'TransportType', 'SalesCoordinator', 
    'GrossWeight', 'GrossweightUnit', 'CountryName'
  ];
  keysToDelete.forEach(key => delete payload[key]);

  console.log("FINAL PAYLOAD:", payload);

  const formData = new FormData();
  formData.append('pricingData', JSON.stringify(payload));

  // Documents
  const allDocs = [...(this.documents || []), ...(this.invoices || [])];
  allDocs.forEach((doc) => {
    if (doc.file) {
      formData.append('docFiles', doc.file);
      formData.append('docTypes', doc.category === 'invoice' ? 'Invoice' : (doc.name || 'General'));
    }
  });

  const token = localStorage.getItem('cavalier_token');
  const httpOptions = { headers: { Authorization: `Bearer ${token}` } };
  const pricingApiUrl = `${environment.apiUrl}/Pricing`;

  const action = this.quotation.id > 0 
    ? this.http.put(`${pricingApiUrl}/${this.quotation.id}`, formData, httpOptions)
    : this.http.post(pricingApiUrl, formData, httpOptions);

  action.subscribe({
    next: (res: any) => {

      this.sendBulkEmails(res.id);
      Swal.fire('Saved!', 'Pricing, Transport and Country saved successfully!', 'success');
      this.loadPricings(); 
      this.isFormOpen = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error("❌ API ERROR DETAILS:", err);
      alert("Error: " + (err.error?.message || "Internal Mapping Error"));
    }
  });
}
// Variables
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
showCountryDropdown: boolean = false;
countriesList: any[] = []; 
filteredCountries: any[] = [];

// 🔥 Ye variable declare karna zaroori tha error hatane ke liye
selectedCountryName: string = ''; 

fetchAllCountries() {
  const apiUrl = 'https://restcountries.com/v3.1/all';
  
  this.http.get<any[]>(apiUrl).subscribe({
    next: (data) => {
      // Data format: Name aur Code nikal rahe hain
      this.countriesList = data.map(country => ({
        name: country.name.common,
        id: country.cca2 
      })).sort((a, b) => a.name.localeCompare(b.name));
      
      this.filteredCountries = this.countriesList;
    },
    error: (err) => {
      console.error('Country API failed:', err);
      // Fallback
      this.countriesList = [{ id: 'IN', name: 'India' }];
      this.filteredCountries = this.countriesList;
    }
  });
}

// 🔍 Search Function
onCountrySearch() {
  const searchTerm = this.quotation.country?.toLowerCase() || '';
  this.showCountryDropdown = true;
  
  this.filteredCountries = this.countriesList.filter(c => 
    c.name.toLowerCase().includes(searchTerm)
  );
}

// ✅ Selection Function (Updated with selection logic)
selectCountry(country: any) {
  this.quotation.country = country.name;     // UI Input box ke liye
  this.quotation.countryId = country.id;     // Backend ID ke liye
  
  // 🔥 Ye line saveQuotation() ke payload mein data bhejegi
  this.selectedCountryName = country.name; 
  
  this.showCountryDropdown = false;
  console.log("Country Selected for Save:", this.selectedCountryName);
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

// 1. Load Data (POL + POD Merge)
loadConnectingPortsData() {
  const loadingApi = `${environment.apiUrl}/PortOfLoading`;
  const dischargeApi = `${environment.apiUrl}/PortOfDischarge`;

  this.http.get<any[]>(loadingApi).subscribe({
    next: (loadingData) => {
      this.http.get<any[]>(dischargeApi).subscribe({
        next: (dischargeData) => {
          const p1 = loadingData.map(p => ({ ...p, cpType: 'Loading', cpDisplayName: `${p.name} (POL)` }));
          const p2 = dischargeData.map(p => ({ ...p, cpType: 'Discharge', cpDisplayName: `${p.name} (POD)` }));
          this.allConnectingPorts = [...p1, ...p2];
          this.filteredConnectingPorts = [...this.allConnectingPorts];
        }
      });
    }
  });
}

// 2. Select/Toggle Port Logic
selectConnectingPort(port: any) {
  const index = this.selectedConnectingPorts.findIndex(
    p => p.id === port.id && p.cpType === port.cpType
  );

  if (index === -1) {
    // Agar nahi hai toh add karo
    this.selectedConnectingPorts.push(port);
  } else {
    // Agar pehle se hai toh remove karo (Toggle for Modal)
    this.selectedConnectingPorts.splice(index, 1);
  }
}

// 3. Simple Remove
removeConnectingPort(port: any) {
  this.selectedConnectingPorts = this.selectedConnectingPorts.filter(
    p => !(p.id === port.id && p.cpType === port.cpType)
  );
}

// 4. Modal Search
onSearchingConnectingPorts() {
  const term = this.cpSearchTerm.toLowerCase().trim();
  this.filteredConnectingPorts = this.allConnectingPorts.filter(p => 
    p.name.toLowerCase().includes(term)
  );
}

// 5. Toggle Modal
toggleConnectingPortModal() {
  this.isCPModalOpen = !this.isCPModalOpen;
  if (this.isCPModalOpen) {
    this.cpSearchTerm = '';
    this.filteredConnectingPorts = [...this.allConnectingPorts];
  }
}

// Helper to check if port is selected (for Modal UI)
isPortSelected(port: any): boolean {
  return this.selectedConnectingPorts.some(p => p.id === port.id && p.cpType === port.cpType);
}
selectInquiry(inq: any) {
  if (!inq || !inq.inquiryNo) {
    console.error("❌ Inquiry No missing!");
    return;
  }
  this.InquiryId=inq.id || 0;
  this.referenceByInquiryNo=inq.inquiryNo || 0;
  this.organisationId=inq.organisationId || 0;
  this.organisationName=inq.organisationName || '';
  
  console.log(this.organisationId,'changed in inquiry');

  const inquiryNo = inq.inquiryNo?.trim();
  const url = `${environment.apiUrl}/Inquiry/by-no?inquiryNo=${inquiryNo}`;
+
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

      // --- 2. Line of Business (LOB) ---
      this.quotation.lineOfBusinessId = data.lineOfBusinessId ? Number(data.lineOfBusinessId) : null;

      // --- 3. Transport Mode & Type ---
      if (data.transportMode) {
        const modeObj = this.transportModes.find(m => 
          m.name.toLowerCase() === data.transportMode.toLowerCase() || 
          m.id == data.transportMode
        );
        this.quotation.TransportMode = modeObj ? modeObj.id : data.transportMode;
      }

      this.quotation.TransportType = data.transportType || ''; 

      // --- 4. Other IDs & Pricing ---
      this.quotation.salesCoordinator = data.salesCoordinator ? Number(data.salesCoordinator) : null;
      this.quotation.commodity = data.commodityId ? Number(data.commodityId) : null;
      this.quotation.pricingDoneBy = data.pricingDoneBy || ''; 
      this.quotation.qtnDoneBy = data.qtnDoneBy || '';
      this.quotation.businessDimensions = data.businessDimensions || '';

      // --- 5. Movement & Ports ---
      this.quotation.shipmentType = data.shipmentType?.toString() || '';
      this.quotation.movementType = data.movementType || '';
      this.quotation.originPOL = data.originName || ''; 
      this.quotation.portOfLoading = data.portOfLoadingName || '';
      this.quotation.portOfDischarge = data.portOfDischargeName || '';
      this.quotation.podFinalDest = data.finalDestination || '';
      this.quotation.placeOfDelivery = data.placeOfDelivery || '';
      
      this.quotation.portOfDestination = data.portOfDischargeName || '';
      this.quotation.finalDestination = data.finalDestination || '';

      // 🔥 FIX: SERVICE TYPE AUTOFILL (Matching ngModel names) 🔥
      // Hum direct data se value utha rahe hain jo aapne upar object mein dikhayi hai
      this.quotation.isDirect = data.isDirect === true;
      this.quotation.isIndirect = data.isIndirect === true;

      // --- 5a. Connecting Ports Auto-fill ---
      this.selectedConnectingPorts = [];
      if (data.connectingPortIds) {
        const idsArray = Array.isArray(data.connectingPortIds) 
          ? data.connectingPortIds 
          : data.connectingPortIds.toString().split(',');

        this.selectedConnectingPorts = idsArray.map((id: any) => {
          const trimmedId = id.toString().trim();
          const masterPort = this.filteredConnectingPorts.find(p => p.id.toString() === trimmedId);
          return {
            id: trimmedId,
            name: masterPort ? masterPort.name : `Port ID: ${trimmedId}`,
            cpType: 'Transit'
          };
        });
      }

      // --- IncoTerms ---
      this.quotation.incoterm = data.incoterm || '';
      if (this.quotation.incoterm) {
        this.onIncotermChange({ target: { value: this.quotation.incoterm } });
      }

      // --- 6. Weights & Dimensions ---
      this.quotation.noOfPkgs = data.noOfPkgs || 0;
      this.quotation.grossWeightKg = data.grossWeightKg || 0;
      this.quotation.chargeableWeight = data.chargeableWeight || 0;
      this.quotation.volumeWeight = data.volumeWeight || 0;
      this.quotation.description = data.description || '';
      this.quotation.cargoValue = data.cargoValue || '';
      this.quotation.currency = data.cargoCurrency || '';

      if (data.cargoStatusDate) {
        this.quotation.cargoReadyDate = data.cargoStatusDate.split('T')[0];
      }

      // Dimensions mapping
      if (data.dimensions && data.dimensions.length > 0) {
        const firstDim = data.dimensions[0];
        this.dimRow = {
          box: firstDim.box || 0,
          l: firstDim.l || 0,
          w: firstDim.w || 0,
          h: firstDim.h || 0,
          unit: firstDim.unit || 'CMS'
        };

        if (data.dimensions.length > 1) {
          this.dimRows = data.dimensions.slice(1).map((d: any) => ({
            box: d.box, l: d.l, w: d.w, h: d.h, unit: d.unit || 'CMS'
          }));
        } else {
          this.dimRows = [];
        }
        this.calculateVolumeWeight();
      }

      // --- 8. Country ---
      this.quotation.country = data.countryName || '';

      // --- 9. Final UI Refresh ---
      this.showInquiryDropdown = false;
      this.showCountryDropdown = false; 
      this.showPortOfDischargeDropdown = false;

      this.cdr.detectChanges();
      
      if (this.quotation.lineOfBusinessId) {
        const event = { target: { value: this.quotation.lineOfBusinessId } };
        this.onLOBChange(event); 
      }

      setTimeout(() => {
        this.cdr.detectChanges();
      }, 200);
    },
    error: (err) => console.error("❌ API Error:", err)
  });
}
 token:string='';
 inquiryList: any[] = [];
   allInquiries: any[] = [];
gettoken(){
  this.token = localStorage.getItem('cavalier_token') || '';
  return this.token;
}
loadInquiryList() {
  // Toggle logic: Agar pehle se open hai toh band kar do
  if (this.showInquiryDropdown) {
    this.showInquiryDropdown = false;
    this.cdr.detectChanges();
    return;
  }

  // 1. LocalStorage se token nikalna
  const cavalierToken = localStorage.getItem('cavalier_token');

  // 2. Check karna ki token exists karta hai ya nahi
  if (!cavalierToken) {
    console.error("Auth Token (cavalier_token) missing in localStorage");
    // Aap yahan user ko login page par redirect bhi kar sakte hain
    return;
  }

  const url = `${environment.apiUrl}/Inquiry`;

  // 3. Request bhejna 'cavalier_token' ke saath
  this.http.get<any[]>(url, {
    headers: {
      'Authorization': `Bearer ${cavalierToken}`,
      'Content-Type': 'application/json'
    }
  }).subscribe({
    next: (res) => {
      this.inquiryList = res;
      this.filteredInquiries = res; // Search ke liye list update karna zaroori hai
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
  if (type === 'org') {
   this.router.navigate(['/dashboard/organization-add'], { 
            queryParams: { highlightId: id } 
          });
  } 
  else if (type === 'inq') {
    // Agar hum isi page par hain, toh seedha edit function call karenge
    // Agar kisi aur page se aa rahe hain, toh navigation ke baad data load karenge
    if (id) {
       // Isse URL change hoga aur inquiry page load hoga
       this.router.navigate(['/dashboard/salescrm/inquiry'], { queryParams: { editId: id } });
       
      
    }
  }
}
// 1. Edit Function
editPricing(pricing: any) {
  console.log("Editing Pricing:", pricing);

  // 1. Pehle pura data copy karein
  this.quotation = { ...pricing };

  // 2. Transport Mode Fix (Dropdown Autoselect)
  // Backend se "Air" aa raha hai, agar aapka dropdown ID (1, 2, 3) mangta hai:
  if (pricing.transportMode) {
    const modeObj = this.transportModes.find(m => 
      m.name.toLowerCase() === pricing.transportMode.toLowerCase()
    );
    // Agar list mein mil gaya toh ID set karein, warna direct string
    this.quotation.TransportMode = modeObj ? modeObj.id : pricing.transportMode;
  }

  // 3. Transport Type Fix (Import/Export)
  this.quotation.TransportType = pricing.transportType;

  // 4. Currency Fix (Cargo Value select)
  this.quotation.currency = pricing.cargoCurrency;

  // 5. Origin Name Display (Searchable input)
  this.inquiry.origin = pricing.originName;
  this.originsaveid = pricing.originId;

  // 6. Port Loading/Discharge Fix
  // Agar UI box mein naam nahi dikh raha toh ye zaroori hai:
  this.quotation.portOfLoading = pricing.portOfLoadingName || "";
  this.quotation.portOfDestination = pricing.portOfDischargeName || "";
  
  // Mapping IDs for dropdowns
  this.quotation.portOfLoadingId = pricing.portOfLoadingId;
  this.quotation.portOfDischargeId = pricing.portOfDischargeId;

  // 7. Organization & Inquiry Ref
  this.inquiry.organization = pricing.organisationName || pricing.customerName;
  this.quotation.referenceByInquiry = pricing.referenceByInquiryNo;

  // 8. Date Formatting (YYYY-MM-DD)
  if (pricing.receivedDate) {
    this.quotation.receivedDate = pricing.receivedDate.split('T')[0];
  }
  if (pricing.cargoStatusDate) {
    this.quotation.cargoStatusDate = pricing.cargoStatusDate.split('T')[0];
  }

  // 9. Tables Data (Cost & Multi-Carrier)
  this.costRows = pricing.costBreakdowns && pricing.costBreakdowns.length > 0 
    ? [...pricing.costBreakdowns] 
    : [{ lob: 'Standard', chargeName: '', chargeType: 'Prepaid', basis: 'Per KG', currency: 'INR', rate: 0, exchangeRate: 1, amount: 0 }];

  this.multiCarrierRows = pricing.multiCarrierBreakdowns && pricing.multiCarrierBreakdowns.length > 0 
    ? [...pricing.multiCarrierBreakdowns] 
    : [this.createEmptyRow()];

  // 10. Dimensions capture
  if (pricing.dimensions && pricing.dimensions.length > 0) {
    this.dimRows = [...pricing.dimensions];
    this.dimRow = { ...pricing.dimensions[0] };
    this.appliedDimensions = [...pricing.dimensions];
  }

  // Final: Open Form & Detect Changes
  this.isFormOpen = true;
  this.cdr.detectChanges();

  // Safety timeout for nested dropdowns
  setTimeout(() => {
    this.cdr.detectChanges();
  }, 200);
}
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
//         this.loadPricings(); // Table refresh karein
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
}