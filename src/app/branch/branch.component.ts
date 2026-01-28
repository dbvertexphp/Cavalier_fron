import { Component, OnInit } from '@angular/core';
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
  selectedBranch: any = null; // Radio (Modify) ke liye
  selectedBranches: any[] = []; // Checkbox (Delete) ke liye

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

  // 1. Add Branch Logic
  addBranch() {
    this.router.navigate(['/dashboard/branch-form'], { 
      state: { isBranch: true, isEdit: false } 
    });
  }

  // 2. Modify Branch Logic (FIXED)
  modifyBranch() {
    // Step A: Agar selection mode on nahi hai, toh radio buttons dikhayein
    if (!this.showSelection || this.selectionType !== 'radio') {
      this.showSelection = true;
      this.selectionType = 'radio';
      this.selectedBranches = []; // Clear any previous checkbox selections
      alert("Please select a branch using the radio button and click Modify again.");
      return;
    }

    // Step B: Agar selection mode on hai aur branch select ho gayi hai
    if (this.selectedBranch) {
      console.log("Navigating with data:", this.selectedBranch);
      this.router.navigate(['/dashboard/branch-form'], { 
        state: { 
          data: this.selectedBranch, 
          isEdit: true, 
          isBranch: true 
        } 
      });
    } else {
      alert("Please select a branch to modify.");
    }
  }

  // 3. Delete Branch Logic
  deleteBranch() {
    if (!this.showSelection || this.selectionType !== 'checkbox') {
      this.showSelection = true;
      this.selectionType = 'checkbox';
      this.selectedBranch = null; 
    } 
    else if (this.selectedBranches.length > 0) {
      if (confirm(`Are you sure you want to delete ${this.selectedBranches.length} branch(es)?`)) {
        this.loading = true;
        
        const deleteRequests = this.selectedBranches.map(b => 
          this.branchService.deleteBranch(b.id).toPromise()
        );

        Promise.all(deleteRequests)
          .then(() => {
            alert('Selection deleted successfully');
            this.getBranches();
          })
          .catch(err => {
            alert('Error deleting some branches. Check if they are linked to users.');
            this.loading = false;
          });
      }
    } else {
      alert("Please select at least one branch to delete.");
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

  resetSelection() {
    this.showSelection = false;
    this.selectionType = null;
    this.selectedBranch = null;
    this.selectedBranches = [];
  }
}