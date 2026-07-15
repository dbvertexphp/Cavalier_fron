import { Component, OnInit, ChangeDetectorRef, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CheckPermissionService } from '../../services/check-permission.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './teams.component.html',
})
export class TeamsComponent implements OnInit {
  // ---- Filter state ----
  searchTerm = '';

  // ---- Form state ----
  isFormOpen = false;
  isEditMode = false;
  isLoading = false;
  selectedTeamId: number | null = null;
  formError = '';
  PermissionID: any;

  // ---- API URLs ----
  private apiUrl = environment.apiUrl + '/Teams';
  private hodApiUrl = environment.apiUrl + '/User/hod-list';

  // ---- Data ----
  teams: any[] = [];
  filteredTeams: any[] = [];
  hodUserList: any[] = [];
  sortedUserList: any[] = [];

  // ---- Members Modal ----
  isMembersModalOpen = false;
  selectedTeamForView: any = null;
  parsedMembersList: string[] = [];

  // ---- Dropdown status ----
  dropdownStatus = {
    salesTeam: false,
    salesCoordinator: false,
    hod: false,
    reportingManager: false,
    quotedBy: false,
    pricingBy: false,
    operations: false,
    account: false
  };

  // ---- Form Data ----
  formData = {
    teamName: '',
    salesTeam: [] as string[],
    salesCoordinator: [] as string[],
    hod: [] as string[],
    reportingManager: [] as string[],
    quotedBy: [] as string[],
    pricingBy: [] as string[],
    operations: [] as string[],
    account: [] as string[]
  };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    public CheckPermissionService: CheckPermissionService,
    private eRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.PermissionID = Number(localStorage.getItem('permissionID'));
    this.fetchTeams();
    this.loadHodUsers();
  }

  String(value: any): string {
    return String(value);
  }

  // ============================================
  // DROPDOWN HANDLING
  // ============================================

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.closeAllDropdowns();
    } else {
      const clickedEl = event.target as HTMLElement;
      if (!clickedEl.closest('.custom-dropdown')) {
        this.closeAllDropdowns();
      }
    }
  }

  closeAllDropdowns() {
    this.dropdownStatus = {
      salesTeam: false,
      salesCoordinator: false,
      hod: false,
      reportingManager: false,
      quotedBy: false,
      pricingBy: false,
      operations: false,
      account: false
    };
    this.cdr.detectChanges();
  }

  toggleDropdown(field: keyof typeof this.dropdownStatus, event: Event) {
    event.stopPropagation();
    const currentStatus = this.dropdownStatus[field];
    this.closeAllDropdowns();
    this.dropdownStatus[field] = !currentStatus;
    this.cdr.detectChanges();
  }

  toggleSelection(field: keyof typeof this.formData, itemId: any) {
    const stringId = String(itemId).trim();
    const list = this.formData[field] as string[];
    const idx = list.indexOf(stringId);
    
    if (idx > -1) {
      list.splice(idx, 1);
    } else {
      list.push(stringId);
    }
    // Sort the list alphabetically
    this.sortList(field);
    this.cdr.detectChanges();
  }

  sortList(field: keyof typeof this.formData) {
    const list = this.formData[field] as string[];
    list.sort((a, b) => {
      const nameA = this.getUserNameById(a)?.toLowerCase() || '';
      const nameB = this.getUserNameById(b)?.toLowerCase() || '';
      return nameA.localeCompare(nameB);
    });
  }

  // ============================================
  // API CALLS
  // ============================================

  fetchTeams() {
    this.isLoading = true;
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.teams = data;
        this.filteredTeams = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching teams', err);
        this.isLoading = false;
      }
    });
  }

  loadHodUsers() {
    this.http.get<any[]>(this.hodApiUrl).subscribe({
      next: (data) => {
        // Filter: Remove "Master"
        this.hodUserList = data.filter(user =>
          user.role?.toLowerCase() !== 'master' &&
          user.designation?.toLowerCase() !== 'master'
        );
        // Sort: Alphabetical order by name
        this.sortedUserList = [...this.hodUserList].sort((a, b) => {
          const nameA = (a.userName || a.name || '').toLowerCase();
          const nameB = (b.userName || b.name || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading HOD list', err);
        this.hodUserList = [];
        this.sortedUserList = [];
      }
    });
  }

  // ============================================
  // HELPERS
  // ============================================

  getUserNameById(id: string): string {
    const user = this.hodUserList.find(u => String(u.id) === String(id));
    return user ? (user.userName || user.name) : '';
  }

  getUserNamesByIds(idsArray: string[]): string[] {
    if (!idsArray || idsArray.length === 0) return [];
    const names = idsArray.map(id => {
      const user = this.hodUserList.find(u => String(u.id) === String(id));
      return user ? (user.userName || user.name) : `ID: ${id}`;
    });
    return names.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  }

  displayNamesFromIdsString(idsString: string): string {
    if (!idsString) return '—';
    
    if (/[a-zA-Z]/.test(idsString) && !idsString.includes(',')) {
      const isPureId = !isNaN(Number(idsString.trim()));
      if (!isPureId) return idsString;
    }
    
    const ids = idsString.split(',').map(x => x.trim());
    const names = ids.map(id => {
      const user = this.hodUserList.find(u => String(u.id) === String(id));
      return user ? (user.userName || user.name) : id;
    });
    return names.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).join(', ');
  }

  displaySalesTeamNames(idsString: string): string {
    if (!idsString) return '—';
    const ids = idsString.split(',').map(x => x.trim());
    const names = ids.map(id => {
      const user = this.hodUserList.find(u => String(u.id) === String(id));
      return user ? (user.userName || user.name) : id;
    });
    return names.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).join(', ');
  }

  onFilterChange() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredTeams = this.teams;
    } else {
      this.filteredTeams = this.teams.filter(t =>
        t.teamName?.toLowerCase().includes(term) ||
        this.displaySalesTeamNames(t.salesTeam)?.toLowerCase().includes(term)
      );
    }
    this.cdr.detectChanges();
  }

  clearFilters() {
    this.searchTerm = '';
    this.onFilterChange();
  }

  viewMembersList(team: any) {
    this.selectedTeamForView = team;
    if (team.membersDisplay && team.membersDisplay !== 'No Members') {
      this.parsedMembersList = team.membersDisplay.split(',').map((name: string) => name.trim());
    } else {
      this.parsedMembersList = [];
    }
    this.isMembersModalOpen = true;
    this.cdr.detectChanges();
  }

  closeMembersModal() {
    this.isMembersModalOpen = false;
    this.selectedTeamForView = null;
    this.parsedMembersList = [];
    this.cdr.detectChanges();
  }

  // ============================================
  // FORM - OPEN / CLOSE / RESET
  // ============================================

  resetForm() {
    this.formData = {
      teamName: '',
      salesTeam: [],
      salesCoordinator: [],
      hod: [],
      reportingManager: [],
      quotedBy: [],
      pricingBy: [],
      operations: [],
      account: []
    };
    this.formError = '';
    this.closeAllDropdowns();
    this.cdr.detectChanges();
  }

  openAddForm() {
    this.isEditMode = false;
    this.selectedTeamId = null;
    this.resetForm();
    this.isFormOpen = true;
    this.cdr.detectChanges();
  }

  openEditForm(team: any) {
    this.isEditMode = true;
    this.selectedTeamId = team.id;
    
    const splitString = (val: any) => val ? String(val).split(',').map((x: string) => x.trim()) : [];

    this.formData = {
      teamName: team.teamName || '',
      salesTeam: splitString(team.salesTeam),
      salesCoordinator: splitString(team.salesCoordinator),
      hod: splitString(team.hod),
      reportingManager: splitString(team.reportingManager),
      quotedBy: splitString(team.quotedBy),
      pricingBy: splitString(team.pricingBy),
      operations: splitString(team.operations),
      account: splitString(team.account)
    };
    
    // Sort all lists alphabetically
    Object.keys(this.formData).forEach(key => {
      if (Array.isArray(this.formData[key as keyof typeof this.formData])) {
        this.sortList(key as keyof typeof this.formData);
      }
    });
    
    this.isFormOpen = true;
    this.cdr.detectChanges();
  }

  closeForm() {
    this.isFormOpen = false;
    this.selectedTeamId = null;
    this.resetForm();
    this.cdr.detectChanges();
  }

  // ============================================
  // VALIDATION
  // ============================================

  validateForm(): boolean {
    this.formError = '';

    if (!this.formData.teamName.trim()) {
      this.formError = 'Team Name is required.';
      return false;
    }
    if (this.formData.salesTeam.length === 0) {
      this.formError = 'Please select at least one Sales Team member.';
      return false;
    }
    return true;
  }

  // ============================================
  // SAVE - WITH SWEETALERT
  // ============================================

  saveTeam() {
    if (!this.validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: this.formError,
        confirmButtonColor: '#4a3f3f',
        timer: 3000,
        timerProgressBar: true
      });
      return;
    }

    const upperTeamName = this.formData.teamName.trim().toUpperCase();

    const payload: any = {
      teamName: upperTeamName,
      salesTeam: this.formData.salesTeam.join(', '),
      salesCoordinator: this.formData.salesCoordinator.join(', '),
      hod: this.formData.hod.join(', '),
      reportingManager: this.formData.reportingManager.join(', '),
      quotedBy: this.formData.quotedBy.join(', '),
      pricingBy: this.formData.pricingBy.join(', '),
      operations: this.formData.operations.join(', '),
      account: this.formData.account.join(', ')
    };

    this.isLoading = true;

    Swal.fire({
      title: this.isEditMode ? 'Update Team?' : 'Create New Team?',
      text: this.isEditMode
        ? `Are you sure you want to update "${upperTeamName}"?`
        : `Are you sure you want to create "${upperTeamName}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4a3f3f',
      cancelButtonColor: '#6b7280',
      confirmButtonText: this.isEditMode ? 'Yes, Update!' : 'Yes, Create!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      showLoaderOnConfirm: true,
      preConfirm: () => {
        return new Promise((resolve, reject) => {
          if (this.isEditMode && this.selectedTeamId) {
            payload.id = this.selectedTeamId;
            this.http.put(`${this.apiUrl}/${this.selectedTeamId}`, payload).subscribe({
              next: () => resolve(true),
              error: (err) => reject(err.error?.message || 'Update failed')
            });
          } else {
            this.http.post(this.apiUrl, payload).subscribe({
              next: () => resolve(true),
              error: (err) => reject(err.error?.message || 'Create failed')
            });
          }
        });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      this.isLoading = false;
      if (result.isConfirmed) {
        this.fetchTeams();
        this.closeForm();
        this.cdr.detectChanges();
        
        Swal.fire({
          icon: 'success',
          title: this.isEditMode ? 'Updated!' : 'Created!',
          text: this.isEditMode
            ? `Team "${upperTeamName}" has been updated successfully.`
            : `Team "${upperTeamName}" has been created successfully.`,
          timer: 2500,
          showConfirmButton: false,
          timerProgressBar: true,
          position: 'center'
        });
      } else if (result.isDismissed) {
        Swal.fire({
          icon: 'info',
          title: 'Cancelled',
          text: 'Operation cancelled.',
          timer: 1500,
          showConfirmButton: false,
          timerProgressBar: true,
          position: 'center'
        });
      }
    }).catch((error) => {
      this.isLoading = false;
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error || 'Failed to save team. Please try again.',
        confirmButtonColor: '#4a3f3f'
      });
    });
  }

  // ============================================
  // DELETE - WITH SWEETALERT
  // ============================================

  deleteTeam(id: number) {
    const team = this.teams.find(t => t.id === id);
    const teamName = team?.teamName || 'this team';

    Swal.fire({
      title: 'Delete Team?',
      html: `Are you sure you want to delete <strong>${teamName}</strong>?<br><span style="color:#6b7280;font-size:13px;">This action cannot be undone.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      showLoaderOnConfirm: true,
      preConfirm: () => {
        return new Promise((resolve, reject) => {
          this.http.delete(`${this.apiUrl}/${id}`).subscribe({
            next: () => resolve(true),
            error: (err) => reject(err.error?.message || 'Delete failed')
          });
        });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        this.fetchTeams();
        this.cdr.detectChanges();
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: `Team "${teamName}" has been removed successfully.`,
          timer: 2500,
          showConfirmButton: false,
          timerProgressBar: true,
          position: 'center'
        });
      } else if (result.isDismissed) {
        Swal.fire({
          icon: 'info',
          title: 'Cancelled',
          text: 'Deletion cancelled.',
          timer: 1500,
          showConfirmButton: false,
          timerProgressBar: true,
          position: 'center'
        });
      }
    }).catch((error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error || 'Failed to delete team. Please try again.',
        confirmButtonColor: '#4a3f3f'
      });
    });
  }
}
