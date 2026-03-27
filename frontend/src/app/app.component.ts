import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  template: `
    <div class="min-h-screen flex flex-col bg-background">
      <!-- Navbar -->
      <nav class="bg-surface shadow-soft sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center space-x-2 cursor-pointer" routerLink="/">
              <span class="text-primary text-2xl">🐶</span>
              <span class="font-bold text-xl tracking-tight text-gray-900">Adocão</span>
            </div>
            
            <div class="hidden md:flex items-center space-x-6">
              <a routerLink="/explore" class="text-gray-600 hover:text-primary transition-colors font-medium">Explore Pets</a>
              <a routerLink="/education" class="text-gray-600 hover:text-primary transition-colors font-medium">Academy</a>
              <a routerLink="/auth/login" class="text-gray-600 hover:text-primary transition-colors font-medium">Log in</a>
              <a routerLink="/auth/signup" class="btn-primary pointer">Sign up</a>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="bg-gray-900 text-gray-300 py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div class="flex items-center space-x-2 text-white mb-4">
              <span class="text-2xl">🐶</span>
              <span class="font-bold text-xl tracking-tight">Adocão</span>
            </div>
            <p class="text-sm">Connecting adopters, shelters, and rescued pets for safer, more compatible adoptions.</p>
          </div>
          <div>
            <h3 class="text-white font-semibold mb-4">Adopt</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-primary">Explore Dogs</a></li>
              <li><a href="#" class="hover:text-primary">Explore Cats</a></li>
              <li><a href="#" class="hover:text-primary">Match Quiz</a></li>
            </ul>
          </div>
          <div>
            <h3 class="text-white font-semibold mb-4">Learn</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-primary">Adoption Guide</a></li>
              <li><a href="#" class="hover:text-primary">Pet Care</a></li>
              <li><a href="#" class="hover:text-primary">Shelters near me</a></li>
            </ul>
          </div>
          <div>
            <h3 class="text-white font-semibold mb-4">Legal</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-primary">Terms of Service</a></li>
              <li><a href="#" class="hover:text-primary">Privacy Policy</a></li>
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
