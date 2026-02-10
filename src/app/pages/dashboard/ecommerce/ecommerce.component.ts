import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; // ChangeDetectorRef add kiya precision ke liye
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
  displayTime: string = "20:00:00"; 
  private readonly TIMER_KEY = 'session_expiry_time';

  constructor(private router: Router, private cdr: ChangeDetectorRef) {} // Inject cdr

  ngOnInit() {
    const userData = localStorage.getItem('user'); 
    if (userData) {
      this.lastLoginUser = JSON.parse(userData);
    } else {
      this.lastLoginUser = {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@cavalierlogistic.in',
        userType: 'Super Admin'
      };
    }
    
    this.loginTime = new Date().toLocaleString('en-US', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });

    this.startTimer();
  }

  // UPDATED TIMER LOGIC
  startTimer() {
    const sessionExpiry = localStorage.getItem(this.TIMER_KEY);
    let endTime: number;
    const now = Date.now();

    // Logic: Check if valid expiry exists, otherwise set new one
    if (sessionExpiry && parseInt(sessionExpiry, 10) > now) {
      endTime = parseInt(sessionExpiry, 10);
    } else {
      endTime = now + (20 * 60 * 1000); // 20 minutes from now
      localStorage.setItem(this.TIMER_KEY, endTime.toString());
    }

    // Clear existing interval if any
    if (this.interval) clearInterval(this.interval);

    this.interval = setInterval(() => {
      const currentTime = Date.now();
      this.timeLeft = endTime - currentTime;

      if (this.timeLeft > 0) {
        const minutes = Math.floor(this.timeLeft / 60000);
        const seconds = Math.floor((this.timeLeft % 60000) / 1000);
        const milliseconds = Math.floor((this.timeLeft % 1000) / 10);
        
        this.displayTime = 
          `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
        
        // Milliseconds fast chalte hain isliye manual detection help karti hai
        this.cdr.detectChanges(); 
      } else {
        this.stopTimer();
        this.displayTime = "00:00:00";
        localStorage.removeItem(this.TIMER_KEY);
        this.router.navigate(['/']); 
      }
    }, 50); // 50ms is better for performance and visual smoothness
  }

  stopTimer() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  ngOnDestroy() {
    this.stopTimer();
  }
}