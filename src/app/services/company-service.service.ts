import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CompanyServiceOption {
  id: number;
  serviceName: string;
  status: string; // 'Active' | 'Inactive'
}

@Injectable({ providedIn: 'root' })
export class CompanyServiceApiService {
  private apiUrl = environment.apiUrl + '/CompanyService';

  private activeServicesSubject = new BehaviorSubject<CompanyServiceOption[]>([]);
  activeServices$ = this.activeServicesSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadActiveServices(): Observable<CompanyServiceOption[]> {
    return this.http.get<CompanyServiceOption[]>(this.apiUrl).pipe(
      tap(res => {
        // Only "Active" services are valid as a Line of Business selection.
        const active = res.filter(s => s.status === 'Active');
        this.activeServicesSubject.next(active);
      }),
      catchError(err => {
        console.error('Error loading company services', err);
        this.activeServicesSubject.next([]);
        return of([]);
      })
    );
  }
}