import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
  
  private apiUrl = environment.apiUrl + '/Teams';
  teams: any[] = [];
  newTeam = { teamName: '' };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchTeams();
  }

  fetchTeams() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => this.teams = data,
      error: (err) => console.error('Error fetching teams', err)
    });
  }

  openModal() { 
    this.isEditMode = false;
    this.newTeam = { teamName: '' };
    this.isModalOpen = true; 
  }

  editTeam(team: any) {
    this.isEditMode = true;
    this.selectedTeamId = team.id;
    this.newTeam = { teamName: team.teamName };
    this.isModalOpen = true;
  }

  closeModal() { 
    this.isModalOpen = false; 
    this.selectedTeamId = null;
  }
  
  saveTeam() { 
    if (this.newTeam.teamName.trim()) {
      // Logic: Convert to UPPERCASE before saving
      const upperTeamName = this.newTeam.teamName.trim().toUpperCase();

      if (this.isEditMode && this.selectedTeamId) {
        // PUT API Call for Updating Team
        const payload = { id: this.selectedTeamId, teamName: upperTeamName };
        this.http.put(`${this.apiUrl}/${this.selectedTeamId}`, payload).subscribe({
          next: () => {
            this.fetchTeams();
            this.closeModal();
          },
          error: (err) => console.error('Update team failed:', err)
        });
      } else {
        // POST API Call for Adding Team
        const payload = { teamName: upperTeamName };
        this.http.post(this.apiUrl, payload).subscribe({
          next: () => {
            this.fetchTeams();
            this.closeModal();
          },
          error: (err) => {
            console.error('Add team failed:', err);
            alert('Cannot add team!');
          }
        });
      }
    }
  }
  
  deleteTeam(id: number) {
    if(confirm('Are you sure you want to delete this Team?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => this.fetchTeams(),
        error: (err) => console.error('Delete failed', err)
      });
    }
  }
}