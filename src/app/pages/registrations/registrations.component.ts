import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registrations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrations.component.html'
})
export class RegistrationsComponent {
  // Legacy data from image
  registrations = [
    { type: 'CIN NO', branch: '', regNo: 'U74999HR2015PTC056411', validDate: '17-Aug-2015', validUpto: '' },
    { type: 'GSTIN', branch: 'DELHI', regNo: '07AAGCC1465N1ZE', validDate: '', validUpto: '' },
    { type: 'PAN NO', branch: '', regNo: 'AAGCC1465N', validDate: '', validUpto: '' },
    { type: 'TAN NO', branch: 'DELHI', regNo: 'RTKC04011A', validDate: '', validUpto: '' },
    { type: 'GSTIN', branch: 'TAMILNADU', regNo: '33AAGCC1465N1ZJ', validDate: '27-Apr-2022', validUpto: '' },
  ];

  onAction(type: string) {
    console.log(`${type} clicked`);
  }
}