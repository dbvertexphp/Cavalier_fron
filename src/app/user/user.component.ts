import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent {

  users = [
  {
    name: 'Admin User',
    role: 'User Admin',
    department: 'Administration',
    licenseType: 'Enterprise',
    country: 'India',
    dob: '1995-08-15',
    gender: 'Male',
    userType: 'Internal',
    reportTo: 'Super Admin',
    status: true,
    ipAddress: '192.168.1.10',
    telephone: '011-23345678',
    mobile: '+91-9876543210',
    profilePicture: 'https://testingbot.com/free-online-tools/random-avatar/128?u=1'
  },
  {
    name: 'John Doe',
    role: 'Manager',
    department: 'Sales',
    licenseType: 'Standard',
    country: 'India',
    dob: '1990-05-22',
    gender: 'Male',
    userType: 'External',
    reportTo: 'Admin User',
    status: true,
    ipAddress: '192.168.1.11',
    telephone: '011-22334455',
    mobile: '+91-9876543211',
    profilePicture: 'https://testingbot.com/free-online-tools/random-avatar/128?u=2'
  },
  {
    name: 'Jane Smith',
    role: 'Support',
    department: 'IT',
    licenseType: 'Enterprise',
    country: 'India',
    dob: '1992-11-08',
    gender: 'Female',
    userType: 'Internal',
    reportTo: 'Admin User',
    status: false,
    ipAddress: '192.168.1.12',
    telephone: '011-33445566',
    mobile: '+91-9876543212',
    profilePicture: 'https://testingbot.com/free-online-tools/random-avatar/128?u=3'
  },
  {
    name: 'Alice Johnson',
    role: 'Designer',
    department: 'Marketing',
    licenseType: 'Standard',
    country: 'India',
    dob: '1994-07-30',
    gender: 'Female',
    userType: 'External',
    reportTo: 'John Doe',
    status: true,
    ipAddress: '192.168.1.13',
    telephone: '011-44556677',
    mobile: '+91-9876543213',
    profilePicture: 'https://testingbot.com/free-online-tools/random-avatar/128?u=4'
  },
  {
    name: 'Bob Brown',
    role: 'Tester',
    department: 'QA',
    licenseType: 'Enterprise',
    country: 'India',
    dob: '1988-12-19',
    gender: 'Male',
    userType: 'Internal',
    reportTo: 'Jane Smith',
    status: true,
    ipAddress: '192.168.1.14',
    telephone: '011-55667788',
    mobile: '+91-9876543214',
    profilePicture: 'https://testingbot.com/free-online-tools/random-avatar/128?u=5'
  },
  {
    name: 'Charlie Green',
    role: 'Support',
    department: 'Customer Service',
    licenseType: 'Standard',
    country: 'India',
    dob: '1993-03-05',
    gender: 'Male',
    userType: 'External',
    reportTo: 'Alice Johnson',
    status: false,
    ipAddress: '192.168.1.15',
    telephone: '011-66778899',
    mobile: '+91-9876543215',
    profilePicture: 'https://testingbot.com/free-online-tools/random-avatar/128?u=6'
  }
];


  showCheckbox = false;
  selectionType: 'checkbox' | 'radio' | null = null;
  selectedUser: any = null; // for modify radio selection
  selectedUsers: any[] = []; // for delete checkbox selection

  addUser() {
    alert('Working, please wait for some time…');
  }

  deleteUser() {
    this.showCheckbox = true;
    this.selectionType = 'checkbox';
  }

  modifyUser() {
    this.showCheckbox = true;
    this.selectionType = 'radio';
  }

  toggleSelection(user: any, event: any) {
    if (this.selectionType === 'checkbox') {
      if (event.target.checked) {
        this.selectedUsers.push(user);
      } else {
        this.selectedUsers = this.selectedUsers.filter(u => u !== user);
      }
    } else if (this.selectionType === 'radio') {
      this.selectedUser = user;
    }
  }
}
