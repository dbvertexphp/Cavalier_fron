import { Injectable } from '@angular/core';
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
}