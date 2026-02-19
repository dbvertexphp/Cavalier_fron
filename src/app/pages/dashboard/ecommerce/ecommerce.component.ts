
import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ecommerce',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ecommerce.component.html',
})
export class EcommerceComponent implements OnInit, OnDestroy {
  lastLoginUser: any = null;
  loginTime: string = '';

  // Timer Variables
  timeLeft: number = 0; 
  interval: any;
  displayTime: string = "20:00"; 
  private readonly TIMER_KEY = 'session_expiry_time';
  
  // Activity check karne ke liye variable
  private idleTimeout: any;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  // --- User Activity Logic ---
  // Note: mousemove ko commented rakha hai aapki request ke hisaab se
  @HostListener('document:mousemove') 
  @HostListener('document:click')
  @HostListener('document:keydown')
  @HostListener('document:scroll')
  resetUserActivity() {
    // 1. Chalte huye timer ko stop karo
    this.stopTimer();
    
    // 2. Display ko reset karke 20:00 dikhao
    this.displayTime = "20:00";
    localStorage.removeItem(this.TIMER_KEY); 

    // 3. Purana wait clear karo
    if (this.idleTimeout) clearTimeout(this.idleTimeout);

    // 4. AB SIRF 5 SECOND (5000ms) BAAD TIMER SHURU HOGA
    this.idleTimeout = setTimeout(() => {
      this.startTimer();
    }, 5000); // 10 second se badal kar 5 second kar diya hai
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

    // Pehli baar load hone par check shuru karega
    this.resetUserActivity();
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
  }
}