import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teams.component.html',
})
export class TeamsComponent implements OnInit {
  
  isModalOpen = false;
  
  // Static Data List
  teams = [
    { id: 1, teamName: 'Logistics Alpha', assignedHod: 'John Doe' },
    { id: 2, teamName: 'Sales Titans', assignedHod: 'Jane Smith' },
    { id: 3, teamName: 'Accounts Core', assignedHod: 'Robert Wilson' }
  ];
  
  // Form fields for Modal
  newTeam = {
    teamName: '',
    assignedHod: ''
  };

  constructor() {}

  ngOnInit(): void {
    // Abhi API call nahi hai, toh seedha data list show hogi
  }

  openModal() { 
    this.newTeam = { teamName: '', assignedHod: '' };
    this.isModalOpen = true; 
  }

  closeModal() { 
    this.isModalOpen = false; 
  }
  
  saveTeam() { 
    if (this.newTeam.teamName.trim() && this.newTeam.assignedHod.trim()) {
      // Naya data list mein push kar rahe hain (Temporary)
      const nextId = this.teams.length + 1;
      this.teams.push({
        id: nextId,
        teamName: this.newTeam.teamName,
        assignedHod: this.newTeam.assignedHod
      });
      
      console.log('Team Added:', this.newTeam);
      this.closeModal();
    }
  }
  
  deleteTeam(id: number) {
    if(confirm('Are you sure you want to delete this Team?')) {
      this.teams = this.teams.filter(t => t.id !== id);
      console.log('Deleted Team ID:', id);
    }
  }
}