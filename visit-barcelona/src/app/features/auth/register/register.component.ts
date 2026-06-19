import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { AuthService } from '@app/core/services/auth.service';

// Custom Validators
function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.value;

  if (!password) {
    return null;
  }

  const hasMinLength = password.length >= 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecialChar = /[.!@#$%^&*]/.test(password);

  const passwordValid = hasMinLength && hasUpperCase && hasLowerCase && hasDigit && hasSpecialChar;

  if (!passwordValid) {
    return { passwordStrength: true };
  }

  return null;
}

function passwordMatchValidator(group: FormGroup): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;

  if (password && confirmPassword && password !== confirmPassword) {
    group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }

  const confirmPasswordControl = group.get('confirmPassword');
  if (confirmPasswordControl?.errors?.['passwordMismatch']) {
    confirmPasswordControl.updateValueAndValidity({ emitEvent: false });
  }

  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzAlertModule,
    NzSpinModule
  ],
  template: `
    <div class="register-container">
      <nz-card class="register-card">
        <h1>Create Account</h1>
        <p>Join Visit Barcelona today</p>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <nz-form-item>
            <nz-form-label [nzSpan]="24" nzRequired>First Name</nz-form-label>
            <nz-form-control [nzSpan]="24" [nzErrorTip]="firstNameErrorTemplate">
              <input
                nz-input
                type="text"
                formControlName="firstName"
                placeholder="Enter your first name"
              />
            </nz-form-control>
            <ng-template #firstNameErrorTemplate let-control>
              @if (control.hasError('required')) {
                <span>First name is required</span>
              }
            </ng-template>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzSpan]="24" nzRequired>Last Name</nz-form-label>
            <nz-form-control [nzSpan]="24" [nzErrorTip]="lastNameErrorTemplate">
              <input
                nz-input
                type="text"
                formControlName="lastName"
                placeholder="Enter your last name"
              />
            </nz-form-control>
            <ng-template #lastNameErrorTemplate let-control>
              @if (control.hasError('required')) {
                <span>Last name is required</span>
              }
            </ng-template>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzSpan]="24" nzRequired>Email</nz-form-label>
            <nz-form-control [nzSpan]="24" [nzErrorTip]="emailErrorTemplate">
              <input
                nz-input
                type="email"
                formControlName="email"
                placeholder="Enter your email"
              />
            </nz-form-control>
            <ng-template #emailErrorTemplate let-control>
              @if (control.hasError('required')) {
                <span>Email is required</span>
              } @else if (control.hasError('email')) {
                <span>Please enter a valid email</span>
              }
            </ng-template>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzSpan]="24" nzRequired>Password</nz-form-label>
            <nz-form-control [nzSpan]="24" [nzErrorTip]="passwordErrorTemplate">
              <input
                nz-input
                type="password"
                formControlName="password"
                placeholder="Enter your password"
              />
            </nz-form-control>
            <ng-template #passwordErrorTemplate let-control>
              @if (control.hasError('required')) {
                <span>Password is required</span>
              } @else if (control.hasError('passwordStrength')) {
                <span>Password must contain at least 6 characters, one uppercase letter, one lowercase letter, one digit, and one special character (!@#$%^&*)</span>
              }
            </ng-template>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzSpan]="24" nzRequired>Confirm Password</nz-form-label>
            <nz-form-control [nzSpan]="24" [nzErrorTip]="confirmPasswordErrorTemplate">
              <input
                nz-input
                type="password"
                formControlName="confirmPassword"
                placeholder="Confirm your password"
              />
            </nz-form-control>
            <ng-template #confirmPasswordErrorTemplate let-control>
              @if (control.hasError('required')) {
                <span>Please confirm your password</span>
              } @else if (control.hasError('passwordMismatch')) {
                <span>Passwords do not match</span>
              }
            </ng-template>
          </nz-form-item>

          @if (errorMessage()) {
            <nz-alert
              nzType="error"
              [nzMessage]="errorMessage()"
              nzShowIcon
              [nzCloseable]="true"
              (nzOnClose)="clearError()"
            ></nz-alert>
          }

          @if (successMessage()) {
            <nz-alert
              nzType="success"
              [nzMessage]="successMessage()"
              nzShowIcon
            ></nz-alert>
          }

          <button
            nz-button
            nzType="primary"
            nzSize="large"
            [disabled]="registerForm.invalid || isLoading()"
            class="register-button"
          >
            <nz-spin *ngIf="isLoading()" nzSimple [nzSize]="'small'"></nz-spin>
            {{ isLoading() ? 'Creating Account...' : 'Register' }}
          </button>
        </form>

        <p class="login-link">
          Already have an account?
          <a routerLink="/auth/login">Login here</a>
        </p>
      </nz-card>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: var(--bcn-blue);
      background-image: var(--bg-image);
      background-position: var(--bg-position);
      background-repeat: var(--bg-repeat);
      background-size: var(--bg-size);
      padding: 1rem;
    }

    .register-card {
      width: 100%;
      max-width: 500px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      max-height: 90vh;
      overflow-y: auto;
      border-radius: 12px;
      z-index: 2;
    }

    .auth-logo {
      display: flex;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .logo-icon {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 48px;
      height: 48px;
      background-color: var(--bcn-red);
      color: white;
      border-radius: 8px;
      font-size: 24px;
      font-weight: bold;
    }

    h1 {
      text-align: center;
      margin-bottom: 0.5rem;
      color: var(--bcn-blue);
      font-weight: 600;
    }

    p {
      text-align: center;
      color: #666;
      margin-bottom: 2rem;
    }

    nz-form-item {
      margin-bottom: 1rem;
    }

    .register-button {
      width: 100%;
      height: 40px;
      font-size: 16px;
      margin-top: 1rem;
    }

    .login-link {
      text-align: center;
      margin-top: 1rem;
      margin-bottom: 1rem !important;
    }

    .login-link a {
      color: #1890ff;
      text-decoration: none;
    }

    .login-link a:hover {
      text-decoration: underline;
    }

    nz-alert {
      margin-bottom: 1rem;
    }

    /* ── Dark mode ── */
    :host-context(:root.dark-mode) .register-card {
      background: #12122a !important;
      border-color: #2e2e55 !important;
    }

    :host-context(:root.dark-mode) h1 {
      color: #ffffff;
    }

    :host-context(:root.dark-mode) p {
      color: #c0c8e8;
    }

    :host-context(:root.dark-mode) .login-link a {
      color: #69b1ff;
    }

    :host-context(:root.dark-mode) ::ng-deep .ant-form-item-label > label {
      color: #c0c8e8 !important;
    }
  `]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: passwordMatchValidator
    });
  }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isAuthenticatedUser()) {
      this.router.navigate(['/dashboard']);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { firstName, lastName, email, password } = this.registerForm.value;

    await this.authService.register({ email, password, name: `${firstName} ${lastName}` });
    
    this.isLoading.set(false);
  }

  clearError(): void {
    this.errorMessage.set('');
  }
}
