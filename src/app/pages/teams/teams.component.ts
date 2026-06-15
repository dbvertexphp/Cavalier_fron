import { Component, OnInit, ChangeDetectorRef, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CheckPermissionService } from '../../services/check-permission.service';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './teams.component.html',
})
export class TeamsComponent implements OnInit {
  isModalOpen = false;
  isEditMode = false;
  selectedTeamId: number | null = null;
  PermissionID: any;
  private apiUrl = environment.apiUrl + '/Teams';
  
  private hodApiUrl = 'http://localhost:5000/api/User/hod-list';

  teams: any[] = [];
  hodUserList: any[] = []; // Contains list of users from backend { id, name/userName }

  dropdownStatus = {
    salesCoordinator: false,
    hod: false,
    reportingManager: false
  };

  // Track selected IDs as string arrays (E.g. ['1', '2'])
  newTeam = { 
    teamName: '',
    salesCoordinator: [] as string[], 
    hod: [] as string[],
    reportingManager: [] as string[]
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

  // 🔥 HTML Template Strict Checking Error Solution Helper
  String(value: any): string {
    return String(value);
  }

  // Global document click listener to close dropdowns when clicked outside
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
    this.dropdownStatus.salesCoordinator = false;
    this.dropdownStatus.hod = false;
    this.dropdownStatus.reportingManager = false;
    this.cdr.detectChanges();
  }

  fetchTeams() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.teams = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching teams', err)
    });
  }

  loadHodUsers() {
    this.http.get<any[]>(this.hodApiUrl).subscribe({
      next: (data) => {
        this.hodUserList = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading HOD list', err)
    });
  }

  // Helper to map IDs array to human-readable Name tags inside the modal input
  getUserNamesByIds(idsArray: string[]): string[] {
    if (!idsArray || idsArray.length === 0) return [];
    return idsArray.map(id => {
      const user = this.hodUserList.find(u => String(u.id) === String(id));
      return user ? (user.userName || user.name) : `ID: ${id}`;
    });
  }

  // Helper to display comma-separated Names in the table grid using IDs string
  displayNamesFromIdsString(idsString: string): string {
    if (!idsString) return '—';
    
    // If database contains old raw text names, return them directly
    if (/[a-zA-Z]/.test(idsString) && !idsString.includes(',')) {
      const isPureId = !isNaN(Number(idsString.trim()));
      if(!isPureId) return idsString; 
    }
    
    const ids = idsString.split(',').map(x => x.trim());
    const names = ids.map(id => {
      const user = this.hodUserList.find(u => String(u.id) === String(id));
      return user ? (user.userName || user.name) : id;
    });
    return names.join(', ');
  }

  resetForm() {
    this.newTeam = { 
      teamName: '',
      salesCoordinator: [],
      hod: [],
      reportingManager: []
    };
    this.closeAllDropdowns();
  }

  openModal() { 
    this.isEditMode = false;
    this.resetForm();
    this.isModalOpen = true; 
    this.cdr.detectChanges();
  }

  editTeam(team: any) {
    this.isEditMode = true;
    this.selectedTeamId = team.id;
    
    // Split backend comma-separated values string back to array structure
    this.newTeam = { 
      teamName: team.teamName,
      salesCoordinator: team.salesCoordinator ? String(team.salesCoordinator).split(',').map((x: string) => x.trim()) : [],
      hod: team.hod ? String(team.hod).split(',').map((x: string) => x.trim()) : [],
      reportingManager: team.reportingManager ? String(team.reportingManager).split(',').map((x: string) => x.trim()) : []
    };
    
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  closeModal() { 
    this.isModalOpen = false; 
    this.selectedTeamId = null;
    this.resetForm();
    this.cdr.detectChanges();
  }

  // Main checkbox handling toggler using IDs
  toggleSelection(listType: 'salesCoordinator' | 'hod' | 'reportingManager', itemId: any) {
    const stringId = String(itemId).trim();
    const idx = this.newTeam[listType].indexOf(stringId);
    
    if (idx > -1) {
      this.newTeam[listType].splice(idx, 1);
    } else {
      this.newTeam[listType].push(stringId);
    }
    this.cdr.detectChanges();
  }

  toggleDropdown(field: 'salesCoordinator' | 'hod' | 'reportingManager', event: Event) {
    event.stopPropagation(); // Prevents click target bubble logic from closing dropdown immediately
    
    if (field === 'salesCoordinator') {
      this.dropdownStatus.hod = false;
      this.dropdownStatus.reportingManager = false;
      this.dropdownStatus.salesCoordinator = !this.dropdownStatus.salesCoordinator;
    } else if (field === 'hod') {
      this.dropdownStatus.salesCoordinator = false;
      this.dropdownStatus.reportingManager = false;
      this.dropdownStatus.hod = !this.dropdownStatus.hod;
    } else if (field === 'reportingManager') {
      this.dropdownStatus.salesCoordinator = false;
      this.dropdownStatus.hod = false;
      this.dropdownStatus.reportingManager = !this.dropdownStatus.reportingManager;
    }
  }
  
  saveTeam() { 
    if (this.newTeam.teamName.trim()) {
      const upperTeamName = this.newTeam.teamName.trim().toUpperCase();

      // Convert selected IDs arrays to standard backend comma separated strings
      const payload: any = { 
        teamName: upperTeamName,
        salesCoordinator: this.newTeam.salesCoordinator.join(', '),
        hod: this.newTeam.hod.join(', '),
        reportingManager: this.newTeam.reportingManager.join(', ')
      };

      if (this.isEditMode && this.selectedTeamId) {
        payload.id = this.selectedTeamId;
        this.http.put(`${this.apiUrl}/${this.selectedTeamId}`, payload).subscribe({
          next: () => this.handleSuccess(),
          error: (err) => console.error('Update team failed:', err)
        });
      } else {
        this.http.post(this.apiUrl, payload).subscribe({
          next: () => this.handleSuccess(),
          error: (err) => {
            console.error('Add team failed:', err);
            alert('Cannot add team!');
          }
        });
      }
    }
  }

  private handleSuccess() {
    this.fetchTeams();
    this.closeModal();
    this.cdr.detectChanges();
  }
  
  deleteTeam(id: number) {
    if(confirm('Are you sure you want to delete this Team?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.fetchTeams();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Delete failed', err)
      });
    }
  }
}