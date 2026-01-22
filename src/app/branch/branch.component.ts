import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-branch',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './branch.component.html',
  styleUrl: './branch.component.css',
})
export class BranchComponent implements OnInit {

  branches: any[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getBranches();
  }

  getBranches() {
    this.http.get<any>('http://api.cavalierlogistic.graphicsvolume.com/api/branch/list')
      .subscribe({
        next: (res) => {
          // agar API direct array bhej rahi hai
          this.branches = res;
          this.loading = false;
          console.log(this.branches);
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
  }
  
}
