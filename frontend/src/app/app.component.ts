import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  template: `
    <div class="min-h-screen flex flex-col bg-background">
      <nav class="bg-surface shadow-soft sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center space-x-2 cursor-pointer" routerLink="/">
              <span class="text-primary text-2xl">🐶</span>
              <span class="font-bold text-xl tracking-tight text-gray-900">Adoção</span>
            </div>
            <div class="hidden md:flex items-center space-x-6">
              <a routerLink="/explore" class="text-gray-600 hover:text-primary transition-colors font-medium">Explorar Pets</a>
              <a routerLink="/education" class="text-gray-600 hover:text-primary transition-colors font-medium">Academia</a>
              <a routerLink="/auth/login" class="text-gray-600 hover:text-primary transition-colors font-medium">Entrar</a>
              <a routerLink="/auth/signup" class="btn-primary pointer">Cadastrar</a>
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
              <span class="font-bold text-xl tracking-tight">Adoção</span>
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
              <li><a href="#" class="hover:text-primary">Abrigos perto de mim</a></li>
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
export class AppComponent {
  title = 'adocao-frontend';
}
