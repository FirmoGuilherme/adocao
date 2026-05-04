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
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Entrar na sua conta</h2>
        </div>
        
        <form class="mt-8 space-y-6" (ngSubmit)="onSubmit()">
          
          <div *ngIf="error" class="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
            {{error}}
          </div>

          <div class="rounded-md shadow-sm space-y-4">
            <div>
              <label for="email" class="sr-only">E-mail</label>
              <input id="email" name="email" type="email" autocomplete="email" required [(ngModel)]="email"
                class="input-field py-3 text-lg" placeholder="Endereço de e-mail">
            </div>
            <div>
              <label for="password" class="sr-only">Senha</label>
              <input id="password" name="password" type="password" autocomplete="current-password" required [(ngModel)]="password"
                class="input-field py-3 text-lg" placeholder="Sua senha">
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded">
              <label for="remember-me" class="ml-2 block text-sm text-gray-900">Lembrar de mim</label>
            </div>
            <div class="text-sm">
              <a href="#" class="font-medium text-primary hover:text-primary-dark">Esqueceu a senha?</a>
            </div>
          </div>

          <div>
            <button type="submit" [disabled]="loading" class="w-full btn-primary py-3 text-lg flex justify-center items-center">
              <span *ngIf="!loading">Entrar</span>
              <div *ngIf="loading" class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </button>
          </div>
        </form>
        
        <div class="text-center mt-4 text-sm text-gray-600">
          Não tem uma conta? <a routerLink="/auth/signup" class="text-primary font-bold hover:underline">Cadastre-se</a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.loading = true;
    this.error = '';
    
    this.authService.login(this.email, this.password).subscribe({
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
        if (err.status === 0) {
          this.error = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
        } else if (err.status === 401) {
          this.error = 'Senha incorreta. Tente novamente.';
        } else {
          this.error = 'E-mail não encontrado. Verifique ou cadastre-se.';
        }
      }
    });
  }
}
