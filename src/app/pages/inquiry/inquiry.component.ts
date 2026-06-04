
import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
 

import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http'; 
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { CheckPermissionService } from '../../services/check-permission.service';
import { moveItemInArray, transferArrayItem, CdkDragDrop } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop'; // Ye import ensure karein
import { forkJoin, Subscription } from 'rxjs';
import { BranchService } from '../../services/branch.service';
import { UserService } from '../../services/user.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
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
  selector: 'app-inquiry',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule, DragDropModule],
  templateUrl: './inquiry.component.html',
  styleUrl: './inquiry.component.css',
})

  export class InquiryComponent implements OnInit {
    
    @ViewChild('cargoDateInput') cargoDateInput!: ElementRef<HTMLInputElement>;
    getsalescordinate: any[] = [];
    PermissionID:any;
    LeadId:number=0;
    originpinCode:any;
    OrganisationId:number=0;
    invoices: any[] = [];
  isInvoiceModalOpen = false;
documents: any[] = [];
  isDocumentModalOpen = false;
  OrganisationName:string='';
  LeadName:string='';
  // Preview ke liye nayi variables
  isPreviewModalOpen = false;
  agentDetail: any[] = [];
  selectedEmails: string[] = [];
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
  console.log("Function Triggered! Current Data:", this.dimRow); // Ye line sabse pehle daalo

  // 1. Pehle weight aur CBM calculate karein
  const weight = this.calculateSingleVolumeWeight(this.dimRow);
  this.quotation.volumeWeight = parseFloat(weight.toFixed(2));
  this.calculateCBM();

  // 2. AUTO-SAVE LOGIC
  this.dimRows = [{ ...this.dimRow }];
  
  // 3. Filtering
  this.appliedDimensions = this.dimRows.filter(d => d.l > 0 && d.w > 0 && d.h > 0);
  
  this.calculateNetWeight();
  this.calculateVolumeWeightLogic();
  
  // 4. SYNC
  this.syncFinalData(); 
  
  // 5. IMPORTANT
  this.quotation.dimensions = [...this.dimRows];
  console.log("Final Dimensions assigned to quotation:", this.quotation.dimensions); // Check karo array mein data aaya ya nahi
  
  this.updatePreview();
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
// Volume weight ya Gross Weight badalne par CBM aur Chargeable Weight dono update honge
calculateVolumeWeightLogic() {
  const gross = Number(this.quotation.grossWeightKg) || 0;
  const volume = Number(this.quotation.volumeWeight) || 0;

  // 1. CBM calculate hota rahega kyunki wo volume par depend hai
  this.quotation.cbm = parseFloat((volume / 167).toFixed(3));

  // 2. 🔥 NET WEIGHT WALI LINE HATA DI HAI 🔥
  // Ab ye hamesha wahi rahega jo aapne hath se likha hai.

  // 3. Chargeable Weight hamesha bada wala hi select karega (Gross vs Volume)
  this.quotation.chargeableWeight = parseFloat(Math.max(gross, volume).toFixed(2));

  this.cdr.detectChanges();
}
columnFieldMap: any = {
  'ID': 'id',
  'Inquiry No': 'inquiryNo',
  'Date': 'receivedDate',
  'Customer': 'customerName',
  'Mode': 'transportMode',
  // 'Origin': 'origin',
  'Destination': 'finalDestination', // 'finalDestination' property map kar di
  'Status': 'cargoStatus',
  'Sales Person': 'salesCoordinator'   // 'salesCoordinator' property map kar di
};

selectedColumns: string[] = ['ID', 'Inquiry No', 'Date', 'Customer', 'Status','LeadName','OrganisationName'];
availableColumns: string[] = ['Mode', 'Destination', 'Sales Person'];
    isFormOpen = false;
    public apiUrl = `${environment.apiUrl}/Inquiry`;
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
    constructor(private http: HttpClient, private router: Router,private route: ActivatedRoute,private cdr: ChangeDetectorRef,private branchservice:BranchService,public userServices:UserService,public CheckPermissionService:CheckPermissionService,private sanitizer: DomSanitizer,private eRef: ElementRef,) {}

    ngOnInit() {
      this.PermissionID = Number(localStorage.getItem('permissionID'));
    this.route.queryParams.subscribe(params => {
    const editId = params['editId'];
    if (editId) {
      console.log('Fetching data for Inquiry ID:', editId);
      this.loadInquiryById(Number(editId));
    }
  });
   this.getsales();
   this.loadConnectingPortsData();
      this.getbranch();
      this.loadQuotations();
      this.portOfLoading();
      this.quotation.cbmUnit = 'CBM';
      this.getPackageUnits();
       this.loadUomList();
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
// Add these to your class
isOrgModalOpen = false;

openOrgModal() {
  this.loadAllOrganizations(); // List load karo
  this.isOrgModalOpen = true; // Modal kholo
}

selectAndClose(org: any) {
  this.selectOrganization(org); // Data select karo
  this.isOrgModalOpen = false; // Modal band karo
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
filteredFinalDestinations: any[] = [];
showFinalDestinationDropdown = false;
// Naye variables yahan add karein:
 // 1. Data load karne ka function (agar pehle se nahi hai)
loadPortsData() {
  this.http.get<any[]>(`${environment.apiUrl}/PortSetup`).subscribe({
    next: (data) => {
      this.portsOfLoading = data; // Yahi master list use hogi
      console.log("Ports loaded for search:", data);
    },
    error: (err) => console.error("Error loading ports:", err)
  });
}
// Add these variables
// showFinalDestinationDropdown = false;
// filteredFinalDestinations = [];
activeFDIndex = -1; // Keyboard nav ke liye

onFinalDestinationSearch(type: 'name' | 'code') {
  const searchTerm = type === 'name' 
    ? (this.quotation.finalDestination || '').toLowerCase()
    : (this.quotation.finalDestinationCode || '').toLowerCase();

  if (!searchTerm) {
    this.filteredFinalDestinations = [];
    this.showFinalDestinationDropdown = false;
    this.activeFDIndex = -1;
    return;
  }

  this.filteredFinalDestinations = this.portsOfLoading.filter(port => {
    const pName = (port.name || port.portName || port.PortName || '').toLowerCase();
    const pCode = (port.portCode || '').toLowerCase();
    return pName.includes(searchTerm) || pCode.includes(searchTerm);
  });

  this.showFinalDestinationDropdown = this.filteredFinalDestinations.length > 0;
  this.activeFDIndex = -1;
}

selectFinalDestination(port: any) {
  if (!port) return;
  this.quotation.finalDestination = port.name || port.portName || port.PortName || '';
  this.quotation.finalDestinationCode = port.portCode;
  this.showFinalDestinationDropdown = false;
  this.filteredFinalDestinations = [];
  this.activeFDIndex = -1;
}

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
    if (this.activeFDIndex >= 0) {
      this.selectFinalDestination(this.filteredFinalDestinations[this.activeFDIndex]);
    } else if (this.filteredFinalDestinations.length > 0) {
      this.selectFinalDestination(this.filteredFinalDestinations[0]);
    }
  }
}

private scrollToActiveFD() {
  setTimeout(() => {
    const activeElement = document.querySelector('.bg-red-100');
    if (activeElement) activeElement.scrollIntoView({ block: 'nearest' });
  }, 0);
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
// Add these variables if missing
// showPortOfLoadingDropdown = false;
// filteredPortsOfLoading = [];

// Combined search logic (Code aur Name dono ke liye)
// 1. Variable initialize zaroor karna
activeIndex = -1;

// 2. Search Logic
onPortOfLoadingSearch(type: 'name' | 'code') {
  const searchTerm = type === 'name' 
    ? (this.quotation.portOfLoading || '').toLowerCase()
    : (this.quotation.portOfLoadingCode || '').toLowerCase();

  if (!searchTerm) {
    this.filteredPortsOfLoading = [];
    this.showPortOfLoadingDropdown = false;
    this.activeIndex = -1;
    return;
  }

  this.filteredPortsOfLoading = this.portsOfLoading.filter(port => {
    const pName = (port.name || port.portName || port.PortName || '').toLowerCase();
    const pCode = (port.portCode || '').toLowerCase();
    return pName.includes(searchTerm) || pCode.includes(searchTerm);
  });

  this.showPortOfLoadingDropdown = this.filteredPortsOfLoading.length > 0;
  this.activeIndex = -1; // Search karte hi index reset
}

// 3. Select Logic
selectPortOfLoading(port: any) {
  if (!port) return;
  this.quotation.portOfLoading = port.name || port.portName || port.PortName || '';
  this.quotation.portOfLoadingCode = port.portCode;
  this.showPortOfLoadingDropdown = false;
  this.filteredPortsOfLoading = [];
  this.activeIndex = -1;
}

// 4. Keyboard Navigation (Up/Down/Enter)
onPolKeyDown(event: KeyboardEvent) {
  if (!this.showPortOfLoadingDropdown) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (this.activeIndex < this.filteredPortsOfLoading.length - 1) {
      this.activeIndex++;
      this.scrollToActive();
    }
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (this.activeIndex > 0) {
      this.activeIndex--;
      this.scrollToActive();
    }
  } else if (event.key === 'Enter') {
    event.preventDefault();
    if (this.activeIndex >= 0) {
      this.selectPortOfLoading(this.filteredPortsOfLoading[this.activeIndex]);
    } else if (this.filteredPortsOfLoading.length > 0) {
      // Agar koi select nahi kiya par list khuli hai, toh pehla select karlo
      this.selectPortOfLoading(this.filteredPortsOfLoading[0]);
    }
  }
}

// Auto-Scroll helper function
private scrollToActive() {
  setTimeout(() => {
    const activeElement = document.querySelector('.bg-red-100');
    if (activeElement) {
      activeElement.scrollIntoView({ block: 'nearest' });
    }
  }, 0);
}

// Outside click logic

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
    // alert('lob changed'+this.quotation.lineOfBusinessId);
  const selectedId = event.target.value;
  


  const selectedService = this.companyServices.find(s => s.id == selectedId);

  if (!selectedService || !selectedService.serviceName) {
    console.warn("No service found for ID:", selectedId);
    return;
  }

  const fullName = selectedService.serviceName.trim();
  
  this.quotation.lineOfBusinessName = fullName;

  const parts = fullName.split(/[\s\-]+/);

  if (parts.length >= 1) {
    const modeName = parts[0]; // AIR

    // 🔥 Yaha main fix hai
    const modeObj = this.transportModes.find(
      m => m.name.toLowerCase() === modeName.toLowerCase()
    );

    if (modeObj) {
      this.quotation.TransportMode = modeObj.id; // ✅ ID set hoga
    } else {
      console.warn("Mode not found:", modeName);
    }

    if (parts.length >= 2) {
      let lastWord = parts[parts.length - 1];
      this.quotation.TransportType =
        lastWord.charAt(0).toUpperCase() + lastWord.slice(1).toLowerCase();
    }
  }

  console.log(`Auto Filled → Mode ID: ${this.quotation.TransportMode}`);
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
  // if (this.quotation.isDirect) this.quotation.isIndirect = false;
  // if (this.quotation.isIndirect) this.quotation.isDirect = false;
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
 
fetchOrigins() {
  const url = `${environment.apiUrl}/origin/all`;
  this.http.get<any[]>(url).subscribe({
    next: (data) => {
      this.origins = data;
      console.log('API se data mila: origin ka ', data); // <--- Yeh check karein browser console mein
    },
    error: (err) => console.error('API Error:', err)
  });
}
  // --- Search Logic ---
// --- Search Logic ---
onOriginSearchInput() {
  const searchTerm = (this.inquiry.origin || '').toString().trim().toLowerCase();

  if (searchTerm === '') {
    this.showOriginDropdown = false;
    this.filteredOrigins = [];
    return;
  }

  // Ab 'name' field ke basis par filter hoga
  this.filteredOrigins = this.origins.filter(org => {
    return (org.name || '').toLowerCase().includes(searchTerm) || 
           (org.countryName || '').toLowerCase().includes(searchTerm);
  });

  this.showOriginDropdown = true;
}

// 1. Click outside handle karne ke liye (ya toh blur use karein ya HostListener)
// Yahan hum `(blur)` ka use kar rahe hain input par taaki focus hatne par list band ho.

selectOrigin(origin: any) {
  this.originsaveid = origin.id;
  this.inquiry.origin = origin.name;
  
  if (this.quotation) {
    this.quotation.country = origin.countryName;
  }
  
  this.showOriginDropdown = false; // List band
  if (origin.pinCode) this.fetchAgentByPostCode(origin.pinCode);
}

// Enter key press karne par pehla filtered result select karne ke liye
onOriginKeyDown(event: any) {
  if (event.key === 'Enter' && this.filteredOrigins.length > 0) {
    event.preventDefault(); // Form submit hone se rokne ke liye
    this.selectOrigin(this.filteredOrigins[0]);
  }
}
// Global Click Listener: Agar click component ke bahar hua, toh list band
@HostListener('document:click', ['$event'])
clickout(event: any) {
  if(!this.eRef.nativeElement.contains(event.target)) {
    this.showOriginDropdown = false;
  }
  const clickedInside = this.eRef.nativeElement.contains(event.target);
  if (!clickedInside) {
    this.showPortOfDischargeDropdown = false;
  }
    if (this.eRef && !this.eRef.nativeElement.contains(event.target)) {
    this.showPortOfLoadingDropdown = false;
  }
    if (this.eRef && !this.eRef.nativeElement.contains(event.target)) {
    this.showFinalDestinationDropdown = false;
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
  const email = agent.email || agent.Email; // Case sensitivity handle karne ke liye

  if (!email) {
    console.warn("Email Not Found OF This Agent");
    return;
  }

  if (event.target.checked) {
    // 1. Agar check kiya toh array mein dalo
    this.selectedEmails.push(email);
  
  } else {
    // 2. Agar uncheck kiya toh array se hatao
    this.selectedEmails = this.selectedEmails.filter(e => e !== email);
    
  }

  // Final array jo aapko send mail ke liye chahiye
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
// Add this variable in your class
// showPortOfDischargeDropdown = false;

// 1. Search Logic (Works for both Code and Name)
onPortOfDischargeSearch(type: 'name' | 'code') {
  const searchTerm = type === 'name' 
    ? (this.quotation.portOfDestination || '').toLowerCase()
    : (this.quotation.portOfDestinationCode || '').toLowerCase();

  if (!searchTerm) {
    this.showPortOfDischargeDropdown = false;
    return;
  }

  this.filteredPortsOfDischarge = this.portsOfDischarge.filter(port => {
    const pName = (port.name || port.portName || port.PortName || '').toLowerCase();
    const pCode = (port.portCode || '').toLowerCase();
    return pName.includes(searchTerm) || pCode.includes(searchTerm);
  });

  this.showPortOfDischargeDropdown = this.filteredPortsOfDischarge.length > 0;
}

// 2. Select Method
selectPortOfDischarge(port: any) {
  if (!port) return;
  this.quotation.portOfDestination = port.name || port.portName || port.PortName;
  this.quotation.portOfDestinationCode = port.portCode;
  this.showPortOfDischargeDropdown = false;
}

// 3. Enter Key handler
onPortOfDischargeKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' && this.filteredPortsOfDischarge.length > 0) {
    this.selectPortOfDischarge(this.filteredPortsOfDischarge[0]);
    event.preventDefault();
  }
}

// 4. Close dropdown on outside click


  // --- Selection Logic ---
 selectLead(lead: any) {
  if (!lead) return;

  // 🔥 Yahan Lead ID console mein dikhega
  console.log("Selected Lead ID (from list):", lead.id); 

console.log("Selected Lead's Organization ID:", lead.organisationId);
  this.inquiry.leadNo = lead.leadNo;
 // Agar lead ke sath organization ka naam bhi aata hai toh
  this.showLeadDropdown = false;
console.log("Lead selected, now fetching full details for Lead ID:", this.LeadId);
console.log("Lead No set to:", this.OrganisationId);
  // Pura data fetch karne ke liye call
  this.loadLeadByLeadNo(lead.leadNo);
}
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
  const url = `${environment.apiUrl}/Inquiry/NextInquiryNo`;
  
  // Pehle UI ko khali dikhao taaki user ko lage ki naya generate ho raha hai
  this.inquiry.inquiryNo = 'Loading...';

  this.http.get(url, { responseType: 'text' }).subscribe({
    next: (nextNo) => {
      this.inquiry.inquiryNo = nextNo;
      console.log("New Inquiry Number Generated:", nextNo);
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error("Number generation failed:", err);
      this.inquiry.inquiryNo = 'AUTO-GEN'; // Fallback
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

  if (this.isFormOpen) {
    // Check karein ki ye Edit click se toh nahi khula (id check)
    if (!this.quotation.id || this.quotation.id === 0) {
      console.log("Adding New Inquiry - Resetting form...");
      
      // 1. Saare data models reset karein
      this.quotation = this.resetQuotationModel();
      this.inquiry = {
        inquiryNo: '',
        customerName: '',
        organization: '',
        organizationAddress: '',
        leadNo: '',
        isDirect: false,
        isIndirect: false,
        origin: ''
      };
      this.appliedDimensions = [];
      this.dimRows = [{ box: 1, l: 0, w: 0, h: 0, unit: 'CMS' }];
      this.dimRow = { box: 1, l: 0, w: 0, h: 0, unit: 'CMS' };
      this.isPreviewMode = false;
      this.LeadId = 0;
      this.OrganisationId = 0;

      // 2. Naya Inquiry Number fetch karein
      this.getNextInquiryNumber();
    }
  } else {
    // Form band karte waqt states reset karein
    this.isPreviewMode = false;
    this.quotation.id = 0; // Reset ID taaki agli baar naya samjhe
  }
  
  this.cdr.detectChanges();
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
  // Check karo ki list load ho gayi hai, agar hai toh pehli unit lo, warna 'CMS'
  const defaultUnit = (this.uomList && this.uomList.length > 0) 
                      ? this.uomList[0].shortCode 
                      : 'CMS';

  this.dimRows.push({
    box: 1,
    l: 0,
    w: 0,
    h: 0,
    unit: defaultUnit // Yahan dynamic value set ho gayi
  });

  // Change Detection zaroori hai agar row show nahi ho rahi
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
  this.calculateTotalPackages(); // Ye line add ki hai
  this.quotation.dimensions = [...this.dimRows];
  
  // 2. Preview ko update karne ke liye call karein
  this.updatePreview();
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
    // ✅ Ye declare karna zaroori hai
  commodityDocuments: any[] = [];
  packageOrInvoiceDocuments: any[] = [];
  // public apiUrl = environment.apiUrl;
editQuotation(q: any) {
  console.warn('Backend Data for Autofill:', q);
  if (!q) {
    console.error('No data received in editQuotation');
    return;
  }

  try {
    this.quotation = { ...q };

    // --- DOCUMENTS MAPPING ---
    // 1. Backend response se list fill karo
    this.commodityDocuments = q.commodityDocuments || [];
    this.packageOrInvoiceDocuments = q.packageOrInvoiceDocuments || [];
    
    // 2. Commodity Modal ke liye mapping
    this.documents = (q.commodityDocuments || []).map((doc: any) => ({
      id: doc.id,
      name: doc.name,
      documentPath: doc.documentPath,
      isExisting: true 
    }));

    // 3. Invoice Modal ke liye mapping (Yeh add kiya hai)
    this.invoices = (q.packageOrInvoiceDocuments || []).map((doc: any) => ({
      id: doc.id,
      name: doc.name,
      documentPath: doc.documentPath,
      isExisting: true 
    }));
    
    // Transport Mode Mapping
    this.quotation.TransportMode = q.transportMode; 
    if (q.transportType && typeof q.transportType === 'string' && q.transportType.length > 0) {
      this.quotation.TransportType = q.transportType.charAt(0).toUpperCase() + q.transportType.slice(1).toLowerCase();
    }
    if (this.transportModes && Array.isArray(this.transportModes)) {
      const modeObj = this.transportModes.find(m => m && m.name && m.name.toLowerCase() === (q.transportMode || '').toLowerCase());
      if (modeObj) this.quotation.TransportMode = modeObj.id;
    }

    // Sales Coordinator Mapping
    if (q.salesCoordinator) {
      this.quotation.salesCoordinator = q.salesCoordinator.toString();
      if (this.getsalescordinate && Array.isArray(this.getsalescordinate)) {
        const coordinatorExists = this.getsalescordinate.find(sc => sc && sc.id && sc.id.toString() === q.salesCoordinator.toString());
        if (coordinatorExists) this.quotation.salesCoordinator = coordinatorExists.id.toString();
      }
    }

    this.quotation.commodity = q.commodityId ? Number(q.commodityId) : null;
    this.quotation.currency = q.cargoCurrency; 
    this.originsaveid = q.originId ? Number(q.originId) : 0;
    this.quotation.country = q.countryName; 
    this.selectedCountryName = q.countryName; 
    this.quotation.portOfLoadingId = q.portOfLoadingId ? Number(q.portOfLoadingId) : null;
    this.quotation.portOfDischargeId = q.portOfDischargeId ? Number(q.portOfDischargeId) : null;

    if (this.portsOfLoading && Array.isArray(this.portsOfLoading)) {
      const pol = this.portsOfLoading.find(p => p && p.id == q.portOfLoadingId);
      if (pol) this.quotation.portOfLoading = pol.name || pol.portName;
    }
    if (this.portsOfDischarge && Array.isArray(this.portsOfDischarge)) {
      const pod = this.portsOfDischarge.find(p => p && p.id == q.portOfDischargeId);
      if (pod) this.quotation.portOfDestination = pod.name || pod.portName;
    }

    this.inquiry = { ...this.inquiry, inquiryNo: q.inquiryNo, organization: q.organisationName || q.customerName, origin: q.location || q.originName || q.origin, leadNo: q.leadName || q.leadNo };
    this.quotation.branchName = q.branchId ? q.branchId.toString() : q.branchName;
    this.quotation.salesCoordinator = q.salesCoordinator ? q.salesCoordinator.toString() : '';
    
    // --- CONNECTING PORTS MAPPING ---
    const rawPorts = q.connectingPortIds || q.ConnectingPortIds;
    const portIdsArray = typeof rawPorts === 'string' ? rawPorts.split(',').map(Number) : (Array.isArray(rawPorts) ? rawPorts : []);
    this.quotation.connectingPortIds = portIdsArray;

    const allKnownPorts = [...(this.portsOfLoading || []), ...(this.portsOfDischarge || [])];
    this.selectedConnectingPorts = allKnownPorts.filter(p => portIdsArray.includes(Number(p.id)));
    
    // Set commodity value for UI logic
    this.selectcommodityvalue = q.commodityName || '';
    
    // Date Parsing
    try {
      if (q.receivedDate) this.quotation.receivedDate = new Date(q.receivedDate).toISOString().split('T')[0];
      if (q.cargoStatusDate) this.quotation.cargoStatusDate = new Date(q.cargoStatusDate).toISOString().split('T')[0];
      if (q.repliedDate && q.repliedDate !== '2000-02-12T00:00:00') this.quotation.repliedDate = new Date(q.repliedDate).toISOString().split('T')[0];
    } catch (dateErr) { console.error('Date parsing issue:', dateErr); }

    // Dimensions
    if (q.dimensions && q.dimensions.length > 0) {
      this.appliedDimensions = [...q.dimensions];
      this.dimRows = [...q.dimensions];
      this.dimRow = { ...q.dimensions[0] }; 
    } else {
      this.dimRows = [{ box: 1, l: 0, w: 0, h: 0, unit: 'CMS' }];
    }

    this.calculateCBM();
    const incoterm = (q.incoterm || '').toUpperCase();
    this.isPickupEnabled = (incoterm === 'EXWORK');
    this.isDeliveryEnabled = ['DDP', 'DDU', 'DAP'].includes(incoterm);
    this.showincoterms = incoterm;

    // 🔥 Force UI refresh
    this.isFormOpen = true;
    this.cdr.detectChanges(); 
    setTimeout(() => this.cdr.detectChanges(), 300);

  } catch (mainError) {
    console.error("🛑 Internal logic crash:", mainError);
    this.isFormOpen = true;
    this.cdr.detectChanges();
  }
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
    // --- COMMAND: IS SECTION KO REPLACE KAREIN ---
  searchFilters: any = { 
    transportMode: 'Any',
    inquiryNo: '',
    branchName: '',
    salesCoordinator: '',
    cargoStatus: '(Any)',
    receivedDate: null, 
    showMode: 'valid'
  };
 
 // Variables define karein
allUniqueServices: string[] = []; 
filteredServices: string[] = [];

loadDropdownData() {
  const token = localStorage.getItem('cavalier_token');

  const headers = {
    Authorization: `Bearer ${token}`
  };

  this.http.get<any[]>(`${environment.apiUrl}/Inquiry`, { headers })
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
      // Default 'today' rahega
      targetDate = today;
  }

  // Proper YYYY-MM-DD format build karein
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  
  this.searchFilters.receivedDate = `${year}-${month}-${day}`;
  
  // Panel band karein aur search trigger karein
  this.showCustomPicker = false;
  this.onSearch();
}

//-----/////
onSearch() {
  console.log("Search button clicked!");
  this.searchDone = true;

  const filtersToSend: any = { ...this.searchFilters };

  // --- Cleaning Logic ---
  if (filtersToSend.transportMode === 'Any') filtersToSend.transportMode = '';
  if (filtersToSend.cargoStatus === '(Any)') filtersToSend.cargoStatus = '';
  if (filtersToSend.salesCoordinator === 'null' || !filtersToSend.salesCoordinator) filtersToSend.salesCoordinator = "";
  if (filtersToSend.status === "" || filtersToSend.status === undefined || filtersToSend.status === null) {
    filtersToSend.status = null;
  } else {
    filtersToSend.status = Number(filtersToSend.status);
  }
  if (this.branchSearchText && this.branchSearchText !== "") {
    const bId = Number(this.searchFilters.branchId);
    filtersToSend.branchId = isNaN(bId) ? null : bId;
    delete filtersToSend.branchName;
  } else {
    filtersToSend.branchId = null;
  }

  const token = localStorage.getItem('cavalier_token');
  const httpOptions = {
    headers: new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    })
  };

  // --- ForkJoin Implementation ---
  forkJoin({
    searchResult: this.http.post<any[]>(`${environment.apiUrl}/Inquiry/Search`, filtersToSend, httpOptions),
    hodList: this.userServices.getHodList()
  }).subscribe({
    next: (res) => {
      const { searchResult, hodList } = res;
      
      // DEBUG: Yahan dekho console mein kya structure aa raha hai
      console.log("HOD List Structure:", hodList); 

      // MAPPING LOGIC
      // Agar console mein 'id' ki jagah kuch aur hai (jaise 'userId'), toh niche badal dena
      const hodMap = new Map(hodList.map((h: any) => [String(h.id), h.name]));

      this.quotations = searchResult.map(item => {
        const idAsString = String(item.salesCoordinator);
        return {
          ...item,
          // Agar map mein naam milta hai, toh wo show karo, nahi toh ID hi dikhegi
          salesCoordinator: hodMap.has(idAsString) ? hodMap.get(idAsString) : item.salesCoordinator
        };
      });

      console.log("Final Data with Names:", this.quotations);
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error("Search failed:", err);
      alert("Error loading data!");
    }
  });
}
// --- Variables ---
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
currentPage: number = 1;
pageSize: number = 10; // Ek page par kitne records dikhane hain
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
  this.serviceSub = this.http.get<any[]>(`${environment.apiUrl}/Inquiry`, { headers }).subscribe({
    next: (res) => {
      // transportMode nikalna aur Duplicates hatana
      const uniqueModes = [...new Set(
        res
          .filter(item => item.transportMode && item.transportMode.trim() !== "")
          .map(item => item.transportMode)
      )];

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

  // 1. API Call (Inquiry list + HOD List)
  this.coordinatorSub?.unsubscribe();

  // Dono calls parallel mein chalao
  this.coordinatorSub = forkJoin({
    inquiries: this.http.get<any[]>(`${environment.apiUrl}/Inquiry`, { 
      headers: new HttpHeaders({ 'Authorization': `Bearer ${localStorage.getItem('cavalier_token') || ''}` }) 
    }),
    hodList: this.userServices.getHodList()
  }).subscribe({
    next: (res) => {
      const { inquiries, hodList } = res;

      // HOD list ka map (id -> name)
      const hodMap = new Map(hodList.map((h: any) => [String(h.id), h.name]));

      // 2. SalesCoordinator IDs nikaalo, map se Name lao, aur duplicates/empty hatado
      const uniqueNames = [...new Set(
        inquiries
          .filter(item => item.salesCoordinator && item.salesCoordinator.trim() !== "")
          .map(item => {
            const coordId = String(item.salesCoordinator);
            // Agar map mein naam mil gaya toh wo lo, warna original ID hi dikha do
            return hodMap.get(coordId) || coordId;
          })
      )];

      this.allCoordinators = uniqueNames;
      this.showCoordinatorPopup = true;
      this.cdr.detectChanges();
      console.log("Coordinator list loaded with Names");
    },
    error: (err) => {
      console.error("Error fetching data", err);
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
selectInquiry(inq: any) {
  if (!inq) {
    console.warn("Invalid lead selected");
    return;
  }

  // 🔥 Yahan Lead ID console mein dikhega
  console.log("Selected Lead ID (from Modal):", inq);
 this.LeadId = inq.id;
  this.OrganisationId = inq.organisationId; 
  this.OrganisationName = inq.organizationName;
  this.LeadName = inq.leadNo;
  console.log("Selected Lead's Organisation ID:", inq.organisationId);
  this.inquiry.leadNo = inq.leadNo || inq.inquiryNo;
  this.showInquiryDropdown = false;
  this.isSearchModalOpen = false;

  // Full data load karne ke liye
  this.loadLeadByLeadNo(this.inquiry.leadNo);
}
// ================== LOAD FULL LEAD BY LEADNO ==================
// ================== LOAD FULL LEAD BY LEADNO ==================
loadLeadByLeadNo(leadNo: string) {
  if (!leadNo) return;

  const url = `${environment.apiUrl}/Leads/byLeadNo?leadNo=${encodeURIComponent(leadNo)}`;

  this.http.get<any>(url).subscribe({
    next: (leadData) => {
      console.log("✅ Full Lead Data Received:", leadData);

      this.selectedLeadData = leadData;

      // Form auto-fill
      this.inquiry.leadNo = leadData.leadNo || leadData.LeadNo;

      if (leadData.organizationName) {
        this.inquiry.organization = leadData.organizationName;
        this.quotation.organizationName = leadData.organizationName;
      }
      if (leadData.organisationId) {
        this.organizationIds = leadData.organisationId;
      }

      if (leadData.location) this.quotation.location = leadData.location;
      if (leadData.branch) this.quotation.branchName = leadData.branch;
      if (leadData.type) this.quotation.type = leadData.type;
if (leadData.salesCoordinator) {
        // Lead se "25" jaise ID aa raha hai
        this.quotation.salesCoordinator = leadData.salesCoordinator.toString(); 
        // .toString() isliye taaki type match ho (agar sc.id number hai toh bhi safe rahe)
      }
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error("❌ Error fetching lead:", err);
      if (err.status === 404) {
        alert(`Lead ${leadNo} not found!`);
      } else {
        alert("Failed to load lead details");
      }
    }
  });
}
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
  const selectedBranches = this.branchList.filter(b => b.isSelected);
  console.log("📍 Branches found with isSelected=true:", selectedBranches);

  if (selectedBranches.length > 0) {
    // 1. Sabse important: searchFilters mein ID daalo (Yahi pichli baar miss ho raha tha)
    this.searchFilters.branchId = selectedBranches[0].branchId || selectedBranches[0].id;
    
    // 2. Input box mein Name dikhao
    const selectedNames = selectedBranches.map(b => b.branchName);
    this.branchSearchText = selectedNames.join(', ');
  } else {
    this.searchFilters.branchId = '';
    this.branchSearchText = '';
  }

  console.log("📝 Input field updated to:", this.branchSearchText);
  console.log("🆔 Branch ID saved in filters:", this.searchFilters.branchId);

  this.isBranchModalOpen = false;
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
    if (!id) {
      Swal.fire({
        title: 'Validation Deficiency',
        text: 'The provided Organization identifier appears to be null. Please ensure a valid ID is selected.',
        icon: 'warning',
        confirmButtonColor: '#4a3f3f'
      });
      return;
    }

    // 1. API call to check Organization existence
    this.http.get(`${environment.apiUrl}/Organization/exists/${id}`).subscribe({
      next: (res: any) => {
        if (res.exists) {
          // 2. Redirect and highlight
          this.router.navigate(['/dashboard/organization-add'], { 
            queryParams: { highlightId: id } 
          });
        } else {
          // 3. Error message if ID not in DB
          Swal.fire({
            title: 'Resource Unavailability',
            text: 'The requested Organization record does not correspond to any active entry within our database repository.',
            icon: 'error',
            confirmButtonColor: '#4a3f3f'
          });
        }
      },
      error: (err) => {
        console.error("Verification anomaly for Organization:", err);
        Swal.fire({
          title: 'System Inconsistency',
          text: 'A transient error occurred while attempting to retrieve the record. Please verify your connection status.',
          icon: 'error',
          confirmButtonColor: '#4a3f3f'
        });
      }
    });
  } 
  
  else if (type === 'Lead ID') {
    if (!id) {
      Swal.fire({
        title: 'Validation Deficiency',
        text: 'The provided Lead identifier is malformed or invalid.',
        icon: 'warning',
        confirmButtonColor: '#4a3f3f'
      });
      return;
    }

    // Call the Leads exists endpoint
    this.http.get(`${environment.apiUrl}/Leads/exists/${id}`).subscribe({
      next: (res: any) => {
        if (res.exists) {
          this.router.navigate(['/dashboard/salescrm/lead'], { 
            queryParams: { highlightId: id } 
          });
        } else {
          Swal.fire({
            title: 'Resource Unavailability',
            text: 'No Lead record could be identified within the system registry for the provided ID.',
            icon: 'error',
            confirmButtonColor: '#4a3f3f'
          });
        }
      },
      error: (err) => {
        console.error("Lead existence check failed:", err);
        Swal.fire({
          title: 'System Inconsistency',
          text: 'Unable to perform verification against the Lead registry at this juncture.',
          icon: 'error',
          confirmButtonColor: '#4a3f3f'
        });
      }
    });
  } 
  
  else {
    // Default fallback for other types
    Swal.fire({
      title: 'Action Acknowledged',
      text: `The operation for ${type} has been initialized successfully.`,
      icon: 'info',
      confirmButtonColor: '#4a3f3f'
    });
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

saveQuotation() {
  // Basic validation
  if (!this.inquiry.organization) { 
    alert("Organization Name is required!");
    return;
  }

  // 1. JSON Payload Taiyaar Karna
  const payload = {
    ...this.quotation, // Purana saara data uthaya
    inquiryNo: this.inquiry.inquiryNo || '',
    customerName: this.inquiry.organization,
    organization: this.inquiry.organization,
    shipmentType: this.quotation.shipmentType?.toString() || '',
    leadNo: this.inquiry.leadNo || '',
    leadId: this.LeadId,
    OrganisationId: this.OrganisationId,
    LeadName: this.LeadName,
    OrganisationName: this.OrganisationName,
    origin: this.inquiry.origin || '',
    TransportMode: this.quotation.transportMode,
    TransportType: this.quotation.TransportType,

    HazardDocPath: this.quotation.hazardDocPath || null,
    weightUnit: this.quotation.GrossweightUnit || 'KGS',
    cargocurrency: this.quotation.currency || 'INR',
    cargoValue: this.quotation.cargoValue?.toString() || "0",
    lineOfBusinessId: this.quotation.lineOfBusinessId ? Number(this.quotation.lineOfBusinessId) : null,
    lineOfBusinessName: this.quotation.lineOfBusinessName || null,
    commodityId: this.quotation.commodity, 
    originId: this.originsaveid,
    portOfLoadingId: !isNaN(Number(this.quotation.portOfLoadingId)) && Number(this.quotation.portOfLoadingId) > 0 ? Number(this.quotation.portOfLoadingId) : null,
    portOfDischargeId: !isNaN(Number(this.quotation.portOfDischargeId)) && Number(this.quotation.portOfDischargeId) > 0 ? Number(this.quotation.portOfDischargeId) : null,
    cargoStatus: this.quotation.cargoStatusType || 'Ready',
    createdBy: 'admin@cavalierlogistic.in', 
    qtnId: this.quotation.qtnId || ('QTN-' + Math.floor(1000 + Math.random() * 9000)),
    createdDate: new Date().toISOString(),
    dimensions: this.appliedDimensions || [],

    countryName: this.selectedCountryName || this.quotation.country || null,
    connectingPortIds: this.selectedConnectingPorts && this.selectedConnectingPorts.length > 0 
                        ? this.selectedConnectingPorts.map((p: any) => p.id).join(',') 
                        : null,

    // 🔥 SERVICE TYPE FIX (Sabse niche rakha hai taaki overwrite na ho) 🔥
    // Inhe forcefully boolean mein convert kiya hai jo aapne checkbox tick kiya hai wahi jayega
    isDirect: Boolean(this.quotation.isDirect),
    isIndirect: Boolean(this.quotation.isIndirect),
    serviceType: (this.searchFilters?.transportMode || this.quotation.serviceType || "").toString()
  };

  console.log("FINAL PAYLOAD BEFORE SENDING:", payload); // Console mein check kar lena ek baar

  // 2. FormData Create Karna (No Cost/Multi-Carrier as per your requirement)
  const formData = new FormData();
  formData.append('inquiryData', JSON.stringify(payload));

  // 3. Documents Logic
  if (this.documents && this.documents.length > 0) {
    this.documents.forEach((doc) => {
      if (doc.file) {
        formData.append('commodityFiles', doc.file);
        formData.append('documentNames', doc.name || doc.fileName);
      }
    });
  }
  if (this.invoices && this.invoices.length > 0) {
    this.invoices.forEach((inv) => {
      if (inv.file) {
        formData.append('invoiceFiles', inv.file);
        formData.append('invoiceNames', inv.name || inv.fileName);
      }
    });
  }

  // 4. Headers
  const token = localStorage.getItem('cavalier_token');
  const httpOptions = {
    headers: { Authorization: `Bearer ${token}` }
  };

  // 5. Backend Call
  const action = this.quotation.id > 0 
    ? this.http.put(`${this.apiUrl}/${this.quotation.id}`, formData, httpOptions)
    : this.http.post(this.apiUrl, formData, httpOptions);

  action.subscribe({
    next: () => {
      alert("Success: Saved in CavalierDB!");
      
      this.isFormOpen = false;
      this.showMultiCarrierTable = false; 
      this.showCostTable = false; 
      
      this.documents = []; 
      this.invoices = [];
      this.multiCarrierRows = []; 
      this.costRows = []; 

      this.loadQuotations();
      
      if (this.toggleForm) {
        this.toggleForm();
      }
      
      this.getNextInquiryNumber();
      this.cdr.detectChanges();
    },
    error: (err) => {
       console.error("Post Error Details:", err);
       alert("Failed to save: " + (err.error?.message || "Check Backend Connection."));
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
// calculateMultiTotal(index: number) {
//   let row = this.multiCarrierRows[index];
//   // Aap apne calculation logic ke hisaab se ise change kar sakte hain
//   row.totalCost = (Number(row.airFreight) || 0) + (Number(row.exWorks) || 0) + (Number(row.ccFee) || 0);
// }

showRowModal = false;
selectedInquiryId: any = null;

// Double click par call hone wala function
handleRowDblClick(id: any) {
  this.selectedInquiryId = id;
  this.showRowModal = true;
}
loadInquiryById(id: number) {
  const token = localStorage.getItem('cavalier_token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  // Aapki specific API: [HttpGet("{id}")]
  this.http.get<any>(`${this.apiUrl}/${id}`, { headers }).subscribe({
    next: (data) => {
      console.log("Data received from API:", data);
      if (data) {
        // Aapka existing edit function call hoga jo poora data map kar dega
        this.editQuotation(data);
        this.cdr.detectChanges();
      }
    },
    error: (err) => {
      console.error("Error loading inquiry for edit:", err);
      Swal.fire('Error', 'Could not load inquiry data', 'error');
    }
  });
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
  const url = `${environment.apiUrl}/Inquiry/ToggleStatus/${q.id}`;

  // Current state save kar lo (error handle karne ke liye)
  const previousStatus = q.status;

  // 3. API Call
  this.http.patch(url, {}, { headers }).subscribe({
    next: (res: any) => {
      // Backend (res.newStatus) se sync kar rahe hain
      q.status = res.newStatus;
      
      // UI update trigger
      
      
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
// quotation: any = { portOfLoading: 'DELHI (DEL)', portOfDestination: 'LONDON (LHR)' }; // Example
  allConnectingPorts: any[] = [];
  filteredConnectingPorts: any[] = [];
  selectedConnectingPorts: any[] = [];
  cpSearchTerm: string = '';
  isCPModalOpen = false;

  // ngOnInit() { this.loadConnectingPortsData(); }
private apiUrls = `${environment.apiUrl}/ConnectingPort`;
loadConnectingPortsData() {
  const url = `${environment.apiUrl}/PortSetup`; 

  this.http.get<any[]>(url).subscribe({
    next: (data) => {
      // Yahan hum manual 'portType' add kar rahe hain agar wo missing hai
      this.allConnectingPorts = data.map(p => ({
        ...p,
        portType: p.portType || 'AIRPORT' // Agar portType nahi hai, toh default 'AIRPORT' set karo
      }));
      
      this.filteredConnectingPorts = this.allConnectingPorts;
      console.log("Ports Loaded with Default Type:", this.allConnectingPorts);
      this.cdr.detectChanges();
    },
    error: (err) => console.error("Error loading ports:", err)
  });
}

// Filter helpers (portType check karega)
getPortsByType(type: string) {
  // Console ke hisaab se portType field use hogi
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

isPortSelected(port: any): boolean {
  return this.selectedConnectingPorts.some(p => p.id === port.id);
}

onSearchingConnectingPorts() {
  const term = this.cpSearchTerm.toLowerCase();
  // Yahan p.name ki jagah p.portName aur p.code ki jagah p.portCode use kiya hai
  this.filteredConnectingPorts = this.allConnectingPorts.filter(p => 
    (p.portName?.toLowerCase().includes(term) || false) || 
    (p.portCode?.toLowerCase().includes(term) || false)
  );
}

toggleConnectingPortModal() {
  this.isCPModalOpen = !this.isCPModalOpen;
  if (!this.isCPModalOpen) this.cpSearchTerm = '';
}
  calculateTotalPackages() {
  if (this.dimRows && this.dimRows.length > 0) {
    this.quotation.noOfPkgs = this.dimRows.reduce((total: number, dim: any) => {
      return total + (Number(dim.box) || 0);
    }, 0);
  }
}
// Component ke andar add karein
updatePreview() {
  this.quotation.dimensions = [{ ...this.dimRow }];
  this.quotation = { ...this.quotation };
  
  // Force Angular to check the view
  this.cdr.detectChanges(); 
  console.log("Updated Dimensions:", this.quotation.dimensions);
}
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
uomList: any[] = [];
isUomModalOpen: boolean = false;
selectedUom: any = null;



// 1. API se Data Load karna
loadUomList() {
  this.http.get<any[]>(`${environment.apiUrl}/Uom/list`).subscribe({
    next: (data) => {
      this.uomList = data;
      
      // Default unit set karein agar nahi hai
      if (!this.quotation.volumeWeightUnit && this.uomList.length > 0) {
        this.quotation.volumeWeightUnit = this.uomList[0].shortCode;
      }
    },
    error: (err) => console.error("Error loading UOMs:", err)
  });
}

// 2. Modal Toggle
toggleUomModal() {
  this.isUomModalOpen = !this.isUomModalOpen;
}

// 3. Modal se Unit Select karna
selectUom(uom: any) {
  this.quotation.GrossweightUnit = uom.shortCode; 
  this.isUomModalOpen = false;
}
// Modal toggle state for Net Weight
isNetUomModalOpen: boolean = false;

toggleNetUomModal() {
  this.isNetUomModalOpen = !this.isNetUomModalOpen;
}

// Select function for Net Weight
selectNetUom(uom: any) {
  this.quotation.netWeightUnit = uom.shortCode;
  this.isNetUomModalOpen = false;
}
// Modal toggle state for Chargeable Weight
isChargeableUomModalOpen: boolean = false;

toggleChargeableUomModal() {
  this.isChargeableUomModalOpen = !this.isChargeableUomModalOpen;
}

// Select function for Chargeable Weight
selectChargeableUom(uom: any) {
  this.quotation.chargeableWeightUnit = uom.shortCode;
  this.isChargeableUomModalOpen = false;
}
// Modal toggle state for Dimension Unit
isDimUomModalOpen: boolean = false;

toggleDimUomModal() {
  this.isDimUomModalOpen = !this.isDimUomModalOpen;
}
// Select function for Dimension Unit (Calculation ke saath)

selectDimUom(uom: any, dimRow: any) {

  dimRow.unit = uom.shortCode;

  this.isDimUomModalOpen = false;

 

  // Calculations trigger karna zaroori hai

  this.calculateVolumeWeight();

  this.updatePreview();

}
// Ye function ab UI mein use hoga
applySelectedUnit(uom: any, dimRow: any) {
  dimRow.unit = uom.shortCode; 
  
  // Calculations aur Preview update karein
  this.calculateVolumeWeight(); 
  this.updatePreview(); 
  
  // Modal ko close karein
  this.toggleDimUomModal(); 
}
packageUnits: any[] = []; // Yahan API ka data store hoga
getPackageUnits() {
    this.http.get(`${environment.apiUrl}/PackageBox/list`).subscribe(
      (res: any) => {
        // Assume API format: [{id: 1, name: 'PKGS'}, {id: 2, name: 'BOXES'}]
        this.packageUnits = res; 
        console.log("Package Units loaded:", this.packageUnits);
      },
      (error) => console.error('Error fetching units', error)
    );
  }
}
