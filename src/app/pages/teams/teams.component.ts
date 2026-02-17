import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

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
  
  private apiUrl = 'http://localhost:5000/api/Teams';
  teams: any[] = [];
  newTeam = { teamName: '' };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchTeams();
  }

  fetchTeams() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.teams = data;
        this.cdr.detectChanges(); // UI Sync
      },
      error: (err) => console.error('Error fetching teams', err)
    });
  }

  openModal() { 
    this.isEditMode = false;
    this.newTeam = { teamName: '' };
    this.isModalOpen = true; 
    this.cdr.detectChanges();
  }

  editTeam(team: any) {
    this.isEditMode = true;
    this.selectedTeamId = team.id;
    this.newTeam = { teamName: team.teamName };
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  closeModal() { 
    this.isModalOpen = false; 
    this.selectedTeamId = null;
    this.cdr.detectChanges();
  }
  
  saveTeam() { 
    if (this.newTeam.teamName.trim()) {
      const upperTeamName = this.newTeam.teamName.trim().toUpperCase();

      if (this.isEditMode && this.selectedTeamId) {
        const payload = { id: this.selectedTeamId, teamName: upperTeamName };
        this.http.put(`${this.apiUrl}/${this.selectedTeamId}`, payload).subscribe({
          next: () => this.handleSuccess(),
          error: (err) => console.error('Update team failed:', err)
        });
      } else {
        const payload = { teamName: upperTeamName };
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