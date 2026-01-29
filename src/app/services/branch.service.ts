import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private apiUrl = `${environment.apiUrl}/branch`; 

  constructor(private http: HttpClient) { }

  getBranches(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/list`);
  }

  addBranch(data: any): Observable<any> {
    // Backend required fields mapping
    const payload = {
      ...data,
      companyName: data.companyName || 'Cavalier Logistics',
      timeZone: data.timeZone || 'Asia/Kolkata',
      copyDefaultFrom: data.copyDefaultFrom || 'None',
      isActive: data.isActive ?? true,
      gstin: data.gstin || '' 
    };

    // SQL Identity column ke liye 'id' remove karna zaruri hai
    const { id, ...finalData } = payload; 
    return this.http.post(`${this.apiUrl}/create`, finalData);
  }

  updateBranch(id: number, branchData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id}`, branchData);
  }

  deleteBranch(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }

  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/roles`);
  }

  // Alias for addBranch
  createBranch(branchData: any): Observable<any> {
    return this.addBranch(branchData);
  }
}