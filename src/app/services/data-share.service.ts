import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataShareService {
  // Initial/Default text
  private sidebarDataSubject = new BehaviorSubject<string>('');
  
  // Is Observable ko Sidebar listen karega
  sidebarData$ = this.sidebarDataSubject.asObservable();

  // Is function se Ecommerce component data bhejega
  updateSidebarText(text: string) {
    this.sidebarDataSubject.next(text);
  }
}