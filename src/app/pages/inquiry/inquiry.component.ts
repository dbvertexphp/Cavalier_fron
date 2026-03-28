



import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http'; 
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { moveItemInArray, transferArrayItem, CdkDragDrop } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop'; // Ye import ensure karein
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inquiry',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule, DragDropModule],
  templateUrl: './inquiry.component.html',
  styleUrl: './inquiry.component.css',
})
  export class InquiryComponent implements OnInit {
    transportModes: any[] = [];
    incoTerms: any[] = [];
    shipmentTypes: any[] = [];
    movementTypes: any[] = [];
    commodityTypes: any[] = [];
    quotationcheck: any = { TransportMode: '',
    shipmentType: '',incoterm: '',movementType: '',commodity: ''};
    documents: any[] = [];
public ports: any[] = [];
addDocument() {
  this.documents.push({
    name: '',
    file: null
  });
}

removeDocument(index: number) {
  this.documents.splice(index, 1);
}
onFileSelecteds(event: any, index: number) {
  const file = event.target.files[0];
  if (file) {
    this.documents[index].file = file;
  }
}
isDocumentModalOpen = false;

openDocumentModal() {
  this.isDocumentModalOpen = true;
}

closeDocumentModal() {
  this.isDocumentModalOpen = false;
}
isInvoiceModalOpen = false;
invoiceDocuments: any[] = [];

// modal
openInvoiceModal() {
  this.isInvoiceModalOpen = true;
}

closeInvoiceModal() {
  this.isInvoiceModalOpen = false;
}

// add/remove
addInvoiceDoc() {
  this.invoiceDocuments.push({ name: '', file: null });
}

removeInvoiceDoc(index: number) {
  this.invoiceDocuments.splice(index, 1);
}

// file select
onInvoiceFileSelected(event: any, index: number) {
  const file = event.target.files[0];
  if (file) {
    this.invoiceDocuments[index].file = file;
  }
}
    // Labels ko backend properties se map karo (Apne model ke hisaab se check kar lena)
columnFieldMap: any = {
  'ID': 'id',
  'Inquiry No': 'inquiryNo',
  'Date': 'receivedDate',
  'Customer': 'customerName',
  'Mode': 'transportMode',
  'Origin': 'originPort',
  'Destination': 'destinationPort',
  'Status': 'cargoStatus',
  'Sales Person': 'salesPerson'
};

selectedColumns: string[] = ['ID', 'Inquiry No', 'Date', 'Customer', 'Status'];
availableColumns: string[] = ['Mode', 'Origin', 'Destination', 'Sales Person'];
    isFormOpen = false;
    private apiUrl = `${environment.apiUrl}/Inquiry`;
inquiries:any[]=[]
    quotations: any[] = [];
    quotation: any = this.resetQuotationModel();
    selectedFile: File | null = null;
    servicesList: any[] = [];
    isDimModalOpen = false;
    appliedDimensions: any[] = []; 
    dimRows: any[] = [{ box: 1, l: 0, w: 0, h: 0, unit: 'CMS' }];
    inquiry: any = {
    inquiryNo: '',
    customerName: '',
    organization: '',         // Search input ke liye
    organizationAddress: '',
    leadNo: '',
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
    constructor(private http: HttpClient, private router: Router,private cdr: ChangeDetectorRef ) {}

    ngOnInit() {
      this.loadQuotations();
      this.getNextInquiryNumber();
      this.fetchOrganizations();
      this.fetchLeads();
      this.fetchOrigins();
      this.loadDropdownData();
    this.onSearch();
    this.loadInquiryNumbers();
    this.loadCoordinators();
    this.loadBranches();
    this.loadInquirySettings();
    this.fetchCompanyServices();
    this.getTransportModes();
this.getShipmentTypes();
this.getIncoTerms();
this.getMovementTypes();
this.getCommodityTypes();
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

  const selectedService = this.companyServices.find(
    s => s.id == selectedId
  );

  if (selectedService) {
    this.quotation.lineOfBusinessName = selectedService.serviceName;
    console.log("Selected LOB Name:", selectedService.serviceName);
  }
}
    getIncoTerms() {
    this.http.get<any[]>(`${environment.apiUrl}/IncoTerms`).subscribe({
      next: (data) => {
        this.incoTerms = data;
      },
      error: (err) => console.error('Error fetching IncoTerms:', err)
    });
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
    const url = `${environment.apiUrl}/Origin`;
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
  // 1. Check karein ki inquiry.origin null ya undefined na ho
  if (this.inquiry.origin) {
    this.showOriginDropdown = true;
    
    // 2. Safe check: inquiry.origin ko string mein convert karein aur safe toLowerCase()
    const searchTerm = this.inquiry.origin.toString().toLowerCase();

    this.filteredOrigins = this.origins.filter(org =>
      // 3. API response mein 'name' hai ya 'originName', wo check karein
      org.name ? org.name.toLowerCase().includes(searchTerm) : false
    );
  } else {
    this.showOriginDropdown = false;
    this.filteredOrigins = [];
  }
}

  // --- Selection Logic ---
  selectOrigin(origin: any) {
    this.inquiry.origin = origin.name; // Ya jo bhi field origin ka naam ho (e.g., org.name)
    this.showOriginDropdown = false;
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

  // --- Selection Logic ---
  selectLead(lead: any) {
    this.inquiry.leadNo = lead.leadNo; 
    this.showLeadDropdown = false;
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
        this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
          alert("Deleted Successfully!");
          this.loadQuotations();
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
    saveQuotation() {
      // if (!this.quotation.customerName) {
      //   alert("Customer Name is required!");
      //   return;
      // }
      if (!this.inquiry.organization) { // Zaroori check
    alert("Organization Name is required!");
    return;
  }

      

     
const payload = {
  ...this.quotation, 
  inquiryNo: this.getFormattedInquiryNo(),
    customerName: this.inquiry.organization,
    // Organization Name map karein
    organization: this.inquiry.organization,
    shipmentType: this.quotation.shipmentType,
    // Baki fields (example)
    leadNo: this.inquiry.leadNo,
    origin: this.inquiry.origin,
    TransportMode: this.quotation.transportMode,
    TransportType: this.quotation.transportMode,
    
   HazardDocPath: this.quotation.hazardDocPath || null,
   weightUnit: this.quotation.GrossweightUnit || 'KGS',
  // id: Number(this.quotation.id) || 0,
  
  // Foreign Key IDs - Hardcoded to 3 or null
  lineOfBusinessId: this.quotation.lineOfBusinessId ? Number(this.quotation.lineOfBusinessId) : null,
  lineOfBusinessName: this.quotation.lineOfBusinessName || null,
  
  // YAHAN HEE HARDCODE KIYA HAI:
  commodityId: 15, // <--- Hardcoded value 3
  
  
  // Port and Origin IDs - Agar value valid nahi hai, toh null bhejein
  originId: !isNaN(Number(this.quotation.originId)) && Number(this.quotation.originId) > 0 ? Number(this.quotation.originId) : null,
  portOfLoadingId: !isNaN(Number(this.quotation.portOfLoadingId)) && Number(this.quotation.portOfLoadingId) > 0 ? Number(this.quotation.portOfLoadingId) : null,
  portOfDischargeId: !isNaN(Number(this.quotation.portOfDischargeId)) && Number(this.quotation.portOfDischargeId) > 0 ? Number(this.quotation.portOfDischargeId) : null,
  
  // Default Audit Fields
  cargoStatus: this.quotation.cargoStatus || 'Pending',
  createdBy: 'admin@cavalierlogistic.in', // Admin email requirement [cite: 2026-02-02]
  qtnId: this.quotation.qtnId || ('QTN-' + Math.floor(1000 + Math.random() * 9000)),
  createdDate: new Date().toISOString(),
  dimensions: this.appliedDimensions
};

      console.log("Final Payload for Backend:", payload);

     const token = localStorage.getItem('cavalier_token');

const httpOptions = {
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};

const action = this.quotation.id > 0 
  ? this.http.put(`${this.apiUrl}/${this.quotation.id}`, payload, httpOptions)
  : this.http.post(this.apiUrl, payload, httpOptions);

action.subscribe({
  next: () => {
    alert("Success: Saved in CavalierDB!");
    this.isFormOpen = false;

    this.loadQuotations();
    this.toggleForm();
    this.getNextInquiryNumber();
    this.cdr.detectChanges();
  },
  error: (err) => {
    console.error("Post Error Details:", err);

    if (err.status === 0) {
      alert("Connection Refused: Make sure Visual Studio Backend is running.");
    } 
    else if (err.status === 401) {
      alert("Unauthorized! Token invalid ya expire ho gaya. Login again.");
    }
    else {
      const errMsg = err.error?.message || "Verify if Master IDs exist in DB.";
      alert("Failed to save: " + errMsg);
    }
  }
});
    }
    

    toggleForm() {
      this.isFormOpen = !this.isFormOpen;
      
      if (!this.isFormOpen) {
         this.isPreviewMode = false; // Add this line
        this.quotation = this.resetQuotationModel();
        this.appliedDimensions = [];
        this.dimRows = [{ box: 1, l: 0, w: 0, h: 0, unit: 'CMS' }];
      }
    }

    openDimModal() { this.isDimModalOpen = true; }
    closeDimModal() { this.isDimModalOpen = false; }
    
    addNewDimRow() { 
      this.dimRows.push({ box: 1, l: 0, w: 0, h: 0, unit: 'CMS' }); 
    }
    
    removeDimRow(i: number) { 
      if (this.dimRows.length > 1) this.dimRows.splice(i, 1); 
    }

saveDimensions() {
  // Logic: Unhi rows ko rakho jisme Length, Width ya Height me se kuch bhi bhara ho
  this.appliedDimensions = this.dimRows.filter(d => (d.l > 0 || d.w > 0 || d.h > 0));
  
  console.log("Dimensions Saved in appliedDimensions:", this.appliedDimensions);
  this.closeDimModal();
}

    // editQuotation(q: any) {
    //   this.quotation = { ...q };
    //   this.appliedDimensions = q.dimensions || [];
    //   this.dimRows = this.appliedDimensions.length > 0 
    //     ? [...this.appliedDimensions] 
    //     : [{ box: 1, l: 0, w: 0, h: 0, unit: 'CMS' }];
    //   this.isFormOpen = true;
    // }

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
        location: 'DELHI', 
        transportMode: 'Air', 
        shipmentType: 'International',
        lineOfBusinessId: null,
        commodityId: 1,
        originId: 2, // Matches originid2 request
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
  this.http.get<any[]>(`${environment.apiUrl}/Inquiry`).subscribe(data => {
    // 1. Saare inquiryNo nikaal kar null/undefined hatao
    const rawNumbers = data.map(item => item.inquiryNo).filter(n => n);

    // 2. 🔥 Set ka use karke duplicates hatao
    this.allUniqueInquiryNos = [...new Set(rawNumbers)];
    console.log("Unique Inquiry Numbers Loaded");
  });
}

// 🔥 Typing ke waqt trigger hone wala function
onInquiryType() {
  const query = this.searchFilters.inquiryNo ? this.searchFilters.inquiryNo.trim().toLowerCase() : '';

  // 3. Logic: 3 letter ke baad suggestions dikhao
  if (query.length >= 3) {
    this.filteredInquiryNos = this.allUniqueInquiryNos.filter(num => 
      num.toLowerCase().includes(query)
    );
  } else {
    // 3 se kam par list khali
    this.filteredInquiryNos = [];
  }
}
// Variables declare karein
allUniqueCoordinators: string[] = []; // Master list (Unique Names)
filteredCoordinators: string[] = [];  // Suggestions for UI

loadCoordinators() {
  this.http.get<any[]>(`${environment.apiUrl}/Inquiry`).subscribe({
    next: (data) => {
      // 1. Saare salesCoordinator nikalo aur duplicates hatane ke liye Set use karo
      const rawCoords = data.map(item => item.salesCoordinator).filter(c => c);
      this.allUniqueCoordinators = [...new Set(rawCoords)];
      console.log("Unique Coordinators Loaded");
    },
    error: (err) => console.error("Coordinator load error:", err)
  });
}

// 🔥 Typing ke waqt filter karne wala function
onCoordinatorType() {
  const query = this.searchFilters.salesCoordinator ? this.searchFilters.salesCoordinator.trim().toLowerCase() : '';

  // 2. Logic: Sirf 3 characters ke baad hi suggestions dikhao
  if (query.length >= 3) {
    this.filteredCoordinators = this.allUniqueCoordinators.filter(name => 
      name.toLowerCase().includes(query)
    );
  } else {
    // 3 se kam par list khali rakho
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
  
  const filtersToSend = { ...this.searchFilters };

  // 1. Cleaning logic
  if (filtersToSend.transportMode === 'Any') filtersToSend.transportMode = '';
  if (filtersToSend.cargoStatus === '(Any)') filtersToSend.cargoStatus = '';
  
  if (filtersToSend.salesCoordinator === 'null' || !filtersToSend.salesCoordinator) {
    filtersToSend.salesCoordinator = ""; 
  }
  if (filtersToSend.branchName === 'null' || !filtersToSend.branchName) {
    filtersToSend.branchName = "";
  }

  // 2. First API Call (Strict Search)


const token = localStorage.getItem('cavalier_token');

const httpOptions = {
  headers: new HttpHeaders({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  })
};

this.http.post<any[]>(`${environment.apiUrl}/Inquiry/Search`, filtersToSend, httpOptions)
  .subscribe({
    next: (response) => {
      if (response && response.length > 0) {
        // Case 1: Exact data mil gaya
        this.quotations = response;
        console.log("Strict Search Result:", response);
        this.cdr.detectChanges();
      } 
      else if (filtersToSend.inquiryNo) {
        console.log("No exact match, trying with Inquiry No only...");
        
        const fallbackFilters = { inquiryNo: filtersToSend.inquiryNo };

        // ✅ YAHAN BHI TOKEN LAGANA HAI
        this.http.post<any[]>(`${environment.apiUrl}/Inquiry/Search`, fallbackFilters, httpOptions)
          .subscribe({
            next: (fallbackRes) => {
              this.quotations = fallbackRes;

              if (fallbackRes.length > 0) {
                console.log("Match found with Inquiry No fallback!");
              }

              this.cdr.detectChanges();
            },
            error: () => {
              this.quotations = [];
              this.cdr.detectChanges();
            }
          });
      } 
      else {
        this.quotations = [];
        this.cdr.detectChanges();
      }
    },
    error: (err) => {
      console.error("Search failed:", err);

      if (err.status === 401) {
        alert("Unauthorized! Token expired, login again.");
      } else {
        alert("Server error while searching!");
      }

      this.cdr.detectChanges();
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
  } else {
    this.serviceSub?.unsubscribe();

    // API Call to /Inquiry
    this.serviceSub = this.http.get<any[]>(`${environment.apiUrl}/Inquiry`).subscribe({
      next: (res) => {
        // transportMode nikalna, empty values filter karna aur Duplicates hatana
        const uniqueModes = [...new Set(
          res
            .filter(item => item.transportMode && item.transportMode.trim() !== "")
            .map(item => item.transportMode)
        )];

        this.allTransportModes = uniqueModes;
        this.showServicePopup = true;
        this.cdr.detectChanges(); // Instant UI Update
      },
      error: (err) => {
        console.error("Error fetching Inquiry Services", err);
        this.cdr.detectChanges();
      }
    });
  }
}

// 2. Popup se select karne par
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
  } else {
    this.inqSub?.unsubscribe();

    this.inqSub = this.http.get<any[]>(`${environment.apiUrl}/Inquiry`).subscribe({
      next: (res) => {
        // Inquiry No. nikalna aur unique banana
        // Note: Agar property 'inquiryNo' hai toh wahi use karein
        const uniqueInqs = [...new Set(
          res
            .filter(item => item.inquiryNo && item.inquiryNo.trim() !== "")
            .map(item => item.inquiryNo)
        )];

        this.allInquiryNos = uniqueInqs;
        this.showInquiryPopup = true;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error("Error fetching Inquiries", err);
        this.cdr.detectChanges();
      }
    });
  }
}

// 2. Popup se select karne par
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
  } else {
    this.coordinatorSub?.unsubscribe();

    this.coordinatorSub = this.http.get<any[]>(`${environment.apiUrl}/Inquiry`).subscribe({
      next: (res) => {
        // SalesCoor nikalna, empty values filter karna aur Duplicates hatana
        const uniqueCoords = [...new Set(
          res
            .filter(item => item.salesCoordinator && item.salesCoordinator.trim() !== "")
            .map(item => item.salesCoordinator)
        )];

        this.allCoordinators = uniqueCoords;
        this.showCoordinatorPopup = true;
        this.cdr.detectChanges(); // UI Update
      },
      error: (err) => {
        console.error("Error fetching Coordinators", err);
        this.cdr.detectChanges();
      }
    });
  }
}

// 2. Popup se select karne par
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
selectInquiry(inq: any) {
  this.quotation.referenceByInquiry = inq.leadNo || inq.inquiryNo; 
  this.showInquiryDropdown = false; 
  this.cdr.detectChanges(); // UI refresh
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


  }