import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common'; // Location add kiya
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-organization-add',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './organization-add.component.html',
  styleUrl: './organization-add.component.css',
})
export class OrganizationAddComponent {

  constructor(private location: Location) {} // Service inject ki

  saveOrg() {
    alert('Organization Saved Successfully!');
    // Save ke baad bhi wapis jaane ke liye:
    // this.location.back();
  }

  // Cancel button ke liye function
  cancel() {
    this.location.back(); // Ye pichle page par bhej dega (Lead/Inquiry/Quotation)
  }
}