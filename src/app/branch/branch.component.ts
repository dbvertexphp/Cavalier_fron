//import { Component, OnInit } from '@angular/common';
import { Component, OnInit } from '@angular/core'; // Yeh @angular/core hona chahiye
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { BranchService } from '../services/branch.service'; 

@Component({
  selector: 'app-branch',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './branch.component.html',
  styleUrl: './branch.component.css',
})
export class BranchComponent implements OnInit {
  branches: any[] = [];
  loading = true;
  
  // Selection Controls
  showSelection = false;
  selectionType: 'checkbox' | 'radio' | null = null;
  selectedBranch: any = null; // Radio (Modify) mode ke liye
  selectedBranches: any[] = []; // Checkbox (Delete) mode ke liye

  constructor(
    private branchService: BranchService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getBranches();
  }

  getBranches() {
    this.loading = true;
    this.branchService.getBranches().subscribe({
      next: (res) => {
        this.branches = res;
        this.loading = false;
        this.resetSelection(); 
      },
      error: (err) => {
        console.error("Fetch Error:", err);
        this.loading = false;
      }
    });
  }

  // 1. Add Branch - Navigates to form with fresh state
  addBranch() {
    this.router.navigate(['/dashboard/branch-form'], { 
      state: { isBranch: true, isEdit: false } 
    });
  }

  // 2. Modify Branch - Radio button selection logic
  modifyBranch() {
    // Agar mode select nahi hai ya checkbox mode mein tha, toh Radio mode on karo
    if (!this.showSelection || this.selectionType !== 'radio') {
      this.showSelection = true;
      this.selectionType = 'radio';
      this.selectedBranches = []; // Clear delete selections
      this.selectedBranch = null;  // Reset previous modify selection
      return;
    }

    // Agar mode on hai aur branch select ho gayi hai
    if (this.selectedBranch) {
      console.log("Modifying branch:", this.selectedBranch.branchName);
      this.router.navigate(['/dashboard/branch-form'], { 
        state: { 
          data: this.selectedBranch, 
          isEdit: true, 
          isBranch: true 
        } 
      });
    } else {
      alert("Please click the radio button for the branch you want to modify.");
    }
  }

  // 3. Delete Branch - Checkbox selection logic
  deleteBranch() {
    // Agar mode select nahi hai ya radio mode mein tha, toh Checkbox mode on karo
    if (!this.showSelection || this.selectionType !== 'checkbox') {
      this.showSelection = true;
      this.selectionType = 'checkbox';
      this.selectedBranch = null; // Clear modify selection
      this.selectedBranches = []; // Reset previous delete selections
      return;
    } 

    // Agar mode on hai aur branches select ho gayi hain
    if (this.selectedBranches.length > 0) {
      const branchNames = this.selectedBranches.map(b => b.branchName).join(', ');
      if (confirm(`Are you sure you want to delete: ${branchNames}?`)) {
        this.loading = true;
        
        // Multi-delete logic
        const deleteRequests = this.selectedBranches.map(b => 
          this.branchService.deleteBranch(b.id).toPromise()
        );

        Promise.all(deleteRequests)
          .then(() => {
            alert('Selected branch(es) deleted successfully.');
            this.getBranches();
          })
          .catch(err => {
            console.error("Delete Error:", err);
            alert('Some branches could not be deleted. They might have active users linked to them.');
            this.loading = false;
          });
      }
    } else {
      alert("Please select at least one checkbox to delete.");
    }
  }

  // Selection toggle handler
  toggleSelection(item: any, event: any) {
    if (this.selectionType === 'checkbox') {
      if (event.target.checked) {
        this.selectedBranches.push(item);
      } else {
        this.selectedBranches = this.selectedBranches.filter(b => b.id !== item.id);
      }
    } else if (this.selectionType === 'radio') {
      this.selectedBranch = item;
    }
  }

  // Reset function to clear UI states
  resetSelection() {
    this.showSelection = false;
    this.selectionType = null;
    this.selectedBranch = null;
    this.selectedBranches = [];
  }
}