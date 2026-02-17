import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-cargo-type',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './cargo-type.component.html',
  styleUrl: './cargo-type.component.css',
})
export class CargoTypeComponent implements OnInit {
  // Aapki API URL
  private apiUrl = 'http://localhost:5000/api/CargoType';

  isModalOpen = false;
  isEditMode = false;
  rolesList: any[] = [];

  newRole = {
    id: 0,
    name: '',
    status: true
  };

  showPopup = false;
  roleIdToDelete: number | null = null;

  constructor(private http: HttpClient) {}

<<<<<<< HEAD
  // ngOnInit(): void {
  //   // Refresh hone par LocalStorage se data load karein
  //   const savedData = localStorage.getItem('myCommodityData');
  //   if (savedData) {
  //     this.rolesList = JSON.parse(savedData);
  //   } else {
  //     // Agar first time hai to default data set karein
  //     this.rolesList = [
  //       { id: 1, name: 'Loose', status: true },
  //       { id: 2, name: 'ULD', status: true },
       
  //     ];
      
  //   }
  // }
ngOnInit(): void {
  // Refresh hone par LocalStorage se data load karein
  const savedData = localStorage.getItem('myCommodityData');
  
  if (savedData) {
    const parsedData = JSON.parse(savedData);
    // Data load karte waqt hi Name ko Uppercase mein convert kar rahe hain
    this.rolesList = parsedData.map((item: any) => ({
      ...item,
      name: item.name ? item.name.toUpperCase() : ''
    }));
  } else {
    // Agar first time hai to default data (Pehle se hi Uppercase rakha hai)
    this.rolesList = [
      { id: 1, name: 'LOOSE', status: true },
      { id: 2, name: 'ULD', status: true },
    ];
    // Default data ko bhi uppercase mein save kar dete hain
    this.saveToLocalStorage(); 
=======
  ngOnInit(): void {
    this.getCargoTypes();
>>>>>>> 621835e844dbe242b940aab1ab2dd49df73b2e16
  }
}

<<<<<<< HEAD
// Ek helper function taaki baar-baar save na likhna pade
saveToLocalStorage() {
  localStorage.setItem('myCommodityData', JSON.stringify(this.rolesList));
}
  // --- Helper: LocalStorage mein data save karne ke liye ---
  
=======
  // --- 1. GET DATA FROM API ---
  getCargoTypes() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.rolesList = data;
      },
      error: (err) => console.error('Error fetching data:', err)
    });
  }
>>>>>>> 621835e844dbe242b940aab1ab2dd49df73b2e16

  // --- 2. SAVE / ADD DATA ---
  saveRole() {
    if (this.newRole.name.trim()) {
      if (this.isEditMode) {
        // Edit logic (Abhi sirf UI button hai as per your request)
        console.log("Edit Mode is active, but logic is skipped.");
        this.closeModal();
      } else {
        // Dynamic Add Logic
        const payload = {
          name: this.newRole.name,
          status: this.newRole.status
        };

        this.http.post(this.apiUrl, payload).subscribe({
          next: () => {
            this.getCargoTypes(); // Table refresh karein
            this.closeModal();
          },
          error: (err) => console.error('Error saving cargo:', err)
        });
      }
    }
  }

  // --- 3. DELETE DATA ---
  confirmDelete() {
    if (this.roleIdToDelete !== null) {
      this.http.delete(`${this.apiUrl}/${this.roleIdToDelete}`).subscribe({
        next: () => {
          this.getCargoTypes(); // Table refresh karein
          this.cancelDelete();
        },
        error: (err) => console.error('Error deleting cargo:', err)
      });
    }
  }

  // --- UI Helpers ---
  openModal() {
    this.isEditMode = false;
    this.newRole = { id: 0, name: '', status: true };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.newRole = { id: 0, name: '', status: true };
  }

  deleteRole(id: number) {
    this.roleIdToDelete = id;
    this.showPopup = true;
  }

  cancelDelete() {
    this.roleIdToDelete = null;
    this.showPopup = false;
  }

  editRole(role: any) {
    // Sirf modal khulega, edit functionality static rakhi hai
    this.isEditMode = true;
    this.newRole = { ...role };
    this.isModalOpen = true;
  }
}