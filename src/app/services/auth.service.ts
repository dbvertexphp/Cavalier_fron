import { Injectable, inject } from '@angular/core';
// 🔥 HttpHeaders import karna zaroori hai
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  // Yeh API se directly check karega aur Token bhi bhejega
  checkSessionStatus(): Observable<boolean> {
    
    // 🔥 1. LocalStorage se apna cavalier_token nikaalo
    const token = localStorage.getItem('cavalier_token');

    // 🔥 2. Headers set karo taaki API ko token mil jaye
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // 🔥 3. API call me { headers } pass kar do
    return this.http.get<any>(`${environment.apiUrl}/Auth/checkstatus`, { headers }).pipe(
      map(response => {
        // Agar backend ne bola success, toh true
        if (response && response.status === 'success') {
          return true;
        }
        return false;
      }),
      catchError((error) => {
        // Agar 401 Unauthorized aaya (token expire ya galat), toh false
        console.error("Session check failed:", error.message);
        return of(false);
      })
    );
  }
}