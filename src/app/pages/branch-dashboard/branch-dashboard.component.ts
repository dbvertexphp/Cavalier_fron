import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { BaseChartDirective } from 'ng2-charts'; 
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-branch-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatCardComponent, BaseChartDirective],
  templateUrl: './branch-dashboard.component.html',
  styleUrls: ['./branch-dashboard.component.css']
})
export class BranchDashboardComponent {
  // Mobile sidebar state
  isSidebarOpen: boolean = false;

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // Bar Chart Configuration
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: ['1 AUG', '2 AUG', '3 AUG', '4 AUG', '5 AUG', '6 AUG', '7 AUG', '8 AUG'],
    datasets: [{ 
      data: [20000, 15000, 25000, 18000, 22000, 28000, 32000, 24000], 
      backgroundColor: '#6366f1',
      borderRadius: 10,
      label: 'Revenue'
    }]
  };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }
  };

  // Doughnut Chart Configuration (Using 'any' to fix 'cutout' property error)
  public doughnutChartType: ChartType = 'doughnut';
  public pieChartData: ChartData<'doughnut'> = {
    labels: ['Category A', 'Category B', 'Category C'],
    datasets: [{ 
      data: [300, 150, 100], 
      backgroundColor: ['#fb923c', '#6366f1', '#e2e8f0'] 
    }]
  };

  public pieChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%', // Isse chart modern dikhega
    plugins: { legend: { position: 'bottom' } }
  };
}