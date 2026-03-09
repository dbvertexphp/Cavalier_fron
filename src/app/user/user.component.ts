import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  users: any[] = []; 
  loading = true;
  showCheckbox = false;
  selectionType: 'checkbox' | 'radio' | null = null;
  selectedUser: any = null; 
  selectedUsers: any[] = []; 
  newEmployeeID:any=0;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.loadUsers(); 
  }

//   loadUsers(userType: string = 'all') {
//   this.loading = true;

//   this.userService.getUsers(userType).subscribe({
//     next: (data: any[]) => {
//       this.users = data;
//       this.loading = false;
//       this.resetSelection();
//     },
//     error: (err) => {
//       console.error("Data fetch error:", err);
//       this.loading = false;
//     }
//   });
// }

loadUsers(userType: string = 'all') {
  this.loading = true;

  this.userService.getUsers(userType).subscribe({
    next: (data: any[]) => {
      this.users = data;
      this.loading = false;
      this.resetSelection();

      // --- START GENERATION LOGIC ---
     
      // --- END GENERATION LOGIC ---
    },
    error: (err) => {
      console.error("Data fetch error:", err);
      this.loading = false;
    }
  });
}

/**
 * Logic to find the highest ID in the current list and increment it.
 * Assumes your user object has a numeric property like 'empId'.
 */


  addUser() {
    this.router.navigate(['/dashboard/register-user'], { 
      state: { isEdit: false } 
      
    });
  }

  // ✅ Updated to accept a specific user object from the table
  modifyUser(user?: any) {
    // If a user is passed directly from the table button
    if (user) {
      this.router.navigate(['/dashboard/register-user'], { 
        state: { data: user, isEdit: true } 
      });
      return;
    }

    // Original logic kept for compatibility
    if (this.selectionType !== 'radio' || !this.showCheckbox) {
      this.showCheckbox = true;
      this.selectionType = 'radio';
      this.selectedUsers = [];
      return;
    }

    if (this.selectedUser) {
      this.router.navigate(['/dashboard/register-user'], { 
        state: { data: this.selectedUser, isEdit: true } 
      });
    } else {
      alert("Please select a user to modify.");
    }
  }

  // ✅ Updated to accept a specific ID from the table button
  deleteUser(id?: number) {
    // If an ID is passed directly from the table button
    if (id) {
      if (confirm(`Are you sure you want to delete this user?`)) {
        this.loading = true;
        this.userService.deleteUser(id).subscribe({
          next: () => {
            alert('User deleted successfully');
            this.loadUsers();
          },
          error: (err) => {
            console.error("Delete Error:", err);
            alert('Error deleting user.');
            this.loading = false;
          }
        });
      }
      return;
    }

    // Original logic kept for compatibility
    if (this.selectionType !== 'checkbox' || !this.showCheckbox) {
      this.showCheckbox = true;
      this.selectionType = 'checkbox';
      this.selectedUser = null;
      return;
    }

    if (this.selectedUsers.length > 0) {
      this.confirmDelete();
    } else {
      alert("Please select at least one user to delete.");
    }
  }

  confirmDelete() {
    const count = this.selectedUsers.length;
    if (confirm(`Are you sure you want to delete ${count} user(s)?`)) {
      this.loading = true;
      const deleteRequests = this.selectedUsers.map(u => 
        this.userService.deleteUser(u.id).toPromise()
      );

      Promise.all(deleteRequests).then(() => {
        alert('Users deleted successfully');
        this.loadUsers(); 
      }).catch(err => {
        console.error("Delete Error:", err);
        alert('Error deleting some users.');
        this.loading = false;
      });
    }
  }

  toggleSelection(user: any, event: any) {
    if (this.selectionType === 'checkbox') {
      if (event.target.checked) {
        this.selectedUsers.push(user);
      } else {
        this.selectedUsers = this.selectedUsers.filter(u => u.id !== user.id);
      }
    } else if (this.selectionType === 'radio') {
      this.selectedUser = user;
    }
  }

  resetSelection() {
    this.showCheckbox = false;
    this.selectionType = null;
    this.selectedUser = null;
    this.selectedUsers = [];
  }
  exportToExcel() {
  // 1. Check karein ki users array khali toh nahi hai
  if (!this.users || this.users.length === 0) {
    alert("Niche table mein koi data nahi hai export karne ke liye!");
    return;
  }

  // 2. Data Map karein (Pura data lene ke liye direct array use karein)
  const dataToExport = this.users.map(u => ({
    'Employee Type': u.userType || '-',
    'Employee Code': u.empCode || '-',
    'Full Name': `${u.firstName || ''} ${u.lastName || ''}`.trim(),
    'Email': u.email || '-',
    'Designation': u.designation || '-',
    'Functional Area': u.functionalArea || '-',
    'Contact': u.contactPersonal || '-',
    'Location': u.location || '-',
    'PAN No': u.paN_No || '-',
    'Aadhaar No': u.aadhaarNo || '-',
    'Monthly CTC': u.ctC_Monthly || 0,
    'Joining Date': u.dateOfJoining ? new Date(u.dateOfJoining).toLocaleDateString() : '-',
    'Marital Status': u.maritalStatus || '-',
    'Blood Group': u.bloodGroup || '-',
    'Emergency Contact': u.emergencyContactNo || '-'
  }));

  // 3. XLSX Logic
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
  
  // Column width set karna (Optional: Excel sundar dikhne ke liye)
  const wscols = [
    {wch:15}, {wch:15}, {wch:25}, {wch:25}, {wch:20}, {wch:20}, {wch:15}, {wch:15}
  ];
  ws['!cols'] = wscols;

  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Full Employee List');
  
  // File download trigger karein
  XLSX.writeFile(wb, `Cavalier_Employees_Full_Report_${new Date().toLocaleDateString()}.xlsx`);
}
printTable() {
  if (!this.users || this.users.length === 0) {
    alert("Print karne ke liye data nahi hai!");
    return;
  }

  // 1. Ek naya window open karein
  const printWindow = window.open('', '_blank', 'width=1200,height=800');

  // 2. Table ka HTML structure taiyar karein
  let tableHtml = `
    <html>
      <head>
        <title>Employee Directory - Full Report</title>
        <style>
          body { font-family: sans-serif; margin: 20px; color: #333; }
          h2 { text-align: center; color: #444; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; word-wrap: break-word; }
          th, td { border: 1px solid #ccc; padding: 6px; text-align: left; font-size: 9px; overflow: hidden; }
          th { background-color: #f4f4f4; font-weight: bold; text-transform: uppercase; }
          .emp-type { font-weight: bold; color: #4f46e5; }
          img { width: 30px; height: 30px; border-radius: 50%; object-cover: cover; }
          @page { size: landscape; margin: 10mm; }
        </style>
      </head>
      <body>
        <h2>Employee Directory Report</h2>
        <table>
          <thead>
            <tr>
              <th style="width: 80px;">Code</th>
              <th style="width: 150px;">Name</th>
              <th style="width: 120px;">Designation</th>
              <th style="width: 100px;">Contact</th>
              <th style="width: 200px;">Present Address</th>
              <th style="width: 100px;">PAN/UID</th>
              <th style="width: 80px;">CTC/mo</th>
              <th style="width: 100px;">Emergency</th>
            </tr>
          </thead>
          <tbody>
  `;

  // 3. Loop chala kar saara data rows mein dalein
  this.users.forEach(u => {
    tableHtml += `
      <tr>
        <td>${u.empCode || '-'}</td>
        <td>
          <b>${u.firstName} ${u.lastName}</b><br>
          <small>${u.email}</small>
        </td>
        <td>${u.designation}<br><small>${u.functionalArea}</small></td>
        <td>${u.contactPersonal}<br><small>${u.location}</small></td>
        <td>
          H.No: ${u.presHouseNo}, ${u.presStreet}, ${u.presCity}, ${u.presState}
        </td>
        <td>P: ${u.paN_No}<br>A: ${u.aadhaarNo}</td>
        <td>₹${u.ctC_Monthly}</td>
        <td>${u.emergencyName}<br>${u.emergencyContactNo}</td>
      </tr>
    `;
  });

  tableHtml += `
          </tbody>
        </table>
        <p style="text-align:right; font-size:10px;">Generated on: ${new Date().toLocaleString()}</p>
      </body>
    </html>
  `;

  // 4. Content write karein aur print command dein
  printWindow?.document.write(tableHtml);
  printWindow?.document.close();

  // Thoda wait karein taaki images/styles load ho jayein
  setTimeout(() => {
    printWindow?.print();
    printWindow?.close();
  }, 500);
}
downloadFullPDF() {
  if (!this.users || this.users.length === 0) {
    alert("Download ke liye data nahi hai!");
    return;
  }

  // 1. A3 Size use karenge kyunki data bahut zyada hai
  const doc = new jsPDF('l', 'mm', 'a3');

  // 2. Title & Header
  doc.setFontSize(22);
  doc.setTextColor(101, 78, 81); 
  doc.text('CAVALIER EMPLOYEE MASTER REPORT', 14, 20);

  // 3. Headers taiyar karein (Saare 15+ columns jo aapne maange hain)
  const headers = [[
    'Type', 'Code', 'Name', 'Email', 'Designation', 'Function', 
    'Phone', 'Location', 'Address', 'PAN', 'Aadhaar', 'CTC', 
    'Join Date', 'Blood', 'Emergency', 'Education'
  ]];

  // 4. Data Mapping (Har field ko dhyan se check karke)
  const body = this.users.map(u => [
    u.userType || '-',
    u.empCode || '-',
    `${u.firstName} ${u.lastName}`,
    u.email || '-',
    u.designation || '-',
    u.functionalArea || '-',
    u.contactPersonal || '-',
    u.location || '-',
    `${u.presHouseNo || ''}, ${u.presCity || ''}`, // Address
    u.paN_No || '-',
    u.aadhaarNo || '-',
    u.ctC_Monthly || '0',
    u.dateOfJoining ? new Date(u.dateOfJoining).toLocaleDateString() : '-',
    u.bloodGroup || '-',
    `${u.emergencyName || '-'}\n${u.emergencyContactNo || ''}`,
    `10th:${u.tenthYear}, 12th:${u.twelfthYear}` // Education
  ]);

  // 5. AutoTable Config (Sabse Important Section)
  autoTable(doc, {
    head: headers,
    body: body,
    startY: 30,
    theme: 'grid',
    styles: { 
      fontSize: 7.5,     // Font chhota taaki A3 par fit ho
      cellPadding: 2, 
      overflow: 'linebreak', // Agar text bada ho toh niche aa jaye
      cellWidth: 'auto'
    },
    headStyles: { 
      fillColor: [101, 78, 81], 
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    // Specific Column Widths (Jo columns bade hain unhe jagah di hai)
    columnStyles: {
      2: { cellWidth: 35 }, // Name
      3: { cellWidth: 40 }, // Email
      8: { cellWidth: 50 }, // Address
      14: { cellWidth: 35 } // Emergency
    },
    margin: { top: 30, left: 10, right: 10 },
    // Footer Logic: Isse page number aayega jab table ban chuki hogi
    didDrawPage: (data) => {
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(10);
      doc.text('Page ' + pageCount, data.settings.margin.left, doc.internal.pageSize.height - 10);
    }
  });

  // 6. Direct Download
  doc.save(`Cavalier_Complete_Directory_${new Date().getTime()}.pdf`);
}
}