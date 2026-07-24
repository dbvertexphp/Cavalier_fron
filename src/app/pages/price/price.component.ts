import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from "@angular/core";
import { AirlineService, Airline } from "../../services/airline.service";
import { CommonModule } from "@angular/common";
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { environment } from "../../../environments/environment";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { CheckPermissionService } from "../../services/check-permission.service";
import {
  moveItemInArray,
  transferArrayItem,
  CdkDragDrop,
} from "@angular/cdk/drag-drop";
import { DragDropModule } from "@angular/cdk/drag-drop"; // Ye import ensure karein
import { Subscription } from "rxjs";
import { BranchService } from "../../services/branch.service";
import { UserService } from "../../services/user.service";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import Swal from "sweetalert2";
import { ChargeService, ChargeDto } from "../../services/Charge.service";
import { TaxRate, TaxRateService } from "../../services/tax-rate.service";
import { GstCalculationService } from "../../services/gst-calculation.service";
export interface CostBreakdown {
  id?: number;
  inquiryId?: number;
  pricingId?: number;
  lob: string;
  chargeName?: string;
  chargeCode?: string;
  chargeType: string;
  basis: string;
  currency: string;
  rate: number;
  exchangeRate: number;
  amount: number;
  remark?: string;

  // --- GST Fields ---
  gstStatus?: "Taxable" | "Non-Taxable";
  isGstApplicable?: boolean;
  sacHsn?: string;
  taxableValue?: number;
  nonTaxableValue?: number;
  taxName?: string;
  taxPercent?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  cgstPercent?: number;
  sgstPercent?: number;
  igstPercent?: number;
  taxAmount?: number;
  totalAmount?: number;
  isZeroRated?: boolean;
  isRcmApplicable?: boolean;
  shipmentDirection?: string;
    taxType?: string;   
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
  selector: "app-price",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HttpClientModule,
    DragDropModule,
  ],
  templateUrl: "./price.component.html",
  styleUrl: "./price.component.css",
})
export class PriceComponent {
  @ViewChild("cargoDateInput") cargoDateInput!: ElementRef<HTMLInputElement>;
  totalCount: number = 0;
  chargeMasterList: ChargeDto[] = [];
  taxRatesList: TaxRate[] = [];
  /** @deprecated use chargeMasterList */
  chargesList: any[] = [];
  isCustomRangeModalOpen: boolean = false;
  currentLeftCalendarDate: Date = new Date();
  currentRightCalendarDate: Date = new Date(
    new Date().setMonth(new Date().getMonth() + 1),
  );
  leftMonthDaysGrid: any[] = [];
  rightMonthDaysGrid: any[] = [];
  weekDaysHeaders: string[] = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  customStartSelectedDate: string | null = null;
  customEndSelectedDate: string | null = null;
  dateRangeInputValue: string = "";
  getquotedByList: any[] = [];
  getpricingByList: any[] = [];
  getsalesTeamList: any[] = [];
  teamsList: any[] = [];
  showCountryDropdown: boolean = false;
  countriesList: any[] = [];
  filteredCountries: any[] = [];
  selectedCountryName: string = "";
  currentPage: number = 1;
  pageSize: number = 10;
  getsalescordinate: any[] = [];
  PermissionID: any;
  LeadId: number = 0;
  originpinCode: any;
  InquiryId: number = 0;
  referenceByInquiryNo: string = "";
  organisationId: number = 0;
  organisationName: string = "";
  filteredPodOrigins: any[] = [];
  showPodOriginDropdown: boolean = false;

  paginatedPricings: any[] = [];
  costBreakdowns: any[] = [];
  OrganisationId: number = 0;
  invoices: any[] = [];
  lastSelectedBranch: string = "";
  isInvoiceModalOpen = false;
  documents: any[] = [];
  isDocumentModalOpen = false;
  OrganisationName: string = "";
  LeadName: string = "";
  airlineList: any[] = [];
  filteredAirlines: any[] = [];
  showAirlineDropdownIndex: number | null = null;
  isPreviewModalOpen = false;
  agentDetail: any[] = [];
  selectedEmails = new Set<string>();
  currentPreviewUrl: SafeResourceUrl | null = null;
  showincoterms: string = "";
  selectcommodityvalue: string = "";
  organizationIds: number = 0;
  isDeliveryEnabled: boolean = false;
  portsOfDischarge: any[] = [];
  filteredPortsOfDischarge: any[] = [];
  originsaveid: number = 0;
  showPortOfDischargeDropdown: boolean = false;
  portsOfLoading: any[] = [];
  filteredPortsOfLoading: any[] = [];
  showPortOfLoadingDropdown: boolean = false;
  branchlist: any[] = [];
  isPickupEnabled: boolean = false;
  selectedLeadData: any = null;
  transportModes: any[] = [];

  incoTerms: any[] = [];
  shipmentTypes: any[] = [];
  movementTypes: any[] = [];
  commodityTypes: any[] = [];
  quotationcheck: any = {
    TransportMode: "",
    shipmentType: "",
    incoterm: "",
    movementType: "",
    commodity: "",
  };

  public ports: any[] = [];
  addDocument() {
    this.documents.push({
      name: "",
      file: null,
      fileName: "",
      previewUrl: null,
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
    const selectedId = event.target.value;
    const selectedText = event.target.options[event.target.selectedIndex].text;
    this.selectcommodityvalue = selectedText;
    console.log("Selected ID:", selectedId);
    console.log("Selected Name/Text:", selectedText);
  }

  closeDocumentModal() {
    this.isDocumentModalOpen = false;
  }

  openInvoiceModal() {
    this.isInvoiceModalOpen = true;
  }

  closeInvoiceModal() {
    this.isInvoiceModalOpen = false;
  }

  addInvoice() {
    this.invoices.push({
      name: "",
      documentPath: null,
      file: null,
      fileName: "",
      previewUrl: null,
      isReplacing: false,
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

  saveDocuments() {
    console.log("=== 📦 Commodity Documents List ===");

    if (this.documents.length === 0) {
      console.log("Koi document add nahi kiya gaya hai.");
    } else {
      this.documents.forEach((doc, index) => {
        console.log(`\n--- Document ${index + 1} ---`);
        console.log("Document Name/Type :", doc.name || "Name not entered");
        console.log("Original File Name :", doc.fileName || "No file selected");
        console.log("Actual File Object :", doc.file);
      });

      console.log("\nFull Array Data:", this.documents);
    }

    this.closeDocumentModal();
  }
  onInvoiceFileSelected(event: any, index: number) {
    const file = event.target.files[0];

    if (file) {
      this.invoices[index].file = file;
      this.invoices[index].fileName = file.name;

      const objectUrl = URL.createObjectURL(file);

      this.invoices[index].previewUrl =
        this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
    }
  }

  dimRow: any = { box: 1, l: 0, w: 0, h: 0, unit: "kgs" };
  dimRows: any[] = [];

  openCustomRangeCalendar() {
    this.isCustomRangeModalOpen = true;
    this.renderDualCalendars();
  }

  closeCustomRangeCalendar() {
    this.isCustomRangeModalOpen = false;
  }

  renderDualCalendars() {
    this.leftMonthDaysGrid = this.buildMonthMatrix(
      this.currentLeftCalendarDate,
    );
    this.rightMonthDaysGrid = this.buildMonthMatrix(
      this.currentRightCalendarDate,
    );
  }

  buildMonthMatrix(targetDate: Date): any[] {
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const firstDayDayOfWeek = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);

    let dayCells: any[] = [];

    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    for (let i = firstDayDayOfWeek - 1; i >= 0; i--) {
      dayCells.push({
        dayNumber: prevMonthTotalDays - i,
        isCurrentMonth: false,
        dateString: null,
        isFuture: false,
      });
    }

    for (let i = 1; i <= totalDaysInMonth; i++) {
      const activeDateObj = new Date(year, month, i);
      const dateString = `${activeDateObj.getFullYear()}-${String(activeDateObj.getMonth() + 1).padStart(2, "0")}-${String(activeDateObj.getDate()).padStart(2, "0")}`;
      const isFutureDate = activeDateObj > todayObj;

      dayCells.push({
        dayNumber: i,
        isCurrentMonth: true,
        dateString: dateString,
        isFuture: isFutureDate,
      });
    }

    const remainingCells = 42 - dayCells.length;
    for (let i = 1; i <= remainingCells; i++) {
      dayCells.push({
        dayNumber: i,
        isCurrentMonth: false,
        dateString: null,
        isFuture: false,
      });
    }

    return dayCells;
  }

  shiftLeftCalendar(direction: number) {
    this.currentLeftCalendarDate.setMonth(
      this.currentLeftCalendarDate.getMonth() + direction,
    );
    this.renderDualCalendars();
  }

  shiftRightCalendar(direction: number) {
    this.currentRightCalendarDate.setMonth(
      this.currentRightCalendarDate.getMonth() + direction,
    );
    this.renderDualCalendars();
  }

  handleCellClick(cellDateString: string | null) {
    if (!cellDateString) return;
    if (
      !this.customStartSelectedDate ||
      (this.customStartSelectedDate && this.customEndSelectedDate)
    ) {
      this.customStartSelectedDate = cellDateString;
      this.customEndSelectedDate = null;
    } else {
      if (new Date(cellDateString) < new Date(this.customStartSelectedDate)) {
        this.customStartSelectedDate = cellDateString;
      } else {
        this.customEndSelectedDate = cellDateString;
      }
    }
    this.renderDualCalendars();
  }

  isCellActive(cellDateString: string | null): boolean {
    return (
      cellDateString === this.customStartSelectedDate ||
      cellDateString === this.customEndSelectedDate
    );
  }

  isCellWithinRange(cellDateString: string | null): boolean {
    if (
      !cellDateString ||
      !this.customStartSelectedDate ||
      !this.customEndSelectedDate
    )
      return false;
    const currentCell = new Date(cellDateString);
    return (
      currentCell > new Date(this.customStartSelectedDate) &&
      currentCell < new Date(this.customEndSelectedDate)
    );
  }

  applyCustomPresetSlots(rangeType: string) {
    const baseToday = new Date();
    let fromDate = new Date();
    let toDate = new Date();
    switch (rangeType) {
      case "yesterday":
        fromDate.setDate(baseToday.getDate() - 1);
        toDate.setDate(baseToday.getDate() - 1);
        break;
      case "thisWeek":
        fromDate.setDate(baseToday.getDate() - baseToday.getDay());
        break;
      case "lastWeek":
        fromDate.setDate(baseToday.getDate() - baseToday.getDay() - 7);
        toDate.setDate(baseToday.getDate() - baseToday.getDay() - 1);
        break;
      case "thisMonth":
        fromDate = new Date(baseToday.getFullYear(), baseToday.getMonth(), 1);
        break;
      case "lastMonth":
        fromDate = new Date(
          baseToday.getFullYear(),
          baseToday.getMonth() - 1,
          1,
        );
        toDate = new Date(baseToday.getFullYear(), baseToday.getMonth(), 0);
        break;
      case "lastYear":
        fromDate = new Date(baseToday.getFullYear() - 1, 0, 1);
        toDate = new Date(baseToday.getFullYear() - 1, 11, 31);
        break;
    }
    this.customStartSelectedDate = `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, "0")}-${String(fromDate.getDate()).padStart(2, "0")}`;
    this.customEndSelectedDate = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, "0")}-${String(toDate.getDate()).padStart(2, "0")}`;
    this.confirmSelectedRangePipeline();
  }

  confirmSelectedRangePipeline() {
    if (this.customStartSelectedDate && !this.customEndSelectedDate)
      this.customEndSelectedDate = this.customStartSelectedDate;
    if (this.customStartSelectedDate && this.customEndSelectedDate) {
      this.dateRangeInputValue = `${this.customStartSelectedDate} - ${this.customEndSelectedDate}`;

      this.searchFilters.fromDate = this.customStartSelectedDate;
      this.searchFilters.toDate = this.customEndSelectedDate;

      this.closeCustomRangeCalendar();
      this.onSearch();
    }
  }

  getCalendarMonthLabel(date: Date): string {
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  }
  calculateVolumeWeight() {
    const weight = this.calculateSingleVolumeWeight(this.dimRow);
    this.quotation.volumeWeight = parseFloat(weight.toFixed(2));
    this.calculateCBM();

    if (this.dimRows.length > 0) {
      this.dimRows[0] = { ...this.dimRow };
    } else {
      this.dimRows = [{ ...this.dimRow }];
    }

    this.appliedDimensions = this.dimRows.filter(
      (d) => d.l > 0 && d.w > 0 && d.h > 0,
    );
    this.calculateNetWeight();
    this.calculateVolumeWeightLogic();
    this.syncFinalData();
  }
  syncFinalData() {
    this.quotation.dimensions = JSON.parse(JSON.stringify(this.dimRows));
    console.log("Data Auto-Synced!");
  }

  getTotalVolumeWeight(): number {
    let total = 0;
    if (this.dimRows && this.dimRows.length > 0) {
      this.dimRows.forEach((dim) => {
        total += this.calculateSingleVolumeWeight(dim);
      });
    } else {
      total = this.calculateSingleVolumeWeight(this.dimRow);
    }
    return parseFloat(total.toFixed(2));
    this.dimRows.forEach((dim) => {
      total += this.calculateSingleVolumeWeight(dim);
    });
    return total;
  }

  calculateSingleVolumeWeight(dim: any): number {
    if (!dim.l || !dim.w || !dim.h || dim.l <= 0 || dim.w <= 0 || dim.h <= 0) {
      return 0;
    }

    let volumeCm3 = dim.l * dim.w * dim.h;
    if (dim.unit === "INCH") {
      volumeCm3 = volumeCm3 * 16.387;
    }

    return (dim.box || 1) * (volumeCm3 / 6000);
  }

  calculateCBM() {
    if (this.quotation.volumeWeight) {
      const calculatedCbm = this.quotation.volumeWeight / 167;
      this.quotation.cbm = parseFloat(calculatedCbm.toFixed(3));
    } else {
      this.quotation.cbm = 0;
    }
  }
  AllSearch() {
    this.onSearch();
    this.cdr.detectChanges();
  }
  testing() {
    this.onSearch();
    this.cdr.detectChanges();
  }
  calculateNetWeight() {
    const gross = Number(this.quotation.grossWeightKg) || 0;
    const volume = Number(this.quotation.volumeWeight) || 0;

    const result = gross - volume;

    this.quotation.netWeight = parseFloat(result.toFixed(2));

    console.log(
      "Gross:",
      gross,
      "Volume:",
      volume,
      "Net:",
      this.quotation.netWeight,
    );
  }

  calculateChargeableWeight() {
    const gross = Number(this.quotation.grossWeightKg) || 0;
    const volume = Number(this.quotation.volumeWeight) || 0;

    const higherWeight = Math.max(gross, volume);

    this.quotation.chargeableWeight = parseFloat(higherWeight.toFixed(2));
  }
  calculateVolumeWeightLogic() {
    const gross = Number(this.quotation.grossWeightKg) || 0;
    const volume = Number(this.quotation.volumeWeight) || 0;

    const calculatedCbm = volume / 167;
    this.quotation.cbm = parseFloat(calculatedCbm.toFixed(3));

    const netResult = volume - gross;
    this.quotation.netWeight = parseFloat(netResult.toFixed(2));

    const higherWeight = Math.max(gross, volume);
    this.quotation.chargeableWeight = parseFloat(higherWeight.toFixed(2));

    console.log(
      "Calculated -> CBM:",
      this.quotation.cbm,
      "Net:",
      this.quotation.netWeight,
      "Chrg:",
      this.quotation.chargeableWeight,
    );
    this.cdr.detectChanges();
  }
  columnFieldMap: any = {
    "Pricing No.": "pricingNo",
    "Inquiry Ref.": "referenceByInquiryNo",
    Organisation: "organisationName",
    Origin: "originName",
    Destination: "finalDestination",
    Status: "status",
  };

  selectedColumns: string[] = [
    "ID",
    "Inquiry No",
    "Date",
    "Customer",
    "Status",
    "LeadName",
    "OrganisationName",
  ];
  availableColumns: string[] = [
    "Mode",
    "Origin",
    "Destination",
    "Sales Person",
  ];
  isFormOpen = false;
  public apiUrl = `${environment.apiUrl}/Pricing`;
  public fileBaseUrl = environment.apiUrl.replace(/\/api$/, "");
  inquiries: any[] = [];
  quotations: any[] = [];
  quotation: any = this.resetQuotationModel();
  selectedFile: File | null = null;
  servicesList: any[] = [];
  isDimModalOpen = false;
  appliedDimensions: any[] = [];
  inquiry: any = {
    inquiryNo: "",
    customerName: "",
    organization: "",
    organizationAddress: "",
    leadNo: "",
    isDirect: false,
    isIndirect: false,
    origin: "",
  };
  airlineDropdownClicked: boolean = false;
  companyServices: any[] = [];
  organizations: any[] = [];
  filteredOrganizations: any[] = [];
  showDropdown: boolean = false;
  leads: any[] = [];
  filteredLeads: any[] = [];
  showLeadDropdown: boolean = false;
  origins: any[] = [];
  filteredOrigins: any[] = [];
  showOriginDropdown: boolean = false;

  allInquiryNumbers: string[] = [];

  coordinators: any[] = [];
  branchesList: any[] = [];
  searchDone: boolean = false;
  uploadedDocuments: any[] = [];
  constructor(
    private http: HttpClient,
    private router: Router,
    private el: ElementRef,
    private cdr: ChangeDetectorRef,
    private branchservice: BranchService,
    public userServices: UserService,
    public CheckPermissionService: CheckPermissionService,
    private sanitizer: DomSanitizer,
    private eRef: ElementRef,
    private route: ActivatedRoute,
    private airlineService: AirlineService,
    private chargeService: ChargeService,
    private taxRateService: TaxRateService,
    private gstCalculationService: GstCalculationService,
  ) {}
  orgData: any = null;
  isLoading: boolean = true;
  ngOnInit() {
    this.loadChargeMaster();
    this.taxRateService.loadAll().subscribe((rows) => {
      this.taxRatesList = rows || [];
      this.cdr.detectChanges();
      this.recalculateAllGst();
    });
    this.loadAirlines();
    this.route.queryParams.subscribe((params) => {
      const editId = params["editId"];
      if (editId) {
        console.log("URL se Edit ID mili:", editId);
        this.loadPricingForEdit(editId);
      }
    });
    const idFromUrl = this.route.snapshot.paramMap.get("id");

    this.http.get<any[]>(`${environment.apiUrl}/Organization/list`).subscribe({
      next: (allOrgs) => {
        this.orgData = allOrgs.find(
          (o) => o.id == idFromUrl || o.Id == idFromUrl,
        );
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error loading orgs", err);
        this.isLoading = false;
      },
    });

    this.PermissionID = Number(localStorage.getItem("permissionID"));
    console.log("Direct API call trigger ho rahi hai...");
    this.getTeams();
    this.loadConnectingPortsData();
    this.getbranch();
    this.quotation.chargeableWeightUnit = "KGS";
    this.quotation.netWeightUnit = "KGS";
    if (!this.quotation.GrossweightUnit) this.quotation.GrossweightUnit = "KGS";
    this.quotation.volumeWeightUnit = "KGS";
    if (!this.quotation.cbmUnit) {
      this.quotation.cbmUnit = "CBM";
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
    this.quotation.shipmentType = "Ready";

    this.setTodayDate();
  }

  getCommodityTypes() {
    this.http.get<any[]>(`${environment.apiUrl}/CommodityType`).subscribe({
      next: (data) => {
        this.commodityTypes = data;
      },
      error: (err) => console.error("Error fetching Commodities:", err),
    });
  }
  setTodayDate() {
    const today = new Date().toISOString().split("T")[0];
    this.quotation.cargoStatusDate = today;
  }
  getsales(): void {
    console.log("Fetching Sales Coordinators from HOD list API...");

    this.userServices.getHodList().subscribe({
      next: (data: any[]) => {
        console.log("HOD/Sales Coord data received:", data);

        this.getsalescordinate = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error loading HOD list:", err);
      },
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
      },
    });
  }

  loadAirlines() {
    this.airlineService.getAll().subscribe({
      next: (data: Airline[]) => {
        this.airlineList = data || [];
        console.log("Airlines loaded via service:", this.airlineList.length);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Airline API error via service:", err);
        this.loadAirlinesFallback();
      },
    });
  }
  loadAirlinesFallback() {
    const token = localStorage.getItem("cavalier_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http
      .get<any[]>(`${environment.apiUrl}/Airline`, { headers })
      .subscribe({
        next: (data) => {
          this.airlineList = data || [];
          console.log("Airlines loaded via fallback:", this.airlineList.length);
          this.cdr.detectChanges();
        },
        error: (err) => console.error("Fallback airline API error:", err),
      });
  }

  onAirlineSearch(index: number, event?: Event) {
    const row = this.multiCarrierRows[index];
    if (!row) return;

    const searchTerm = event
      ? (event.target as HTMLInputElement).value.trim().toLowerCase()
      : (row.airline || "").toString().trim().toLowerCase();

    if (searchTerm === "") {
      this.filteredAirlines = [];
      this.showAirlineDropdownIndex = null;
      this.cdr.detectChanges();
      return;
    }

    this.filteredAirlines = this.airlineList.filter((a) => {
      const name = (a.airlineName || "").toLowerCase();
      const code = (a.airlineCode || "").toLowerCase();
      const prefix = (a.airlinePrefix || "").toLowerCase();
      return (
        name.includes(searchTerm) ||
        code.includes(searchTerm) ||
        prefix.includes(searchTerm)
      );
    });

    if (this.filteredAirlines.length > 50) {
      this.filteredAirlines = this.filteredAirlines.slice(0, 50);
    }

    this.showAirlineDropdownIndex =
      this.filteredAirlines.length > 0 ? index : null;

    if (event) {
      const target = event.target as HTMLInputElement;
      const rect = target.getBoundingClientRect();
      this.airlineDropdownPos = {
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 220),
      };
    }

    this.cdr.detectChanges();
  }

  airlineDropdownPos: { top: number; left: number; width: number } = {
    top: 0,
    left: 0,
    width: 0,
  };

  onAirlineFocus(index: number, event: FocusEvent) {
    const row = this.multiCarrierRows[index];
    if (!row) return;

    const target = event.target as HTMLInputElement;
    const rect = target.getBoundingClientRect();
    this.airlineDropdownPos = {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: Math.max(rect.width, 220),
    };

    const currentValue = (row.airline || "").toString().trim();

    if (currentValue.length > 0) {
      this.filteredAirlines = this.airlineList.filter((a) => {
        const name = (a.airlineName || "").toLowerCase();
        const code = (a.airlineCode || "").toLowerCase();
        const prefix = (a.airlinePrefix || "").toLowerCase();
        const search = currentValue.toLowerCase();
        return (
          name.includes(search) ||
          code.includes(search) ||
          prefix.includes(search)
        );
      });
    } else {
      this.filteredAirlines = this.airlineList.slice(0, 50);
    }

    this.showAirlineDropdownIndex =
      this.filteredAirlines.length > 0 ? index : null;
    this.cdr.detectChanges();
  }

  selectAirline(airline: any, index: number) {
    const row = this.multiCarrierRows[index];
    if (!row || !airline) return;

    row.airline = airline.airlineName || airline.name || "";
    row.airlineCode = airline.airlineCode || "";
    row.airlinePrefix = airline.airlinePrefix || "";

    this.showAirlineDropdownIndex = null;
    this.filteredAirlines = [];
    this.cdr.detectChanges();
  }

  loadPricingForEdit(id: any) {
    const token = localStorage.getItem("cavalier_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http
      .get(`${environment.apiUrl}/Pricing/${id}`, { headers })
      .subscribe({
        next: (data: any) => {
          if (data) {
            this.quotation = { ...data };

            this.isFormOpen = true;

            // ✅ FIX: normalize gstStatus (Taxable/Non-Taxable) from isGstApplicable
            // before recalculating, otherwise GST fields stay empty on edit.
            if (data.costBreakdowns) {
              this.costRows = data.costBreakdowns.map((r: any) =>
                this.normalizeBreakdownRow(r),
              );
            }
            if (data.multiCarrierBreakdowns) {
              this.multiCarrierRows = data.multiCarrierBreakdowns.map(
                (r: any) => this.normalizeBreakdownRow(r),
              );
            }
            this.quotation.currency = data.cargoCurrency || "";
            this.quotation.cargoValue = data.cargoValue || null;
            this.recalculateAllGst();
            this.cdr.detectChanges();
            console.log("Edit Form automatically opened for ID:", id);
          }
        },
        error: (err) => {
          console.error("Pricing load fail:", err);
          Swal.fire(
            "Error",
            "We encountered a retrieval anomaly during the data fetch; the requested information appears to be devoid of a valid pricing association in our current system configuration.",
            "error",
          );
        },
      });
  }
  activePOLIndex = -1;

  onPortOfLoadingSearch(type: "name" | "code") {
    const searchTerm = (
      type === "name"
        ? this.quotation.portOfLoading || ""
        : this.quotation.portOfLoadingCode || ""
    )
      .toString()
      .trim()
      .toLowerCase();

    if (searchTerm === "") {
      this.filteredPortsOfLoading = [];
      this.showPortOfLoadingDropdown = false;
      this.activePOLIndex = -1;
      return;
    }

    this.filteredPortsOfLoading = this.portsOfLoading.filter((port) => {
      const pName = (
        port.name ||
        port.portName ||
        port.PortName ||
        port.description ||
        ""
      ).toLowerCase();
      const pCode = (port.portCode || "").toLowerCase();
      return pName.includes(searchTerm) || pCode.includes(searchTerm);
    });

    this.showPortOfLoadingDropdown = this.filteredPortsOfLoading.length > 0;
    this.activePOLIndex = -1;
  }
  getTeams() {
    const token = localStorage.getItem("cavalier_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any[]>(`${environment.apiUrl}/Teams`, { headers }).subscribe({
      next: (data) => {
        this.teamsList = data || [];
        console.log("🆕 Price Master Teams Loaded:", this.teamsList);
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Error fetching Teams list:", err),
    });
  }

  onTeamChange(teamId: any) {
    console.log(
      "📡 Dynamic Team Change triggered inside Pricing Engine, Team ID:",
      teamId,
    );

    if (
      !teamId ||
      teamId === "null" ||
      teamId === null ||
      teamId === undefined
    ) {
      this.getsalescordinate = [];
      this.getquotedByList = [];
      this.getpricingByList = [];
      this.getsalesTeamList = [];
      this.quotation.salesTeam = "";
      return;
    }

    const token = localStorage.getItem("cavalier_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const url = `${environment.apiUrl}/Teams/${teamId}/details`;

    this.http.get<any>(url, { headers }).subscribe({
      next: (res) => {
        console.log("📊 Raw Team Payload Received:", res);

        this.getsalescordinate =
          res && res.salesCoordinators ? res.salesCoordinators : [];
        this.getquotedByList = res && res.quotedBy ? res.quotedBy : [];
        this.getpricingByList = res && res.pricingBy ? res.pricingBy : [];
        this.getsalesTeamList = res && res.salesTeam ? res.salesTeam : [];

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(
          "❌ Failed to query dynamic team framework context layout:",
          err,
        );
        this.getsalescordinate = [];
        this.getquotedByList = [];
        this.getpricingByList = [];
        this.getsalesTeamList = [];
        this.cdr.detectChanges();
      },
    });
  }

  selectPortOfLoading(port: any) {
    if (!port) return;
    this.quotation.portOfLoadingId = Number(port.id || port.Id);
    this.quotation.portOfLoading =
      port.name || port.portName || port.PortName || "";
    this.quotation.portOfLoadingCode = port.portCode || "";
    console.log(
      this.quotation.portOfLoadingId,
      this.quotation.portOfLoading,
      this.quotation.portOfLoadingCode,
    );
    this.showPortOfLoadingDropdown = false;
    this.filteredPortsOfLoading = [];
    this.activePOLIndex = -1;
    this.recalculateAllGst();
  }

  onPOLKeyDown(event: KeyboardEvent) {
    if (!this.showPortOfLoadingDropdown) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (this.activePOLIndex < this.filteredPortsOfLoading.length - 1)
        this.activePOLIndex++;
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (this.activePOLIndex > 0) this.activePOLIndex--;
    } else if (event.key === "Enter") {
      event.preventDefault();
      const selected =
        this.activePOLIndex >= 0
          ? this.filteredPortsOfLoading[this.activePOLIndex]
          : this.filteredPortsOfLoading[0];
      this.selectPortOfLoading(selected);
    }
  }

  showFinalDestinationDropdown = false;
  filteredFinalDestinations: any[] = [];
  activeFDIndex = -1;

  onFinalDestinationSearch(type: "name" | "code") {
    const searchTerm = (
      type === "name"
        ? this.quotation.finalDestination || ""
        : this.quotation.finalDestinationCode || ""
    )
      .toString()
      .trim()
      .toLowerCase();

    if (searchTerm === "") {
      this.filteredFinalDestinations = [];
      this.showFinalDestinationDropdown = false;
      this.activeFDIndex = -1;
      return;
    }

    this.filteredFinalDestinations = this.portsOfLoading.filter((port) => {
      const pName = (
        port.name ||
        port.portName ||
        port.PortName ||
        port.description ||
        ""
      ).toLowerCase();
      const pCode = (port.portCode || "").toLowerCase();
      return pName.includes(searchTerm) || pCode.includes(searchTerm);
    });

    this.showFinalDestinationDropdown =
      this.filteredFinalDestinations.length > 0;
    this.activeFDIndex = -1;
  }

  selectFinalDestination(port: any) {
    if (!port) return;
    this.quotation.finalDestination =
      port.name || port.portName || port.PortName || "";
    this.quotation.finalDestinationCode = port.portCode || "";
    this.showFinalDestinationDropdown = false;
    this.filteredFinalDestinations = [];
    this.activeFDIndex = -1;
  }

  onFDKeyDown(event: KeyboardEvent) {
    if (!this.showFinalDestinationDropdown) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (this.activeFDIndex < this.filteredFinalDestinations.length - 1) {
        this.activeFDIndex++;
        this.scrollToActiveFD();
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (this.activeFDIndex > 0) {
        this.activeFDIndex--;
        this.scrollToActiveFD();
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      const selected =
        this.activeFDIndex >= 0
          ? this.filteredFinalDestinations[this.activeFDIndex]
          : this.filteredFinalDestinations[0];
      this.selectFinalDestination(selected);
    }
  }

  private scrollToActiveFD() {
    setTimeout(() => {
      const activeElement = document.querySelector(".bg-gray-100");
      if (activeElement) activeElement.scrollIntoView({ block: "nearest" });
    }, 0);
  }

  onShipmentTypeChange() {
    if (this.quotation.shipmentType === "Ready") {
      this.setTodayDate();
    } else if (this.quotation.shipmentType === "Ready By") {
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
              console.log("showPicker not supported, using click");
            }
          }, 50);
        }
      }, 120);
    }
  }
  loadChargeMaster() {
    const lob = this.quotation?.lineOfBusinessName || "";
    this.chargeService.getDropdown(lob || undefined).subscribe({
      next: (data) => {
        this.chargeMasterList = data || [];
        this.chargesList = this.chargeMasterList.map((c) => ({
          id: c.id,
          name: c.name,
          code: c.code,
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Error fetching charge master:", err),
    });
  }

  getFilteredChargeMaster(): ChargeDto[] {
    const lob = (this.quotation?.lineOfBusinessName || "").trim();
    if (!lob) return this.chargeMasterList;
    return this.chargeMasterList.filter((c) =>
      (c.applicableFor || []).some(
        (a) => a.toLowerCase() === lob.toLowerCase(),
      ),
    );
  }

  private getBranchState(): string {
    const branchName = this.quotation?.branchName || "";
    const branch = (this.branchlist || []).find(
      (b) =>
        (b.branchName || b.BranchName || "").toLowerCase() ===
        branchName.toLowerCase(),
    );
    const state = branch?.state || branch?.State || "";
    console.log("🔍 Branch State resolved:", state);
    return state;
  }

  private getGstPortContext() {
    const pol = this.portsOfLoading.find(
      (p) => Number(p.id) === Number(this.quotation.portOfLoadingId),
    );
    const pod = this.portsOfDischarge.find(
      (p) => Number(p.id) === Number(this.quotation.portOfDischargeId),
    );

    const cleanCountry = (code: string) => {
      if (!code) return "";
      return code.split("/")[0].trim();
    };

    const polCountry = cleanCountry(
      pol?.isoCode ||
        pol?.IsoCode ||
        pol?.countryCode ||
        pol?.CountryCode ||
        "",
    );
    const podCountry = cleanCountry(
      pod?.isoCode ||
        pod?.IsoCode ||
        pod?.countryCode ||
        pod?.CountryCode ||
        "",
    );

    // ✅ NEW: PortSetup se seedha state nikalo, city-guess nahi
    const polState = pol?.stateName || pol?.StateName || "";
    const podState = pod?.stateName || pod?.StateName || "";

    console.log("🔍 GST Port Context:", {
      polCountry,
      podCountry,
      polState,
      podState,
      pol,
      pod,
    });

    return {
      polCountryCode: polCountry,
      podCountryCode: podCountry,
      polCity:
        pol?.cityName ||
        pol?.CityName ||
        pol?.name ||
        this.quotation.portOfLoading ||
        "",
      podCity:
        pod?.cityName ||
        pod?.CityName ||
        pod?.name ||
        this.quotation.portOfDestination ||
        "",
      polState, // ✅ NEW
      podState, // ✅ NEW
      branchState: this.getBranchState(),
    };
  }

  private defaultGstFields(): Partial<CostBreakdown> {
    return {
      chargeCode: "",
      gstStatus: "Non-Taxable",
      isGstApplicable: false,
      sacHsn: "",
      taxableValue: 0,
      nonTaxableValue: 0,
      taxName: "",
      taxPercent: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      taxAmount: 0,
      totalAmount: 0,
      isZeroRated: false,
      isRcmApplicable: false,
      shipmentDirection: "",
    };
  }

applyGstToCostRow(row: any) {
  const amountInr = Number(row.amount) || 0;
  const isTaxable = row.gstStatus === "Taxable";
  row.isGstApplicable = isTaxable;

  const charge = this.chargeMasterList.find((c) => c.code === row.chargeCode);

  // ✅ Tax Type column ke liye — Charge Master ki "Taxable" dropdown value
  const gstRow = charge?.taxRows?.find(
    (t: any) => t.key?.toLowerCase() === "gst" && t.checked,
  );
  row.taxType = gstRow?.taxable;

  if (!charge) {
    console.warn("Charge not found in master list:", row.chargeCode);
    return;
  }

  if (!this.taxRatesList || this.taxRatesList.length === 0) {
    console.warn("Tax rates not loaded yet. Skipping GST calculation.");
    return;
  }

  const ctx = this.getGstPortContext();
  const result = this.gstCalculationService.calculateLineLocal(
    {
      chargeCode: row.chargeCode || "",
taxType: row.taxType,
      amountInr,
      ...ctx,
      isZeroRated: !!row.isZeroRated,
      isRcmApplicable: !!row.isRcmApplicable,
    },
    charge,
    this.taxRatesList,
  );

  row.sacHsn = result.sacHsn;
  row.taxableValue = result.taxableValue;
  row.nonTaxableValue = result.nonTaxableValue;
  row.taxName = result.taxName;
  row.taxPercent = result.taxPercent;
  row.cgst = result.cgst;
  row.sgst = result.sgst;
  row.igst = result.igst;
  row.cgstPercent = result.cgstPercent;
  row.sgstPercent = result.sgstPercent;
  row.igstPercent = result.igstPercent;
  row.taxAmount = result.taxAmount;
  row.totalAmount = result.totalAmount;
  row.shipmentDirection = result.shipmentDirection;

  console.log("GST calculation result:", result);
}


applyGstToMultiCarrierRow(row: any) {
  const amountInr = Number(row.totalCost) || 0;
  const isTaxable = row.gstStatus === "Taxable";
  row.isGstApplicable = isTaxable;

  const charge = this.chargeMasterList.find((c) => c.code === row.chargeCode);

  // ✅ Tax Type column ke liye — Charge Master ki "Taxable" dropdown value
  const gstRow = charge?.taxRows?.find(
    (t: any) => t.key?.toLowerCase() === "gst" && t.checked,
  );
  row.taxType = gstRow?.taxable;

  const ctx = this.getGstPortContext();
  const result = this.gstCalculationService.calculateLineLocal(
    {
      chargeCode: row.chargeCode || "",
     taxType: row.taxType,
      amountInr,
      ...ctx,
      isZeroRated: !!row.isZeroRated,
      isRcmApplicable: !!row.isRcmApplicable,
    },
    charge,
    this.taxRatesList,
  );

  row.sacHsn = result.sacHsn;
  row.taxableValue = result.taxableValue;
  row.nonTaxableValue = result.nonTaxableValue;
  row.taxName = result.taxName;
  row.taxPercent = result.taxPercent;
  row.cgstPercent = result.cgstPercent;
  row.sgstPercent = result.sgstPercent;
  row.igstPercent = result.igstPercent;
  row.cgst = result.cgst;
  row.sgst = result.sgst;
  row.igst = result.igst;
  row.taxAmount = result.taxAmount;
  row.totalAmount = result.totalAmount;
  row.shipmentDirection = result.shipmentDirection;
}

onCostChargeSelect(row: any, chargeCode: string) {
  const charge = this.chargeMasterList.find((c) => c.code === chargeCode);
  row.chargeCode = chargeCode || "";
  row.chargeName = charge?.name || "";

  // ✅ FIX: taxRows kabhi-kabhi JSON string aata hai backend se — parse karo
  let taxRowsArr: any[] = [];
  if (charge?.taxRows) {
    taxRowsArr = typeof charge.taxRows === "string"
      ? JSON.parse(charge.taxRows)
      : charge.taxRows;
  }

  const gstRow = taxRowsArr.find(
    (t: any) => t.key?.toLowerCase() === "gst" && t.checked,
  );

  row.taxType = gstRow?.taxable;
  row.isGstApplicable = row.taxType;
  row.gstStatus = row.isGstApplicable

  this.applyGstToCostRow(row);
  this.cdr.detectChanges();
}

onMultiCarrierChargeSelect(row: any, chargeCode: string) {
  const charge = this.chargeMasterList.find((c) => c.code === chargeCode);
  row.chargeCode = chargeCode || "";
  row.chargeName = charge?.name || "";

  // ✅ FIX: taxRows kabhi-kabhi JSON string aata hai backend se — parse karo
  let taxRowsArr: any[] = [];
  if (charge?.taxRows) {
    taxRowsArr = typeof charge.taxRows === "string"
      ? JSON.parse(charge.taxRows)
      : charge.taxRows;
  }

  const gstRow = taxRowsArr.find(
    (t: any) => t.key?.toLowerCase() === "gst" && t.checked,
  );

  row.taxType = gstRow?.taxable ;
  row.isGstApplicable = row.taxType ;
  row.gstStatus = row.isGstApplicable;

  this.applyGstToMultiCarrierRow(row);
  this.cdr.detectChanges();
}


  
  onCostGstStatusChange(row: any) {
    this.applyGstToCostRow(row);
    this.cdr.detectChanges();
  }

  onMultiCarrierGstStatusChange(row: any) {
    this.applyGstToMultiCarrierRow(row);
    this.cdr.detectChanges();
  }

  normalizeBreakdownRow(row: any) {
    row.gstStatus =
      row.isGstApplicable || row.gstStatus
    if (!row.chargeCode && row.chargeName) {
      const match = this.chargeMasterList.find(
        (c) => c.name === row.chargeName,
      );
      if (match) row.chargeCode = match.code;
    }
    return row;
  }

  recalculateAllGst() {
    (this.costRows || []).forEach((row) => this.applyGstToCostRow(row));
    (this.multiCarrierRows || []).forEach((row) =>
      this.applyGstToMultiCarrierRow(row),
    );
    this.cdr.detectChanges();
  }

  loadChargeNamesMaster() {
    this.loadChargeMaster();
  }
  getbranch() {
    this.branchservice.getBranches().subscribe({
      next: (response: any) => {
        this.branchlist = response;
        console.log("Branches loaded:", this.branchlist);
      },
      error: (err: any) => {
        console.error("Error fetching branches:", err);
      },
      complete: () => {
        console.log("Branch fetch completed");
      },
    });
  }
  getMovementTypes() {
    this.http.get<any[]>(`${environment.apiUrl}/MovementTypes`).subscribe({
      next: (data) => {
        this.movementTypes = data;
      },
      error: (err) => console.error("Error fetching Movement Types:", err),
    });
  }
  onLOBChange(event: any) {
    const selectedId = event.target.value;
    const selectedService = this.companyServices.find(
      (s) => s.id == selectedId,
    );

    if (!selectedService) return;

    const fullName = selectedService.serviceName.trim();
    this.quotation.lineOfBusinessName = fullName;
    this.loadChargeMaster();

    if (this.costRows && this.costRows.length > 0) {
      this.costRows[0].lob = fullName;
    }

    if (this.multiCarrierRows && this.multiCarrierRows.length > 0) {
      this.multiCarrierRows.forEach((row: any) => {
        row.lob = fullName;
      });
    }

    const parts: string[] = fullName.split(/[\s\-]+/);
    if (parts.length >= 1) {
      const modeName = parts[0];
      const modeObj = this.transportModes.find(
        (m) => m.name.toLowerCase() === modeName.toLowerCase(),
      );
      if (modeObj) {
        this.quotation.TransportMode = modeObj.id;
      }

      const typeKeyword = parts.find((p) =>
        ["export", "import"].includes(p.toLowerCase()),
      );
      if (typeKeyword) {
        this.quotation.TransportType =
          typeKeyword.charAt(0).toUpperCase() +
          typeKeyword.slice(1).toLowerCase();
      }
    }

    const currentCountry =
      this.quotation.country || this.selectedCountryName || "";
    this.fetchAgentByLobId(selectedId, currentCountry);

    this.cdr.detectChanges();
  }

  getIncoTerms() {
    this.http.get<any[]>(`${environment.apiUrl}/IncoTerms`).subscribe({
      next: (data) => {
        this.incoTerms = data;
      },
      error: (err) => console.error("Error fetching IncoTerms:", err),
    });
  }

  onServiceTypeChange() {
    console.log(
      `Service Type Changed → Direct: ${this.quotation.isDirect} | Indirect: ${this.quotation.isIndirect}`,
    );
    console.log(
      "Direct:",
      this.quotation.isDirect,
      "Indirect:",
      this.quotation.isIndirect,
    );
    if (this.quotation.isDirect) this.quotation.isIndirect = false;
    if (this.quotation.isIndirect) this.quotation.isDirect = false;
  }

  onIncotermChange(event: any) {
    const selectedIncoterm = event.target.value?.toUpperCase().trim();
    console.log(selectedIncoterm);
    this.showincoterms = selectedIncoterm;
    this.cdr.detectChanges();
    if (!selectedIncoterm) return;

    this.quotation.incoterm = selectedIncoterm;

    console.log(`Incoterm changed to: ${selectedIncoterm}`);
    if (
      selectedIncoterm === "DDP" ||
      selectedIncoterm === "DDU" ||
      selectedIncoterm === "DAP"
    ) {
      this.isDeliveryEnabled = true;
    } else {
      this.isDeliveryEnabled = false;
      this.quotation.deliveryAddress = "";
    }

    switch (selectedIncoterm) {
      case "FOB":
        this.quotation.movementType = "PORT TO PORT";
        this.isPickupEnabled = false;
        this.quotation.pickupAddress = "";
        break;

      case "EXWORK":
        this.quotation.movementType = "DOOR TO PORT";
        this.isPickupEnabled = true;
        break;

      default:
        this.quotation.movementType = "DOOR TO DOOR";
        this.isPickupEnabled = false;
        this.quotation.pickupAddress = "";
    }

    console.log(
      `→ Movement Type Auto Selected: ${this.quotation.movementType}`,
    );
  }
  getTransportModes() {
    const url = `${environment.apiUrl}/TransportModes`;

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.transportModes = data;
      },
      error: (err) => console.error("API Error:", err),
    });
  }
  getShipmentTypes() {
    this.http.get<any[]>(`${environment.apiUrl}/ShipmentTypes`).subscribe({
      next: (data) => {
        this.shipmentTypes = data;
      },
      error: (err) => console.error("Error fetching Shipment Types:", err),
    });
  }

  closeAirlineDropdownWithDelay() {
    setTimeout(() => {
      if (!this.airlineDropdownClicked) {
        this.showAirlineDropdownIndex = null;
        this.cdr.detectChanges();
      }
    }, 300);
  }
  onAirlineSelectChange(selectedName: string, index: number) {
    const row = this.multiCarrierRows[index];
    if (!row) return;

    const found = this.airlineList.find(
      (a) => (a.airlineName || a.name) === selectedName,
    );

    if (found) {
      row.airline = found.airlineName || found.name || "";
      row.airlineCode = found.airlineCode || "";
      row.airlinePrefix = found.airlinePrefix || "";
    }

    this.cdr.detectChanges();
  }

  fetchCompanyServices() {
    const url = `${environment.apiUrl}/CompanyService`;
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.companyServices = data;
        console.log("Line of Business loaded:", data);
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Error loading LOB:", err),
    });
  }

  fetchOrigins() {
    const url = `${environment.apiUrl}/origin/all`;
    this.http.get<any[]>(url).subscribe((data) => {
      this.origins = data;
    });
  }

  onForwarderSelectChange(selectedAgentName: string, index: number) {
    const row = this.multiCarrierRows[index];
    if (!row) return;

    const found = this.agentDetail.find(
      (a: any) => a.agentName === selectedAgentName,
    );

    row.forwarder = selectedAgentName;

    if (found) {
      row.forwarderOrgName = found.orgName || "";
      row.forwarderBranch = found.branchName || "";
      row.forwarderEmail = found.email || "";
    }

    this.cdr.detectChanges();
  }

  onOriginSearchInput() {
    const searchTerm = (this.inquiry.origin || "")
      .toString()
      .trim()
      .toLowerCase();
    if (searchTerm === "") {
      this.showOriginDropdown = false;
      this.filteredOrigins = [];
      return;
    }

    this.filteredOrigins = this.origins.filter((org) => {
      return (
        (org.name || "").toLowerCase().includes(searchTerm) ||
        (org.countryName || "").toLowerCase().includes(searchTerm)
      );
    });
    this.showOriginDropdown = true;
  }

  selectOrigin(origin: any) {
    this.originsaveid = origin.id;
    this.originpinCode = origin.countryCode;

    this.inquiry.origin = origin.name;

    this.quotation.countryName = origin.countryName || origin.country;
    this.quotation.country = origin.countryName || origin.country;

    this.showOriginDropdown = false;

    console.log("Selected Origin and Country:", origin);

    if (this.multiCarrierRows?.length > 0) {
      this.multiCarrierRows.forEach((row: any) => {
        row.origin = origin.name;
      });
    }

    this.cdr.detectChanges();
  }
  onOriginKeyDown(event: any) {
    if (event.key === "Enter" && this.filteredOrigins.length > 0) {
      event.preventDefault();
      this.selectOrigin(this.filteredOrigins[0]);
    }
  }
  fetchAgentByPostCode(postCode: string | number) {
    const url = `${environment.apiUrl}/OrgBranch/GetByPostCodeAgent/${postCode}`;

    this.http.get<any[]>(url).subscribe({
      next: (res) => {
        this.agentDetail = res;

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Agent fetch fail ho gaya bhai:", err);
        this.agentDetail = [];
      },
    });
  }
  toggleSelectAllAgents(event: any): void {
    const isChecked = event.target.checked;

    this.agentDetail.forEach((agent) => {
      agent.isSelected = isChecked;

      const mockEvent = { target: { checked: isChecked } };
      this.onAgentSelect(mockEvent, agent);
    });
  }
  isAllAgentsSelected(): boolean {
    if (!this.agentDetail || this.agentDetail.length === 0) {
      return false;
    }
    return this.agentDetail.every((agent) => agent.isSelected);
  }
  fetchAgentByLobId(lobId: string | number, countryName: string) {
    if (!lobId) {
      console.warn("⚠️ Operation blocked: Line of Business ID missing.");
      return;
    }

    const safeCountry = countryName
      ? encodeURIComponent(countryName.trim())
      : "";

    const url = `${environment.apiUrl}/OrgBranch/GetByLobIdAgent/${lobId}?country=${safeCountry}`;
    console.log("📡 Dispatching Combined Agent Query Payload:", url);

    this.http.get<any[]>(url).subscribe({
      next: (res) => {
        this.agentDetail = res || [];
        if (this.quotation.Agent) {
          this.markAgentAsSelected(this.quotation.Agent);
        }
        this.cdr.detectChanges();
        console.log(
          "✅ Agents/Branches synced for review sequence:",
          this.agentDetail,
        );
      },
      error: (err) => {
        console.error("❌ Agent dynamic fetch protocol failed:", err);
        this.agentDetail = [];
        this.cdr.detectChanges();
      },
    });
  }
  addToLocalReview() {
    console.log("--- Review Button Clicked ---");

    if (!this.inquiry.organization) {
      Swal.fire(
        "Warning",
        "First save or select an organization name!",
        "warning",
      );
      return;
    }

    let finalDimensions = [];
    if (this.dimRows && this.dimRows.length > 0) {
      finalDimensions = this.dimRows.filter((d) => d.l || d.w || d.h);
    }

    if (
      finalDimensions.length === 0 &&
      this.appliedDimensions &&
      this.appliedDimensions.length > 0
    ) {
      finalDimensions = [...this.appliedDimensions];
    }

    const completeData = {
      lineOfBusiness: this.getLabel(
        this.companyServices,
        this.quotation.lineOfBusinessId,
      ),
      commodity: this.getLabel(this.commodityTypes, this.quotation.commodityId),
      incoTerm: this.quotation.incoterm || "N/A",
      cargoStatus: this.quotation.cargoStatusType || "Pending",
      noOfPkgs: this.quotation.noOfPkgs || 0,
      grossWeight: this.quotation.grossWeightKg || 0,
      chargeableWeight: this.quotation.chargeableWeight || 0,
      origin: this.inquiry.origin || "N/A",
      finalDestination: this.quotation.finalDestination || "N/A",
      pickupAddress: this.quotation.pickupAddress || "N/A",
      dimensions: finalDimensions,
    };

    this.localInquiryList = [completeData];

    const activeLobId = this.quotation.lineOfBusinessId;
    const currentCountry =
      this.quotation.country || this.selectedCountryName || "";

    this.fetchAgentByLobId(activeLobId, currentCountry);

    this.isPreviewMode = true;
    this.cdr.detectChanges();
  }

  onAgentSelect(event: any, agent: any) {
    const email = agent.email || agent.email;
    const branch = agent.agentName || agent.agentName || "Global";

    if (!email) return;

    if (event.target.checked) {
      this.selectedEmails.add(email);
      console.log(
        `✅ Agent selected: ${Array.from(this.selectedEmails)} | Branch: ${branch}`,
      );
      this.lastSelectedBranch = branch;
    } else {
      this.selectedEmails.delete(email);
    }

    console.log("Current Selection:", Array.from(this.selectedEmails));
    console.log("Selected Branch:", this.lastSelectedBranch);
  }
  fetchLeads() {
    const url = `${environment.apiUrl}/Leads`;
    this.http.get<any[]>(url).subscribe((data) => {
      this.leads = data;
    });
  }

  onLeadSearchInput() {
    if (this.inquiry.leadNo && this.inquiry.leadNo.length > 3) {
      this.showLeadDropdown = true;
      this.filteredLeads = this.leads.filter((lead) =>
        lead.leadNo.toLowerCase().includes(this.inquiry.leadNo.toLowerCase()),
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
      },
    });
  }
  activePODIndex = -1;

  onPortOfDischargeSearch(type: "name" | "code") {
    const searchTerm = (
      type === "name"
        ? this.quotation.portOfDestination || ""
        : this.quotation.portOfDestinationCode || ""
    )
      .toString()
      .trim()
      .toLowerCase();

    if (searchTerm === "") {
      this.filteredPortsOfDischarge = [];
      this.showPortOfDischargeDropdown = false;
      this.activePODIndex = -1;
      return;
    }

    this.filteredPortsOfDischarge = this.portsOfDischarge.filter((port) => {
      const pName = (
        port.name ||
        port.portName ||
        port.PortName ||
        port.description ||
        ""
      ).toLowerCase();
      const pCode = (port.portCode || "").toLowerCase();
      return pName.includes(searchTerm) || pCode.includes(searchTerm);
    });

    this.showPortOfDischargeDropdown = this.filteredPortsOfDischarge.length > 0;
    this.activePODIndex = -1;
  }

  selectPortOfDischarge(port: any) {
    if (!port) return;
    this.quotation.portOfDischargeId = Number(port.id || port.Id);
    this.quotation.portOfDestination =
      port.name || port.portName || port.PortName || "";
    this.quotation.portOfDestinationCode = port.portCode || "";
    this.showPortOfDischargeDropdown = false;
    this.filteredPortsOfDischarge = [];
    this.activePODIndex = -1;
    this.recalculateAllGst();
  }

  onPODKeyDown(event: KeyboardEvent) {
    if (!this.showPortOfDischargeDropdown) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (this.activePODIndex < this.filteredPortsOfDischarge.length - 1)
        this.activePODIndex++;
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (this.activePODIndex > 0) this.activePODIndex--;
    } else if (event.key === "Enter") {
      event.preventDefault();
      const selected =
        this.activePODIndex >= 0
          ? this.filteredPortsOfDischarge[this.activePODIndex]
          : this.filteredPortsOfDischarge[0];
      this.selectPortOfDischarge(selected);
    }
  }

  fetchOrganizations() {
    const url = `${environment.apiUrl}/Organization/list`;

    const token = localStorage.getItem("cavalier_token");

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http.get<any[]>(url, { headers }).subscribe({
      next: (data) => {
        this.organizations = data;
      },
      error: (err) => {
        console.error("Error fetching organizations:", err);
      },
    });
  }

  onSearchInput() {
    if (this.inquiry.organization && this.inquiry.organization.length > 3) {
      this.showDropdown = true;
      this.filteredOrganizations = this.organizations.filter((org) =>
        org.orgName
          .toLowerCase()
          .includes(this.inquiry.organization.toLowerCase()),
      );
    } else {
      this.showDropdown = false;
    }
  }

  selectOrganization(org: any) {
    this.inquiry.organization = org.orgName;

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

    this.http.get(url, { responseType: "text" }).subscribe({
      next: (nextNo) => {
        this.inquiry.inquiryNo = nextNo;
        console.log("Next Inquiry No set to:", nextNo);
      },
      error: (err) => {
        console.error("API Error:", err);
      },
    });
  }

  loadQuotations() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (res) => (this.quotations = res),
      error: (err) => console.error("Failed to load inquiries:", err),
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadedDocuments.push({
        file: file,
        fileName: file.name,
      });

      if (this.uploadedDocuments.length === 1) {
        this.quotation.hazardDocPath = file.name;
      }

      event.target.value = "";

      console.log("Documents List:", this.uploadedDocuments);
    }
  }

  removeDoc(index: number) {
    this.uploadedDocuments.splice(index, 1);
  }

  neworg() {
    this.router.navigate(["/dashboard/organization-add"]);
  }
  deleteQuotation(id: number) {
    if (confirm("Are you sure?")) {
      this.quotations = this.quotations.filter((q: any) => q.id !== id);

      this.cdr.detectChanges();

      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          console.log("Deleted Successfully!");
          this.loadQuotations();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Delete failed", err);
          Swal.fire({
            icon: "error",
            title: "Delete Failed",
            text: "Delete failed! Refreshing list...",
            confirmButtonColor: "#d33",
            confirmButtonText: "OK",
          });
          this.loadQuotations();
          this.cdr.detectChanges();
        },
      });
    }
  }
  getFormattedInquiryNo(): string {
    const lobName = this.quotation.lineOfBusinessName || "";

    const initials = (lobName || "")
      .split(" ")
      .filter((word: string) => word && word.length > 0)
      .map((word: string) => word.charAt(0))
      .join("")
      .toUpperCase();

    let number = 1;

    if (this.inquiry.inquiryNo) {
      number = parseInt(this.inquiry.inquiryNo) || 1;
    }

    const formattedNumber = number.toString().padStart(4, "0");

    const now = new Date();
    const startYear =
      now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    const endYear = startYear + 1;

    const fy = `${startYear.toString().slice(-2)}-${endYear.toString().slice(-2)}`;

    return `CAV/INQ/${initials}/${formattedNumber}/${fy}`;
  }

  toggleForm() {
    this.isFormOpen = !this.isFormOpen;

    if (!this.isFormOpen) {
      this.isPreviewMode = false;
      this.quotation = this.resetQuotationModel();
      this.appliedDimensions = [];
      this.dimRows = [{ box: 1, l: 0, w: 0, h: 0, unit: "CMS" }];
    } else {
      if (!this.quotation || !this.quotation.id || this.quotation.id === 0) {
        this.fetchNextPricingNumber();
      }
    }

    this.cdr.detectChanges();
  }

  fetchNextPricingNumber() {
    const token = localStorage.getItem("cavalier_token");
    const headers = { Authorization: `Bearer ${token}` };

    this.http
      .get(`${environment.apiUrl}/Pricing/GetNextNumber`, { headers })
      .subscribe({
        next: (res: any) => {
          if (res && res.nextNo) {
            this.quotation.pricingNo = res.nextNo;
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          console.error("Pricing number fetch error:", err);
        },
      });
  }

  closeDimModal() {
    this.isDimModalOpen = false;
  }

  addNewDimRow() {
    this.dimRows.push({
      box: 1,
      l: 0,
      w: 0,
      h: 0,
      unit: "CMS",
    });
    this.cdr.detectChanges();
  }

  removeDimRow(i: number) {
    if (this.dimRows.length > 1) {
      this.dimRows.splice(i, 1);
    }
  }
  onTransportModeChange() {
    Swal.fire({
      icon: "info",
      title: "Transport Mode Changed",
      text: `Transport mode changed to ${this.quotation.TransportMode}`,
      confirmButtonColor: "#3085d6",
      confirmButtonText: "OK",
    });
  }
  saveDimensions() {
    console.log(
      "--- 💾 Syncing and Applying Multiple Dimensions ---",
      this.dimRows,
    );

    this.dimRows = [...this.dimRows];

    this.appliedDimensions = this.dimRows.filter(
      (d) => Number(d.l) > 0 || Number(d.w) > 0 || Number(d.h) > 0,
    );

    this.quotation.dimensions = [...this.dimRows];

    if (this.dimRows.length > 0) {
      this.dimRow = { ...this.dimRows[0] };
    }

    this.quotation.volumeWeight = this.getTotalVolumeWeight();
    this.calculateCBM();
    this.calculateNetWeight();
    this.calculateVolumeWeightLogic();
    this.calculateTotalPackages();

    this.isDimModalOpen = false;
    this.cdr.detectChanges();
  }
  openDimModal() {
    if (!this.dimRows || this.dimRows.length === 0) {
      this.dimRows = [{ ...this.dimRow }];
    }
    this.isDimModalOpen = true;
    this.cdr.detectChanges();
  }

  editQuotation(q: any) {
    const url = `${environment.apiUrl}/Pricing/${q.id}`;

    this.http.get<any>(url).subscribe({
      next: (fullData) => {
        console.log("FULL DATA RECEIVED:", fullData);

        this.quotation = { ...fullData };

        this.documents = fullData.pricingDocuments.filter(
          (d: any) => d.docType === "Commodity",
        );
        this.invoices = fullData.pricingDocuments.filter(
          (d: any) => d.docType === "Invoice",
        );
        console.log("Mapped Documents:", this.documents);
        this.isFormOpen = true;
        this.cdr.detectChanges();
      },
    });
  }

  resetQuotationModel() {
    return {
      id: 0,
      customerName: "",
      branchName: "MAIN",
      receivedDate: new Date().toISOString().split("T")[0],
      location: "",
      transportMode: "Air",
      shipmentType: "International",
      lineOfBusinessId: null,
      commodityId: 1,
      cargoStatusType: "Ready",
      salesTeam: "",
      portOfLoadingId: 1,
      portOfDischargeId: 1,
      noOfPkgs: 1,
      grossWeightKg: 0,
      chargeableWeight: 0,
      hazardDocPath: "",
      cargoStatusDate: new Date().toISOString().split("T")[0],
      dimensions: [],
      currency: "",
      cargoValue: null,
    };
  }

  allUniqueServices: string[] = [];
  filteredServices: string[] = [];

  loadDropdownData() {
    const token = localStorage.getItem("cavalier_token");

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    this.http
      .get<any[]>(`${environment.apiUrl}/Pricing`, { headers })
      .subscribe({
        next: (data) => {
          const allModes = data
            .map((item) => item.transportMode)
            .filter((m) => m);

          this.allUniqueServices = [...new Set(allModes)];

          console.log("Master Unique List ready:", this.allUniqueServices);
        },
        error: (err) => {
          console.error("Error loading dropdown data:", err);

          if (err.status === 401) {
            Swal.fire({
              icon: "error",
              title: "Unauthorized!",
              text: "Please login again.",
              confirmButtonColor: "#d33",
              confirmButtonText: "OK",
            });
          }
        },
      });
  }

  toggleServicePopup() {
    if (this.showServicePopup) {
      this.showServicePopup = false;
      this.cdr.detectChanges();
      return;
    }

    const token = localStorage.getItem("cavalier_token");
    if (!token) {
      console.warn("Bhai login token nahi mila!");
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.serviceSub?.unsubscribe();

    const fullUrl = `${environment.apiUrl}/Pricing`;

    this.serviceSub = this.http.get<any>(fullUrl, { headers }).subscribe({
      next: (res: any) => {
        const rawList =
          res && res.data && Array.isArray(res.data)
            ? res.data
            : Array.isArray(res)
              ? res
              : [];

        const uniqueModes: string[] = Array.from(
          new Set<string>(
            rawList
              .filter(
                (item: any) =>
                  item &&
                  typeof item.transportMode === "string" &&
                  item.transportMode.trim() !== "",
              )
              .map((item: any) => item.transportMode as string),
          ),
        );

        this.allTransportModes = uniqueModes;

        this.allUniqueServices = [...uniqueModes];

        this.showServicePopup = true;

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error fetching Inquiry Services", err);
        this.showServicePopup = false;
        this.cdr.detectChanges();
      },
    });
  }

  onServiceType() {
    const query = this.searchFilters.transportMode
      ? this.searchFilters.transportMode.trim().toLowerCase()
      : "";
    console.log("--- ⌨️ Input Box Typing --- Query:", query);

    if (query.length >= 3) {
      this.filteredServices = this.allTransportModes.filter(
        (mode: string) => mode && mode.toLowerCase().includes(query),
      );
      console.log(
        `Dropdown Matches found: ${this.filteredServices.length}`,
        this.filteredServices,
      );
    } else {
      this.filteredServices = [];
    }
    this.cdr.detectChanges();
  }

  selectServiceType(val: string) {
    console.log("--- 🎯 Item Selected ---", val);
    this.searchFilters.transportMode = val;
    this.filteredServices = [];
    this.showServicePopup = false;
    this.cdr.detectChanges();
  }
  allUniqueInquiryNos: string[] = [];
  filteredInquiryNos: string[] = [];
  showPricingPopup: boolean = false;
  allUniquePricingNos: string[] = [];
  masterPricingList: string[] = [];
  filteredPricingNos: string[] = [];
  loadPricingNumbers() {
    const token = localStorage.getItem("cavalier_token");
    const headers = { Authorization: `Bearer ${token}` };

    this.http
      .get<any[]>(`${environment.apiUrl}/Pricing`, { headers })
      .subscribe({
        next: (data) => {
          const rawNumbers = data
            .map((item) => item.pricingNo)
            .filter((n) => n);

          this.masterPricingList = [...new Set(rawNumbers)];
          this.allUniquePricingNos = [...this.masterPricingList];
        },
        error: (err) => console.error("Error:", err),
      });
  }

  togglePricingPopup() {
    this.showPricingPopup = !this.showPricingPopup;
    this.allUniquePricingNos = [...this.masterPricingList];

    this.cdr.detectChanges();
  }

  openPricingModal() {
    console.log("--- 🔍 Icon Clicked: openPricingModal() Triggered ---");
    this.showPricingPopup = true;

    const fullUrl = `${environment.apiUrl}/pricing`;
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("cavalier_token")}`,
    };
    console.log("Fetching directly from target API URL:", fullUrl);

    this.http.get(fullUrl, { headers }).subscribe({
      next: (response: any) => {
        console.log("Backend API Raw Response:", response);

        if (response && response.data && Array.isArray(response.data)) {
          this.masterPricingList = response.data.map(
            (item: any) => item.pricingNo,
          );
        } else {
          this.masterPricingList = [];
        }

        console.log(
          "Master list stored locally (Strings only):",
          this.masterPricingList,
        );

        this.allUniquePricingNos = [...this.masterPricingList];
        console.log(
          "Modal rendering data sequence ready:",
          this.allUniquePricingNos,
        );

        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error("API call directly failed! Trace:", error);
        this.cdr.detectChanges();
      },
    });
  }

  onPricingNoType() {
    const query = this.searchFilters.pricingNo
      ? this.searchFilters.pricingNo.trim().toLowerCase()
      : "";
    console.log("--- ⌨️ Main Input Event Tracked ---");
    console.log("Normalized query filter:", query);

    if (query.length >= 3) {
      this.filteredPricingNos = this.masterPricingList.filter(
        (pNo: any) => pNo && pNo.toLowerCase().includes(query),
      );
      console.log(
        `Matches found (>= 3 chars): ${this.filteredPricingNos.length}`,
        this.filteredPricingNos,
      );
    } else {
      this.filteredPricingNos = [];
      console.log("Query string too short (< 3 chars). Dropdown hidden.");
    }

    this.cdr.detectChanges();
  }

  filterPricingList(event: any) {
    const searchTerm = event.target.value
      ? event.target.value.toLowerCase().trim()
      : "";
    console.log("--- 📦 Inner Modal Searching ---");

    if (!searchTerm) {
      this.allUniquePricingNos = [...this.masterPricingList];
      console.log("Search field empty. Reverted back to full master dataset.");
    } else {
      this.allUniquePricingNos = this.masterPricingList.filter(
        (pNo: any) => pNo && pNo.toLowerCase().includes(searchTerm),
      );
      console.log(
        `Filtered result subset size: ${this.allUniquePricingNos.length}`,
        this.allUniquePricingNos,
      );
    }

    this.cdr.detectChanges();
  }

  selectPricingNumber(num: string) {
    console.log("--- 🎯 Selection Event Fired ---", num);

    this.searchFilters.pricingNo = num;
    this.filteredPricingNos = [];
    this.showPricingPopup = false;

    this.cdr.detectChanges();
  }

  loadInquiryNumbers() {
    const token = localStorage.getItem("cavalier_token");

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    this.http
      .get<any[]>(`${environment.apiUrl}/Inquiry`, { headers })
      .subscribe({
        next: (data) => {
          const rawNumbers = data
            .map((item) => item.inquiryNo)
            .filter((n) => n !== null && n !== undefined && n !== "");

          this.allUniqueInquiryNos = [...new Set(rawNumbers)];

          console.log(
            "Authorized Unique Inquiry Numbers Loaded",
            this.allUniqueInquiryNos,
          );
        },
        error: (err) => {
          console.error("Authorization failed or API error:", err);
        },
      });
  }

  onInquiryType() {
    const query = this.searchFilters.inquiryNo
      ? String(this.searchFilters.inquiryNo).trim().toLowerCase()
      : "";

    if (query.length >= 3) {
      this.filteredInquiryNos = this.allUniqueInquiryNos.filter(
        (num) => num && String(num).toLowerCase().includes(query),
      );
    } else {
      this.filteredInquiryNos = [];
    }
  }
  allUniqueCoordinators: string[] = [];
  filteredCoordinators: string[] = [];

  loadCoordinators() {
    const token = localStorage.getItem("cavalier_token");

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    this.http
      .get<any[]>(`${environment.apiUrl}/Inquiry`, { headers })
      .subscribe({
        next: (data) => {
          const rawCoords = data
            .map((item) => item.salesCoordinator)
            .filter(
              (c) => c !== null && c !== undefined && String(c).trim() !== "",
            );

          this.allUniqueCoordinators = [...new Set(rawCoords)];
          console.log(
            "Authorized Coordinators Loaded:",
            this.allUniqueCoordinators.length,
          );
        },
        error: (err) => {
          console.error("Coordinator load error (Auth Fail?):", err);
        },
      });
  }

  onCoordinatorType() {
    const query = this.searchFilters.salesCoordinator
      ? String(this.searchFilters.salesCoordinator).trim().toLowerCase()
      : "";

    if (query.length >= 3) {
      this.filteredCoordinators = this.allUniqueCoordinators.filter(
        (name) => name && String(name).toLowerCase().includes(query),
      );
      console.log("Suggestions Found:", this.filteredCoordinators.length);
    } else {
      this.filteredCoordinators = [];
    }
  }
  allUniqueBranches: string[] = [];
  filteredBranches: string[] = [];

  loadBranches() {
    this.http.get<any[]>(`${environment.apiUrl}/Inquiry`).subscribe({
      next: (res) => {
        const rawBranches = res
          ?.map((item) => item?.branchName || item)
          .filter((b) => b);
        this.allUniqueBranches = [...new Set(rawBranches)];
        console.log("Unique Branches Loaded");
      },
      error: (err) => console.error("Branch load error:", err),
    });
  }

  onBranchType() {
    const query = this.searchFilters.branchName
      ? this.searchFilters.branchName.trim().toLowerCase()
      : "";

    if (query.length >= 3) {
      this.filteredBranches = this.allUniqueBranches.filter((branch) =>
        branch.toLowerCase().includes(query),
      );
    } else {
      this.filteredBranches = [];
    }
  }
  isAdvanceFilterVisible: boolean = false;

  toggleAdvanceFilter() {
    this.isAdvanceFilterVisible = !this.isAdvanceFilterVisible;
  }
  onClear() {
    this.searchFilters = {
      transportMode: "Any",
      inquiryNo: "",
      branchName: "",
      salesCoordinator: "",
      cargoStatus: "(Any)",
      receivedDate: null,
      showMode: "valid",
    };
    this.dateRangeInputValue = "";
    this.searchDone = false;
    this.inquiries = [];

    this.onSearch();

    console.log("Filters Cleared!");
  }

  showCustomPicker: boolean = false;

  showDateDropdown = false;

  setQuickDate(range: string) {
    const today = new Date();
    let from = new Date();
    let to = new Date();

    switch (range) {
      case "today":
        break;
      case "yesterday":
        from.setDate(today.getDate() - 1);
        to.setDate(today.getDate() - 1);
        break;
      case "lastWeek":
        from.setDate(today.getDate() - 7);
        break;
      case "lastMonth":
        from.setMonth(today.getMonth() - 1);
        break;
      case "lastYear":
        from.setFullYear(today.getFullYear() - 1);
        break;
    }

    this.searchFilters.fromDate = from.toISOString().split("T")[0];
    this.searchFilters.toDate = to.toISOString().split("T")[0];

    this.showDateDropdown = false;
    this.onSearch();
  }
  pricings: any[] = [];
  allPricingData: any[] = [];

  searchFilters: any = {
    pricingNo: "",
    transportMode: "",
    organisationName: "",
    fromDate: null,
    toDate: null,
    branchIds: [],
    status: -1,
  };

  onSearch() {
    const isBlank =
      !this.searchFilters.pricingNo &&
      !this.searchFilters.transportMode &&
      !this.searchFilters.organisationName &&
      (this.searchFilters.status === "" ||
        this.searchFilters.status === null) &&
      !this.searchFilters.fromDate &&
      !this.searchFilters.toDate &&
      (!this.searchFilters.branchIds ||
        this.searchFilters.branchIds.length === 0);

    if (isBlank) {
      this.currentPage = 1;
      return;
    }

    const token = localStorage.getItem("cavalier_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    });

    let statusValue = -1;
    if (
      this.searchFilters.status !== "" &&
      this.searchFilters.status !== null
    ) {
      statusValue = Number(this.searchFilters.status);
    }

    const payload = {
      pricingNo: this.searchFilters.pricingNo || "",
      transportMode: this.searchFilters.transportMode || "",
      organisationName: this.searchFilters.organisationName || "",
      status: statusValue,
      fromDate: this.searchFilters.fromDate || null,
      toDate: this.searchFilters.toDate || null,
      branchIds:
        this.searchFilters.branchIds && this.searchFilters.branchIds.length > 0
          ? this.searchFilters.branchIds
          : [],
    };

    this.http
      .post<any[]>(`${environment.apiUrl}/Pricing/Search`, payload, { headers })
      .subscribe({
        next: (res: any) => {
          const rawData = Array.isArray(res) ? res : res.data || [];

          this.pricings = rawData.map((item: any) => ({
            ...item,
            pricingNo: item.pricingNo || item.PricingNo || "N/A",
            customerName: item.organisationName || item.customerName || "N/A",
            inquiryNo: item.referenceByInquiryNo || item.inquiryNo || "-",
            transportMode: item.transportMode || "-",
            status: item.status === 1 || item.status === true ? 1 : 0,
            branchName: item.branchName || "N/A",
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
        },
      });
  }
  onPageChange(page: number) {
    this.currentPage = page;

    const isSearchActive =
      this.pricings.length > 0 &&
      (this.searchFilters.pricingNo ||
        this.searchFilters.organisationName ||
        this.searchFilters.transportMode ||
        this.searchFilters.status !== "" ||
        this.searchFilters.branchIds?.length > 0);

    if (isSearchActive) {
      const startIndex = (page - 1) * this.pageSize;
      this.paginatedPricings = this.pricings.slice(
        startIndex,
        startIndex + this.pageSize,
      );
    } else {
      this.onSearch();
    }

    this.cdr.detectChanges();
  }

  AllSearchprice() {
    Swal.fire({
      icon: "info",
      title: "All Price Search",
      text: "Performing all price search...",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "OK",
    });
    return;
  }
  isExportOpen = false;

  toggleExportMenu() {
    this.isExportOpen = !this.isExportOpen;
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent) {
    this.isExportOpen = false;
  }

  printInquiries() {
    this.generatePrintLayout("print");
  }

  downloadInquiriesPDF() {
    this.isExportOpen = false;
    const printData = this.quotations.slice(0, 20);

    const element = document.createElement("div");
    element.style.padding = "40px";
    element.style.width = "1000px";
    element.style.position = "absolute";
    element.style.left = "-9999px";
    element.style.backgroundColor = "#ffffff";

    let rowsHtml = "";
    printData.forEach((q, index) => {
      const bgColor = index % 2 === 0 ? "#ffffff" : "#f9fafb";
      rowsHtml += `
      <tr style="background-color: ${bgColor}; border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px; color: #111827; font-weight: 600;">${q.id}</td>
        <td style="padding: 12px; color: #4b5563;">${q.inquiryNo}</td>
        <td style="padding: 12px; color: #4b5563;">${q.receivedDate ? new Date(q.receivedDate).toLocaleDateString("en-GB") : ""}</td>
        <td style="padding: 12px; color: #111827; text-transform: uppercase; font-size: 11px;">${q.customerName || ""}</td>
        <td style="padding: 12px; color: #4b5563;">${q.transportMode || ""}</td>
        <td style="padding: 12px;">
          <span style="background-color: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold;">
            ${q.cargoStatus || "PENDING"}
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
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        pdfWidth,
        pdfHeight,
        undefined,
        "FAST",
      );
      pdf.save(`Inquiry_Summary_${new Date().getTime()}.pdf`);

      document.body.removeChild(element);
    });
  }

  private generatePrintLayout(mode: string) {
    this.isExportOpen = false;
    const printData = this.quotations.slice(0, 20);

    let rows = "";
    printData.forEach((q) => {
      rows += `
      <tr>
        <td>${q.id}</td>
        <td><b>${q.inquiryNo}</b></td>
        <td>${q.receivedDate ? new Date(q.receivedDate).toLocaleDateString("en-GB") : ""}</td>
        <td style="text-transform: uppercase;">${q.customerName || ""}</td>
        <td>${q.transportMode || ""}</td>
        <td>${q.cargoStatus || ""}</td>
      </tr>`;
    });

    const printWindow = window.open("", "_blank");
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

    if (!this.quotations || this.quotations.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Data Available",
        text: "Excel file is empty!",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      });
      return;
    }

    const excelData = this.quotations.map((q) => {
      return {
        ID: q.id || "-",
        "Inquiry No": q.inquiryNo || "-",
        "Received Date": q.receivedDate
          ? new Date(q.receivedDate).toLocaleDateString("en-GB")
          : "-",
        "Customer Name": q.customerName || "-",
        "Transport Mode": q.transportMode || "-",
        Status: q.cargoStatus || "PENDING",
        Branch: q.branchName || "-",
        Coordinator: q.salesCoordinator || "-",
        "Shipment Type": q.shipmentType || "-",
      };
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

    const colWidths = [
      { wch: 8 },
      { wch: 15 },
      { wch: 15 },
      { wch: 30 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
    ];
    ws["!cols"] = colWidths;

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inquiry Records");

    XLSX.writeFile(wb, `Inquiry_Report_${new Date().getTime()}.xlsx`);
  }
  protected readonly Math = Math;

  get paginatedInquiries(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.quotations.slice(startIndex, startIndex + this.pageSize);
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.cdr.detectChanges();
  }
  loadInquirySettings() {
    this.http
      .get<any>(`${environment.apiUrl}/InquiryColumnSettings`)
      .subscribe((res) => {
        if (res && res.selectedColumns) {
          this.selectedColumns = JSON.parse(res.selectedColumns);
          this.availableColumns = JSON.parse(res.availableColumns);
        }
      });
  }
  onCargoStatusChange() {
    if (this.quotation.cargoStatusType === "Ready") {
      this.setTodayDate();
    } else if (this.quotation.cargoStatusType === "Ready By") {
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
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }

    const payload = {
      id: 1,
      selectedColumns: JSON.stringify(this.selectedColumns),
      availableColumns: JSON.stringify(this.availableColumns),
    };
    this.http
      .post(`${environment.apiUrl}/InquiryColumnSettings/save`, payload)
      .subscribe();
  }
  showColumnModal: boolean = false;
  showServicePopup: boolean = false;
  allTransportModes: string[] = [];
  private serviceSub?: Subscription;

  selectServiceFromPopup(val: string) {
    this.searchFilters.transportMode = val;
    this.showServicePopup = false;
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.serviceSub?.unsubscribe();
    this.inqSub?.unsubscribe();
    this.branchSub?.unsubscribe();
    this.coordinatorSub?.unsubscribe();
  }
  showInquiryPopup: boolean = false;
  allInquiryNos: string[] = [];
  private inqSub?: Subscription;

  toggleInquiryPopup() {
    if (this.showInquiryPopup) {
      this.showInquiryPopup = false;
      this.cdr.detectChanges();
      return;
    }

    const token = localStorage.getItem("cavalier_token");
    if (!token) {
      console.warn("Bhai login token nahi mila!");
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.inqSub?.unsubscribe();

    this.inqSub = this.http
      .get<any[]>(`${environment.apiUrl}/Inquiry`, { headers })
      .subscribe({
        next: (res) => {
          const uniqueInqs = [
            ...new Set(
              res
                .filter(
                  (item) => item.inquiryNo && item.inquiryNo.trim() !== "",
                )
                .map((item) => item.inquiryNo),
            ),
          ];

          this.allInquiryNos = uniqueInqs;
          this.showInquiryPopup = true;
          this.cdr.detectChanges();
          console.log("Inquiry list loaded with token");
        },
        error: (err) => {
          console.error("Error fetching Inquiries", err);
          this.showInquiryPopup = false;
          this.cdr.detectChanges();
        },
      });
  }

  selectInquiryFromPopup(val: string) {
    this.searchFilters.inquiryNo = val;
    this.showInquiryPopup = false;
    this.cdr.detectChanges();
  }
  showBranchPopup: boolean = false;
  allCustomerNames: string[] = [];
  private branchSub?: Subscription;

  toggleBranchPopup() {
    if (this.showBranchPopup) {
      this.showBranchPopup = false;
      this.cdr.detectChanges();
    } else {
      this.branchSub?.unsubscribe();

      this.branchSub = this.http
        .get<any[]>(`${environment.apiUrl}/Inquiry`)
        .subscribe({
          next: (res) => {
            const uniqueCustomers = [
              ...new Set(
                res
                  .filter(
                    (item) =>
                      item.customerName && item.customerName.trim() !== "",
                  )
                  .map((item) => item.customerName),
              ),
            ];

            this.allCustomerNames = uniqueCustomers;
            this.showBranchPopup = true;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error("Error fetching customers", err);
            this.cdr.detectChanges();
          },
        });
    }
  }

  selectBranchFromPopup(val: string) {
    this.searchFilters.branchName = val;
    this.showBranchPopup = false;
    this.cdr.detectChanges();
  }

  showCoordinatorPopup: boolean = false;
  allCoordinators: string[] = [];
  private coordinatorSub?: Subscription;

  toggleCoordinatorPopup() {
    if (this.showCoordinatorPopup) {
      this.showCoordinatorPopup = false;
      this.cdr.detectChanges();
      return;
    }

    const token = localStorage.getItem("cavalier_token");
    if (!token) {
      console.warn("Bhai login token nahi mila!");
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.coordinatorSub?.unsubscribe();

    this.coordinatorSub = this.http
      .get<any[]>(`${environment.apiUrl}/Inquiry`, { headers })
      .subscribe({
        next: (res) => {
          const uniqueCoords = [
            ...new Set(
              res
                .filter(
                  (item) =>
                    item.salesCoordinator &&
                    item.salesCoordinator.trim() !== "",
                )
                .map((item) => item.salesCoordinator),
            ),
          ];

          this.allCoordinators = uniqueCoords;
          this.showCoordinatorPopup = true;
          this.cdr.detectChanges();
          console.log("Coordinator list loaded with token");
        },
        error: (err) => {
          console.error("Error fetching Coordinators", err);
          this.showCoordinatorPopup = false;
          this.cdr.detectChanges();
        },
      });
  }

  selectCoordinatorFromPopup(val: string) {
    this.searchFilters.salesCoordinator = val;
    this.showCoordinatorPopup = false;
    this.cdr.detectChanges();
  }

  isPreviewMode = false;

  toggleReview() {
    this.addToLocalReview();
  }

  localInquiryList: any[] = [];

  backToEdit() {
    this.isPreviewMode = false;
  }

  getLabel(list: any[], id: any): string {
    if (!id || !list || list.length === 0) return "N/A";

    const found = list.find(
      (x) =>
        x.id == id ||
        x.serviceId == id ||
        x.commodityId == id ||
        x.portId == id ||
        x.value == id,
    );

    return found
      ? found.serviceName ||
          found.commodityName ||
          found.name ||
          found.portName ||
          found.text
      : id;
  }
  navigateToNewOrg(event?: MouseEvent) {
    if (event) {
      event.stopImmediatePropagation();
    }

    this.router.navigate(["/dashboard/organization-add"], {
      state: { isFormOpen: true },
    });
  }
  getSimpleLabel(val: any): string {
    return val ? val : "N/A";
  }
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

        this.cdr.detectChanges();

        console.log(res, "Leads response loaded");
      },
      error: (err) => {
        console.error("Leads load karne mein error:", err);
        this.showInquiryDropdown = false;
        this.cdr.detectChanges();
      },
    });
  }

  showOrgDropdown: boolean = false;
  organizationList: any[] = [];

  loadAllOrganizations() {
    if (this.showOrgDropdown) {
      this.showOrgDropdown = false;
      this.cdr.detectChanges();
      return;
    }

    const token = localStorage.getItem("cavalier_token");
    if (!token) {
      console.warn("Bhai login token nahi mila!");
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    });

    const url = `${environment.apiUrl}/Organization/list`;

    this.http.get<any[]>(url, { headers }).subscribe({
      next: (res) => {
        this.organizationList = res;
        this.showOrgDropdown = true;
        this.cdr.detectChanges();
        console.log(res, "Organization list loaded");
      },
      error: (err) => {
        console.error("Org load error:", err);
        this.showOrgDropdown = false;
        this.cdr.detectChanges();
      },
    });
  }

  filterTransportModes(event: any) {}
  filterInquiryList(event: any) {}
  filterCoordinatorList(event: any) {}
  isSearchModalOpen: boolean = false;
  loadAllLeadss() {
    if (this.showInquiryDropdown || this.showLeadDropdown) {
      this.showInquiryDropdown = true;
      this.showLeadDropdown = true;
      this.isSearchModalOpen = true;
      this.cdr.detectChanges();
      return;
    }

    const token = localStorage.getItem("cavalier_token");
    if (!token) {
      console.warn("Bhai login token nahi mila!");
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const url = `${environment.apiUrl}/leads`;

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
      },
    });
  }

  branchList: any[] = [];
  filteredBranchSuggestions: any[] = [];
  isBranchModalOpen: boolean = false;
  branchSearchText: string = "";
  modalSearchText: string = "";

  loadBranchess() {
    const fullUrl = `${environment.apiUrl}/branch/list`;
    console.log("📡 Calling API:", fullUrl);

    this.http.get(fullUrl).subscribe({
      next: (res: any) => {
        console.log("✅ API Raw Response:", res);

        const data = Array.isArray(res) ? res : res.data || res.result || [];
        console.log("📊 Extracted Data Array:", data);

        if (data.length === 0) {
          console.warn("⚠️ Warning: API returned empty array!");
        }

        this.branchList = data.map((b: any) => ({
          ...b,
          isSelected: false,
        }));

        this.filteredBranchSuggestions = [...this.branchList];
        console.log("📋 branchList mapped & ready:", this.branchList);
      },
      error: (err) => {
        console.error("❌ API Load Failed!", err);
      },
    });
  }

  onBranchSearch() {
    const search = this.branchSearchText.toLowerCase().trim();
    console.log("🔍 Main Input Search Text:", search);

    if (!search) {
      this.filteredBranchSuggestions = [...this.branchList];
      console.log(
        "🔄 Search empty, reset list to:",
        this.filteredBranchSuggestions.length,
      );
      return;
    }

    this.filteredBranchSuggestions = this.branchList.filter(
      (b) =>
        b.branchName?.toLowerCase().includes(search) ||
        b.branchCode?.toLowerCase().includes(search),
    );

    console.log(
      "🎯 Main Search Results Found:",
      this.filteredBranchSuggestions.length,
    );
  }

  onModalSearch() {
    const search = this.modalSearchText.toLowerCase().trim();
    console.log("🔍 Modal Search Text:", search);

    if (!search) {
      this.filteredBranchSuggestions = [...this.branchList];
      console.log(
        "🔄 Modal Search empty, showing all:",
        this.filteredBranchSuggestions.length,
      );
      return;
    }

    this.filteredBranchSuggestions = this.branchList.filter(
      (b) =>
        b.branchName?.toLowerCase().includes(search) ||
        b.branchCode?.toLowerCase().includes(search),
    );

    console.log(
      "🎯 Modal Search Results Found:",
      this.filteredBranchSuggestions.length,
    );
  }

  toggleBranchModal() {
    this.isBranchModalOpen = !this.isBranchModalOpen;
    console.log(
      "📦 Modal Status:",
      this.isBranchModalOpen ? "OPENED" : "CLOSED",
    );

    if (this.isBranchModalOpen) {
      this.modalSearchText = "";
      this.filteredBranchSuggestions = [...this.branchList];
      console.log(
        "💎 Data available for Modal:",
        this.filteredBranchSuggestions.length,
      );

      if (this.filteredBranchSuggestions.length === 0) {
        console.error("🚨 Error: branchList is empty when opening modal!");
      }
    }
  }

  toggleBranchSelection(branch: any) {
    branch.isSelected = !branch.isSelected;
    console.log(
      `✅ Toggled Branch: ${branch.branchName} | Selected: ${branch.isSelected}`,
    );
  }

  confirmSelection() {
    console.log("🆗 Confirming Selection...");

    const selectedBranches = this.branchList.filter((b) => b.isSelected);
    console.log("📍 Selected Branches:", selectedBranches);

    if (selectedBranches.length > 0) {
      this.searchFilters.branchIds = selectedBranches.map(
        (b) => b.branchId || b.id,
      );

      this.branchSearchText = selectedBranches
        .map((b) => b.branchName)
        .join(", ");

      this.searchFilters.branchId =
        selectedBranches[0].branchId || selectedBranches[0].id;
    } else {
      this.searchFilters.branchIds = [];
      this.searchFilters.branchId = "";
      this.branchSearchText = "";
    }

    console.log("📝 Input field updated to:", this.branchSearchText);
    console.log(
      "🆔 Array of IDs saved in filters:",
      this.searchFilters.branchIds,
    );

    this.isBranchModalOpen = false;

    this.onSearch();
  }

  selectBranchFromDropdown(branch: any) {
    console.log("🖱️ Direct dropdown selection:", branch.branchName);
    branch.isSelected = true;
    this.confirmSelection();
    this.filteredBranchSuggestions = [];
  }
  showCostTable: boolean = false;
  showMultiCarrierTable: boolean = false;
  toggleTable(value: boolean) {
    console.log("Button clicked! Setting showCostTable to:", value);
    this.showCostTable = value;
  }
  services = [
    { serviceName: "Standard" },
    { serviceName: "Express" },
    { serviceName: "Economy" },
  ];

  currencies = [
    { value: "USD", label: "US dollar" },
    { value: "EUR", label: "Euro" },
    { value: "INR", label: "Indian rupee" },
    { value: "AED", label: "United Arab Emirates dirham" },
    { value: "GBP", label: "Pound sterling" },
    { value: "JPY", label: "Japanese yen" },
    { value: "AFN", label: "Afghan afghani" },
    { value: "ALL", label: "Albanian lek" },
    { value: "AMD", label: "Armenian dram" },
    { value: "ANG", label: "Netherlands Antillean guilder" },
    { value: "AOA", label: "Angolan kwanza" },
    { value: "ARS", label: "Argentine peso" },
    { value: "AUD", label: "Australian dollar" },
    { value: "AWG", label: "Aruban florin" },
    { value: "AZN", label: "Azerbaijani manat" },
    { value: "BAM", label: "Bosnia and Herzegovina convertible mark" },
    { value: "BBD", label: "Barbadian dollar" },
    { value: "BDT", label: "Bangladeshi taka" },
    { value: "BGN", label: "Bulgarian lev" },
    { value: "BHD", label: "Bahraini dinar" },
    { value: "BIF", label: "Burundian franc" },
    { value: "BMD", label: "Bermudian dollar" },
    { value: "BND", label: "Brunei dollar" },
    { value: "BOB", label: "Bolivian boliviano" },
    { value: "BRL", label: "Brazilian real" },
    { value: "BSD", label: "Bahamian dollar" },
    { value: "BTN", label: "Bhutanese ngultrum" },
    { value: "BWP", label: "Botswana pula" },
    { value: "BYN", label: "Belarusian ruble" },
    { value: "BZD", label: "Belize dollar" },
    { value: "CAD", label: "Canadian dollar" },
    { value: "CDF", label: "Congolese franc" },
    { value: "CHF", label: "Swiss franc" },
    { value: "CLP", label: "Chilean peso" },
    { value: "CNY", label: "Chinese yuan" },
    { value: "COP", label: "Colombian peso" },
    { value: "CRC", label: "Costa Rican colón" },
    { value: "CUC", label: "Cuban convertible peso" },
    { value: "CUP", label: "Cuban peso" },
    { value: "CVE", label: "Cape Verdean escudo" },
    { value: "CZK", label: "Czech koruna" },
    { value: "DJF", label: "Djiboutian franc" },
    { value: "DKK", label: "Danish krone" },
    { value: "DOP", label: "Dominican peso" },
    { value: "DZD", label: "Algerian dinar" },
    { value: "EGP", label: "Egyptian pound" },
    { value: "ERN", label: "Eritrean nakfa" },
    { value: "ETB", label: "Ethiopian birr" },
    { value: "FJD", label: "Fijian dollar" },
    { value: "FKP", label: "Falkland Islands pound" },
    { value: "GEL", label: "Georgian lari" },
    { value: "GGP", label: "Guernsey pound" },
    { value: "GHS", label: "Ghanaian cedi" },
    { value: "GIP", label: "Gibraltar pound" },
    { value: "GMD", label: "Gambian dalasi" },
    { value: "GNF", label: "Guinean franc" },
    { value: "GTQ", label: "Guatemalan quetzal" },
    { value: "GYD", label: "Guyanese dollar" },
    { value: "HKD", label: "Hong Kong dollar" },
    { value: "HNL", label: "Honduran lempira" },
    { value: "HRK", label: "Croatian kuna" },
    { value: "HTG", label: "Haitian gourde" },
    { value: "HUF", label: "Hungarian forint" },
    { value: "IDR", label: "Indonesian rupiah" },
    { value: "ILS", label: "Israeli new shekel" },
    { value: "IMP", label: "Manx pound" },
    { value: "IQD", label: "Iraqi dinar" },
    { value: "IRR", label: "Iranian rial" },
    { value: "ISK", label: "Icelandic króna" },
    { value: "JEP", label: "Jersey pound" },
    { value: "JMD", label: "Jamaican dollar" },
    { value: "JOD", label: "Jordanian dinar" },
    { value: "KES", label: "Kenyan shilling" },
    { value: "KGS", label: "Kyrgyzstani som" },
    { value: "KHR", label: "Cambodian riel" },
    { value: "KID", label: "Kiribati dollar" },
    { value: "KMF", label: "Comorian franc" },
    { value: "KPW", label: "North Korean won" },
    { value: "KRW", label: "South Korean won" },
    { value: "KWD", label: "Kuwaiti dinar" },
    { value: "KYD", label: "Cayman Islands dollar" },
    { value: "KZT", label: "Kazakhstani tenge" },
    { value: "LAK", label: "Lao kip" },
    { value: "LBP", label: "Lebanese pound" },
    { value: "LKR", label: "Sri Lankan rupee" },
    { value: "LRD", label: "Liberian dollar" },
    { value: "LSL", label: "Lesotho loti" },
    { value: "LYD", label: "Libyan dinar" },
    { value: "MAD", label: "Moroccan dirham" },
    { value: "MDL", label: "Moldovan leu" },
    { value: "MGA", label: "Malagasy ariary" },
    { value: "MKD", label: "Macedonian denar" },
    { value: "MMK", label: "Burmese kyat" },
    { value: "MNT", label: "Mongolian tögrög" },
    { value: "MOP", label: "Macanese pataca" },
    { value: "MRU", label: "Mauritanian ouguiya" },
    { value: "MUR", label: "Mauritian rupee" },
    { value: "MVR", label: "Maldivian rufiyaa" },
    { value: "MWK", label: "Malawian kwacha" },
    { value: "MXN", label: "Mexican peso" },
    { value: "MYR", label: "Malaysian ringgit" },
    { value: "MZN", label: "Mozambican metical" },
    { value: "NAD", label: "Namibian dollar" },
    { value: "NGN", label: "Nigerian naira" },
    { value: "NIO", label: "Nicaraguan córdoba" },
    { value: "NOK", label: "Norwegian krone" },
    { value: "NPR", label: "Nepalese rupee" },
    { value: "NZD", label: "New Zealand dollar" },
    { value: "OMR", label: "Omani rial" },
    { value: "PAB", label: "Panamanian balboa" },
    { value: "PEN", label: "Peruvian sol" },
    { value: "PGK", label: "Papua New Guinean kina" },
    { value: "PHP", label: "Philippine peso" },
    { value: "PKR", label: "Pakistani rupee" },
    { value: "PLN", label: "Polish złoty" },
    { value: "PYG", label: "Paraguayan guaraní" },
    { value: "QAR", label: "Qatari riyal" },
    { value: "RON", label: "Romanian leu" },
    { value: "RSD", label: "Serbian dinar" },
    { value: "RUB", label: "Russian ruble" },
    { value: "RWF", label: "Rwandan franc" },
    { value: "SAR", label: "Saudi riyal" },
    { value: "SEK", label: "Swedish krona" },
    { value: "SGD", label: "Singapore dollar" },
    { value: "SOS", label: "Somali shilling" },
    { value: "SRD", label: "Surinamese dollar" },
    { value: "SSP", label: "South Sudanese pound" },
    { value: "THB", label: "Thai baht" },
    { value: "TRY", label: "Turkish lira" },
    { value: "TWD", label: "New Taiwan dollar" },
    { value: "TZS", label: "Tanzanian shilling" },
    { value: "UAH", label: "Ukrainian hryvnia" },
    { value: "UGX", label: "Ugandan shilling" },
    { value: "UYU", label: "Uruguayan peso" },
    { value: "UZS", label: "Uzbekistani soʻm" },
    { value: "VES", label: "Venezuelan bolívar soberano" },
    { value: "VND", label: "Vietnamese đồng" },
    { value: "ZAR", label: "South African rand" },
    { value: "ZMW", label: "Zambian kwacha" },
  ];

  addCostRow() {
    const newRow: any = {
      lob: this.quotation.lineOfBusinessName || "Standard",
      chargeName: "",
      chargeCode: "",
      chargeType: "Prepaid",
      basis: "",
      basisUnit: "KG",
      basisValue: 1,
      currency: "INR",
      rate: 0,
      exchangeRate: 1,
      amount: 0,
      ...this.defaultGstFields(),
    };
    this.costRows.push(newRow);
  }

  removeCostRow(index: number) {
    if (this.costRows.length > 1) {
      this.costRows.splice(index, 1);
      this.calculateCost();
    }
  }

  calculateCost() {
    const chargeableWeight = Number(this.quotation.chargeableWeight) || 0;

    this.costRows.forEach((row: any) => {
      const rate = Number(row.rate) || 0;
      const exchangeRate = Number(row.exchangeRate) || 1;

      row.amount = chargeableWeight * rate * exchangeRate;
      this.applyGstToCostRow(row);
    });

    this.cdr.detectChanges();
  }

  openCalendar(input: HTMLInputElement) {
    try {
      (input as any).showPicker();
    } catch (error) {
      input.click();
    }
  }
  applyCost() {
    console.log("Final Cost Data:", this.costRows);
    this.showCostTable = false;
  }
  costRows: CostBreakdown[] = [
    {
      lob: "Standard",
      chargeName: "",
      chargeCode: "",
      chargeType: "Prepaid",
      basis: "Per KG",
      currency: "INR",
      rate: 0,
      exchangeRate: 1,
      amount: 0,
      gstStatus: "Non-Taxable",
      isGstApplicable: false,
      sacHsn: "",
      taxableValue: 0,
      nonTaxableValue: 0,
      taxName: "",
      taxPercent: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      taxAmount: 0,
      totalAmount: 0,
    },
  ];

  multiCarrierRows: any[] = [this.createEmptyRow()];

  createEmptyRow() {
    return {
      id: 0,
      forwarder: "",
      origin: "",
      lob: "Standard",
      chargeName: "",
      chargeCode: "",
      chargeType: "Prepaid",
      currency: "USD",
      airFreight: 0,
      fsc: "INC",
      airline: "",
      airlineCode: "",
      airlinePrefix: "",
      type: "INDIRECT",
      cutoff: "",
      schedule: "",
      exWorks: 0,
      doCharges: 0,
      ccFee: 0,
      rate: 0,
      exchangeRate: 1,
      totalCost: 0,
      remark: "",
      gstStatus: "Non-Taxable",
      isGstApplicable: false,
      sacHsn: "",
      taxableValue: 0,
      nonTaxableValue: 0,
      taxName: "",
      taxPercent: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      taxAmount: 0,
      totalAmount: 0,
    };
  }

  calculateMultiTotal(i: number) {
    const r = this.multiCarrierRows[i];
    r.totalCost =
      (Number(r.airFreight) || 0) +
      (Number(r.exWorks) || 0) +
      (Number(r.doCharges) || 0) +
      (Number(r.ccFee) || 0);
    this.applyGstToMultiCarrierRow(r);
    this.cdr.detectChanges();
  }

  calculateIndirectCost(index: number) {
    const row = this.multiCarrierRows[index];
    if (row) {
      const basisValue = Number(row.basisValue) || 0;
      const rate = Number(row.rate) || 0;

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

      mRow.totalCost = airfreightCost + chrgWeight * inputRate * exchangeVal;
      this.applyGstToMultiCarrierRow(mRow);
    }
    this.cdr.detectChanges();
  }

  addMultiCarrierRow() {
    const emptyRow = this.createEmptyRow();

    if (this.quotation.lineOfBusinessName) {
      emptyRow.lob = this.quotation.lineOfBusinessName;
    }
    if (this.inquiry.origin) {
      emptyRow.origin = this.inquiry.origin;
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
    this.showMultiCarrierTable = false;
    Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Carrier details added to Inquiry!",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "OK",
    });
  }

  loadPricings() {
    const token = localStorage.getItem("cavalier_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const url = `${environment.apiUrl}/Pricing?pageNumber=${this.currentPage}&pageSize=${this.pageSize}`;

    this.http.get(url, { headers }).subscribe({
      next: (res: any) => {
        this.pricings = res.data;
        this.totalCount = res.totalCount;
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Error loading pricings:", err),
    });
  }

  setPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.onSearch();
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize) || 1;
  }
  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    this.paginatedPricings = this.pricings.slice(startIndex, endIndex);
  }
  saveQuotation() {
    if (!this.inquiry.organization) {
      Swal.fire("Warning", "Organization Name is required!", "warning");
      return;
    }

    let finalDimensionsPayload: any[] = [];

    const isExistingPricing = Number(this.quotation.id || 0) > 0;

    if (this.dimRows && this.dimRows.length > 0) {
      finalDimensionsPayload = this.dimRows
        .filter(
          (d: any) => Number(d.l) > 0 || Number(d.w) > 0 || Number(d.h) > 0,
        )
        .map((d: any) => {
          const explicitId = isExistingPricing
            ? Number(d.dimId || d.id || 0)
            : 0;
          return {
            dimId: explicitId,
            id: explicitId,
            inquiryId: Number(this.quotation.id || 0),
            box: Number(d.box || 1),
            l: Number(d.l || 0),
            w: Number(d.w || 0),
            h: Number(d.h || 0),
            unit: String(d.unit || "CMS")
              .toUpperCase()
              .trim(),
          };
        });
    } else if (this.dimRow) {
      const singleId = isExistingPricing
        ? Number(this.dimRow.dimId || this.dimRow.id || 0)
        : 0;
      finalDimensionsPayload = [
        {
          dimId: singleId,
          id: singleId,
          inquiryId: Number(this.quotation.id || 0),
          box: Number(this.dimRow.box || 1),
          l: Number(this.dimRow.l || 0),
          w: Number(this.dimRow.w || 0),
          h: Number(this.dimRow.h || 0),
          unit: String(this.dimRow.unit || "CMS")
            .toUpperCase()
            .trim(),
        },
      ];
    }

    const costData = (
      this.costRows && this.costRows.length > 0
        ? this.costRows
        : this.costBreakdowns || []
    ).map((cb: any) => ({
      lob: cb.lob || "",
      chargeType: cb.chargeType || "Prepaid",
      basis: cb.basis || "",
      chargeName: cb.chargeName || cb.charge || "",
      currency: cb.currency || "INR",
      rate: Number(cb.rate) || 0,
      exchangeRate: Number(cb.exchangeRate) || 1,
      amount: Number(cb.amount) || 0,
      remark: cb.remark || "",
      chargeCode: cb.chargeCode || null,
      taxType: cb.taxType,
      sacHsn: cb.sacHsn || "",
      taxableValue: Number(cb.taxableValue) || 0,
      nonTaxableValue: Number(cb.nonTaxableValue) || 0,
      taxName: cb.taxName || "",
      taxPercent: Number(cb.taxPercent) || 0,
      cgst: Number(cb.cgst) || 0,
      sgst: Number(cb.sgst) || 0,
      igst: Number(cb.igst) || 0,
      taxAmount: Number(cb.taxAmount) || 0,
      totalAmount: Number(cb.totalAmount) || Number(cb.amount) || 0,
    }));

    const multiCarrierData = (this.multiCarrierRows || []).map((mcb: any) => ({
      id: Number(mcb.id || 0),
      pricingId: Number(this.quotation.id || 0),
      forwarder: String(mcb.forwarder || "").trim(),
      origin: String(mcb.origin || "").trim(),
      lob: String(mcb.lob || "Standard"),
      chargeName: String(mcb.chargeName || "").trim(),
      chargeType: String(mcb.chargeType || "Prepaid"),
      currency: String(mcb.currency || "USD").trim(),
      airFreight: Number(mcb.airFreight) || 0,
      fsc: String(mcb.fsc || "INC"),
      airline: String(mcb.airline || "").trim(),
      type: String(mcb.type || "INDIRECT"),
      cutoff: String(mcb.cutoff || ""),
      schedule: String(mcb.schedule || ""),
      exWorks: Number(mcb.exWorks) || 0,
      doCharges: Number(mcb.doCharges) || 0,
      ccFee: Number(mcb.ccFee) || 0,
      rate: Number(mcb.rate) || 0,
      exchangeRate: Number(mcb.exchangeRate) || 1,
      totalCost: Number(mcb.totalCost) || 0,
      remark: String(mcb.remark || "").trim(),
      chargeCode: mcb.chargeCode || null,
      taxType: mcb.taxType,
      sacHsn: mcb.sacHsn || "",
      taxableValue: Number(mcb.taxableValue) || 0,
      nonTaxableValue: Number(mcb.nonTaxableValue) || 0,
      taxName: mcb.taxName || "",
      taxPercent: Number(mcb.taxPercent) || 0,
      cgst: Number(mcb.cgst) || 0,
      sgst: Number(mcb.sgst) || 0,
      igst: Number(mcb.igst) || 0,
      taxAmount: Number(mcb.taxAmount) || 0,
      totalAmount: Number(mcb.totalAmount) || Number(mcb.totalCost) || 0,
    }));

    console.log(
      "✈️ MULTI-CARRIER PACKAGED ARRAY DATA SUBMITTING:",
      multiCarrierData,
    );

    const processedDocuments = (this.documents || []).map((d) => ({
      name: d.name,
      documentPath: d.documentPath && !d.isReplacing ? d.documentPath : null,
    }));

    const processedInvoices = (this.invoices || []).map((i) => {
      console.log(i);
      return {
        name: i.name,
        documentPath: i.documentPath && !i.isReplacing ? i.documentPath : null,
      };
    });

    const payload: any = {
      ...this.quotation,
      invoiceList: this.quotation.invoiceList || "",
      teamId:
        this.quotation.teamId && Number(this.quotation.teamId) > 0
          ? Number(this.quotation.teamId)
          : null,
      CodeOfPOL: this.quotation.portOfLoadingCode || "",
      CodeOfPOD: this.quotation.portOfDestinationCode || "",
      CodeOfFinalDest: this.quotation.finalDestinationCode || "",
      podOrigin: String(this.quotation.podOrigin || ""),
      salesTeam: String(this.quotation.salesTeam || ""),
      inquiryNo: String(
        this.quotation.inquiryNo || this.inquiry.inquiryNo || "",
      ),
      referenceByInquiryNo:
        this.referenceByInquiryNo ||
        this.quotation.inquiryNo ||
        this.inquiry.inquiryNo ||
        null,
      transportMode: String(
        this.quotation.TransportMode || this.quotation.transportMode || "",
      ),
      transportType: String(
        this.quotation.TransportType || this.quotation.transportType || "",
      ),
      serviceType: String(
        this.quotation.TransportType || this.quotation.transportType || "",
      ),
      shipmentType: (
        this.quotation.shipmentType ||
        this.inquiry.shipmentType ||
        ""
      ).toString(),
      countryName: (
        this.quotation.countryName ||
        this.selectedCountryName ||
        ""
      ).toString(),
      connectingPortIds: Array.isArray(this.quotation.connectingPortIds)
        ? this.quotation.connectingPortIds.join(",")
        : this.quotation.connectingPortIds || "",
      OrganisationId: this.organisationId || 0,
      OrganisationName: this.organisationName || this.inquiry.organization,
      customerName: this.inquiry.organization,
      InquiryId: this.InquiryId || 0,
      pricingNo: this.quotation.pricingNo || null,
      originName: this.inquiry.origin || this.quotation.originPOL,
      portOfLoadingId: this.quotation.portOfLoadingId
        ? Number(this.quotation.portOfLoadingId)
        : null,
      portOfDischargeId: this.quotation.portOfDischargeId
        ? Number(this.quotation.portOfDischargeId)
        : null,
      lineOfBusinessId: this.quotation.lineOfBusinessId
        ? Number(this.quotation.lineOfBusinessId)
        : null,
      commodityId: this.quotation.commodity
        ? Number(this.quotation.commodity)
        : null,
      originId: this.originsaveid ? Number(this.originsaveid) : null,
      GrossWeightUnit: this.quotation.GrossWeightUnit || "KGS",
      netWeightUnit: this.quotation.netWeightUnit || "KGS",
      chargeWeightUnit: this.quotation.chargeableWeightUnit || "KGS",
      volumeWeightUnit: this.quotation.volumeWeightUnit || "KGS",
      NoOfPkgsUnit: this.quotation.noOfPkgsUnit || "PKG",
      CbmWeightUnit: this.quotation.CbmWeightUnit || "CBM",
      cargocurrency: String(this.quotation.currency || "INR"),
      cargoValue: String(this.quotation.cargoValue || "0"),
      cargoStatus: (
        this.quotation.cargoStatus ||
        this.quotation.cargoStatusType ||
        "Ready"
      ).toString(),

      CostBreakdowns: costData,
      multiCarrierBreakdowns: multiCarrierData,
      dimensions: finalDimensionsPayload,
      commodityDocs: processedDocuments,
      packageInvoiceDocs: processedInvoices,
      salesCoordinator: (this.quotation.salesCoordinator || "").toString(),
      createdBy: "admin@cavalierlogistic.in",
      qtnId: String(
        this.quotation.qtnId ||
          "QTN-" + Math.floor(1000 + Math.random() * 9000),
      ),
      createdDate: new Date().toISOString(),
    };

    const keysToDelete = [
      "TransportMode",
      "TransportType",
      "SalesCoordinator",
      "GrossWeight",
      "GrossweightUnit",
      "costBreakdowns",
      "existingInvoices",
      "commodity",
    ];
    keysToDelete.forEach((key) => delete payload[key]);

    const formData = new FormData();
    formData.append("pricingData", JSON.stringify(payload));

    this.documents.forEach((d) => {
      if (d.file) {
        formData.append("docFiles", d.file);
        formData.append("docTypes", "Commodity");
      }
    });
    this.invoices.forEach((i) => {
      if (i.file) {
        formData.append("invoiceFiles", i.file);
        formData.append("invoiceNames", i.name || i.fileName);
      }
    });

    const token = localStorage.getItem("cavalier_token");
    const httpOptions = { headers: { Authorization: `Bearer ${token}` } };
    const pricingApiUrl = `${environment.apiUrl}/Pricing`;

    const action =
      this.quotation.id > 0
        ? this.http.put(
            `${pricingApiUrl}/${this.quotation.id}`,
            formData,
            httpOptions,
          )
        : this.http.post(pricingApiUrl, formData, httpOptions);

    Swal.fire({
      title:
        this.quotation.id > 0 ? "Updating Pricing..." : "Saving Pricing...",
      text: "Please wait while your data is being processed securely.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    action.subscribe({
      next: (res: any) => {
        const savedInquiryId =
          res?.id || res?.data?.id || this.quotation.id || this.InquiryId;

        console.log("testing", this.selectedEmails);
        if (
          this.isPreviewMode &&
          this.selectedEmails &&
          this.selectedEmails.size > 0
        ) {
          console.log(
            "🚀 Pricing Saved! Found active selected agents. Redirecting to Bulk Email Stream...",
          );
          this.sendBulkEmails(savedInquiryId);
        } else {
          Swal.fire({
            title:
              this.quotation.id > 0
                ? "Updated Successfully!"
                : "Saved Successfully!",
            text:
              this.quotation.id > 0
                ? "Pricing data has been updated successfully with all table configurations!"
                : "Pricing data has been created successfully with all table configurations!",
            icon: "success",
            confirmButtonColor: "#3085d6",
            confirmButtonText: "OK",
          }).then(() => {
            this.isFormOpen = false;
            this.isPreviewMode = false;
            this.onSearch();
            this.cdr.detectChanges();
          });
        }
      },
      error: (err) => {
        console.error("❌ API SAVE SYSTEM REJECTION TRACE:", err);
        Swal.fire(
          "Database Mismatch",
          err.error?.message || "Entity relational matrix validation conflict.",
          "error",
        );
      },
    });
  }
  onFileSelecteds(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.documents[index].file = file;
      this.documents[index].isReplacing = false;
    }
  }

  saveDocumentChanges() {
    console.log("Documents saved to local state:", this.documents);
    this.isDocumentModalOpen = false;
  }

  isModalOpen = false;

  openMultiCarrierModal() {
    if (this.multiCarrierRows && this.multiCarrierRows.length > 0) {
      this.isModalOpen = true;
      this.cdr.detectChanges();
    } else {
      Swal.fire({
        icon: "warning",
        title: "No Data Available",
        text: "No carrier data has been added yet!",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      });
    }
  }

  closeModal() {
    this.isModalOpen = false;
  }

  showRowModal = false;
  selectedInquiryId: any = null;

  handleRowDblClick(id: any) {
    this.selectedInquiryId = id;
    this.showRowModal = true;
  }

  closeRowModal() {
    this.showRowModal = false;
    this.selectedInquiryId = null;
  }
  toggleStatus(q: any) {
    const token = localStorage.getItem("cavalier_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    });

    const url = `${environment.apiUrl}/Pricing/ToggleStatus/${q.id}`;

    const previousStatus = q.status;

    this.http.patch(url, {}, { headers }).subscribe({
      next: (res: any) => {
        q.status = res.newStatus;

        this.cdr.detectChanges();

        console.log(`✅ Status changed for ID ${q.id}:`, res.newStatus);
      },
      error: (err) => {
        console.error("❌ Status update fail:", err);

        q.status = previousStatus;

        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Error while changing status!",
          confirmButtonColor: "#d33",
          confirmButtonText: "OK",
        });
        this.cdr.detectChanges();
      },
    });
  }

  fetchAllCountries() {
    const apiUrl = "https://restcountries.com/v3.1/all?fields=name,cca2";
    console.log("📡 Triggering External Country API Fetch Sequence...");

    this.http.get<any[]>(apiUrl).subscribe({
      next: (data) => {
        if (data && Array.isArray(data)) {
          this.countriesList = data
            .map((country) => ({
              name: country.name?.common || "",
              id: country.cca2 || "",
            }))
            .filter((c) => c.name !== "")
            .sort((a, b) => a.name.localeCompare(b.name));

          console.log(
            `✅ Total ${this.countriesList.length} Countries successfully cached in memory.`,
          );
        } else {
          this.loadFallbackCountries();
        }
      },
      error: (err) => {
        console.error(
          "⚠️ Country API Failed, turning on secure local fallback list. Reason:",
          err,
        );
        this.loadFallbackCountries();
      },
    });
  }

  loadFallbackCountries() {
    const fallback = [
      { id: "IN", name: "India" },
      { id: "US", name: "United States" },
      { id: "AE", name: "United Arab Emirates" },
      { id: "GB", name: "United Kingdom" },
      { id: "SA", name: "Saudi Arabia" },
      { id: "QA", name: "Qatar" },
      { id: "OM", name: "Oman" },
      { id: "KW", name: "Kuwait" },
      { id: "DE", name: "Germany" },
      { id: "FR", name: "France" },
      { id: "CA", name: "Canada" },
      { id: "AU", name: "Australia" },
      { id: "SG", name: "Singapore" },
      { id: "MY", name: "Malaysia" },
      { id: "CN", name: "China" },
      { id: "JP", name: "Japan" },
      { id: "ZA", name: "South Africa" },
      { id: "NL", name: "Netherlands" },
      { id: "IT", name: "Italy" },
      { id: "ES", name: "Spain" },
    ];
    this.countriesList = fallback.sort((a, b) => a.name.localeCompare(b.name));
    console.log(
      "🔒 Fallback Dataset successfully mounted onto the framework configuration.",
    );
  }

  onCountrySearch() {
    const searchTerm = this.quotation.country?.trim().toLowerCase() || "";

    if (!searchTerm) {
      this.filteredCountries = [];
      this.showCountryDropdown = false;
      return;
    }

    this.filteredCountries = this.countriesList.filter((c) =>
      c.name.toLowerCase().includes(searchTerm),
    );

    this.showCountryDropdown = this.filteredCountries.length > 0;
    this.cdr.detectChanges();
  }

  selectCountry(country: any) {
    if (!country) return;
    this.quotation.countryName = country.name;
    this.quotation.country = country.name;
    this.quotation.countryId = country.id;
    this.selectedCountryName = country.name;

    this.showCountryDropdown = false;
    this.filteredCountries = [];

    console.log(
      "🎯 Selected Country metadata compilation active:",
      this.selectedCountryName,
    );
    this.recalculateAllGst();
    this.cdr.detectChanges();
  }
  allConnectingPorts: any[] = [];
  filteredConnectingPorts: any[] = [];
  selectedConnectingPorts: any[] = [];
  isCPModalOpen: boolean = false;
  cpSearchTerm: string = "";

  loadConnectingPortsData() {
    this.http.get<any[]>(`${environment.apiUrl}/PortSetup`).subscribe({
      next: (data) => {
        this.allConnectingPorts = data.map((p) => ({
          ...p,
          portType: p.portType || "AIRPORT",
        }));
        this.filteredConnectingPorts = [...this.allConnectingPorts];
        console.log("Ports Loaded:", this.allConnectingPorts);
        this.cdr.detectChanges();
      },
    });
  }

  getPortsByType(type: string) {
    return this.filteredConnectingPorts.filter((p) => p.portType === type);
  }

  selectConnectingPort(port: any) {
    const index = this.selectedConnectingPorts.findIndex(
      (p) => p.id === port.id,
    );
    if (index === -1) this.selectedConnectingPorts.push(port);
    else this.selectedConnectingPorts.splice(index, 1);
    this.cdr.detectChanges();
  }

  removeConnectingPort(port: any) {
    this.selectedConnectingPorts = this.selectedConnectingPorts.filter(
      (p) => p.id !== port.id,
    );
    this.cdr.detectChanges();
  }

  onSearchingConnectingPorts() {
    const term = this.cpSearchTerm.toLowerCase().trim();
    this.filteredConnectingPorts = this.allConnectingPorts.filter(
      (p) =>
        p.portName.toLowerCase().includes(term) ||
        p.portCode.toLowerCase().includes(term),
    );
  }

  toggleConnectingPortModal() {
    this.isCPModalOpen = !this.isCPModalOpen;
  }

  isPortSelected(port: any): boolean {
    return this.selectedConnectingPorts.some((p) => p.id === port.id);
  }
  commodityDocuments: any[] = [];
  packageOrInvoiceDocuments: any[] = [];
  selectInquiry(inq: any) {
    if (!inq || !inq.inquiryNo) {
      console.error("❌ Inquiry No missing!");
      return;
    }

    const inquiryNo = inq.inquiryNo?.trim();
    const url = `${environment.apiUrl}/Inquiry/by-no?inquiryNo=${inquiryNo}`;

    this.http.get<any>(url).subscribe({
      next: (data) => {
        this.InquiryId = data.id || 0;
        this.referenceByInquiryNo = data.inquiryNo || "";
        this.organisationId = data.organisationId || 0;
        this.organisationName = data.organisationName || "";
        this.OrganisationId = data.organisationId || 0;
        this.OrganisationName = data.organisationName || "";
        this.LeadId = data.leadId || 0;
        this.LeadName = data.leadName || "";
        this.quotation.CarrierCode = data.carrierCode || data.CarrierCode || "";
        this.quotation.CarrierName = data.carrierName || data.CarrierName || "";
        this.quotation.Agent = data.agent || data.Agent || "";
        this.agentSearchText = this.quotation.Agent || "";
        this.quotation.referenceByInquiry = data.inquiryNo || "";
        this.quotation.customerName = data.customerName || "";
        this.quotation.organization = data.organisationName || "";
        if (this.inquiry)
          this.inquiry.organization = data.organisationName || "";
        this.quotation.branchName = data.branchName || "";

        this.quotation.location = data.location || "";
        this.quotation.partyRole = data.partyRole || "";
        this.quotation.businessDimensions = data.businessDimensions || "";
        this.quotation.serviceType = data.serviceType || "";
        this.quotation.currency = data.cargoCurrency || "";
        this.quotation.cargoValue = data.cargoValue || null;
        this.quotation.teamId = null;
        this.getsalescordinate = [];
        this.getquotedByList = [];
        this.getpricingByList = [];

        let targetTeamId = data.teamId || data.TeamId || null;

        if (targetTeamId) {
          this.quotation.teamId = targetTeamId.toString();

          this.onTeamChange(this.quotation.teamId);

          setTimeout(() => {
            if (data.salesCoordinator) {
              this.quotation.salesCoordinator =
                data.salesCoordinator.toString();
            }
            if (data.qtnDoneBy) {
              this.quotation.qtnDoneBy = data.qtnDoneBy.toString();
            }
            if (data.pricingDoneBy) {
              this.quotation.pricingDoneBy = data.pricingDoneBy.toString();
            }
            if (data.salesTeam) {
              this.quotation.salesTeam = data.salesTeam.toString();
            }
            this.cdr.detectChanges();
          }, 400);
        }

        this.commodityDocuments = data.commodityDocuments || [];
        this.packageOrInvoiceDocuments = data.packageOrInvoiceDocuments || [];

        this.documents = (data.commodityDocuments || []).map((doc: any) => ({
          id: doc.id,
          name: doc.name || "Document",
          documentPath: doc.documentPath,
          isExisting: true,
          file: null,
          isReplacing: false,
        }));

        this.invoices = (data.packageOrInvoiceDocuments || []).map(
          (doc: any) => ({
            id: doc.id,
            name: doc.name || "Document",
            documentPath: doc.documentPath,
            isExisting: true,
            file: null,
            isReplacing: false,
          }),
        );

        this.quotation.invoiceList =
          data.invoiceList ||
          (this.invoices.length > 0 ? "Available" : "Not Available");

        this.quotation.lineOfBusinessId = data.lineOfBusinessId
          ? Number(data.lineOfBusinessId)
          : null;

        if (data.transportMode) {
          const modeObj = this.transportModes.find(
            (m) =>
              m.id == data.transportMode ||
              (m.name &&
                m.name.toLowerCase() ===
                  data.transportMode.toString().toLowerCase()),
          );
          this.quotation.TransportMode = modeObj
            ? modeObj.id
            : data.transportMode;
        }
        this.quotation.TransportType = data.transportType || "";

        if (this.quotation.lineOfBusinessId) {
          setTimeout(() => {
            this.onLOBChange({
              target: { value: this.quotation.lineOfBusinessId },
            });
          }, 100);
        }

        this.quotation.commodity = data.commodityId
          ? Number(data.commodityId)
          : null;
        setTimeout(() => {
          const commObj = this.commodityTypes.find(
            (c) => c.id == data.commodityId,
          );
          this.selectcommodityvalue = commObj ? commObj.name : "";
        }, 100);

        this.quotation.cargoStatusType = data.cargoStatus || "Ready";
        if (data.cargoStatusDate) {
          this.quotation.cargoStatusDate = data.cargoStatusDate
            .toString()
            .split("T")[0];
        }

        this.quotation.noOfPkgs = data.noOfPkgs || 0;
        this.quotation.noOfPkgsUnit = data.noOfPkgsUnit || "PKG";
        this.quotation.grossWeightKg = data.grossWeightKg || 0;
        this.quotation.GrossWeightUnit = data.grossWeightUnit || "KGS";
        this.quotation.netWeight = data.netWeight || 0;
        this.quotation.netWeightUnit = data.netWeightUnit || "KGS";
        this.quotation.chargeableWeight = data.chargeableWeight || 0;
        this.quotation.chargeableWeightUnit =
          data.chargeableWeightUnit || "KGS";
        this.quotation.volumeWeight = data.volumeWeight || 0;
        this.quotation.volumeWeightUnit = data.volumeWeightUnit || "KGS";
        this.quotation.description = data.description || "";
        this.quotation.currency = data.cargoCurrency || "";
        this.quotation.cargoValue = data.cargoValue || "";
        this.quotation.isServiceRequired =
          data.isServiceRequired !== undefined ? data.isServiceRequired : true;
        this.quotation.shipmentType = data.shipmentType || "";

        this.quotation.isDirect = data.isDirect === true;
        this.quotation.isIndirect = data.isIndirect === true;

        this.quotation.movementType = data.movementType || "";
        this.inquiry.origin = data.originName || "";
        this.originsaveid = data.originId || null;

        if (this.multiCarrierRows && this.multiCarrierRows.length > 0) {
          this.multiCarrierRows.forEach((row: any) => {
            row.origin = this.inquiry.origin;
          });
        }

        this.quotation.portOfLoadingId = data.portOfLoadingId
          ? Number(data.portOfLoadingId)
          : null;
        this.quotation.portOfLoadingCode = data.codeOfPOL || "";
        const polMatch = this.portsOfLoading?.find(
          (p) => Number(p.id) === Number(data.portOfLoadingId),
        );
        this.quotation.portOfLoading = polMatch
          ? polMatch.portName || polMatch.name
          : data.portOfLoadingName || "";

        this.quotation.portOfDischargeId = data.portOfDischargeId
          ? Number(data.portOfDischargeId)
          : null;
        this.quotation.portOfDestinationCode = data.codeOfPOD || "";
        const podMatch = this.portsOfDischarge?.find(
          (p) => Number(p.id) === Number(data.portOfDischargeId),
        );
        this.quotation.portOfDestination = podMatch
          ? podMatch.portName || podMatch.name
          : data.portOfDischargeName || "";

        this.quotation.finalDestination = data.finalDestination || "";
        this.quotation.finalDestinationCode = data.codeOfFinalDest || "";
        this.quotation.podOrigin = data.podOrigin || "";
        this.quotation.pickupAddress = data.pickupAddress || "";
        this.quotation.placeOfDelivery = data.placeOfDelivery || "";
        this.quotation.incoterm = data.incoterm || "";

        if (this.quotation.incoterm) {
          this.onIncotermChange({ target: { value: this.quotation.incoterm } });
        }

        this.quotation.countryName = data.countryName || "";
        this.quotation.country = data.countryName || "";
        this.selectedCountryName = data.countryName || "";

        this.selectedConnectingPorts = [];
        this.quotation.connectingPortIds = [];
        const rawCP = data.connectingPortIds;
        if (rawCP) {
          const idsArray = Array.isArray(rawCP)
            ? rawCP
            : rawCP.toString().split(",").map(Number);
          this.quotation.connectingPortIds = idsArray;

          this.selectedConnectingPorts = idsArray.map((id: number) => {
            const masterPort = this.allConnectingPorts?.find(
              (p) => Number(p.id) === id,
            );
            return {
              id: id,
              portName: masterPort
                ? masterPort.portName || masterPort.name
                : `Port ID: ${id}`,
              portCode: masterPort ? masterPort.portCode : "N/A",
            };
          });
        }

        try {
          if (data.receivedDate) {
            this.quotation.receivedDate = new Date(data.receivedDate)
              .toISOString()
              .split("T")[0];
          }
          if (
            data.repliedDate &&
            data.repliedDate !== "2000-02-12T00:00:00" &&
            data.repliedDate !== "0001-01-01T00:00:00"
          ) {
            this.quotation.repliedDate = new Date(data.repliedDate)
              .toISOString()
              .split("T")[0];
          } else {
            this.quotation.repliedDate = null;
          }
        } catch (dateErr) {
          console.error("Date parsing issue:", dateErr);
        }

        if (
          data.dimensions &&
          Array.isArray(data.dimensions) &&
          data.dimensions.length > 0
        ) {
          this.dimRows = data.dimensions.map((d: any) => ({
            dimId: d.dimId || 0,
            box: d.box || 0,
            l: d.l || 0,
            w: d.w || 0,
            h: d.h || 0,
            unit: d.unit || "CMS",
          }));
          this.dimRow = { ...this.dimRows[0] };
          this.appliedDimensions = [...this.dimRows];
        } else {
          this.dimRows = [{ box: 1, l: 0, w: 0, h: 0, unit: "CMS" }];
          this.dimRow = { ...this.dimRows[0] };
          this.appliedDimensions = [];
        }

        this.calculateVolumeWeightLogic();
        this.calculateTotalPackages();

        this.showInquiryDropdown = false;
        this.showCountryDropdown = false;
        this.showPortOfLoadingDropdown = false;
        this.showPortOfDischargeDropdown = false;
        this.showFinalDestinationDropdown = false;
        this.showOriginDropdown = false;

        this.cdr.detectChanges();

        setTimeout(() => {
          this.cdr.detectChanges();
          console.log("🔥 Inquiry Auto-Fill Complete!");
        }, 500);
      },
      error: (err) => console.error("❌ selectInquiry execution error:", err),
    });
  }

  isHazard(): boolean {
    const val = (this.selectcommodityvalue || "").toLowerCase();

    if (["hazard", "hazardous"].includes(val)) return true;

    const selectedType = this.commodityTypes?.find(
      (t) => t.id == this.quotation?.commodity,
    );

    if (selectedType) {
      const name = (selectedType.name || "").toLowerCase();

      return ["hazard", "hazardous"].includes(name);
    }

    return false;
  }
  saveInvoices() {
    console.log("Updating local invoices array:", this.invoices);

    const isValid = this.invoices.every(
      (inv) => inv.name && inv.name.trim() !== "",
    );

    if (!isValid) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please provide a name for all invoices.",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      });
      return;
    }

    this.isInvoiceModalOpen = false;

    console.log("Local state updated successfully.");
  }
  token: string = "";
  inquiryList: any[] = [];
  allInquiries: any[] = [];
  gettoken() {
    this.token = localStorage.getItem("cavalier_token") || "";
    return this.token;
  }

  loadInquiryList() {
    if (this.showInquiryDropdown) {
      this.showInquiryDropdown = false;
      this.cdr.detectChanges();
      return;
    }

    const cavalierToken = localStorage.getItem("cavalier_token");
    if (!cavalierToken) {
      Swal.fire({
        icon: "warning",
        title: "Session Expired",
        text: "Your login token is missing. Please log in again.",
      });
      return;
    }

    Swal.fire({
      title: "Loading Inquiries",
      text: "Please wait while we fetch the data...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const startTime = new Date().getTime();
    const url = `${environment.apiUrl}/Inquiry/list `;

    this.http
      .get<any[]>(url, {
        headers: {
          Authorization: `Bearer ${cavalierToken}`,
          "Content-Type": "application/json",
        },
      })
      .subscribe({
        next: (res) => {
          const endTime = new Date().getTime();
          const duration = endTime - startTime;

          const delay = duration < 1000 ? 1000 - duration : 0;

          setTimeout(() => {
            this.inquiryList = (res || []).filter((inq) => inq.status === 1);
            this.filteredInquiries = res || [];
            this.showInquiryDropdown = this.inquiryList.length > 0;

            this.cdr.detectChanges();
            Swal.close();
          }, delay);
        },
        error: (err) => {
          Swal.close();
          console.error("Inquiry fetch error:", err);

          this.showInquiryDropdown = false;
          this.cdr.detectChanges();

          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to load inquiry list, please try again.",
            confirmButtonColor: "#d33",
          });
        },
      });
  }
  hideDropdownWithDelay() {
    setTimeout(() => {
      this.showInquiryDropdown = false;
    }, 200);
  }
  onInquirySearchInput() {
    if (
      this.quotation.referenceByInquiry &&
      this.quotation.referenceByInquiry.length > 0
    ) {
      this.showInquiryDropdown = true;
      const searchTerm = this.quotation.referenceByInquiry.toLowerCase();

      this.filteredInquiries = this.allInquiries.filter(
        (inq) =>
          (inq.inquiryNo && inq.inquiryNo.toLowerCase().includes(searchTerm)) ||
          (inq.customerName &&
            inq.customerName.toLowerCase().includes(searchTerm)),
      );
    } else {
      this.showInquiryDropdown = false;
    }
  }
  generateTemporaryPricingNo() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    let financialYear = "";
    if (month >= 4) {
      financialYear = `${year.toString().slice(-2)}-${(year + 1).toString().slice(-2)}`;
    } else {
      financialYear = `${(year - 1).toString().slice(-2)}-${year.toString().slice(-2)}`;
    }

    this.quotation.pricingNo = `CAV/PRC/${financialYear}/---`;
  }
  openPricingForm(inquiryData: any) {
    this.isFormOpen = true;
    this.inquiry = inquiryData;
    this.generateTemporaryPricingNo();
  }
  redirectdata(type: any, id: any) {
    if (!id) {
      Swal.fire({
        icon: "warning",
        title: "Reference Identifier Omission",
        text: "The redirection sequence cannot be instantiated due to the absence of a valid operational reference. Please cross-verify the data integrity with our technical support infrastructure.",
        confirmButtonColor: "#4a3f3f",
      });
      return;
    }

    const Toast = Swal.mixin({
      toast: true,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });

    if (type === "org") {
      Toast.fire({
        icon: "info",
        title: "Synchronizing organizational parameters...",
      });
      this.router.navigate(["/dashboard/organization-add"], {
        queryParams: { highlightId: id },
      });
    } else if (type === "inq") {
      Toast.fire({
        icon: "info",
        title: "Fetching inquiry metadata for modification...",
      });
      this.router.navigate(["/dashboard/salescrm/inquiry"], {
        queryParams: { editId: id },
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Protocol Deviation",
        text: "The requested routing protocol is currently incompatible with existing system configurations. Should this persistence anomaly continue, please escalate the matter to the technical support department.",
        confirmButtonColor: "#4a3f3f",
      });
    }
  }
  editPricing(pricing: any) {
    console.log("Editing Pricing Entry Data:", pricing);
    if (!pricing) return;

    const pricingId = pricing.id || pricing.PricingId;
    const fullDataUrl = `${environment.apiUrl}/Pricing/${pricingId}`;

    this.http.get<any>(fullDataUrl).subscribe(
      (fullData: any) => {
        console.log("DEBUG: Full Data fetched from API:", fullData);

        pricing = fullData;

        const allDocs =
          pricing.pricingDocuments || pricing.PricingDocuments || [];
        this.documents = allDocs
          .filter(
            (d: any) =>
              (d.docType || d.DocType || "").toLowerCase() === "commodity",
          )
          .map((d: any) => ({
            id: d.docId || d.DocId,
            name: "Commodity Document",
            documentPath: d.docPath || d.DocPath,
            isExisting: true,
          }));

        this.invoices = allDocs
          .filter(
            (d: any) =>
              (d.docType || d.DocType || "").toLowerCase() === "invoice",
          )
          .map((d: any) => ({
            id: d.docId || d.DocId,
            name: "Invoice Document",
            documentPath: d.docPath || d.DocPath,
            isExisting: true,
          }));

        this.cdr.detectChanges();

        const rawCbm =
          pricing.cbm ||
          pricing.volume ||
          pricing.totalCbm ||
          pricing.cbmWeight ||
          pricing.cbm_weight;
        const rawVolWeight =
          pricing.volumeWeight ||
          pricing.volume_weight ||
          pricing.volumetricWeight ||
          (this.quotation && this.quotation.volumeWeight);
        const rawCommodityId =
          pricing.commodityId ||
          pricing.commodityID ||
          pricing.commodity_id ||
          pricing.commodity;
        const rawCommodityName =
          pricing.commodityName ||
          pricing.commodity_name ||
          pricing.commodity ||
          "";
        this.quotation.teamId = pricing.teamId
          ? pricing.teamId.toString()
          : null;

        this.quotation.salesCoordinator = pricing.salesCoordinator || "";

        if (this.quotation.teamId) {
          this.onTeamChange(this.quotation.teamId);

          setTimeout(() => {
            if (pricing.salesCoordinator) {
              this.quotation.salesCoordinator =
                pricing.salesCoordinator.toString();
              this.cdr.detectChanges();
            }
            if (pricing.salesTeam) {
              this.quotation.salesTeam = pricing.salesTeam.toString();
              this.cdr.detectChanges();
            }
          }, 800);
        }
        if (this.quotation.teamId) {
          this.onTeamChange(this.quotation.teamId);
          setTimeout(() => {
            if (pricing.salesTeam) {
              this.quotation.salesTeam = pricing.salesTeam.toString();
              this.cdr.detectChanges();
            }
          }, 800);
        }
        if (!this.quotation) this.quotation = {};
        this.quotation = { ...this.quotation, ...pricing };

        if (pricing.transportMode && this.transportModes) {
          const modeObj = this.transportModes.find(
            (m) =>
              m &&
              m.name &&
              m.name.toLowerCase() === pricing.transportMode.toLowerCase(),
          );
          this.quotation.TransportMode = modeObj
            ? modeObj.id
            : pricing.transportMode;
        }

        this.quotation.TransportType = pricing.transportType;
        this.quotation.currency = pricing.cargoCurrency;

        if (!this.inquiry) this.inquiry = {};
        this.inquiry.origin = pricing.originName || pricing.origin;
        this.originsaveid = pricing.originId;

        const dbPortOfLoadingId =
          pricing["[PortOfLoadingId]"] ||
          pricing.portOfLoadingId ||
          pricing.PortOfLoadingId ||
          null;
        const dbPortOfDischargeId =
          pricing["[PortOfDischargeId]"] ||
          pricing.portOfDischargeId ||
          pricing.PortOfDischargeId ||
          null;

        this.quotation.portOfLoadingId = dbPortOfLoadingId
          ? dbPortOfLoadingId.toString()
          : null;
        this.quotation.portOfDischargeId = dbPortOfDischargeId
          ? dbPortOfDischargeId.toString()
          : null;
        this.quotation.GrossWeightUnit = pricing.grossWeightUnit || "";
        this.quotation.netWeightUnit = pricing.netWeightUnit || "";
        this.quotation.chargeableWeightUnit = pricing.chargeWeightUnit || "";
        this.quotation.volumeWeightUnit = pricing.volumeWeightUnit || "";
        this.quotation.cbmUnit = pricing.cbmWeightUnit || "";
        this.quotation.noOfPkgsUnit = pricing.noOfPkgsUnit || "";
        this.quotation.currency = pricing.cargoCurrency || "";
        this.quotation.cargoValue = pricing.cargoValue || null;
        this.quotation.portOfLoadingCode =
          pricing.codeOfPOL || pricing.CodeOfPOL || "";
        this.quotation.portOfDestinationCode =
          pricing.codeOfPOD || pricing.CodeOfPOD || "";
        this.quotation.finalDestinationCode =
          pricing.codeOfFinalDest || pricing.CodeOfFinalDest || "";
        this.quotation.finalDestination = pricing.finalDestination || "";

        this.quotation.originPOL = pricing.originName || pricing.origin || "";
        this.quotation.placeOfDelivery =
          pricing["[PlaceOfDelivery]"] ||
          pricing.placeOfDelivery ||
          pricing.PlaceOfDelivery ||
          "";

        this.quotation.CarrierCode =
          pricing.carrierCode || pricing.CarrierCode || "";
        this.quotation.CarrierName =
          pricing.carrierName || pricing.CarrierName || "";
        this.quotation.Agent = pricing.agent || pricing.Agent || "";
        this.agentSearchText = this.quotation.Agent || "";

        this.markAgentAsSelected(this.quotation.Agent);

        this.quotation.country =
          pricing["[CountryName]"] ||
          pricing.countryName ||
          pricing.CountryName ||
          "";
        this.quotation.countryName = this.quotation.country;
        this.quotation.countryId = pricing.countryId || null;
        try {
          if (pricing.receivedDate)
            this.quotation.receivedDate = new Date(pricing.receivedDate)
              .toISOString()
              .split("T")[0];

          if (pricing.cargoStatusDate) {
            this.quotation.cargoStatusDate = pricing.cargoStatusDate
              .toString()
              .split("T")[0];
          }

          if (
            pricing.repliedDate &&
            pricing.repliedDate !== "2000-02-12T00:00:00" &&
            pricing.repliedDate !== "0001-01-01T00:00:00"
          ) {
            this.quotation.repliedDate = new Date(pricing.repliedDate)
              .toISOString()
              .split("T")[0];
          } else {
            this.quotation.repliedDate = null;
          }
        } catch (dateErr) {
          console.error("Date parsing issue:", dateErr);
        }
        if (
          dbPortOfLoadingId &&
          this.filteredConnectingPorts &&
          this.filteredConnectingPorts.length > 0
        ) {
          const foundPol = this.filteredConnectingPorts.find(
            (p) => p.id.toString() === dbPortOfLoadingId.toString(),
          );
          this.quotation.portOfLoading = foundPol
            ? foundPol.portName || foundPol.name
            : pricing.portOfLoadingName || "";
        } else {
          this.quotation.portOfLoading = pricing.portOfLoadingName || "";
        }

        if (
          dbPortOfDischargeId &&
          this.filteredConnectingPorts &&
          this.filteredConnectingPorts.length > 0
        ) {
          const foundPod = this.filteredConnectingPorts.find(
            (p) => p.id.toString() === dbPortOfDischargeId.toString(),
          );
          this.quotation.portOfDischarge = foundPod
            ? foundPod.portName || foundPod.name
            : pricing.portOfDischargeName || "";
          this.quotation.portOfDestination = this.quotation.portOfDischarge;
        } else {
          this.quotation.portOfDischarge = pricing.portOfDischargeName || "";
          this.quotation.portOfDestination = pricing.portOfDischargeName || "";
        }

        const rawCP = pricing.connectingPortIds || pricing.ConnectingPortIds;
        const cPortIds =
          typeof rawCP === "string"
            ? rawCP.split(",").map((id: any) => Number(id.trim()))
            : Array.isArray(rawCP)
              ? rawCP
              : [];
        this.quotation.connectingPortIds = cPortIds;
        if (
          this.filteredConnectingPorts &&
          this.filteredConnectingPorts.length > 0
        ) {
          this.selectedConnectingPorts = this.filteredConnectingPorts
            .filter((p) => cPortIds.includes(Number(p.id)))
            .map((p) => ({
              id: p.id,
              portName: p.portName || p.name,
              portCode: p.portCode || "---",
            }));
        }

        this.inquiry.organization =
          pricing.organisationName || pricing.customerName;
        this.quotation.referenceByInquiry = pricing.referenceByInquiryNo;
        this.quotation.cargoStatusType = pricing.cargoStatus || "";
        if (pricing.receivedDate)
          this.quotation.receivedDate = pricing.receivedDate.split("T")[0];
        if (pricing.cargoStatusDate)
          this.quotation.cargoStatusDate =
            pricing.cargoStatusDate.split("T")[0];

        if (rawCommodityId) this.quotation.commodity = Number(rawCommodityId);
        this.selectcommodityvalue = rawCommodityName;

        if (rawVolWeight) this.quotation.volumeWeight = Number(rawVolWeight);
        if (rawCbm && Number(rawCbm) > 0) {
          this.quotation.cbm = parseFloat(Number(rawCbm).toFixed(3));
        } else if (
          this.quotation.volumeWeight &&
          Number(this.quotation.volumeWeight) > 0
        ) {
          this.quotation.cbm = parseFloat(
            (Number(this.quotation.volumeWeight) / 167).toFixed(3),
          );
        } else {
          this.quotation.cbm = 0;
        }

        this.quotation.weight =
          pricing.weight || pricing.grossWeightKg || pricing.grossWeight || 0;
        this.quotation.cbmUnit = pricing.cbmUnit || "CBM";
        const editLobId = this.quotation.lineOfBusinessId;
        const editCountry =
          pricing.countryName ||
          pricing.CountryName ||
          this.selectedCountryName ||
          "";
        if (editLobId) {
          this.fetchAgentByLobId(editLobId, editCountry);
        }

        // ✅ FIX: normalize gstStatus (Taxable/Non-Taxable) from isGstApplicable
        // for both Single-Carrier (costRows) and Multi-Carrier rows, before
        // recalculating GST — otherwise Tax Name/%/CGST/SGST/IGST stay blank
        // when editing an existing pricing record.
        this.costRows =
          pricing.costBreakdowns && pricing.costBreakdowns.length > 0
            ? pricing.costBreakdowns.map((r: any) =>
                this.normalizeBreakdownRow(r),
              )
            : [
                {
                  lob: "Standard",
                  chargeName: "",
                  chargeType: "Prepaid",
                  basis: "Per KG",
                  currency: "INR",
                  rate: 0,
                  exchangeRate: 1,
                  amount: 0,
                  ...this.defaultGstFields(),
                },
              ];
        this.multiCarrierRows =
          pricing.multiCarrierBreakdowns &&
          pricing.multiCarrierBreakdowns.length > 0
            ? pricing.multiCarrierBreakdowns.map((r: any) =>
                this.normalizeBreakdownRow(r),
              )
            : [this.createEmptyRow()];

        if (
          pricing.dimensions &&
          Array.isArray(pricing.dimensions) &&
          pricing.dimensions.length > 0
        ) {
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
          // ✅ FIX: recalculate GST after everything (charge master, tax
          // rates, ports, branch state) is in place, so Taxable rows get
          // their Tax Name/%/CGST/SGST/IGST/Total populated automatically.
          this.recalculateAllGst();
          this.cdr.detectChanges();
          console.log("🔥 Sync Finished!");
        }, 400);
      },
      (err) => console.error("Error fetching full data:", err),
    );
  }

  sendBulkEmails(inqId: number) {
    if (!this.selectedEmails || this.selectedEmails.size === 0) {
      console.warn(
        "⚠️ Redirection flow complete: No agents selected, bypassing email deployment.",
      );
      this.router.navigate(["/dashboard/Price"]);
      return;
    }

    const payload = {
      toEmails: Array.from(this.selectedEmails),
      inquiryId: inqId,
      branchName: this.lastSelectedBranch || "Our Partner",
    };

    const token = localStorage.getItem("cavalier_token");
    const headers = { Authorization: `Bearer ${token}` };

    Swal.fire({
      title: "Processing...",
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
        Swal.showLoading();
      },
      customClass: {
        popup: "premium-popup",
      },
    });

    this.http
      .post(`${this.apiUrl}/SendBulkEmail`, payload, { headers })
      .subscribe({
        next: (res: any) => {
          Swal.fire({
            icon: "success",
            title: "Sent Successfully!",
            text: "Emails sent and Inquiry saved successfully.",
            timer: 3000,
            showConfirmButton: false,
            timerProgressBar: true,
          }).then(() => {
            this.isFormOpen = false;
            this.isPreviewMode = false;
            this.onSearch();
          });
          this.isFormOpen = false;
          this.isPreviewMode = false;
          this.onSearch();
        },
        error: (err) => {
          console.error("❌ Email API Error Details:", err);
          Swal.fire({
            icon: "error",
            title: "Email Failed",
            text:
              err.error?.message || "Something went wrong while sending email.",
            confirmButtonColor: "#4a3f3f",
          }).then(() => {
            this.router.navigate(["/dashboard/Price"]);
          });
        },
      });
  }
  openNewQuotation() {
    this.quotation = {};

    if (this.pricings && this.pricings.length > 0) {
      const numbers = this.pricings
        .map((p: any) => {
          const val = p.pricingNo || p.PricingNo;
          const match = val?.toString().match(/\d+/);
          return match ? parseInt(match[0]) : 0;
        })
        .filter((n: number) => !isNaN(n));

      const maxNo = Math.max(...numbers, 0);

      this.quotation.pricingNo = (maxNo + 1).toString();
    } else {
      this.quotation.pricingNo = "1";
    }

    this.isFormOpen = true;
    this.cdr.detectChanges();
  }
  deletePricing(id: number) {
    if (!id) {
      Swal.fire("Error", "Invalid Pricing ID", "error");
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this pricing record? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("cavalier_token");
        const httpOptions = {
          headers: { Authorization: `Bearer ${token}` },
        };

        this.http
          .delete(`${environment.apiUrl}/Pricing/${id}`, httpOptions)
          .subscribe({
            next: (res: any) => {
              Swal.fire(
                "Deleted!",
                "The record has been successfully deleted.",
                "success",
              );

              this.pricings = this.pricings.filter(
                (p) => (p.id || p.Id) !== id,
              );

              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error("Delete error:", err);
              const errorMsg =
                err.error?.message || "Something went wrong on the server.";
              Swal.fire("Error!", "Failed to delete: " + errorMsg, "error");
            },
          });
      }
    });
  }
  goToOrganization(id: any) {
    if (id) {
      window.location.href = `/dashboard/organization-add/${id}`;
    }
  }
  calculateTotalPackages() {
    if (this.dimRows && this.dimRows.length > 0) {
      this.quotation.noOfPkgs = this.dimRows.reduce(
        (total: number, dim: any) => {
          return total + (Number(dim.box) || 0);
        },
        0,
      );
    }
  }
  updatePreview() {
    this.cdr.detectChanges();

    console.log("Current Dimensions List:", this.dimRows);
  }
  selectedPricingColumns: string[] = [];

  pricingColumnFieldMap: any = {
    "Pricing No": "pricingNo",
    Organisation: "organisationName",
    "Inquiry No": "inquiryNo",
    Customer: "customerName",
    Location: "location",

    Incoterm: "incoterm",
    Movement: "movementType",
    Commodity: "businessDimensions",
    Status: "status",
  };

  fetchPricingSettings() {
    this.http.get(`${environment.apiUrl}/PricingColumnSettings`).subscribe({
      next: (res: any) => {
        if (res && res.selectedColumns) {
          this.selectedPricingColumns = JSON.parse(res.selectedColumns);
        }
      },
      error: (err) => console.error("Error loading settings:", err),
    });
  }

  dropPricingColumn(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.selectedPricingColumns,
      event.previousIndex,
      event.currentIndex,
    );
    this.savePricingSettings();
  }

  savePricingSettings() {
    const payload = {
      Id: 1,
      AvailableColumns: JSON.stringify(this.selectedPricingColumns),
      SelectedColumns: JSON.stringify(this.selectedPricingColumns),
    };

    this.http
      .post(`${environment.apiUrl}/PricingColumnSettings/save`, payload)
      .subscribe({
        next: () => console.log("Pricing settings saved successfully!"),
        error: (err) => console.error("Error saving settings:", err),
      });
  }

  isColumnModalOpen: boolean = false;

  toggleColumnSelector() {
    this.isColumnModalOpen = !this.isColumnModalOpen;
    console.log("Modal state is now:", this.isColumnModalOpen);
  }
  allPossibleColumns: string[] = [
    "Pricing No",
    "Organisation",
    "Inquiry No",
    "Customer",
    "Location",
    "Incoterm",
    "Movement",
    "Commodity",
    "Status",
  ];

  toggleColumn(colName: string) {
    const index = this.selectedPricingColumns.indexOf(colName);
    if (index > -1) {
      this.selectedPricingColumns.splice(index, 1);
    } else {
      this.selectedPricingColumns.push(colName);
    }
    this.savePricingSettings();
  }
  isOrgModalOpen = false;

  openOrgModal() {
    this.loadAllOrganizations();
    this.isOrgModalOpen = true;
  }

  selectAndClose(org: any) {
    this.inquiry.organization = org.orgName || org.organizationName;
    this.isOrgModalOpen = false;
    this.showDropdown = false;
    this.showOrgDropdown = false;
  }

  getTotalPackageCount() {
    return this.dimRows.reduce((sum, item) => sum + (Number(item.box) || 0), 0);
  }
  getGroupedDimensions(): DimGroup[] {
    const groups: DimGroup[] = [];

    this.dimRows.forEach((dim: any, index: number) => {
      const dimString = `${dim.l || 0}x${dim.w || 0}x${dim.h || 0} ${dim.unit || "CMS"}`;

      let foundGroup = groups.find((g) => g.dimString === dimString);

      if (foundGroup) {
        foundGroup.indices.push(index + 1);
        foundGroup.totalBoxQty += Number(dim.box || 0);
      } else {
        groups.push({
          dimString: dimString,
          l: dim.l || 0,
          w: dim.w || 0,
          h: dim.h || 0,
          unit: dim.unit || "CMS",
          indices: [index + 1],
          totalBoxQty: Number(dim.box || 0),
        });
      }
    });

    return groups;
  }
  unitsList: any[] = [];
  showModal: boolean = false;
  uomList: any[] = [];
  isUomModalOpen: boolean = false;

  loadUomList() {
    this.http.get<any[]>(`${environment.apiUrl}/Uom/list`).subscribe({
      next: (data) => {
        this.uomList = data;
      },
      error: (err) => console.error("Error loading UOMs:", err),
    });
  }
  getFilteredUomList() {
    return (
      this.uomList?.filter(
        (uom) => uom.shortCode === "KGS" || uom.shortCode === "LBS",
      ) || []
    );
  }

  toggleUomModal() {
    this.isUomModalOpen = !this.isUomModalOpen;
  }
  selectUom(uom: any) {
    this.quotation.GrossweightUnit = uom.shortCode;
    this.isUomModalOpen = false;
    this.calculateVolumeWeightLogic();
  }
  isNetUomModalOpen: boolean = false;

  selectNetUom(uom: any) {
    this.quotation.netWeightUnit = uom.shortCode;
    this.isNetUomModalOpen = false;
  }

  toggleNetUomModal() {
    this.isNetUomModalOpen = !this.isNetUomModalOpen;
  }
  isChargeableUomModalOpen: boolean = false;

  toggleChargeableUomModal() {
    this.isChargeableUomModalOpen = !this.isChargeableUomModalOpen;
  }

  selectChargeableUom(uom: any) {
    this.quotation.chargeableWeightUnit = uom.shortCode;
    this.isChargeableUomModalOpen = false;
  }
  isVolumeUomModalOpen: boolean = false;

  toggleVolumeUomModal() {
    this.isVolumeUomModalOpen = !this.isVolumeUomModalOpen;
  }

  selectVolumeUom(uom: any) {
    this.quotation.volumeWeightUnit = uom.shortCode;
    this.isVolumeUomModalOpen = false;
    this.calculateVolumeWeightLogic();
  }
  addNewDimensionRow() {
    this.dimRows.push({ box: 0, l: 0, w: 0, h: 0, unit: "KGS" });
    this.updatePreview();
  }

  toggleDimModal() {
    this.isDimModalOpen = !this.isDimModalOpen;
  }
  fixExistingRows() {
    if (this.dimRows && this.dimRows.length > 0) {
      this.dimRows.forEach((row) => {
        if (!row.unit) {
          row.unit = "KGS";
        }
      });
    }
  }
  packageUnits: any[] = [];
  getPackageUnits() {
    this.http
      .get(`${environment.apiUrl}/PackageBox/list`)
      .subscribe((res: any) => {
        this.packageUnits = res;
      });
  }
  isUnitModalOpen = false;
  toggleUnitModal(event: Event) {
    event.stopPropagation();
    this.isUnitModalOpen = !this.isUnitModalOpen;
  }

  filteredCarrierList: any[] = [];
  showCarrierDropdown = false;
  highlightedCarrierIndex = -1;

  onCarrierCodeInput() {
    const term = (this.quotation.CarrierCode || "").trim().toLowerCase();
    this.filterCarrierList(term);
  }

  onCarrierNameSearch() {
    const term = (this.quotation.CarrierName || "").trim().toLowerCase();
    this.filterCarrierList(term);
  }

  private filterCarrierList(term: string) {
    if (!term) {
      this.filteredCarrierList = this.airlineList.slice(0, 50);
    } else {
      this.filteredCarrierList = this.airlineList.filter((a) => {
        const name = (a.airlineName || a.name || "").toLowerCase();
        const code = (a.airlineCode || "").toLowerCase();
        return name.includes(term) || code.includes(term);
      });
    }
    this.showCarrierDropdown = this.filteredCarrierList.length > 0;
    this.highlightedCarrierIndex = -1;
    this.cdr.detectChanges();
  }

  selectCarrier(a: any) {
    if (!a) return;
    this.quotation.CarrierCode = a.airlineCode || "";
    this.quotation.CarrierName = a.airlineName || a.name || "";
    this.showCarrierDropdown = false;
    this.filteredCarrierList = [];
    this.cdr.detectChanges();
  }

  onCarrierKeyDown(event: KeyboardEvent) {
    if (!this.showCarrierDropdown || this.filteredCarrierList.length === 0)
      return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (this.highlightedCarrierIndex < this.filteredCarrierList.length - 1)
        this.highlightedCarrierIndex++;
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (this.highlightedCarrierIndex > 0) this.highlightedCarrierIndex--;
    } else if (event.key === "Enter") {
      event.preventDefault();
      const selected =
        this.highlightedCarrierIndex >= 0
          ? this.filteredCarrierList[this.highlightedCarrierIndex]
          : this.filteredCarrierList[0];
      this.selectCarrier(selected);
    }
  }

  onCarrierBlur() {
    setTimeout(() => {
      this.showCarrierDropdown = false;
      this.cdr.detectChanges();
    }, 200);
  }

  onCarrierFocus() {
    if (this.airlineList && this.airlineList.length > 0) {
      this.filteredCarrierList = this.airlineList.slice(0, 50);
      this.showCarrierDropdown = true;
      this.cdr.detectChanges();
    }
  }

  agentSearchText: string = "";
  filteredAgentList: any[] = [];
  showAgentDropdown = false;
  highlightedAgentIndex = -1;

  toggleAgentDropdown() {
    if (this.showAgentDropdown) {
      this.showAgentDropdown = false;
      return;
    }

    if (!this.agentDetail || this.agentDetail.length === 0) {
      console.warn("⚠️ Agent list khali hai. Pehle LOB/Origin select karo.");
      return;
    }

    this.filteredAgentList = [...this.agentDetail];
    this.showAgentDropdown = true;
    this.highlightedAgentIndex = -1;
    this.cdr.detectChanges();
  }

  onAgentSearchInput() {
    const term = (this.agentSearchText || "").trim().toLowerCase();

    if (!term) {
      this.filteredAgentList = [...this.agentDetail];
    } else {
      this.filteredAgentList = this.agentDetail.filter((a: any) => {
        const name = (a.agentName || "").toLowerCase();
        const org = (a.orgName || "").toLowerCase();
        const branch = (a.branchName || "").toLowerCase();
        return (
          name.includes(term) || org.includes(term) || branch.includes(term)
        );
      });
    }

    this.showAgentDropdown = true;
    this.highlightedAgentIndex = -1;
    this.cdr.detectChanges();
  }

  onAgentKeyDown(event: KeyboardEvent) {
    if (!this.showAgentDropdown || this.filteredAgentList.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (this.highlightedAgentIndex < this.filteredAgentList.length - 1)
        this.highlightedAgentIndex++;
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (this.highlightedAgentIndex > 0) this.highlightedAgentIndex--;
    } else if (event.key === "Enter") {
      event.preventDefault();
      const selected =
        this.highlightedAgentIndex >= 0
          ? this.filteredAgentList[this.highlightedAgentIndex]
          : this.filteredAgentList[0];
      this.selectAgentFromForwarding(selected);
    } else if (event.key === "Escape") {
      this.showAgentDropdown = false;
    }
  }

  selectAgentFromForwarding(a: any) {
    if (!a) return;

    this.quotation.Agent = a.agentName || "";
    this.agentSearchText = a.agentName || "";
    this.showAgentDropdown = false;
    this.filteredAgentList = [];

    const match = this.agentDetail.find(
      (x: any) => (x.agentName || "").trim() === (a.agentName || "").trim(),
    );
    if (match) {
      match.isSelected = true;
      if (match.email) {
        this.selectedEmails.add(match.email);
        this.lastSelectedBranch =
          match.agentName || match.branchName || "Global";
      }
      console.log(
        "✅ Agent auto-marked in Assigned Agents list:",
        match.agentName,
      );
    }

    this.cdr.detectChanges();
  }
  markAgentAsSelected(agentName: string, attempt: number = 0) {
    if (!agentName) return;

    if (this.agentDetail && this.agentDetail.length > 0) {
      const match = this.agentDetail.find(
        (x: any) => (x.agentName || "").trim() === agentName.trim(),
      );
      if (match) {
        match.isSelected = true;
        if (match.email) {
          this.selectedEmails.add(match.email);
          this.lastSelectedBranch =
            match.agentName || match.branchName || "Global";
        }
        console.log("✅ [EDIT MODE] Agent auto-marked:", match.agentName);
        this.cdr.detectChanges();
        return;
      }
    }

    if (attempt < 5) {
      setTimeout(() => this.markAgentAsSelected(agentName, attempt + 1), 600);
    } else {
      console.warn(
        "⚠️ Agent list load nahi hui, mark nahi ho paya:",
        agentName,
      );
    }
  }

  onPodOriginSearchInput() {
    const searchTerm = (this.quotation.podOrigin || "")
      .toString()
      .trim()
      .toLowerCase();

    if (searchTerm === "") {
      this.showPodOriginDropdown = false;
      this.filteredPodOrigins = [];
      return;
    }

    this.filteredPodOrigins = this.origins.filter((org) => {
      return (
        (org.name || "").toLowerCase().includes(searchTerm) ||
        (org.countryName || "").toLowerCase().includes(searchTerm)
      );
    });

    this.showPodOriginDropdown = true;
  }

  selectPodOrigin(origin: any) {
    this.quotation.podOrigin = origin.name;
    this.showPodOriginDropdown = false;
  }

  onPodOriginKeyDown(event: any) {
    if (event.key === "Enter" && this.filteredPodOrigins.length > 0) {
      event.preventDefault();
      this.selectPodOrigin(this.filteredPodOrigins[0]);
    }
  }

  filteredPlaceOfDelivery: any[] = [];
  showPlaceOfDeliveryDropdown: boolean = false;

  onPlaceOfDeliverySearchInput() {
    const searchTerm = (this.quotation.placeOfDelivery || "")
      .toString()
      .trim()
      .toLowerCase();

    if (searchTerm === "") {
      this.showPlaceOfDeliveryDropdown = false;
      this.filteredPlaceOfDelivery = [];
      return;
    }

    this.filteredPlaceOfDelivery = this.origins.filter((org) => {
      return (
        (org.name || "").toLowerCase().includes(searchTerm) ||
        (org.countryName || "").toLowerCase().includes(searchTerm)
      );
    });

    this.showPlaceOfDeliveryDropdown = true;
  }

  selectPlaceOfDelivery(place: any) {
    this.quotation.placeOfDelivery = place.name;
    console.log(this.quotation.placeOfDelivery);
    this.showPlaceOfDeliveryDropdown = false;
  }

  onPlaceOfDeliveryKeyDown(event: any) {
    if (event.key === "Enter" && this.filteredPlaceOfDelivery.length > 0) {
      event.preventDefault();
      this.selectPlaceOfDelivery(this.filteredPlaceOfDelivery[0]);
    }
  }

  @HostListener("document:click", ["$event"])
  clickout(event: any) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isUnitModalOpen = false;
      this.showOriginDropdown = false;
      this.showCountryDropdown = false;
      this.showPodOriginDropdown = false;
      this.showPlaceOfDeliveryDropdown = false;
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
    if (this.el && !this.el.nativeElement.contains(event.target)) {
      this.showAirlineDropdownIndex = null;
    }
    if (this.el && !this.el.nativeElement.contains(event.target)) {
      this.showCarrierDropdown = false;
      this.showAgentDropdown = false;
    }
  }
}
