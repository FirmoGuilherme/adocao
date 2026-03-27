import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Hero Section -->
    <div class="relative bg-surface overflow-hidden">
      <div class="max-w-7xl mx-auto">
        <div class="relative z-10 pb-8 bg-surface sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 pt-20">
          <main class="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div class="sm:text-center lg:text-left">
              <h1 class="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span class="block xl:inline">Find the right pet,</span>
                <span class="block text-primary">responsibly.</span>
              </h1>
              <p class="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Adocão connects adopters, shelters, and rescued pets for safer, more compatible adoptions. We believe every pet deserves a perfect home.
              </p>
              <div class="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div class="rounded-md shadow">
                  <a routerLink="/explore" class="w-full flex items-center justify-center btn-primary text-lg font-medium px-8 py-3">
                    Find a Pet
                  </a>
                </div>
                <div class="mt-3 sm:mt-0 sm:ml-3">
                  <a routerLink="/auth/signup" class="w-full flex items-center justify-center btn-outline text-lg font-medium px-8 py-3">
                    Register a Shelter
                  </a>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div class="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-yellow-50 flex items-center justify-center p-12">
         <!-- Simulated beautiful illustration/image -->
         <div class="rounded-3xl shadow-xl overflow-hidden aspect-video w-full bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')"></div>
      </div>
    </div>

    <!-- How it works -->
    <div class="py-16 bg-background">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-base text-secondary font-semibold tracking-wide uppercase">Adoption Process</h2>
          <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            How it works
          </p>
        </div>

        <div class="mt-16">
          <div class="grid grid-cols-1 gap-8 md:grid-cols-3 text-center">
            
            <div class="card p-8 flex flex-col items-center">
              <div class="flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 text-primary text-2xl font-bold mb-6">1</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Browse Pets</h3>
              <p class="text-gray-500">Explore hundreds of dogs and cats waiting for a home from verified NGOs and shelters.</p>
            </div>

            <div class="card p-8 flex flex-col items-center transform md:-translate-y-4">
              <div class="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-secondary text-2xl font-bold mb-6">2</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Check Compatibility</h3>
              <p class="text-gray-500">Take our smart quiz to see which pets fit your lifestyle, home size, and routine perfectly.</p>
            </div>

            <div class="card p-8 flex flex-col items-center">
              <div class="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-accent text-2xl font-bold mb-6">3</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Apply for Adoption</h3>
              <p class="text-gray-500">Submit an application. Track its status transparently, directly communicating with the shelter.</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  `
})
export class LandingComponent {}
