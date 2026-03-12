import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CheckPermissionService {

  permissions:any[] = [];
  isMaster:boolean = false;   // 🔥 MASTER FLAG

  constructor(private http:HttpClient) {}

  // 🔥 API CALL
  loadPermissions(){

    const token = localStorage.getItem('cavalier_token');

    return this.http.get<any>(
      `${environment.apiUrl}/action-permission/user`,
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
      }
    );
  }

  // 🔥 SAVE PERMISSIONS
  setPermissions(data:any){

    console.log('Setting permissions in service:', data);

    // 🚀 MASTER ROLE
    if(data?.role === 'Master'){
      this.isMaster = true;
      this.permissions = [];
      return;
    }

    this.permissions = data;
    this.isMaster = false;

    console.log('Permissions set in service:', this.permissions);
  }

  // 🔥 CHECK PERMISSION
  hasPermission(permissionId:number, action:string){

    // 🚀 MASTER → FULL ACCESS
    if(this.isMaster){
      return true;
    }

    const perm = this.permissions.find(
      (p:any)=>p.permissionId === permissionId
    );

    return perm && perm.actions.includes(action);
  }

}