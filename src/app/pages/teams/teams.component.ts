import { Component, OnInit } from '@angular/core';
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
      if (this.isEditMode) {
        // Update logic (UI only for now as requested)
        this.closeModal();
      } else {
        this.http.post(this.apiUrl, this.newTeam).subscribe({
          next: () => {
            this.fetchTeams();
            this.closeModal();
          },
          error: (err) => alert('can not add team!')
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