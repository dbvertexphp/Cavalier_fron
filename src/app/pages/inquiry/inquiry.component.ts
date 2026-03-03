
  import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http'; 
  import { FormsModule } from '@angular/forms';
  import { Router, RouterModule } from '@angular/router';
  import { environment } from '../../../environments/environment';

  @Component({
    selector: 'app-inquiry',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
    templateUrl: './inquiry.component.html',
    styleUrl: './inquiry.component.css',
  })
  export class InquiryComponent implements OnInit {
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
    }
    // --- Fetch Origins List ---
  fetchOrigins() {
    // API Path: /api/Origin
    const url = `${environment.apiUrl}/Origin`;
    this.http.get<any[]>(url).subscribe(data => {
      this.origins = data;
      console.log(data)
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
    if (this.inquiry.leadNo && this.inquiry.leadNo.length > 0) {
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
    if (this.inquiry.organization && this.inquiry.organization.length > 0) {
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

    onFileSelected(event: any) {
      const file = event.target.files[0];
      if (file) this.selectedFile = file;
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

    saveQuotation() {
      // if (!this.quotation.customerName) {
      //   alert("Customer Name is required!");
      //   return;
      // }
      if (!this.inquiry.organization) { // Zaroori check
    alert("Organization Name is required!");
    return;
  }

      const httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      };

      // --- FIXING DATA TYPES FOR DATABASE SYNC ---
      // Hum ensures kar rahe hain ki saari IDs 'number' format mein jayein
     // --- FIXING DATA TYPES FOR DATABASE SYNC ---
// --- FIXING DATA TYPES FOR DATABASE SYNC ---
const payload = {
  ...this.quotation,
  inquiryNo: String(this.inquiry.inquiryNo),
    customerName: this.inquiry.organization,
    // Organization Name map karein
    organization: this.inquiry.organization,
    
    // Baki fields (example)
    leadNo: this.inquiry.leadNo,
    origin: this.inquiry.origin,
    
   
  // id: Number(this.quotation.id) || 0,
  
  // Foreign Key IDs - Hardcoded to 3 or null
  lineOfBusinessId: Number(this.quotation.lineOfBusinessId) > 0 ? Number(this.quotation.lineOfBusinessId) : null,
  
  // YAHAN HEE HARDCODE KIYA HAI:
  commodityId: 3, // <--- Hardcoded value 3
  
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

      const action = this.quotation.id > 0 
        ? this.http.put(`${this.apiUrl}/${this.quotation.id}`, payload, httpOptions)
        : this.http.post(this.apiUrl, payload, httpOptions);

      action.subscribe({
        next: () => {
          alert("Success: Saved in CavalierDB!");
          this.isFormOpen = false; // Maan lete hain ye variable form visible rakhta hai
        
        // --- 3. --- FORCED UI UPDATE ---
       
          this.loadQuotations();
          this.toggleForm();
          this.getNextInquiryNumber();
           this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Post Error Details:", err);
          if (err.status === 0) {
            alert("Connection Refused: Make sure Visual Studio Backend is running.");
          } else {
            // Check for Foreign Key conflict or Type mismatch
            const errMsg = err.error?.message || "Verify if Master IDs exist in DB.";
            alert("Failed to save: " + errMsg);
          }
        }
      });
    }

    toggleForm() {
      this.isFormOpen = !this.isFormOpen;
      if (!this.isFormOpen) {
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
      // Only capture rows where length is specified
      this.appliedDimensions = this.dimRows.filter(d => d.l > 0);
      this.closeDimModal();
    }

    editQuotation(q: any) {
      this.quotation = { ...q };
      this.appliedDimensions = q.dimensions || [];
      this.dimRows = this.appliedDimensions.length > 0 
        ? [...this.appliedDimensions] 
        : [{ box: 1, l: 0, w: 0, h: 0, unit: 'CMS' }];
      this.isFormOpen = true;
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
        lineOfBusinessId: 1,
        commodityId: 1,
        originId: 2, // Matches originid2 request
        portOfLoadingId: 1, // Matches pol1 request
        portOfDischargeId: 1, // Matches pod1 request
        noOfPkgs: 1, 
        grossWeightKg: 0, 
        chargeableWeight: 0,
        dimensions: []
      };
    }
    searchFilters = {
    transportMode: 'Any',
    inquiryNo: '',
    branchName: '',
    salesCoordinator: '',
    cargoStatus: '(Any)',
    receivedDate: null,
    showMode: 'valid'
  };
  loadDropdownData() {
    this.http.get<string[]>(`${environment.apiUrl}/Inquiry`)
      .subscribe(data => {
        this.servicesList = data;
      });
  }
  // onSearch() {
  //   console.log("Searching with:", this.searchFilters);

  //   this.http.post<any[]>(`${environment.apiUrl}/Inquiry/Search`, this.searchFilters)
  //     .subscribe({
  //       next: (res) => {
  //         this.inquiries = res; // Data table mein update ho jayega
  //         console.log("Results found:", res.length);
  //       },
  //       error: (err) => {
  //         console.error("Search API Error:", err);
  //       }
  //     });
  // }
  loadInquiryNumbers() {
  // Aapki existing GET API se saare numbers utha rahe hain
  this.http.get<any[]>(`${environment.apiUrl}/Inquiry`).subscribe(data => {
    // Sirf inquiryNo nikal kar array mein daal rahe hain
    this.allInquiryNumbers = data.map(item => item.inquiryNo);
  });
}
loadCoordinators() {
  // Option A: Backend se unique names mangao
  this.http.get<string[]>(`${environment.apiUrl}/Inquiry`).subscribe(data => {
    this.coordinators = data;
  });

  // Option B: Agar API nahi hai toh abhi test ke liye static daal do
  // this.coordinators = ['Admin', 'John Doe', 'Prince'];
}
loadBranches() {
  this.http.get<string[]>(`${environment.apiUrl}/Inquiry`).subscribe({
    next: (res) => {
      this.branchesList = res;
    },
    error: (err) => console.error("Branch load karne mein error:", err)
  });
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
// Pehle constructor me inject kar lena: constructor(private cd: ChangeDetectorRef, ...) {}

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
  this.http.post<any[]>(`${environment.apiUrl}/Inquiry/Search`, filtersToSend)
    .subscribe({
      next: (response) => {
        if (response && response.length > 0) {
          // Case 1: Exact data mil gaya
          this.quotations = response;
          console.log("Strict Search Result:", response);
          this.cdr.detectChanges(); // UI Update
        } 
        else if (filtersToSend.inquiryNo) {
          // Case 2: Exact match nahi mila, sirf Inquiry No se fallback try karein
          console.log("No exact match, trying with Inquiry No only...");
          
          const fallbackFilters = { inquiryNo: filtersToSend.inquiryNo };

          this.http.post<any[]>(`${environment.apiUrl}/Inquiry/Search`, fallbackFilters)
            .subscribe({
              next: (fallbackRes) => {
                this.quotations = fallbackRes;
                if(fallbackRes.length > 0) {
                   console.log("Match found with Inquiry No fallback!");
                }
                this.cdr.detectChanges(); // UI Update for fallback
              },
              error: () => {
                this.quotations = [];
                this.cdr.detectChanges();
              }
            });
        } else {
          // Case 3: Kuch nahi mila
          this.quotations = [];
          this.cdr.detectChanges(); // UI Update for empty state
        }
      },
      error: (err) => {
        console.error("Search failed:", err);
        alert("Server error while searching!");
        this.cdr.detectChanges();
      }
    });
}

}
  
  