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
  getUsers(userType: string = 'all'): Observable<User[]> {
  return this.http.get<User[]>(
    `${this.apiUrl}/list?user_type=${userType}`
  );
}


  // 2. ✅ Delete Department
  deleteDepartment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-department/${id}`);
  }

  // 3. ✅ Add Department (Dynamic Database Save)
  addDepartment(deptName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-department`, { name: deptName });
  }
  // ✅ Update Department logic
updateDepartment(id: number, name: string): Observable<any> {
  const payload = { Id: id, Name: name }; // Sahi PascalCase properties backend ke liye
  return this.http.put(`${this.apiUrl}/update-department`, payload);
}

  // 4. ✅ Get Departments (Dropdown aur Cards ke liye)
  getDepartments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/departments`);
  }

  // 5. ✅ Get Designations (URL FIX: Backend expects 'get-designations')
  getDesignations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get-designations`);
  }

  // 6. ✅ Add Designation
  addDesignation(designationData: any): Observable<any> {
    const payload = {
      Name: designationData.name || designationData.Name,
      DepartmentId: Number(designationData.departmentId || designationData.DepartmentId)
    };
    return this.http.post(`${this.apiUrl}/add-designation`, payload);
  }

  // 7. ✅ Update Designation (NEW)
  updateDesignation(designationData: any): Observable<any> {
    const payload = {
      Id: designationData.id || designationData.Id,
      Name: designationData.name || designationData.Name,
      DepartmentId: Number(designationData.departmentId || designationData.DepartmentId)
    };
    return this.http.put(`${this.apiUrl}/update-designation`, payload);
  }

  // 8. ✅ Delete Designation (NEW)
  deleteDesignation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-designation/${id}`);
  }

  // 9. ✅ Register New User (With File Upload Support)
  registerUser(userData: any): Observable<any> {
    const formData = this.convertToFormData(userData);
    return this.http.post(`${this.apiUrl}/register`, formData);
  }

  // 10. ✅ Update Existing User
  updateUser(userData: any): Observable<any> {
    const formData = this.convertToFormData(userData);
    return this.http.put(`${this.apiUrl}/update`, formData);
  }

  // 11. ✅ Delete User
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }

  // --- ROLE MANAGEMENT LOGIC ---

  // ✅ Get All Roles
  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/roles`);
  }

  // ✅ Add New Role
  addRole(roleData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-role`, roleData);
  }
  // ✅ Update Existing Role
  updateRole(roleData: any): Observable<any> {
    const payload = {
      Id: roleData.id || roleData.Id,
      Name: roleData.name || roleData.Name,
      Status: roleData.status !== undefined ? roleData.status : true
    };
    return this.http.put(`${this.apiUrl}/update-role`, payload);
  }

  // ✅ Delete Role
  deleteRole(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-role/${id}`);
  }

  /**
   * 🛠 Helper: Object ko FormData mein convert karne ke liye
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