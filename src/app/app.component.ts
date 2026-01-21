import { Component } from '@angular/core';

import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Cavalier Logistics Dashboard';
    constructor(private router: Router) {}
    ngOnInit(): void {
    const isAdminLoggedIn = localStorage.getItem('adminlogin');

    if (isAdminLoggedIn !== '1') {
      this.router.navigate(['']); // login route
    }
  }
}
