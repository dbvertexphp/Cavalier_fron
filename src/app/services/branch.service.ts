import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private apiUrl = `${environment.apiUrl}/api/branch`;

  constructor(private http: HttpClient) { }

  // 1. Get List
  getBranches(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/list`);
  }
  //Yeh method missing tha (Error 11 fix)
  addBranch(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // 2. Create (Identity Error Fix)
  createBranch(branchData: any): Observable<any> {
    // SQL 'Identity' error se bachne ke liye Id property ko remove karte hain
    const { id, ...payload } = branchData; 
    return this.http.post(`${this.apiUrl}/create`, payload);
  }

  // 3. Update
  updateBranch(id: number, branchData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id}`, branchData);
  }

  // 4. Delete
  deleteBranch(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }
}