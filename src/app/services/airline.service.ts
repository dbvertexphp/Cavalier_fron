import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })


export class AirlineService {
  private baseUrl = `${environment.apiUrl}/Airline`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Airline[]> {
    return this.http.get<Airline[]>(this.baseUrl);
  }

  getById(id: number): Observable<Airline> {
    return this.http.get<Airline>(`${this.baseUrl}/${id}`);
  }

  create(airline: Airline): Observable<Airline> {
    return this.http.post<Airline>(this.baseUrl, airline);
  }

  update(id: number, airline: Airline): Observable<Airline> {
    return this.http.put<Airline>(`${this.baseUrl}/${id}`, airline);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
export interface Airline {
  id?: number;
  airlineName: string;
  airlineCode: string;
  airlinePrefix: string;
  isActive?: boolean;
  createdDate?: string;
}