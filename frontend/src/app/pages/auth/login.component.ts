import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-surface p-10 rounded-3xl shadow-soft">
        <div>
          <h2 class="mt-2 flex justify-center text-5xl">🐶</h2>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        </div>
        
        <form class="mt-8 space-y-6" (ngSubmit)="onSubmit()">
          
          <div *ngIf="error" class="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
            {{error}}
          </div>

          <div class="rounded-md shadow-sm space-y-4">
            <div>
              <label for="email" class="sr-only">Email address</label>
              <input id="email" name="email" type="email" autocomplete="email" required [(ngModel)]="email"
                class="input-field py-3 text-lg" placeholder="Email address">
            </div>
            <div>
              <label for="password" class="sr-only">Password</label>
              <input id="password" name="password" type="password" autocomplete="current-password" required
                class="input-field py-3 text-lg" placeholder="Password (mock: any string works)">
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded">
              <label for="remember-me" class="ml-2 block text-sm text-gray-900"> Remember me </label>
            </div>

            <div class="text-sm">
              <a href="#" class="font-medium text-primary hover:text-primary-dark"> Forgot your password? </a>
            </div>
          </div>

          <div>
            <button type="submit" [disabled]="loading" class="w-full btn-primary py-3 text-lg flex justify-center items-center">
              <span *ngIf="!loading">Sign in</span>
              <div *ngIf="loading" class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </button>
          </div>
        </form>
        
        <div class="text-center mt-4 text-sm text-gray-600">
          Don't have an account? <a routerLink="/auth/signup" class="text-primary font-bold hover:underline">Sign up</a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.loading = true;
    this.error = '';
    
    // Very basic backend interaction for the MVP demo
    this.authService.login(this.email).subscribe({
      next: (user) => {
        this.loading = false;
        if (user.role === 'shelter') {
          this.router.navigate(['/dashboard/shelter']);
        } else if (user.role === 'admin') {
          this.router.navigate(['/dashboard/admin']);
        } else {
          this.router.navigate(['/dashboard/adopter']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Invalid email or user not found. (Hint: use marianacosta@email.com)';
      }
    });
  }
}
