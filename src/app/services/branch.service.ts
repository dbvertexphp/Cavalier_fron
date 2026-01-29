/*import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private apiUrl = 'http://localhost:5000/api/branch'; 

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
}*/
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  // Check karein ki aapka Swagger ya API port 5000 hi hai ya kuch aur
  private apiUrl = 'http://localhost:5000/api/branch'; 

  constructor(private http: HttpClient) { }

  // 1. Get List
  getBranches(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/list`);
  }

  // 2. Add/Register Branch (Error 11 Fix)
  // Screenshot mein aap isi method ko call kar rahe hain
  /*addBranch(data: any): Observable<any> {
    // Agar Backend identity column use karta hai, toh yahan se 'id' remove kar sakte hain
    const { id, ...payload } = data; 
    return this.http.post(`${this.apiUrl}/register`, payload);
  }*/
 /*addBranch(data: any): Observable<any> {
  // SQL Identity column ke liye 'id' property ko remove karna zaroori hai
  const { id, ...payload } = data; 
  
  // Controller ke [HttpPost("create")] se match karne ke liye URL fix karein
  return this.http.post(`${this.apiUrl}/create`, payload); 
}*/   /*addBranch(data: any): Observable<any> {
  // 1. SQL Identity error se bachne ke liye 'id' hata dein
  const { id, ...payload } = data; 
  
  // 2. URL ko '/create' karein (pehle shayad /register tha)
  return this.http.post(`${this.apiUrl}/create`, payload); 
}*/



    addBranch(data: any): Observable<any> {
  // Backend ko [Required] fields chahiye jo shayad form mein nahi hain
  const payload = {
    ...data,
    companyName: data.companyName || 'Cavalier Logistics', // Required in Model
    timeZone: data.timeZone || 'Asia/Kolkata',           // Required in Model
    copyDefaultFrom: data.copyDefaultFrom || 'None',     // Required in Model
    isActive: data.isActive ?? true,                     // Model uses IsActive
    // Frontend 'gstin' ko backend 'GSTIN' (uppercase) se match karein agar zaroori ho
    gstin: data.gstin || '' 
  };

  // SQL Identity error se bachne ke liye Id hatao
  const { id, ...finalData } = payload; 
  
  return this.http.post(`${this.apiUrl}/create`, finalData);
}

  // 3. Update Branch
  updateBranch(id: number, branchData: any): Observable<any> {
    // API endpoint check karein: /update/${id} ya sirf /update
    return this.http.put(`${this.apiUrl}/update/${id}`, branchData);
  }

  // 4. Delete Branch
  deleteBranch(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }
  //branch roles 
 // roles fetch karne ke liye naya method
  getRoles(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/roles`);
}




  // Helper: Agar aapko 'createBranch' naam se method chahiye toh isse rakhein, warna hata dein
  createBranch(branchData: any): Observable<any> {
    return this.addBranch(branchData);
  }
}