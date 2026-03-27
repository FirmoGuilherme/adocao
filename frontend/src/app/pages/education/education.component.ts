import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-background min-h-screen py-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="text-center mb-16">
          <h1 class="text-4xl font-extrabold text-gray-900">Responsible Adoption Academy</h1>
          <p class="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">Everything you need to know before, during, and after welcoming a rescued pet into your home.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div class="card overflow-hidden hover:shadow-float cursor-pointer transition flex flex-col h-full bg-white">
             <img src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80" alt="Dog house" class="h-48 w-full object-cover">
             <div class="p-6 flex flex-col flex-grow">
               <span class="text-xs font-bold text-primary uppercase tracking-wider mb-2">First Days</span>
               <h3 class="text-xl font-bold text-gray-900 mb-2">How to prepare your home for a rescued dog</h3>
               <p class="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">Bringing a new dog home is exciting but requires preparation. Learn how to pet-proof your environment to reduce their initial stress and ensure safety.</p>
               <div class="flex items-center justify-between text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
                 <span>5 min read</span>
                 <span class="text-primary font-medium hover:underline">Read Guide →</span>
               </div>
             </div>
          </div>

          <div class="card overflow-hidden hover:shadow-float cursor-pointer transition flex flex-col h-full bg-white">
             <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80" alt="Cat in apartment" class="h-48 w-full object-cover">
             <div class="p-6 flex flex-col flex-grow">
               <span class="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Apartment Living</span>
               <h3 class="text-xl font-bold text-gray-900 mb-2">What to know before adopting a cat</h3>
               <p class="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">Cats are excellent apartment companions, but they need vertical space, proper scratching posts, and window safety nets before you bring them in.</p>
               <div class="flex items-center justify-between text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
                 <span>4 min read</span>
                 <span class="text-primary font-medium hover:underline">Read Guide →</span>
               </div>
             </div>
          </div>

          <div class="card overflow-hidden hover:shadow-float cursor-pointer transition flex flex-col h-full bg-white border-2 border-primary border-opacity-50 relative">
             <div class="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">Must Read</div>
             <img src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=600&q=80" alt="Vet" class="h-48 w-full object-cover">
             <div class="p-6 flex flex-col flex-grow">
               <span class="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">Health & Wellness</span>
               <h3 class="text-xl font-bold text-gray-900 mb-2">Why neutering matters</h3>
               <p class="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">Neutering isn't just about population control; it significantly improves your pet's health, prevents certain cancers, and reduces behavioral issues.</p>
               <div class="flex items-center justify-between text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
                 <span>8 min read</span>
                 <span class="text-primary font-medium hover:underline">Read Guide →</span>
               </div>
             </div>
          </div>

          <div class="card overflow-hidden hover:shadow-float cursor-pointer transition flex flex-col h-full bg-white">
             <div class="bg-green-50 h-48 w-full flex items-center justify-center text-6xl">🐕🐈</div>
             <div class="p-6 flex flex-col flex-grow">
               <span class="text-xs font-bold text-primary uppercase tracking-wider mb-2">Adaptation</span>
               <h3 class="text-xl font-bold text-gray-900 mb-2">How to introduce a new pet to another animal</h3>
               <p class="text-gray-600 text-sm mb-4 line-clamp-3">A step-by-step guide to safe and slow introductions to prevent fights and build lifelong sibling bonds.</p>
               <div class="flex items-center justify-between text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
                 <span>6 min read</span>
                 <span class="text-primary font-medium hover:underline">Read Guide →</span>
               </div>
             </div>
          </div>

        </div>

        <div class="mt-16 bg-blue-50 rounded-3xl p-8 md:p-12 text-center border border-blue-100">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Taking the Compatibility Quiz?</h2>
          <p class="text-gray-600 mb-6 max-w-xl mx-auto">Make sure to read through our "Before You Adopt" learning path to boost your profile score and show shelters you are fully prepared.</p>
          <button class="btn-primary">Start Learning Path</button>
        </div>

      </div>
    </div>
  `
})
export class EducationComponent {}
