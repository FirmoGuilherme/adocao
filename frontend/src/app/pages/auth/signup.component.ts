import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-[80vh] flex flex-col items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      
      <div class="w-full max-w-4xl bg-surface rounded-3xl shadow-soft overflow-hidden">
        <div class="grid grid-cols-1 md:grid-cols-2">
           
           <div class="bg-primary text-white p-12 flex flex-col justify-center">
             <h2 class="text-4xl font-extrabold mb-4">Join Adocão</h2>
             <p class="text-lg opacity-90 mb-8">Choose how you want to be part of our community. Together we can find homes for thousands of pets.</p>
             <div class="space-y-4">
               <div class="flex items-center space-x-3"><span class="text-2xl">🐾</span> <span>Save lives</span></div>
               <div class="flex items-center space-x-3"><span class="text-2xl">🌱</span> <span>Adopt responsibly</span></div>
               <div class="flex items-center space-x-3"><span class="text-2xl">🏢</span> <span>Manage shelters easily</span></div>
             </div>
           </div>

           <div class="p-12 flex flex-col justify-center">
             <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">I am registering as...</h3>
             
             <div class="space-y-4">
               <!-- Adopter Role Card -->
               <button class="w-full text-left p-6 border-2 border-gray-100 rounded-2xl hover:border-primary hover:bg-orange-50 transition-all flex items-center space-x-4">
                 <div class="h-12 w-12 bg-orange-100 text-primary rounded-full flex items-center justify-center text-2xl">🧑</div>
                 <div>
                   <h4 class="font-bold text-gray-900 text-lg">An Adopter</h4>
                   <p class="text-sm text-gray-500">I want to find and adopt a new pet.</p>
                 </div>
               </button>

               <!-- Shelter Role Card -->
               <button class="w-full text-left p-6 border-2 border-gray-100 rounded-2xl hover:border-secondary hover:bg-green-50 transition-all flex items-center space-x-4">
                 <div class="h-12 w-12 bg-green-100 text-secondary rounded-full flex items-center justify-center text-2xl">🏢</div>
                 <div>
                   <h4 class="font-bold text-gray-900 text-lg">A Shelter / NGO</h4>
                   <p class="text-sm text-gray-500">I manage pets available for adoption.</p>
                 </div>
               </button>

               <!-- Volunteer Role Card -->
               <button class="w-full text-left p-6 border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center space-x-4">
                 <div class="h-12 w-12 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center text-2xl">🤝</div>
                 <div>
                   <h4 class="font-bold text-gray-900 text-lg">A Volunteer</h4>
                   <p class="text-sm text-gray-500">I want to help with the adoption pipeline.</p>
                 </div>
               </button>
             </div>

             <div class="mt-8 text-center text-sm text-gray-500">
               Already have an account? <a routerLink="/auth/login" class="text-primary font-bold hover:underline">Log in</a>
             </div>

           </div>
        </div>
      </div>
      
    </div>
  `
})
export class SignupComponent {}
