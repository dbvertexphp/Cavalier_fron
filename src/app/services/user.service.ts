import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Backend API ka base URL
  private apiUrl = `${environment.apiUrl}/api/User`; 

  constructor(private http: HttpClient) { }

  // 1. Saare Users fetch karne ke liye (List)
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/list`);
  }

  // 2. Naya User Register karne ke liye (Multipart/Form-Data)
  registerUser(userData: any): Observable<any> {
    const formData = this.convertToFormData(userData);
    return this.http.post(`${this.apiUrl}/register`, formData);
  }

  // 3. User update karne ke liye
  // Id ko FormData mein bhi add kiya gaya hai backend compatibility ke liye
  updateUser(id: number, userData: any): Observable<any> {
    const formData = this.convertToFormData(userData);
    
    // Agar backend DTO mein 'Id' field hai, toh ise append karein
    formData.append('Id', id.toString());

    // Backend URL mapping check karein: /update/{id}
    return this.http.put(`${this.apiUrl}/update/${id}`, formData);
  }

  // 4. User delete karne ke liye
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }

  /**
   * Helper function: JSON object ko FormData mein badalne ke liye
   * Backend PascalCase (e.g. FirstName) dhoond raha hai, 
   * isliye hum keys ko properly append karenge.
   */
  private convertToFormData(data: any): FormData {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      const value = data[key];

      if (value !== null && value !== undefined) {
        // Mapping Logic: Agar key 'paN_No' hai toh use 'PAN_No' bhej sakte hain
        // par best practice hai ki components mein hi sahi keys rakhein.
        
        if (value instanceof File) {
          // File (Photo) handle karne ke liye
          formData.append(key, value, value.name);
        } else if (value instanceof Date) {
          formData.append(key, value.toISOString().split('T')[0]); // YYYY-MM-DD format
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    
    return formData;
  }
}