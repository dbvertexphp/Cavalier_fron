import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener, ViewChild, ElementRef, AfterViewInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-ecommerce',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ecommerce.component.html',
})
export class EcommerceComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('revenueCanvas') private revenueCanvas!: ElementRef<HTMLCanvasElement>;

  lastLoginUser: any = null;
  loginTime: string = '';
  currentTotal: string = '12.5L';
  chart: Chart | undefined;

  timeLeft: number = 0; 
  interval: any;
  displayTime: string = "20:00"; 
  private readonly TIMER_KEY = 'session_expiry_time';
  private idleTimeout: any;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  @HostListener('document:mousemove') 
  @HostListener('document:click')
  @HostListener('document:keydown')
  @HostListener('document:scroll')
  resetUserActivity() {
    this.stopTimer();
    this.displayTime = "20:00";
    localStorage.removeItem(this.TIMER_KEY); 

    if (this.idleTimeout) clearTimeout(this.idleTimeout);

    this.idleTimeout = setTimeout(() => {
      this.startTimer();
    }, 5000);
  }

  ngOnInit() {
    const storedName = localStorage.getItem('userName');
    
    if (storedName) {
      this.lastLoginUser = {
        userName: storedName,
        email: 'admin@cavalierlogistics.in'
      };
    } else {
      this.lastLoginUser = {
        userName: 'Admin User',
        email: 'admin@cavalierlogistic.in'
      };
    }
    
    this.loginTime = new Date().toLocaleString('en-US', { 
      day: '2-digit', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', hour12: true
    });

    this.resetUserActivity();
  }

  ngAfterViewInit(): void {
    this.initRevenueChart();
  }

initRevenueChart(): void {
  if (!this.revenueCanvas) return;
  const ctx = this.revenueCanvas.nativeElement.getContext('2d');
  if (!ctx) return;

  const gradient = ctx.createLinearGradient(0, 0, 0, 200);
  gradient.addColorStop(0, 'rgba(101, 78, 81, 0.35)');
  gradient.addColorStop(1, 'rgba(101, 78, 81, 0.0)');

  this.chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['01 Jul', '05 Jul', '10 Jul', '15 Jul', '20 Jul', '25 Jul', '30 Jul'],
      datasets: [{
        label: 'Revenue (₹)',
        data: [350000, 520000, 600000, 1250000, 890000, 950000, 1100000],
        borderColor: '#654E51',
        borderWidth: 3,
        backgroundColor: gradient,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#654E51',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: '#654E51',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#654E51',
          titleFont: { size: 10, weight: 'bold' },
          bodyFont: { size: 12, weight: 'bold' },
          padding: 10,
          cornerRadius: 10,
          displayColors: false,
          callbacks: {
            label: (context) => '₹' + Number(context.raw).toLocaleString('en-IN')
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#9ca3af', font: { size: 10, weight: 600 } } // FIXED: Removed quotes from '600'
        },
        y: {
          grid: { color: '#f1f5f9' },
          ticks: {
            color: '#9ca3af',
            font: { size: 10, weight: 600 }, // FIXED: Removed quotes from '600'
            callback: (value) => (Number(value) / 100000) + 'L'
          },
          beginAtZero: true
        }
      }
    }
  });
}

  onRangeChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (!this.chart) return;

    if (selectedValue === 'last_month') {
      this.currentTotal = '9.8L';
      this.chart.data.labels = ['01 Jun', '05 Jun', '10 Jun', '15 Jun', '20 Jun', '25 Jun', '30 Jun'];
      this.chart.data.datasets[0].data = [200000, 410000, 550000, 980000, 750000, 820000, 910000];
    } else {
      this.currentTotal = '12.5L';
      this.chart.data.labels = ['01 Jul', '05 Jul', '10 Jul', '15 Jul', '20 Jul', '25 Jul', '30 Jul'],
      this.chart.data.datasets[0].data = [350000, 520000, 600000, 1250000, 890000, 950000, 1100000];
    }
    this.chart.update();
  }

  startTimer() {
    const sessionExpiry = localStorage.getItem(this.TIMER_KEY);
    let endTime: number;
    const now = Date.now();

    if (sessionExpiry && parseInt(sessionExpiry, 10) > now) {
      endTime = parseInt(sessionExpiry, 10);
    } else {
      endTime = now + (20 * 60 * 1000); 
      localStorage.setItem(this.TIMER_KEY, endTime.toString());
    }

    if (this.interval) clearInterval(this.interval);

    this.interval = setInterval(() => {
      const currentTime = Date.now();
      this.timeLeft = endTime - currentTime;

      if (this.timeLeft > 0) {
        const minutes = Math.floor(this.timeLeft / 60000);
        const seconds = Math.floor((this.timeLeft % 60000) / 1000);
        this.displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.cdr.detectChanges(); 
      } else {
        this.handleLogout(); 
      }
    }, 50); 
  }

  refreshTimer() {
    const newEndTime = Date.now() + (20 * 60 * 1000);
    localStorage.setItem(this.TIMER_KEY, newEndTime.toString());
    this.startTimer();
  }

  handleLogout() {
    this.stopTimer();
    this.displayTime = "00:00";
    localStorage.removeItem(this.TIMER_KEY);
    localStorage.removeItem('cavalier_token'); 
    this.router.navigate(['/']); 
  }

  stopTimer() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  ngOnDestroy() {
    this.stopTimer();
    if (this.idleTimeout) clearTimeout(this.idleTimeout);
    if (this.chart) this.chart.destroy();
  }
}