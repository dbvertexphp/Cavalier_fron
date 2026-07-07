import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CheckPermissionService } from '../../services/check-permission.service';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { leadSchema } from './lead.schema';
import { forkJoin, Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-lead-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DragDropModule],
  templateUrl: './lead-form.component.html',
  styleUrl: './lead-form.component.css',
})
export class LeadFormComponent implements OnInit {
  @ViewChild('deptInput') deptInput!: ElementRef;
  @ViewChild('desigInput') desigInput!: ElementRef;
  // ✅ CONFIGURATION VARIABLES FOR INDEPENDENT DUAL RANGE CALENDAR
  isCustomRangeModalOpen: boolean = false;
  currentLeftCalendarDate: Date = new Date(); 
  currentRightCalendarDate: Date = new Date(new Date().setMonth(new Date().getMonth() + 1));
  leftMonthDaysGrid: any[] = [];
  rightMonthDaysGrid: any[] = [];
  weekDaysHeaders: string[] = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  customStartSelectedDate: string | null = null;
  customEndSelectedDate: string | null = null;
  dateRangeInputValue: string = '';
hodDisplayText: string = '';
  managerDisplayText: string = '';
  leadOwnerDisplayText: string = '';
  teamDisplayText: string = '';
  showTable: boolean = false; 
  isHODModalOpen: boolean = false;
  modalHODSearchText: string = '';
  allHODList: string[] = []; 
  allHODListFiltered: string[] = [];
  filteredHODSuggestions: string[] = [];
  leadSources: any[] = [];     
  salesStages: any[] = [];
  isEditMode: boolean = false;
  selectedLeadId: number | null = null;
  OrganisationId: any;
  salesProcesses: any[] = [];
  highlightedLeadId: number | null = null;
  leadOwners: any[] = [];
  salesCoordinators: any[] = [];
  reportingManagers: any[] = [];
  branches: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  PermissionID: any;
  paginatedLeads: any[] = [];
  showModal: boolean = false;
  leadForm!: FormGroup;
  searchForm!: FormGroup;
  showCustomPicker: boolean = false; 
  isFormOpen = false;
  allLeads: any[] = [];       
  leads: any[] = []; 
  nextLeadNo: string = '0001';
  hodList: any[] = [];
  teamList: any[] = [];
  organizations: any[] = [];
  filteredOrganizations: any[] = [];
  isLeadOwnerModalOpen: boolean = false;
  modalOwnerSearchText: string = '';
  allOwnersFiltered: any[] = [];       
  filteredLeadOwners: string[] = [];
  hodUniqueList: any[] = [];
  managerUniqueList: string[] = [];

  // Dedicated arrays for independent team dropdown mapping rules
  salesCoordinatorsList: any[] = [];
  hodsList: any[] = [];
  reportingManagersList: any[] = [];

  leadSearchFilters = {
    date: "",
    organizationName: '',
    type: 'Any',
    leadNo: '',
    salesProcess: '',
    salesStage: '',
    branch: '',
    leadOwner: 'Any',
    hod: '',
    team: '',
    reportingManager: '',
    status: 'Any'
  };

  leadNoList: string[] = [];
  leadOrgList: string[] = [];
  leadOwnerList: string[] = [];
  filteredLeads: any[] = [];
  filteredSalesStages: any[] = [];
  filteredDates: string[] = [];
  allDates: string[] = [];
  filteredSalesProcesses: string[] = [];
  allSalesProcesses: string[] = [];
  filteredTeams: any[] = [];
  filteredManagers: string[] = [];
  statusList: string[] = ['Inquiry Received', 'Qualified', 'Proposal Sent', 'Sales Closed', 'Lost'];
  filteredStatusSuggestions: string[] = [];
  isExportOpen = false;
  isLNModalOpen: boolean = false;
  modalLNSearchText: string = '';
  allLNList: any[] = [];          
  allLNFiltered: any[] = [];     
  iconSearchOrgs: any[] = []; 
  private iconSearchSub?: Subscription;
  private hodIconSub?: Subscription;
  loIconList: string[] = []; 
  private loIconSub?: Subscription;
  lnIconList: any[] = []; 
  private lnIconSub?: Subscription;
  tmIconList: any[] = []; 
  private tmIconSub?: Subscription;
  isTeamModalOpen: boolean = false;
  modalTeamSearchText: string = '';
  allTeamsList: any[] = []; 
  tmIconListFiltered: any[] = [];
  rmIconList: string[] = []; 
  private rmIconSub?: Subscription;
  isManagerModalOpen: boolean = false;
  modalManagerSearchText: string = '';
  allManagersList: any[] = [];
  rmIconListFiltered: any[] = [];
  orgList: any[] = [];
  showOrgDropdown: boolean = false;
  quotation: any = {}; 
  showInquiryDropdown = true;
  iconHODList: string[] = [];
  branchList: any[] = [];           
  filteredBranchSuggestions: any[] = []; 
  isBranchModalOpen: boolean = false;
  branchSearchText: string = '';
  showRowModal = false;
  salesCoordinator: any[] = [];
  OnlyleadOwner: any[] = [];
  availableColumns: string[] = [];
  selectedColumns: string[] = [];
  sortOrders: any = {};

  columnFieldMap: any = {
    'Lead No': 'leadNo',
    'Organization': 'organizationName',
    'Source': 'leadSource',
    'Sales Process': 'salesProcess',
    'Sales Stage': 'salesStage',
    'Owner': 'leadOwner',
    'Location': 'location',
    'Branch': 'branch',
    'Area': 'area',
    'Team': 'team',
    'Type': 'type',
    'Date': 'date',
    'Expected Validity': 'expectedValidity',
    'Reporting Manager': 'reportingManager',
    'Sales Coordinator': 'salesCoordinator',
    'HOD': 'hod',
    'Created At': 'createdAt',
    'UpdatedAt': 'updatedAt'
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    public CheckPermissionService: CheckPermissionService,
    public userServices: UserService,
    private eRef: ElementRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const highlightId = params['highlightId'];
      if (highlightId) {
        this.highlightedLeadId = +highlightId;
        this.loadLeads();
        this.onEditLead(this.highlightedLeadId);
      } 
    });
    this.loadBranchess();
    this.loadDropdownData();
    this.loadLeadOwners();
    this.getSalesProcesses();
    this.getsales();
    this.getSalesCoordinators();
    this.loadLeadSources();
    this.loadSalesStages();
    this.getBranches();
    this.PermissionID = Number(localStorage.getItem('permissionID'));
    this.initForm();
    this.loadColumnSettings();

    this.http.get(`${environment.apiUrl}/Teams`).subscribe((res: any) => this.teamList = res);
    this.loadOrganizations();
    this.initSearchForm();
    this.loadLeadSuggestions();
  }
 
  fetchNextLeadNoFromApi(): void {
    const highlightId = this.route.snapshot.queryParams['highlightId'];
    if (this.isEditMode || highlightId) return;

    const token = localStorage.getItem('cavalier_token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any>(`${environment.apiUrl}/Leads/nextLeadNo`, { headers }).subscribe({
      next: (res) => {
        if (res && res.nextLeadNo) {
          this.nextLeadNo = res.nextLeadNo;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error(err);
        this.calculateNextLeadNo();
      }
    });
  }
  
  updatePagination() {
    this.totalPages = Math.ceil(this.leads.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + Number(this.itemsPerPage);
    this.paginatedLeads = this.leads.slice(startIndex, endIndex);
    this.cdr.detectChanges();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  onTeamChange(event: any) {
    const selectedTeamName = event.target.value;
    console.log('🚀 HTML (change) event triggered for team:', selectedTeamName);

    if (selectedTeamName && selectedTeamName !== '') {
      const matchedTeam = this.teamList.find(t => (t.teamName || t.name || t) === selectedTeamName);
      const teamId = matchedTeam ? matchedTeam.id : null;

      if (teamId) {
        this.http.get<any>(`${environment.apiUrl}/Teams/${teamId}/details`).subscribe({
          next: (res) => {
            console.log('✅ Dynamic Team Details Received via Event:', res);
            
            // Map specifically to separation arrays
            this.salesCoordinatorsList = res.salesCoordinators || [];
            this.hodsList = res.hods || [];
            this.reportingManagersList = res.reportingManagers || [];
            this.salesCoordinator = res.salesCoordinators || []; 

            // Auto patch logic execution based on first available parameters
            const patchObj: any = {};
            if (this.salesCoordinatorsList.length > 0) {
              patchObj.salesCoordinator = String(this.salesCoordinatorsList[0].id);
            }
            if (this.hodsList.length > 0) {
              patchObj.hod = String(this.hodsList[0].id);
            }
            if (this.reportingManagersList.length > 0) {
              patchObj.reportingManager = String(this.reportingManagersList[0].id);
            }

            this.leadForm.patchValue(patchObj);
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('❌ Details API Error:', err);
            this.clearTeamDropdowns();
          }
        });
      }
    } else {
      this.clearTeamDropdowns();
    }
  }

  clearTeamDropdowns() {
    this.salesCoordinatorsList = [];
    this.hodsList = [];
    this.reportingManagersList = [];
    this.salesCoordinator = [];
    this.leadForm.patchValue({
      salesCoordinator: '',
      reportingManager: '',
      hod: ''
    });
    this.cdr.detectChanges();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  loadLeadSources() {
    this.http.get<any[]>(`${environment.apiUrl}/LeadSources`).subscribe({
      next: (res) => this.leadSources = res,
      error: (err) => console.error(err)
    });
  }

  loadSalesStages() {
    this.http.get<any[]>(`${environment.apiUrl}/SalesStages`).subscribe({
      next: (res) => this.salesStages = res,
      error: (err) => console.error(err)
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.closest('button')?.textContent?.trim() === 'NEW') return;
    const dropdownClicked = target.closest('ul') || target.closest('.absolute.z-50') || target.closest('input[formControlName="organization"]');
    if (dropdownClicked) return;
    this.closeAllDropdowns();
  }

  closeAllDropdowns() {
    this.showOrgDropdown = false;
    this.filteredOrganizations = [];
    this.cdr.detectChanges();
  }

  AllLeadSearch(){
    this.loadLeads();
    this.showTable = true;
  }

  navigateToNewOrg(event?: MouseEvent) {
    if (event) event.stopImmediatePropagation();
    this.closeAllDropdowns();
    this.router.navigate(['/dashboard/organization-add'], { state: { isFormOpen: true } });
  }

  getLeadOwners() {
    this.http.get<any[]>(`${environment.apiUrl}/LeadOwners`).subscribe({
      next: (res) => this.leadOwners = res,
      error: (err) => console.error(err)
    });
  }

  getSalesCoordinators() {
    this.http.get<any[]>(`${environment.apiUrl}/SalesCoordinators`).subscribe({
      next: (res) => this.salesCoordinators = res,
      error: (err) => console.error(err)
    });
  }

  onEditLead(id: any) {
    if (!id || id <= 0) return;
    this.http.get<any>(`${environment.apiUrl}/Leads/${id}`).subscribe({
      next: (lead) => {
        this.isEditMode = true;
        this.selectedLeadId = id;

        this.leadForm.patchValue({
          date: lead.date ? lead.date.split('T')[0] : '',
          expectedValidity: lead.expectedValidity ? lead.expectedValidity.split('T')[0] : '',
          type: lead.type || '',
          leadOwner: lead.leadOwner || '',
          salesProcess: lead.salesProcess || '',
          salesStage: lead.salesStage || '',
          branch: lead.branch || '',
          team: lead.team || '',
          location: lead.location || '',
          area: lead.area || '',
          organization: lead.organizationName || '',     
          organizationId: lead.organisationId || '',
          source: lead.leadSource || ''                 
        });

        this.nextLeadNo = lead.leadNo || '';
        this.isFormOpen = true;

        if (lead.team) {
          const matchedTeam = this.teamList.find(t => (t.teamName || t.name || t) === lead.team);
          const teamId = matchedTeam ? matchedTeam.id : null;

          if (teamId) {
            this.http.get<any>(`${environment.apiUrl}/Teams/${teamId}/details`).subscribe({
              next: (res) => {
                this.salesCoordinatorsList = res.salesCoordinators || [];
                this.hodsList = res.hods || [];
                this.reportingManagersList = res.reportingManagers || [];
                this.salesCoordinator = res.salesCoordinators || [];

                this.leadForm.patchValue({
                  salesCoordinator: lead.salesCoordinator ? String(lead.salesCoordinator) : '',
                  reportingManager: lead.reportingManager ? String(lead.reportingManager) : '',
                  hod: lead.hod ? String(lead.hod) : ''
                });

                this.cdr.detectChanges();
              },
              error: (err) => console.error('❌ Edit Mode Team API Error:', err)
            });
          }
        } else {
          this.leadForm.patchValue({
            salesCoordinator: lead.salesCoordinator ? String(lead.salesCoordinator) : '',
            reportingManager: lead.reportingManager ? String(lead.reportingManager) : '',
            hod: lead.hod ? String(lead.hod) : ''
          });
        }

        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  onOrgClick(orgId: any, orgName: string) {
    if (orgId) {
      this.router.navigate(['/dashboard/organization-add'], { queryParams: { highlightId: orgId } });
    } else {
      Swal.fire({ icon: 'error', title: 'Identification Anomaly', text: 'The record is missing an organization reference.' });
    }
  }

  getBranches() {
    this.http.get<any[]>(`${environment.apiUrl}/branch/list`).subscribe(res => this.branches = res);
  }

  getSalesProcesses() {
    this.http.get<any[]>(`${environment.apiUrl}/SalesProcesses`).subscribe({
      next: (res) => this.salesProcesses = res,
      error: (err) => console.error(err)
    });
  }

  getReportingManagers() {
    this.http.get<any[]>(`${environment.apiUrl}/ReportingManagers`).subscribe({
      next: (res) => this.reportingManagers = res,
      error: (err) => console.error(err)
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
    this.cdr.detectChanges();
    const payload = {
      availableColumns: JSON.stringify(this.availableColumns),
      selectedColumns: JSON.stringify(this.selectedColumns)
    };
    this.http.post(`${environment.apiUrl}/LeadColumnSettings/save`, payload).subscribe({
      error: (err) => console.error(err)
    });
  }

  sortColumn(column: string) {
    const field = this.columnFieldMap[column];
    this.sortOrders[column] = !this.sortOrders[column] || this.sortOrders[column] === 'desc' ? 'asc' : 'desc';
    const order = this.sortOrders[column];

    this.leads.sort((a: any, b: any) => {
      let valA = a[field];
      let valB = b[field];
      if (valA == null) return 1;
      if (valB == null) return -1;
      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      return order === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
    this.cdr.detectChanges();
  }

  loadColumnSettings() {
    this.http.get<any>(`${environment.apiUrl}/LeadColumnSettings`).subscribe({
      next: (res) => {
        if (res) {
          this.availableColumns = JSON.parse(res.availableColumns || '[]');
          this.selectedColumns = JSON.parse(res.selectedColumns || '[]');
        }
        this.cdr.detectChanges();
      }
    });
  }

  initSearchForm() {
    this.searchForm = this.fb.group({
      organizationName: [''],
      salesProcess: [''],
      leadNo: [''],
      salesStage: ['']
    });
  }

  loadLeads(): void {
    const token = localStorage.getItem('cavalier_token');
    const headers = { Authorization: `Bearer ${token}` };
    this.http.get<any[]>(`${environment.apiUrl}/Leads`, { headers }).subscribe({
      next: (res) => {
        this.leads = res; 
        this.currentPage = 1;
        this.updatePagination();
        this.calculateNextLeadNo();
      },
      error: (err) => console.error(err)
    });
  }

  calculateNextLeadNo(): void {
    const highlightId = this.route.snapshot.queryParams['highlightId'];
    if (this.isEditMode || highlightId) return;

    if (!this.leads || this.leads.length === 0) {
      this.nextLeadNo = 'CAV/LEAD/0001';
      this.leadForm.patchValue({ leadNo: this.nextLeadNo });
      return;
    }

    let maxNumber = 0;
    this.leads.forEach((lead: any) => {
      if (lead?.leadNo) {
        const match = lead.leadNo.toString().match(/CAV\/LEAD\/(\d+)/i);
        if (match && match[1]) {
          const currentNumber = parseInt(match[1], 10);
          if (currentNumber > maxNumber) maxNumber = currentNumber;
        }
      }
    });

    this.nextLeadNo = `CAV/LEAD/${(maxNumber + 1).toString().padStart(4, '0')}`;
    this.leadForm.patchValue({ leadNo: this.nextLeadNo });
  }

  onDeleteLead(id: any) {
    if (confirm('Do you want to delete this lead?')) {
      this.leads = this.leads.filter((l: any) => l.id !== id);
      this.updatePagination();
      this.http.delete(`${environment.apiUrl}/Leads/${id}`, { responseType: 'text' }).subscribe({
        next: () => this.onLeadSearch(),
        error: (err) => {
          console.error(err);
          this.onLeadSearch();
        }
      });
    }
  }

  private loadOrganizations(): void {
    this.http.get<any[]>(`${environment.apiUrl}/Organization/List`).subscribe({
      next: (res) => this.organizations = res,
      error: (err) => console.error(err)
    });
  }

  onOrganizationSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    if (!value) {
      this.filteredOrganizations = [];
      return;
    }
    this.filteredOrganizations = this.organizations.filter(org => org.orgName.toLowerCase().includes(value));
  }

  selectOrganization(org: any): void {
    this.OrganisationId = org.id;
    this.leadForm.patchValue({ organization: org.orgName, organizationId: org.id });
    this.filteredOrganizations = [];
  }

  selectOrg(org: any) {
    if (this.quotation) this.quotation.organizationName = org.orgName; 
    this.leadSearchFilters.organizationName = org.orgName;
    this.OrganisationId = org.id; 
    this.leadForm.patchValue({ organization: org.orgName, organizationId: org.id });
    this.showOrgDropdown = false;
    this.orgList = [];
    this.cdr.detectChanges(); 
  }

  initForm() {
    const today = new Date();
    const validityDate = new Date();
    validityDate.setDate(today.getDate() + 90);

    this.leadForm = this.fb.group({
      organizationName: [''],
      leadId: [""],
      leadNo: [{value: this.nextLeadNo, disabled: true}], 
      type: ['New Business', Validators.required],
      source: ['', Validators.required],
      salesProcess: ['', Validators.required],
      salesCoordinator: ['', Validators.required],
      branch: ['', Validators.required],
      date: [this.toISODate(today), Validators.required],
      leadOwner: ['BHARAT JUYAL', Validators.required],
      expectedValidity: [this.toISODate(validityDate)],
      salesStage: ['Inquiry Received', Validators.required],
      reportingManager: ['', Validators.required],
      hod: ['', Validators.required],
      team: ['', Validators.required],
      organization: ['', Validators.required],
      organizationId: ['', Validators.required],
      location: ['', Validators.required],
      area: ['', Validators.required],
    });
  }

  toggleForm() {
    this.isFormOpen = !this.isFormOpen;
    this.isEditMode = false;
    this.selectedLeadId = null;
    this.leadForm.reset();
    this.nextLeadNo = '';
    this.initForm();  
    this.fetchNextLeadNoFromApi();
  }

  private toISODate(date: Date): string {
    return date.toISOString().substring(0, 10);
  }

  onLeadNoSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    if (!value) {
      this.filteredLeads = [];
      return;
    }
    this.filteredLeads = this.leads.filter(lead => lead.leadNo.toLowerCase().includes(value));
  }

  selectLead(lead: any): void {
    this.leadForm.patchValue({
      leadNo: lead.leadNo,
      type: lead.type,
      source: lead.leadSource,
      salesProcess: lead.salesProcess,
      salesCoordinator: lead.salesCoordinator,
      branch: lead.branch,
      date: this.toISODate(new Date(lead.date)),
      expectedValidity: this.toISODate(new Date(lead.expectedValidity)),
      salesStage: lead.salesStage,
      reportingManager: lead.reportingManager,
      hod: lead.hod,
      team: lead.team,
      organization: lead.organizationName,
      location: lead.location,
      area: lead.area
    });
    this.filteredLeads = [];
  }

  onSalesStageSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    if (!value) {
      this.filteredSalesStages = [];
      return;
    }
    this.filteredSalesStages = this.salesStages.filter(stage => stage.toLowerCase().includes(value));
  }

  selectSalesStage(stage: string): void {
    this.leadForm.patchValue({ salesStage: stage });
    this.filteredSalesStages = []; 
  }

  loadLeadDates(): void {
    this.allDates = [...new Set(this.leads.map(lead => this.toISODate(new Date(lead.date))))];
  }

  selectDate(date: string): void {
    this.leadForm.patchValue({ date: date });
    this.filteredDates = [];
  }

  onSave() {
    this.leadForm.markAllAsTouched();
    const rawValue = this.leadForm.getRawValue();
    
    const validation = leadSchema.safeParse(rawValue);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      console.error('🚨 [Zod Validation Failed]:', errors);
      
      Object.keys(errors).forEach((field: string) => {
        const control = this.leadForm.get(field);
        if (control) {
          control.setErrors({ zod: errors[field as keyof typeof errors]?.[0] });
        }
      });
      
      Swal.fire({ 
        icon: 'error', 
        title: 'Validation Failed', 
        text: 'Please check the required fields highlighted below!'
      });
      return;
    }

    const orgIdValue = this.OrganisationId || rawValue.organizationId;
    const finalOrgId = (orgIdValue && orgIdValue !== "") ? Number(orgIdValue) : null;

    const payload: any = {
      LeadNo: this.isEditMode ? rawValue.leadNo : this.nextLeadNo,
      Date: rawValue.date ? new Date(rawValue.date).toISOString() : null,
      ExpectedValidity: rawValue.expectedValidity ? new Date(rawValue.expectedValidity).toISOString() : null,
      Type: rawValue.type,
      LeadOwner: String(rawValue.leadOwner || ""),
      LeadSource: String(rawValue.source || ""),
      SalesProcess: rawValue.salesProcess,
      SalesCoordinator: String(rawValue.salesCoordinator || ""),
      SalesStage: String(rawValue.salesStage || ""),
      Branch: String(rawValue.branch || ""),
      ReportingManager: String(rawValue.reportingManager || ""),
      Team: rawValue.team,
      HOD: String(rawValue.hod || ""),
      Location: rawValue.location,
      Area: rawValue.area,
      OrganizationName: rawValue.organization || rawValue.organizationName,
      organizationId: finalOrgId 
    };

    const token = localStorage.getItem('cavalier_token');
    const headers = { Authorization: `Bearer ${token}` };

    if (this.isEditMode && this.selectedLeadId) {
      this.http.put(`${environment.apiUrl}/Leads/${this.selectedLeadId}`, payload, { headers }).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'Updated!', text: 'Lead Updated Successfully!', timer: 2000 });
          this.resetFormAfterSave();
          this.OrganisationId = null;
        },
        error: (err) => Swal.fire({ icon: 'error', title: 'Update Failed', text: err.error?.message || 'Something went wrong!' })
      });
    } else {
      this.http.post(`${environment.apiUrl}/Leads`, payload, { headers }).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'Created!', text: 'Lead Created Successfully!', timer: 2000 });
          this.resetFormAfterSave();
          this.OrganisationId = null;
        },
        error: (err) => Swal.fire({ icon: 'error', title: 'Create Failed', text: err.error?.message || 'Failed to create lead!' })
      });
    }
  }

  resetFormAfterSave() {
    this.isFormOpen = false;
    this.isEditMode = false;
    this.selectedLeadId = null;
    this.leadForm.reset();
    this.nextLeadNo = '';
    this.initForm();        
    this.onLeadSearch();               
  }

  clearFilters() {
    this.leadForm.reset();
  }

  onOrgCheckForFilters(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    if (!value) {
      this.filteredOrganizations = [];
      this.loadLeads(); 
      return;
    }
    this.filteredOrganizations = this.organizations.filter(org => org.orgName.toLowerCase().includes(value));
  }

  selectOrgForFilters(org: any): void {
    this.searchForm.controls['organizationName'].setValue(org.orgName);
    this.filteredOrganizations = [];
    this.cdr.detectChanges();
    this.filterTableByOrganization(org.orgName);
  }

  filterTableByOrganization(orgName: string) {
    this.http.get<any[]>(`${environment.apiUrl}/Leads/search-leads`, { params: { organizationName: orgName } }).subscribe(res => this.leads = res);
  }

  onTeamSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase().trim();
    if (!value || value.length < 3) {
      this.filteredTeams = [];
      return;
    }
    this.filteredTeams = this.teamList.filter(t => {
      const teamName = (t.teamName || t.name || t || '').toString().toLowerCase();
      return teamName.includes(value);
    });
  }
// ✅ INDEPENDENT DUAL PIPELINE CALENDAR EXECUTION LIFECYCLE CONTROLS
  openCustomRangeCalendar() {
    this.isCustomRangeModalOpen = true;
    this.renderDualCalendars();
  }

  closeCustomRangeCalendar() {
    this.isCustomRangeModalOpen = false;
  }

  renderDualCalendars() {
    this.leftMonthDaysGrid = this.buildMonthMatrix(this.currentLeftCalendarDate);
    this.rightMonthDaysGrid = this.buildMonthMatrix(this.currentRightCalendarDate);
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
      dayCells.push({ dayNumber: prevMonthTotalDays - i, isCurrentMonth: false, dateString: null, isFuture: false });
    }
    
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const activeDateObj = new Date(year, month, i);
      const dateString = `${activeDateObj.getFullYear()}-${String(activeDateObj.getMonth() + 1).padStart(2, '0')}-${String(activeDateObj.getDate()).padStart(2, '0')}`;
      const isFutureDate = activeDateObj > todayObj;

      dayCells.push({ 
        dayNumber: i, 
        isCurrentMonth: true, 
        dateString: dateString,
        isFuture: isFutureDate 
      });
    }
    
    const remainingCells = 42 - dayCells.length;
    for (let i = 1; i <= remainingCells; i++) {
      dayCells.push({ dayNumber: i, isCurrentMonth: false, dateString: null, isFuture: false });
    }
    
    return dayCells;
  }

  shiftLeftCalendar(direction: number) {
    this.currentLeftCalendarDate.setMonth(this.currentLeftCalendarDate.getMonth() + direction);
    this.renderDualCalendars();
  }

  shiftRightCalendar(direction: number) {
    this.currentRightCalendarDate.setMonth(this.currentRightCalendarDate.getMonth() + direction);
    this.renderDualCalendars();
  }

  handleCellClick(cellDateString: string | null) {
    if (!cellDateString) return;
    if (!this.customStartSelectedDate || (this.customStartSelectedDate && this.customEndSelectedDate)) {
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
    return cellDateString === this.customStartSelectedDate || cellDateString === this.customEndSelectedDate;
  }

  isCellWithinRange(cellDateString: string | null): boolean {
    if (!cellDateString || !this.customStartSelectedDate || !this.customEndSelectedDate) return false;
    const currentCell = new Date(cellDateString);
    return currentCell > new Date(this.customStartSelectedDate) && currentCell < new Date(this.customEndSelectedDate);
}

  applyCustomPresetSlots(rangeType: string) {
    const baseToday = new Date();
    let fromDate = new Date();
    let toDate = new Date();
    switch (rangeType) {
      case 'yesterday': fromDate.setDate(baseToday.getDate() - 1); toDate.setDate(baseToday.getDate() - 1); break;
      case 'thisWeek': fromDate.setDate(baseToday.getDate() - baseToday.getDay()); break;
      case 'lastWeek': fromDate.setDate(baseToday.getDate() - baseToday.getDay() - 7); toDate.setDate(baseToday.getDate() - baseToday.getDay() - 1); break;
      case 'thisMonth': fromDate = new Date(baseToday.getFullYear(), baseToday.getMonth(), 1); break;
      case 'lastMonth': fromDate = new Date(baseToday.getFullYear(), baseToday.getMonth() - 1, 1); toDate = new Date(baseToday.getFullYear(), baseToday.getMonth(), 0); break;
      case 'lastYear': fromDate = new Date(baseToday.getFullYear() - 1, 0, 1); toDate = new Date(baseToday.getFullYear() - 1, 11, 31); break;
    }
    this.customStartSelectedDate = `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, '0')}-${String(fromDate.getDate()).padStart(2, '0')}`;
    this.customEndSelectedDate = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, '0')}-${String(toDate.getDate()).padStart(2, '0')}`;
    this.confirmSelectedRangePipeline();
  }

  confirmSelectedRangePipeline() {
    if (this.customStartSelectedDate && !this.customEndSelectedDate) this.customEndSelectedDate = this.customStartSelectedDate;
    if (this.customStartSelectedDate && this.customEndSelectedDate) {
      this.dateRangeInputValue = `${this.customStartSelectedDate} - ${this.customEndSelectedDate}`;
      // Framework architecture sync rule layer pattern mapping context pipeline:
      this.leadSearchFilters.date = `${this.customStartSelectedDate}_to_${this.customEndSelectedDate}`;
      this.closeCustomRangeCalendar();
      this.onLeadSearch();
    }
  }

  getCalendarMonthLabel(date: Date): string {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  }
 selectTeam(team: any): void {
    const matchedTeam = typeof team === 'object' ? team : this.teamList.find(t => (t.teamName || t.name) === team);
    if (matchedTeam) {
      this.leadSearchFilters.team = String(matchedTeam.teamName);
      this.teamDisplayText = matchedTeam.teamName || matchedTeam.name; // Input mein naam dikhega
    }
    this.filteredTeams = [];                    
    this.cdr.detectChanges();
  }

  onSalesStageSearchForFilters(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    if (!value) {
      this.filteredSalesStages = [];
      this.loadLeads(); 
      return;
    }
    this.filteredSalesStages = this.salesStages.filter(stage => stage.toLowerCase().includes(value));
  }

  selectSalesStageForFilters(stage: string): void {
    this.searchForm.controls['salesStage'].setValue(stage);
    this.filteredSalesStages = [];
    this.cdr.detectChanges();
    this.filterTableBySalesStage(stage);
  }

  filterTableBySalesStage(stage: string) {
    this.http.get<any[]>(`${environment.apiUrl}/Leads/search-leads`, { params: { salesStage: stage } }).subscribe(res => this.leads = res);
  }

  onSalesProcessSearchForFilters(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    if (!value) {
      this.filteredSalesProcesses = [];
      this.loadLeads(); 
      return;
    }
    this.filteredSalesProcesses = this.allSalesProcesses.filter(process => process.toLowerCase().includes(value));
  }

  selectSalesProcessForFilters(process: string): void {
    this.searchForm.controls['salesProcess'].setValue(process);
    this.filteredSalesProcesses = [];
    this.cdr.detectChanges();
    this.filterTableBySalesProcess(process);
  }

  filterTableBySalesProcess(process: string) {
    this.http.get<any[]>(`${environment.apiUrl}/Leads/search-leads`, { params: { salesProcess: process } }).subscribe(res => this.leads = res);
  }

  selectLeadDate(date: any): void {
    this.leadSearchFilters.date = date; 
    this.filteredDates = [];           
    this.onLeadSearch();               
  }

  onDateSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (!value) {
      this.filteredDates = [];
      return;
    }
    this.filteredDates = this.allDates.filter(d => d.includes(value));
  }

  onLeadOrgSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    if (!value || value.length < 4) {
      this.filteredOrganizations = [];
      return;
    }
    this.filteredOrganizations = this.organizations.filter(org => org.orgName.toLowerCase().includes(value));
  }

  setLeadQuickDate(type: string) {
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
    const formattedDate = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
    this.leadForm.patchValue({ date: formattedDate });
    this.leadSearchFilters.date = formattedDate;
    this.showCustomPicker = false; 
    this.cdr.detectChanges();      
    this.onLeadSearch();
  }

  selectLeadOrg(org: any): void {
    this.leadSearchFilters.organizationName = org.orgName; 
    this.filteredOrganizations = [];                      
  }
loadLeadSuggestions() {
    this.http.get<any[]>(`${environment.apiUrl}/Leads`).subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.leadNoList = [...new Set(data.map(l => l.leadNo).filter(val => val))];
          this.leadOrgList = [...new Set(data.map(l => l.organizationName).filter(val => val))];
          this.allSalesProcesses = [...new Set(data.map(l => l.salesProcess).filter(val => val))];
          this.cdr.detectChanges(); 
        }
      }
    });

    // Humare global list ko populate karo taaki bina modal khole type karne par bhi filter chale
    this.userServices.getHodList().subscribe({
      next: (res: any[]) => {
        this.OnlyleadOwner = res;
        const validNames = res.map(u => u.name).filter(n => n);
        this.allHODList = [...new Set(validNames)];
        this.leadOwnerList = [...new Set(validNames)];
        this.managerUniqueList = [...new Set(validNames)];
        this.cdr.detectChanges();
      }
    });
  }

  onManagerSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase().trim();
    if (!value || value.length < 3) {
      this.filteredManagers = [];
      return;
    }
    // Ab ye direct hod-list ke content se dynamically search karega
    this.filteredManagers = this.managerUniqueList.filter(m => m.toLowerCase().includes(value));
  }

  selectManager(managerName: string): void {
    this.leadSearchFilters.reportingManager = managerName;
    this.filteredManagers = [];
    this.cdr.detectChanges();
  }

  onStatusSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase().trim();
    if (!value || value.length < 3) {
      this.filteredStatusSuggestions = [];
      return;
    }
    this.filteredStatusSuggestions = this.statusList.filter(s => s.toLowerCase().includes(value));
  }

  selectStatus(status: string): void {
    this.leadSearchFilters.salesStage = status;
    this.filteredStatusSuggestions = [];
    this.cdr.detectChanges();
  }

onLeadSearch() {
  this.showTable = true;
  const searchInput = this.leadSearchFilters.leadNo?.toString().trim();
  
  // Custom Date Range parsing pipeline logic
  let payloadFromDate: string | null = null;
  let payloadToDate: string | null = null;
  
  if (this.customStartSelectedDate) {
    payloadFromDate = new Date(this.customStartSelectedDate).toISOString();
  }
  if (this.customEndSelectedDate) {
    payloadToDate = new Date(this.customEndSelectedDate).toISOString();
  } else if (this.customStartSelectedDate) {
    // Agar single date select ki hai to end date bhi wahi hogi
    payloadToDate = new Date(this.customStartSelectedDate).toISOString();
  }

  let filtersToSend: any = {};
  if (searchInput && searchInput !== "") {
    filtersToSend = {
      LeadNo: searchInput, 
      OrganizationName: '', 
      Type: '', 
      LeadOwner: '', 
      SalesStage: '', 
      SalesProcess: '', 
      HOD: '', 
      Team: '', 
      Branch: '', 
      ReportingManager: '', 
      Status: '', 
      FromDate: null,
      EndDate: null 
    };
  } else {
    filtersToSend = {
      LeadNo: '',
      OrganizationName: this.leadSearchFilters.organizationName || "",
      OrganisationId: this.OrganisationId ? Number(this.OrganisationId) : null,
      Type: this.leadSearchFilters.type === 'Any' ? "" : this.leadSearchFilters.type,
      LeadOwner: this.leadSearchFilters.leadOwner === 'Any' ? "" : this.leadSearchFilters.leadOwner,
      SalesStage: this.leadSearchFilters.salesStage || "",
      SalesProcess: this.leadSearchFilters.salesProcess || "",
      HOD: this.leadSearchFilters.hod || "", 
      Team: this.leadSearchFilters.team || "", 
      Branch: this.leadSearchFilters.branch || "", 
      ReportingManager: this.leadSearchFilters.reportingManager || "", 
      Status: (this.leadSearchFilters.status === 'Any' || !this.leadSearchFilters.status) ? "" : this.leadSearchFilters.status.toString(),
      FromDate: payloadFromDate,
      EndDate: payloadToDate
    };
  }

  console.log("🚀 Cavalier Search Payload:", filtersToSend);

  const headers = { 'Authorization': `Bearer ${localStorage.getItem('cavalier_token')}` };
  this.http.post<any[]>(`${environment.apiUrl}/Leads/Search`, filtersToSend, { headers }).subscribe({
    next: (response) => {
      this.leads = response || [];
      this.updatePagination();
      if (this.leads.length === 0) Swal.fire({ icon: 'info', title: 'No Records', text: 'No data found in DB.' });
    },
    error: () => Swal.fire({ icon: 'error', title: 'Error', text: 'Search failed!' })
  });
}



  onLeadSalesStageSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    if (!value) {
      this.filteredSalesStages = [];
      return;
    }
    this.filteredSalesStages = this.salesStages.filter(stage => stage.toLowerCase().includes(value));
  }

  selectLeadSalesStage(stage: string): void {
    this.leadSearchFilters.salesStage = stage;
    this.filteredSalesStages = [];
  }

  resetLeadFilters() {
    this.leadSearchFilters = {
      leadNo: '', date: '', organizationName: '', type: 'Any', leadOwner: 'Any', salesProcess: '', salesStage: '', hod: '', team: '', reportingManager: '', 
      status: 'Any',
       branch: '',
       
    };
    this.OrganisationId='';
    this.hodDisplayText='';
    this.leadOwnerDisplayText='';
    this.dateRangeInputValue='';
    
    this.teamDisplayText='';
    this.managerDisplayText='';
    this.dateRangeInputValue='';
    if (this.leadForm) this.leadForm.patchValue({ date: '', branch: '' });

    const headers = { 'Authorization': `Bearer ${localStorage.getItem('cavalier_token')}` };
    this.http.post<any[]>(`${environment.apiUrl}/Leads/Search`, { 
      LeadNo: '', OrganizationName: '', Type: '', LeadOwner: '', SalesStage: '', SalesProcess: '', HOD: '', Team: '', Branch: '', ReportingManager: '', Status: '', Date: '', FromDate: null, EndDate: null
    }, { headers }).subscribe({
      next: (response) => {
        this.leads = response || [];
        this.updatePagination();
      }
    });
  }
// ll
  downloadLeadsPDF() {
    this.isExportOpen = false;
    if (!this.leads || this.leads.length === 0) return;
    const doc = new jsPDF('l', 'mm', 'a4');
    const colWidth = 277 / (this.selectedColumns.length || 1);
    doc.setFontSize(16); doc.text("LEAD RECORDS SUMMARY", 110, 15);
    doc.setFillColor(74, 63, 63); doc.rect(10, 25, 277, 10, 'F');
    doc.setFontSize(7); doc.setTextColor(255, 255, 255);
    this.selectedColumns.forEach((col, i) => doc.text(col.toUpperCase(), 10 + (i * colWidth) + 2, 32));
    
    let y = 45;
    doc.setTextColor(0, 0, 0);
    this.leads.forEach((l, rIndex) => {
      if (y > 185) { doc.addPage(); y = 20; }
      if (rIndex % 2 === 0) { doc.setFillColor(245, 245, 245); doc.rect(10, y - 5, 277, 8, 'F'); }
      this.selectedColumns.forEach((col, cIndex) => {
        let val = l[this.columnFieldMap[col]] || '-';
        doc.text(val.toString().substring(0, 17), 10 + (cIndex * colWidth) + 2, y);
      });
      y += 8;
    });
    doc.save(`Leads_Report_${Date.now()}.pdf`);
  }

  printLeads() {
    this.isExportOpen = false;
    if (!this.leads || this.leads.length === 0) return;
    let header = '<tr style="background-color: #4a3f3f; color: white;">';
    this.selectedColumns.forEach(c => header += `<th style="padding:10px; border:1px solid #ddd;">${c}</th>`);
    header += '</tr>';
    let rows = '';
    this.leads.forEach(l => {
      rows += '<tr>';
      this.selectedColumns.forEach(c => {
        let v = l[this.columnFieldMap[c]] ?? '-';
        rows += `<td style="padding:8px; border:1px solid #eee;">${v}</td>`;
      });
      rows += '</tr>';
    });
    const w = window.open('', '_blank');
    w?.document.write(`<html><body><h2>LEAD RECORDS SUMMARY</h2><table style="width:100%; border-collapse:collapse;"><thead>${header}</thead><tbody>${rows}</tbody></table></body></html>`);
    w?.document.close();
    setTimeout(() => { w?.print(); w?.close(); }, 500);
  }

  downloadLeadsExcel() {
    if (!this.leads || this.leads.length === 0) return;
    const data = this.leads.map(lead => {
      let r: any = {};
      this.selectedColumns.forEach(c => r[c] = lead[this.columnFieldMap[c]] ?? '-');
      return r;
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    XLSX.writeFile(wb, `Lead_Report_${Date.now()}.xlsx`);
  }

  setPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  onPageSizeChange() {
    this.itemsPerPage = Number(this.itemsPerPage);
    this.currentPage = 1;
    this.updatePagination();
  }

  oniconLeadSearch() {
    if (this.iconSearchOrgs.length > 0) { this.iconSearchOrgs = []; return; }
    this.iconSearchSub = this.http.get<any[]>(`${environment.apiUrl}/Leads`).subscribe(res => {
      const u = [...new Set(res.map(i => i.organizationName))].filter(n => n);
      this.iconSearchOrgs = u.map(n => ({ orgName: n }));
    });
  }

  selectIconOrg(org: any) {
    this.leadSearchFilters.organizationName = org.orgName;
    this.iconSearchOrgs = [];
  }

  oniconHODSearch() {
    this.isHODModalOpen = true; 
    this.modalHODSearchText = '';
    
    // Direct API user list (OnlyleadOwner) se names map kar rahe hain
    if (this.OnlyleadOwner && this.OnlyleadOwner.length > 0) {
      this.allHODList = [...new Set(this.OnlyleadOwner.map(u => u.name))]
        .filter(n => n && typeof n === 'string' && n.trim() !== '');
      this.allHODListFiltered = [...this.allHODList];
    } else {
      this.userServices.getHodList().subscribe({
        next: (res: any[]) => {
          this.OnlyleadOwner = res;
          this.allHODList = [...new Set(res.map(u => u.name))].filter(n => n);
          this.allHODListFiltered = [...this.allHODList];
          this.cdr.detectChanges();
        }
      });
    }
  }

  onHODSearchType(event: Event): void {
    const v = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.filteredHODSuggestions = v.length >= 3 ? this.allHODList.filter(h => h.toLowerCase().includes(v)) : [];
  }

 selectHOD(hodUser: any): void {
    if (hodUser && typeof hodUser === 'object') {
      this.leadSearchFilters.hod = String(hodUser.id);
      this.hodDisplayText = hodUser.name; // Input mein naam dikhega
    } else {
      const match = this.OnlyleadOwner.find(u => u.name === hodUser);
      if (match) {
        this.leadSearchFilters.hod = String(match.id);
        this.hodDisplayText = match.name;
      } else {
        this.leadSearchFilters.hod = hodUser;
        this.hodDisplayText = hodUser;
      }
    }
    this.filteredHODSuggestions = []; 
    this.isHODModalOpen = false;
    this.cdr.detectChanges();
  }

  filterHODModalList() {
    const q = this.modalHODSearchText.toLowerCase().trim();
    this.allHODListFiltered = q ? this.allHODList.filter(h => h.toLowerCase().includes(q)) : [...this.allHODList];
  }

  selectHODFromIcon(name: string) {
    this.leadSearchFilters.hod = name; this.iconHODList = [];
  }

  onLeadOwnerIconClick() {
    this.isLeadOwnerModalOpen = true; 
    this.modalOwnerSearchText = '';
    
    if (this.OnlyleadOwner && this.OnlyleadOwner.length > 0) {
      this.leadOwnerList = [...new Set(this.OnlyleadOwner.map(u => u.name))]
        .filter(n => n && typeof n === 'string' && n.trim() !== '');
      this.allOwnersFiltered = [...this.leadOwnerList];
    } else {
      this.userServices.getHodList().subscribe({
        next: (res: any[]) => {
          this.OnlyleadOwner = res;
          this.leadOwnerList = [...new Set(res.map(u => u.name))].filter(n => n);
          this.allOwnersFiltered = [...this.leadOwnerList];
          this.cdr.detectChanges();
        }
      });
    }
  }

  onLeadOwnerSearch(event: Event): void {
    const v = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.filteredLeadOwners = v.length >= 3 ? this.leadOwnerList.filter(o => o.toLowerCase().includes(v)) : [];
  }

selectLeadOwner(owner: any): void {
    if (owner && typeof owner === 'object') {
      this.leadSearchFilters.leadOwner = String(owner.id);
      this.leadOwnerDisplayText = owner.name; // Input mein naam dikhega
    } else {
      const match = this.OnlyleadOwner.find(u => u.name === owner);
      if (match) {
        this.leadSearchFilters.leadOwner = String(match.id);
        this.leadOwnerDisplayText = match.name;
      } else {
        this.leadSearchFilters.leadOwner = owner;
        this.leadOwnerDisplayText = owner;
      }
    }
    this.filteredLeadOwners = []; 
    this.isLeadOwnerModalOpen = false;
    this.cdr.detectChanges();
  }

  filterOwnerModalList() {
    const q = this.modalOwnerSearchText.toLowerCase().trim();
    this.allOwnersFiltered = q ? this.leadOwnerList.filter(o => o.toLowerCase().includes(q)) : [...this.leadOwnerList];
  }

  selectLeadNoFromIcon(val: any) { this.leadSearchFilters.leadNo = val; this.lnIconList = []; }
  selectLoFromIcon(owner: string) { this.leadSearchFilters.leadOwner = owner; this.loIconList = []; }
  filterLeadOwners(event: any) {}

  onLeadNoIconClick() {
    this.isLNModalOpen = true; this.modalLNSearchText = '';
    this.http.get<any[]>(`${environment.apiUrl}/Leads`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('cavalier_token')}` } }).subscribe(res => {
      this.allLNList = [...new Set(res.map(i => i.inquiryNo || i.leadNo || i))].filter(v => v);
      this.allLNFiltered = [...this.allLNList];
    });
  }

  onLeadNoSearchForFilters(event: any): void {
    const v = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.filteredLeads = v.length >= 3 ? this.allLNList.filter(ln => ln.toString().toLowerCase().includes(v)) : [];
  }

  selectLeadForFilters(lead: any): void {
    this.leadSearchFilters.leadNo = lead.leadNo ? lead.leadNo : lead;
    this.isLNModalOpen = false; this.filteredLeads = [];
  }

  filterLeadNumbers(event?: any) {
    const q = this.modalLNSearchText.toLowerCase().trim();
    this.allLNFiltered = q ? this.allLNList.filter(ln => ln.toString().toLowerCase().includes(q)) : [...this.allLNList];
  }

  onTeamIconClick() {
    this.isTeamModalOpen = true; this.modalTeamSearchText = '';
    this.http.get<any[]>(`${environment.apiUrl}/Teams`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('cavalier_token')}` } }).subscribe(res => {
      this.allTeamsList = [...new Set(res.map(t => t.teamName || t.name || t))];
      this.tmIconListFiltered = [...this.allTeamsList];
    });
  }

  filterTeams(event: any) {
    const q = this.modalTeamSearchText.toLowerCase().trim();
    this.tmIconListFiltered = this.allTeamsList.filter(t => t.toString().toLowerCase().includes(q));
  }

selectTmFromIcon(team: any) {
    const matchedTeam = this.teamList.find(t => (t.teamName || t.name || t) === team);
    if (matchedTeam) {
      this.leadSearchFilters.team = String(matchedTeam.id);
      this.teamDisplayText = matchedTeam.teamName || matchedTeam.name;
    } else {
      this.leadSearchFilters.team = team;
      this.teamDisplayText = team;
    }
    this.isTeamModalOpen = false;
    this.cdr.detectChanges();
  }

  onManagerIconClick() {
    this.isManagerModalOpen = true; 
    this.modalManagerSearchText = '';
    
    if (this.OnlyleadOwner && this.OnlyleadOwner.length > 0) {
      this.allManagersList = [...new Set(this.OnlyleadOwner.map(u => u.name))]
        .filter(n => n && typeof n === 'string' && n.trim() !== '');
      this.rmIconListFiltered = [...this.allManagersList];
      this.cdr.detectChanges();
    } else {
      this.userServices.getHodList().subscribe({
        next: (res: any[]) => {
          this.OnlyleadOwner = res;
          this.allManagersList = [...new Set(res.map(u => u.name))].filter(n => n);
          this.rmIconListFiltered = [...this.allManagersList];
          this.cdr.detectChanges();
        }
      });
    }
  }

  filterManagers(event?: any) {
    const q = this.modalManagerSearchText.toLowerCase().trim();
    this.rmIconListFiltered = this.allManagersList.filter(m => m.toString().toLowerCase().includes(q));
    this.cdr.detectChanges();
  }

  selectRmFromIcon(manager: any) {
    if (manager && typeof manager === 'object') {
      this.leadSearchFilters.reportingManager = String(manager.id);
      this.managerDisplayText = manager.name; // Input mein naam dikhega
    } else {
      const match = this.OnlyleadOwner.find(u => u.name === manager);
      if (match) {
        this.leadSearchFilters.reportingManager = String(match.id);
        this.managerDisplayText = match.name;
      } else {
        this.leadSearchFilters.reportingManager = manager;
        this.managerDisplayText = manager;
      }
    }
    this.isManagerModalOpen = false;
    this.cdr.detectChanges();
  }

  loadOrganizationList() {
    if (this.showOrgDropdown) { this.showOrgDropdown = false; return; }
    this.http.get<any[]>(`${environment.apiUrl}/Organization/List`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('cavalier_token')}` } }).subscribe({
      next: (res) => {
        this.orgList = res; this.showOrgDropdown = true; this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  filterHODs(event: any) {}
  filterLeads(event: any) {}
  filterOrgList(event: any) {}

  selectLnFromIcon(val: any) {
    this.leadSearchFilters.leadNo = val; this.lnIconList = [];
    this.cdr.detectChanges();
  }

  loadLeadOwners(): void {
    this.userServices.getHodList().subscribe({ next: (res: any) => this.hodList = res });
  }

  loadDropdownData(): void {
    this.userServices.getUsers('onlyuserdata').subscribe({
      next: (data: any) => {
        // Dropdown data configuration block
      }
    });
  }

  loadBranchess() {
    this.http.get(`${environment.apiUrl}/branch/list`).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res.data || res.result || []);
        this.branchList = data.map((b: any) => ({ ...b, isSelected: false }));
        this.filteredBranchSuggestions = [...this.branchList];
      }
    });
  }

  onBranchSearch() {
    const s = this.branchSearchText.toLowerCase().trim();
    if (!s) this.leadSearchFilters.branch = '';
    this.filteredBranchSuggestions = this.branchList.filter(b => b.branchName?.toLowerCase().includes(s));
  }

  toggleBranchModal() { this.isBranchModalOpen = !this.isBranchModalOpen; }
  toggleBranchSelection(branch: any) { branch.isSelected = !branch.isSelected; }

  confirmSelection() {
    this.isBranchModalOpen = false;
    const total = this.branchList.length;
    const selected = this.branchList.filter(b => b.isSelected);
    if (selected.length === total || selected.length === 0) {
      this.leadSearchFilters.branch = ""; this.branchSearchText = "";
    } else {
      this.leadSearchFilters.branch = selected.map(b => b.branchName).join(', ');
      this.branchSearchText = this.leadSearchFilters.branch;
    }
    this.onLeadSearch();
  }

  selectBranchFromDropdown(branch: any) {
    this.branchSearchText = branch.branchName; this.toggleBranchSelection(branch);
    this.leadSearchFilters.branch = branch.branchName; this.filteredBranchSuggestions = [];
    this.onLeadSearch();
  }

  handleRowDblClick(leadId: any) { this.selectedLeadId = leadId; this.showRowModal = true; }
  closeRowModal() { this.showRowModal = false; this.selectedLeadId = null; }

  toggleLeadStatus(lead: any) {
    const newStatus = lead.status === 1 ? 0 : 1;
    this.http.patch(`${environment.apiUrl}/Leads/UpdateStatus/${lead.id}`, newStatus, { headers: { 'Authorization': `Bearer ${localStorage.getItem('cavalier_token')}`, 'Content-Type': 'application/json' } }).subscribe({
      next: () => { lead.status = newStatus; this.cdr.detectChanges(); }
    });
  }

  getsales(): void {
    this.userServices.getHodList().subscribe({ next: (data: any[]) => this.OnlyleadOwner = data });
  }
}