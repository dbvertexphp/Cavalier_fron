/*import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/User`; 

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/list`);
  }
 // Baki functions ke saath niche ye add karein

  registerUser(userData: any): Observable<any> {
    const formData = this.convertToFormData(userData);
    return this.http.post(`${this.apiUrl}/register`, formData);
  }

  updateUser(userData: any): Observable<any> {
    const formData = this.convertToFormData(userData);
    return this.http.put(`${this.apiUrl}/update`, formData);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }

  private convertToFormData(data: any): FormData {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value, value.name);
        } else if (value instanceof Date) {
          formData.append(key, value.toISOString().split('T')[0]);
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    return formData;
  }
}*/

/*import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/User`; 

  constructor(private http: HttpClient) { }
        // user.service.ts mein ye method add karein
  // Purana code: return this.http.post(`${this.apiUrl}/add-department`, { name: name });
// Naya code (Sirf string bhejei
  // ✅ Get All Users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/list`);
  }
    addDepartment(deptName: string): Observable<any> {
    // Is path ko backend ke route se match karein
    return this.http.post(`${this.apiUrl}/User/add-department`, { name: deptName });
  }
  // ✅ Dropdown Data: Departments
  getDepartments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/departments`);
  }

  // ✅ Dropdown Data: Designations
  getDesignations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/designations`);
  }

  // ✅ Register New User
  registerUser(userData: any): Observable<any> {
    const formData = this.convertToFormData(userData);
    return this.http.post(`${this.apiUrl}/register`, formData);
  }

  // ✅ Update Existing User
  updateUser(userData: any): Observable<any> {
    const formData = this.convertToFormData(userData);
    return this.http.put(`${this.apiUrl}/update`, formData);
  }

  // ✅ Delete User
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }
  

  // ✅ Helper to convert Object to FormData (Required for File Uploads)
  private convertToFormData(data: any): FormData {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value, value.name);
        } else if (value instanceof Date) {
          formData.append(key, value.toISOString().split('T')[0]);
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    return formData;
  }
}*/

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Base URL: e.g., http://localhost:5000/api/User
  private apiUrl = `${environment.apiUrl}/User`; 

  constructor(private http: HttpClient) { }

  // 1. ✅ Get All Users (Table ke liye)
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/list`);
  }
  // user.service.ts mein ye add karein

deleteDepartment(id: number): Observable<any> {
  // Aapke backend route ke hisaab se: delete-department/{id}
  return this.http.delete(`${this.apiUrl}/delete-department/${id}`);
}

  // 2. ✅ Add Department (Dynamic Database Save)
  addDepartment(deptName: string): Observable<any> {
    // Backend Model 'Department' expect kar raha hai jisme 'Name' property hai
    return this.http.post(`${this.apiUrl}/add-department`, { name: deptName });
  }

  // 3. ✅ Get Departments (Dropdown aur Cards ke liye)
  getDepartments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/departments`);
  }

  // 4. ✅ Get Designations (Dropdown ke liye)
  getDesignations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/designations`);
  }

  // 5. ✅ Add Designation
  addDesignation(designationData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-designation`, designationData);
  }

  // 6. ✅ Register New User (With File Upload Support)
  registerUser(userData: any): Observable<any> {
    const formData = this.convertToFormData(userData);
    return this.http.post(`${this.apiUrl}/register`, formData);
  }

  // 7. ✅ Update Existing User
  updateUser(userData: any): Observable<any> {
    const formData = this.convertToFormData(userData);
    return this.http.put(`${this.apiUrl}/update`, formData);
  }

  // 8. ✅ Delete User
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }

  /**
   * 🛠 Helper: Object ko FormData mein convert karne ke liye
   * Kyunki aap user ki image (file) bhi bhej rahe honge shayad.
   */
  private convertToFormData(data: any): FormData {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value, value.name);
        } else if (value instanceof Date) {
          formData.append(key, value.toISOString().split('T')[0]);
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    return formData;
  }
}