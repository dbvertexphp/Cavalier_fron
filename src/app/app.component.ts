import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from './services/notification.service';
import { ToastrModule } from 'ngx-toastr';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule,ToastrModule],
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
     const token = await this.notification.init();

    console.log("TOKEN:", token);

    this.notification.listen();

    const isAdminLoggedIn = localStorage.getItem('adminlogin');

    if (isAdminLoggedIn !== '1') {
      this.router.navigate(['']);
    }
  }
}