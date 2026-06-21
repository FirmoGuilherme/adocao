import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { AuthService, User } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  template: `
    <div class="min-h-screen flex flex-col bg-background">
      <nav class="bg-surface shadow-soft sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center space-x-2 cursor-pointer" routerLink="/">
              <span class="text-primary text-2xl">🐶</span>
              <span class="font-bold text-xl tracking-tight text-gray-900">AdoCão</span>
            </div>
            <div class="hidden md:flex items-center space-x-6">

              <!-- Not logged in -->
              <ng-container *ngIf="!currentUser">
                <a routerLink="/explore" class="text-gray-600 hover:text-primary transition-colors font-medium">Explorar Pets</a>
                <a routerLink="/education" class="text-gray-600 hover:text-primary transition-colors font-medium">Academia</a>
                <a routerLink="/auth/login" class="text-gray-600 hover:text-primary transition-colors font-medium">Entrar</a>
                <a routerLink="/auth/signup" class="btn-primary pointer">Cadastrar</a>
              </ng-container>

              <!-- Logged in as adopter -->
              <ng-container *ngIf="currentUser?.role === 'adopter'">
                <a routerLink="/explore" class="text-gray-600 hover:text-primary transition-colors font-medium">Explorar Pets</a>
                <a routerLink="/profile" class="text-gray-600 hover:text-primary transition-colors font-medium">Meu Perfil</a>
                <a routerLink="/dashboard/adopter" class="text-gray-600 hover:text-primary transition-colors font-medium">Meu Painel</a>
                <span class="text-sm text-gray-500">Olá, {{currentUser?.name}}</span>
                <button (click)="logout()" class="text-gray-600 hover:text-red-500 transition-colors font-medium text-sm">Sair</button>
              </ng-container>

              <!-- Logged in as shelter/ONG -->
              <ng-container *ngIf="currentUser?.role === 'shelter'">
                <a routerLink="/dashboard/shelter" class="text-gray-600 hover:text-primary transition-colors font-medium">Meu Painel</a>
                <a routerLink="/dashboard/shelter/add-pet" class="text-gray-600 hover:text-primary transition-colors font-medium">Cadastrar Pet</a>
                <span class="text-sm text-gray-500">🏢 {{currentUser?.name}}</span>
                <button (click)="logout()" class="text-gray-600 hover:text-red-500 transition-colors font-medium text-sm">Sair</button>
              </ng-container>

              <!-- Logged in as admin -->
              <ng-container *ngIf="currentUser?.role === 'admin'">
                <a routerLink="/dashboard/admin" class="text-gray-600 hover:text-primary transition-colors font-medium">Painel Admin</a>
                <span class="text-sm text-gray-500">{{currentUser?.name}}</span>
                <button (click)="logout()" class="text-gray-600 hover:text-red-500 transition-colors font-medium text-sm">Sair</button>
              </ng-container>

              <!-- Logged in as volunteer -->
              <ng-container *ngIf="currentUser?.role === 'volunteer'">
                <a routerLink="/dashboard/volunteer" class="text-gray-600 hover:text-primary transition-colors font-medium">Abrigos</a>
                <a routerLink="/profile" class="text-gray-600 hover:text-primary transition-colors font-medium">Meu Perfil</a>
                <span class="text-sm text-gray-500">🤝 {{currentUser?.name}}</span>
                <button (click)="logout()" class="text-gray-600 hover:text-red-500 transition-colors font-medium text-sm">Sair</button>
              </ng-container>

            </div>
          </div>
        </div>
      </nav>

      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>

      <footer class="bg-gray-900 text-gray-300 py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div class="flex items-center space-x-2 text-white mb-4">
              <span class="text-2xl">🐶</span>
              <span class="font-bold text-xl tracking-tight">AdoCão</span>
            </div>
            <p class="text-sm">Conectando adotantes, abrigos e pets resgatados para adoções mais seguras e compatíveis.</p>
          </div>
          <div>
            <h3 class="text-white font-semibold mb-4">Adotar</h3>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/explore" class="hover:text-primary">Explorar Cães</a></li>
              <li><a routerLink="/explore" class="hover:text-primary">Explorar Gatos</a></li>
              <li><a routerLink="/quiz" class="hover:text-primary">Quiz de Compatibilidade</a></li>
            </ul>
          </div>
          <div>
            <h3 class="text-white font-semibold mb-4">Aprender</h3>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/education" class="hover:text-primary">Guia de Adoção</a></li>
              <li><a routerLink="/education" class="hover:text-primary">Cuidados com Pets</a></li>
            </ul>
          </div>
          <div>
            <h3 class="text-white font-semibold mb-4">Legal</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-primary">Termos de Uso</a></li>
              <li><a href="#" class="hover:text-primary">Política de Privacidade</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class AppComponent implements OnInit {
  title = 'adocao-frontend';
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
