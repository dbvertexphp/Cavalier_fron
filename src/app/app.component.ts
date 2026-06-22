import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from './services/notification.service';
import { ToastrModule, ToastrService } from 'ngx-toastr'; // 🔥 ToastrService import kiya

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
    private notification: NotificationService,
    private toastr: ToastrService // 🔥 Toastr inject kiya yahan
  ) {}

  async ngOnInit(): Promise<void> {
    const isAdminLoggedIn = localStorage.getItem('adminlogin');

    if (isAdminLoggedIn !== '1') {
      this.router.navigate(['']);
      return;
    }

    // 1. Service initialization & registration sequence
    const token = await this.notification.init();
    console.log("📊 Token validation verify parameters:", token);

    // 2. Core Service background capture handler trigger
    this.notification.listen();

    // 🔥 3. LIVE PIPELINE SUBSCRIPTION FOR TOASTR
    // Jab bhi data stream change hoga, yeh block automatically execute ho jayega
    this.notification.currentMessage.subscribe((payload) => {
      if (payload) {
        console.log('🎉 Toaster Pipeline Triggered with data:', payload);
        
        // Extracting Title and Body fields dynamically
        const title = payload.notification?.title || payload.data?.title || 'Cavalier Notification';
        const body = payload.notification?.body || payload.data?.body || 'New cargo status updated.';

        // 🔥 BOOM! Yeh line actual toaster screen par render karegi
        this.toastr.success(body, title);
      }
    });
  }
}