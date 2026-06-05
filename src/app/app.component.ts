import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from './services/notification.service';
import { ToastrModule } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, ToastrModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'Cavalier Logistics Dashboard';

  constructor(
    private router: Router,
    private notification: NotificationService
  ) {}

  async ngOnInit(): Promise<void> {
    // 1. Framework validation check block execution parameters allocation
    const isAdminLoggedIn = localStorage.getItem('adminlogin');

    if (isAdminLoggedIn !== '1') {
      this.router.navigate(['']);
      return; // Navigation sequence break safety check loop
    }

    // 2. Notification subscription loop initialization setup logic mapping array parameters
    const token = await this.notification.init();
    console.log("📊 System Startup Validation Verification Parameter - TOKEN:", token);

    // 3. Keep listening for real-time foreground updates streaming channel active
    this.notification.listen();
  }
}