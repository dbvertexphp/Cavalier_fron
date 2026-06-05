import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CheckPermissionService } from '../services/check-permission.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  branches: any[] = [];
  isBranchDisabled = false;
  loginForm!: FormGroup;
  selectionForm!: FormGroup;

  slides = [0, 1, 2];
  currentSlide = 0;

  isStepTwo = false;

  displayUserName = '';
  displayCompanyName = '';

  roles: string[] = [];
  cities: string[] = [];

  // ✅ Password Toggle Variable
  isPasswordVisible: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private c: ChangeDetectorRef,
    private checkPermission: CheckPermissionService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.selectionForm = this.fb.group({
      selectedRole: [''],
      selectedCity: ['']
    });

    // ⏳ Automatic Image Slider Carousel Loop
    setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    }, 5000);

    // 🔥 LIVE TEST: Console mein sabse pehle dikhayenge ki Firebase context environment ready hai
    this.checkFirebaseStatus();
  }

  // 📡 Debugger Check: Login screen par hi initialization verification print karega
  checkFirebaseStatus(): void {
    try {
      if (environment.firebase && environment.firebase.apiKey) {
        console.log("======================================================");
        console.log("🔥 [SYSTEM CONFIG]: FIREBASE APP LAYER LOADED SUCCESSFULLY!");
        console.log("🚀 VAPID Key Target Active:", environment.vapidKey);
        console.log("======================================================");
      } else {
        console.warn("⚠️ Firebase credentials missing inside environment config file.");
      }
    } catch (e) {
      console.error("❌ Notification instance structural diagnostic warning:", e);
    }
  }

  // ✅ Password Toggle Function
  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  setSlide(index: number): void {
    this.currentSlide = index;
  }

  // 🔐 LOGIN STEP (API BASED)
  onNextStep(): void {
    console.log('clicked next step');

    if (this.loginForm.invalid) {
      alert('Email & Password required');
      return;
    }

    this.http.post<any>(
      `${environment.apiUrl}/Auth/login`,
      this.loginForm.value
    ).subscribe({
      next: async (res) => {
        const user = res.user;
        this.isStepTwo = true;
        this.c.detectChanges();

        this.displayUserName = user.firstName;
        this.displayCompanyName = (user.branches?.[0]?.companyName || '').toUpperCase();

        localStorage.setItem('userName', user.firstName + ' ' + user.lastName);
        localStorage.setItem('firstName', user.firstName);
        localStorage.setItem('lastName', user.lastName);
        localStorage.setItem('gender', user.gender);
        localStorage.setItem('companyName', this.displayCompanyName);
        localStorage.setItem('cavalier_token', res.token);

        const userRole = user.role?.name;

        if (userRole === 'Master') {
          this.roles = [
            'System Administrator',
            'Branch Administrator'
          ];
          this.branches = user.branches || [];
          console.log(this.branches);

          this.selectionForm.patchValue({
            selectedRole: '',
            selectedCity: ''
          });

          this.isBranchDisabled = false;
          this.selectionForm.get('selectedCity')?.enable();

        } else {
          this.roles = ['Branch Administrator'];
          this.branches = user.branches || [];
          console.log(this.branches);

          this.selectionForm.patchValue({
            selectedRole: 'Branch Administrator',
            selectedCity: ''
          });

          this.isBranchDisabled = false;
          this.selectionForm.get('selectedCity')?.enable();
        }

        localStorage.setItem('userRole', user.role.name);

        // ✅ SECURE TIMING MODULE: Token generation workflow tab start hoga jab user aur auth status local storage pe store ho chuka hai
        console.log("🔑 Authentication verified! Triggering FCM Device registration sync pipeline...");
        
        try {
          const fcmToken = await this.notificationService.init();
          
          if (fcmToken) {
            console.log("📡 Token recovered from browser registration hook. Sending to Cavalier database layer...");
            
            this.notificationService.sendFcmToken(fcmToken).subscribe({
              next: (tokenRes) => {
                console.log('✅ Success: FCM token saved successfully onto backend system configuration:', tokenRes);
              },
              error: (tokenErr) => {
                console.error('❌ Error: Token distribution sync rejected by UserFcmToken API controller:', tokenErr);
              }
            });
          } else {
            console.warn("⚠️ Token omitted. Check browser authorization permissions context.");
          }
        } catch (fcmError) {
          console.error("❌ Critical notification loop runtime execution crashed:", fcmError);
        }

        // Active notification listening socket routing handler
        this.notificationService.listen();
      },
      error: (err) => {
        alert(err.error?.message || 'Login Failed');
      }
    });
  }

  onRoleChange(): void {
    const role = this.selectionForm.value.selectedRole;

    if (role === 'System Administrator') {
      this.isBranchDisabled = true; 
      this.selectionForm.patchValue({ selectedCity: '' });
      this.selectionForm.get('selectedCity')?.disable();
    } else {
      this.isBranchDisabled = false;
      this.selectionForm.get('selectedCity')?.enable();
    }
  }

  // 🚀 FINAL SUBMIT
  onFinalSubmit(): void {
    const role = this.selectionForm.value.selectedRole;
    const branch = this.selectionForm.value.selectedCity;

    if (!role) {
      alert('Please select role');
      return;
    }

    if (role === 'Branch Administrator' && !branch) {
      alert('Please select branch');
      return;
    }

    let accessType = '';
    if (role === 'System Administrator') {
      accessType = 'system';
    }
    if (role === 'Branch Administrator') {
      accessType = 'branch';
    }
    const branchId = this.selectionForm.value.selectedCity;

    this.http.post<any>(
      `${environment.apiUrl}/Auth/set-access-type`,
      { accessType, branchId },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('cavalier_token')}`
        }
      }
    ).subscribe({
      next: (res) => {
        localStorage.setItem('cavalier_token', res.token);
        localStorage.setItem('accessType', res.accessType);
        localStorage.setItem('adminlogin', '1');
        localStorage.setItem('selectedRole', role);

        if (accessType === 'branch') {
          localStorage.setItem('selectedBranch', branch);
        }

        // 🚀 LOAD PERMISSIONS BEFORE REDIRECT
        this.checkPermission.loadPermissions().subscribe((perm: any) => {
          console.log("Permissions Loaded:", perm);
          this.checkPermission.setPermissions(perm);
          this.router.navigate(['/dashboard']);
        });
      },
      error: () => {
        alert('Failed to set access type');
      }
    });
  }
}