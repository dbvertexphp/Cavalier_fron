import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Replace with your actual .NET port (e.g., 5001 or 5000)
  private apiUrl = 'https://localhost:5000/api/auth/login';

  constructor(private http: HttpClient) {}

  login(credentials: any) {
    // This sends the email and password to the .NET Controller
    return this.http.post(this.apiUrl, credentials);
  }
}