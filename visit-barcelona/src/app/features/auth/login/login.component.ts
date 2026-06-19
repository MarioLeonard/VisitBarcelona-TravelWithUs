import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'app-login',
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
    NzCheckboxModule,
    NzSpinModule
  ],
  template: `
    <div class="login-container">
      <nz-card class="login-card">
        <h1>Login</h1>
        <p>Welcome to Visit Barcelona</p>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
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
              }
            </ng-template>
          </nz-form-item>

          <nz-form-item>
            <nz-form-control [nzSpan]="24">
              <label nz-checkbox formControlName="rememberMe">
                Remember me
              </label>
            </nz-form-control>
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

          <button
            nz-button
            nzType="primary"
            nzSize="large"
            [disabled]="loginForm.invalid || isLoading()"
            class="login-button"
          >
            <nz-spin *ngIf="isLoading()" nzSimple [nzSize]="'small'"></nz-spin>
            {{ isLoading() ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <p class="register-link">
          Don't have an account?
          <a routerLink="/auth/register">Register here</a>
        </p>

        <div class="demo-credentials">
          <p><strong>Demo Credentials:</strong></p>
          <p>Email: eve.holt@reqres.in</p>
          <p>Password: cityslicka</p>
        </div>
      </nz-card>
    </div>
  `,
  styles: [`
    .login-container {
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

    .login-card {
      width: 100%;
      max-width: 400px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
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

    .login-button {
      width: 100%;
      height: 40px;
      font-size: 16px;
      margin-top: 1rem;
    }

    .register-link {
      text-align: center;
      margin-top: 1rem;
      margin-bottom: 1rem !important;
    }

    .register-link a {
      color: #1890ff;
      text-decoration: none;
    }

    .register-link a:hover {
      text-decoration: underline;
    }

    nz-alert {
      margin-bottom: 1rem;
    }

    .demo-credentials {
      background: #f0f2f5;
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1rem;
      font-size: 0.85rem;
    }

    .demo-credentials p {
      margin: 0.25rem 0;
      text-align: left;
    }

    .demo-credentials strong {
      color: #1890ff;
    }

    /* ── Dark mode ── */
    :host-context(:root.dark-mode) .login-card {
      background: #12122a !important;
      border-color: #2e2e55 !important;
    }

    :host-context(:root.dark-mode) h1 {
      color: #ffffff;
    }

    :host-context(:root.dark-mode) p {
      color: #c0c8e8;
    }

    :host-context(:root.dark-mode) .register-link a {
      color: #69b1ff;
    }

    :host-context(:root.dark-mode) .demo-credentials {
      background: #1e1e3a;
      border: 1px solid #2e2e55;
    }

    :host-context(:root.dark-mode) .demo-credentials p {
      color: #c0c8e8;
    }

    :host-context(:root.dark-mode) .demo-credentials strong {
      color: #69b1ff;
    }

    :host-context(:root.dark-mode) ::ng-deep .ant-form-item-label > label {
      color: #c0c8e8 !important;
    }

    :host-context(:root.dark-mode) ::ng-deep .ant-checkbox-wrapper {
      color: #c0c8e8;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isAuthenticatedUser()) {
      this.router.navigate(['/dashboard']);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password, rememberMe } = this.loginForm.value;

    await this.authService.login({ email, password }, rememberMe);
    
    // Reset loading state since error handling is managed by the service now
    setTimeout(() => this.isLoading.set(false), 500);
  }

  clearError(): void {
    this.errorMessage.set('');
  }
}
