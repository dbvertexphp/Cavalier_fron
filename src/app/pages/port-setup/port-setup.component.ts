import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-port-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './port-setup.component.html'
})
export class PortSetupComponent implements OnInit {
  // Filter Fields (Legacy system ke hisaab se)
  searchCountry: string = '';
  searchPortName: string = '';
  searchFunction: string = '';
  quickSearch: string = '';

  // Sample Data
  allPorts = [
    { name: 'Abu Dhabi', code: 'AEAUH', function: '1-345---', country: 'United Arab Emirates' },
    { name: 'Abu Musa', code: 'AEAMU', function: '1-------', country: 'United Arab Emirates' },
    { name: 'Alexandria', code: 'AUALX', function: '--3-----', country: 'Australia' },
    { name: 'Dubai', code: 'AEDXB', function: '1-345---', country: 'United Arab Emirates' },
    { name: 'Melbourne', code: 'AUMEL', function: '12345---', country: 'Australia' },
  ];

  constructor() {}

  ngOnInit(): void {}

  /**
   * Multi-Filter Logic: Ye function saare filters ko ek saath check karega
   */
  get filteredPorts() {
    return this.allPorts.filter(port => {
      const matchCountry = port.country.toLowerCase().includes(this.searchCountry.toLowerCase());
      const matchName = port.name.toLowerCase().includes(this.searchPortName.toLowerCase());
      const matchFunction = port.function.toLowerCase().includes(this.searchFunction.toLowerCase());
      
      // Quick Search sabhi fields mein dhundega
      const matchQuick = !this.quickSearch ? true : (
        port.name.toLowerCase().includes(this.quickSearch.toLowerCase()) ||
        port.code.toLowerCase().includes(this.quickSearch.toLowerCase()) ||
        port.country.toLowerCase().includes(this.quickSearch.toLowerCase())
      );

      return matchCountry && matchName && matchFunction && matchQuick;
    });
  }

  resetFilters() {
    this.searchCountry = '';
    this.searchPortName = '';
    this.searchFunction = '';
    this.quickSearch = '';
  }
}