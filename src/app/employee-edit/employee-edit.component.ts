import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-employee-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-edit.component.html',
  styleUrl: './employee-edit.component.css',
})
export class EmployeeEditComponent implements OnInit {

  employeeForm!: FormGroup;
  employeeId!: string;
  isSubmitting = false;

  // 🔹 Dropdown dummy data (later API se aayega)
  departments = ['HR', 'IT', 'Sales', 'Finance'];
  designations = ['Manager', 'Executive', 'Intern'];
  statuses = ['Active', 'Probation', 'Inactive'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 🔹 Get employee id from route
    this.employeeId = this.route.snapshot.paramMap.get('id') || '';

    // 🔹 Build form
    this.employeeForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      department: ['', Validators.required],
      designation: ['', Validators.required],
      status: ['Active', Validators.required],
      joiningDate: ['', Validators.required],
      shift: ['Morning']
    });

    // 🔹 Load employee data (dummy for now)
    if (this.employeeId) {
      this.loadEmployeeData(this.employeeId);
    }
  }

  // 🔹 Dummy API data load
  loadEmployeeData(id: string) {
    const dummyEmployee = {
      name: 'Rahul Sharma',
      email: 'rahul@gmail.com',
      mobile: '9876543210',
      department: 'IT',
      designation: 'Manager',
      status: 'Active',
      joiningDate: '2024-01-15',
      shift: 'Morning'
    };

    this.employeeForm.patchValue(dummyEmployee);
  }

  // 🔹 Submit form
  onSubmit() {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const payload = {
      id: this.employeeId,
      ...this.employeeForm.value
    };

    console.log('Updated Employee Data:', payload);

    // 🔹 Simulate API call
    setTimeout(() => {
      this.isSubmitting = false;
      alert('Employee updated successfully ✅');
      this.router.navigate(['/dashboard/employees']);
    }, 1000);
  }

  // 🔹 Cancel edit
  onCancel() {
    this.router.navigate(['/dashboard/employees']);
  }
}
