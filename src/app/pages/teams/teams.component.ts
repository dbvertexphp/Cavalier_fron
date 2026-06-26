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
  
  private hodApiUrl = environment.apiUrl + '/User/hod-list';

  teams: any[] = [];
  hodUserList: any[] = []; 

  isMembersModalOpen = false;
  selectedTeamForView: any = null;
  parsedMembersList: string[] = [];

  // 🔥 Updated Dropdown status map
  dropdownStatus = {
    salesCoordinator: false,
    hod: false,
    reportingManager: false,
    quotedBy: false,
    pricingBy: false,
    operations: false,
    account: false
  };

  // 🔥 Track selected IDs for all roles
  newTeam = { 
    teamName: '',
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
    this.dropdownStatus.quotedBy = false;
    this.dropdownStatus.pricingBy = false;
    this.dropdownStatus.operations = false;
    this.dropdownStatus.account = false;
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

  getUserNamesByIds(idsArray: string[]): string[] {
    if (!idsArray || idsArray.length === 0) return [];
    return idsArray.map(id => {
      const user = this.hodUserList.find(u => String(u.id) === String(id));
      return user ? (user.userName || user.name) : `ID: ${id}`;
    });
  }

  displayNamesFromIdsString(idsString: string): string {
    if (!idsString) return '—';
    
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
      reportingManager: [],
      quotedBy: [],
      pricingBy: [],
      operations: [],
      account: []
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
    
    const splitString = (val: any) => val ? String(val).split(',').map((x: string) => x.trim()) : [];

    this.newTeam = { 
      teamName: team.teamName,
      salesCoordinator: splitString(team.salesCoordinator),
      hod: splitString(team.hod),
      reportingManager: splitString(team.reportingManager),
      quotedBy: splitString(team.quotedBy),
      pricingBy: splitString(team.pricingBy),
      operations: splitString(team.operations),
      account: splitString(team.account)
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

  toggleSelection(listType: 'salesCoordinator' | 'hod' | 'reportingManager' | 'quotedBy' | 'pricingBy' | 'operations' | 'account', itemId: any) {
    const stringId = String(itemId).trim();
    const idx = this.newTeam[listType].indexOf(stringId);
    
    if (idx > -1) {
      this.newTeam[listType].splice(idx, 1);
    } else {
      this.newTeam[listType].push(stringId);
    }
    this.cdr.detectChanges();
  }

  toggleDropdown(field: 'salesCoordinator' | 'hod' | 'reportingManager' | 'quotedBy' | 'pricingBy' | 'operations' | 'account', event: Event) {
    event.stopPropagation();
    
    // Close all first
    const currentStatus = this.dropdownStatus[field];
    this.dropdownStatus = {
      salesCoordinator: false,
      hod: false,
      reportingManager: false,
      quotedBy: false,
      pricingBy: false,
      operations: false,
      account: false
    };
    // Toggle current
    this.dropdownStatus[field] = !currentStatus;
  }
  
  saveTeam() { 
    if (this.newTeam.teamName.trim()) {
      const upperTeamName = this.newTeam.teamName.trim().toUpperCase();

      const payload: any = { 
        teamName: upperTeamName,
        salesCoordinator: this.newTeam.salesCoordinator.join(', '),
        hod: this.newTeam.hod.join(', '),
        reportingManager: this.newTeam.reportingManager.join(', '),
        quotedBy: this.newTeam.quotedBy.join(', '),
        pricingBy: this.newTeam.pricingBy.join(', '),
        operations: this.newTeam.operations.join(', '),
        account: this.newTeam.account.join(', ')
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