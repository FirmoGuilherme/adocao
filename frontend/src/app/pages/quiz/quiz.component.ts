import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-background min-h-screen py-10">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div *ngIf="step < totalSteps" class="bg-surface rounded-3xl shadow-soft p-8 md:p-12 transition-all duration-500 relative overflow-hidden">
          
          <!-- Progress Bar -->
          <div class="w-full bg-gray-200 rounded-full h-2.5 mb-8">
            <div class="bg-primary h-2.5 rounded-full transition-all duration-500" [style.width]="(step / totalSteps) * 100 + '%'"></div>
          </div>

          <div class="mb-4">
            <span class="text-secondary font-bold text-sm tracking-widest uppercase">Question {{step}} of {{totalSteps}}</span>
          </div>

          <!-- Question 1 -->
          <div *ngIf="step === 1" class="animate-fadeIn">
            <h2 class="text-3xl font-extrabold text-gray-900 mb-6">Do you live in an apartment or a house?</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button (click)="answer('housing', 'Apartment')" class="p-6 border-2 border-gray-100 rounded-2xl hover:border-primary hover:bg-orange-50 transition-all text-left flex flex-col items-start gap-4 focus:ring-2 focus:ring-primary focus:outline-none">
                <span class="text-4xl block mb-2">🏢</span>
                <span class="text-xl font-bold text-gray-900">Apartment</span>
                <span class="text-gray-500 text-sm">I live in a flat or apartment without a private yard.</span>
              </button>
              <button (click)="answer('housing', 'House')" class="p-6 border-2 border-gray-100 rounded-2xl hover:border-primary hover:bg-orange-50 transition-all text-left flex flex-col items-start gap-4 focus:ring-2 focus:ring-primary focus:outline-none">
                <span class="text-4xl block mb-2">🏡</span>
                <span class="text-xl font-bold text-gray-900">House</span>
                <span class="text-gray-500 text-sm">I live in a house, possibly with a backyard.</span>
              </button>
            </div>
          </div>

          <!-- Question 2 -->
          <div *ngIf="step === 2" class="animate-fadeIn">
            <h2 class="text-3xl font-extrabold text-gray-900 mb-6">Do you have children living with you?</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button (click)="answer('kids', true)" class="p-6 border-2 border-gray-100 rounded-2xl hover:border-primary hover:bg-orange-50 transition-all text-left">
                <span class="text-4xl block mb-4">👶</span>
                <span class="text-xl font-bold text-gray-900 block mb-2">Yes</span>
                <span class="text-gray-500 text-sm">I have kids at home.</span>
              </button>
              <button (click)="answer('kids', false)" class="p-6 border-2 border-gray-100 rounded-2xl hover:border-primary hover:bg-orange-50 transition-all text-left">
                <span class="text-4xl block mb-4">🧑</span>
                <span class="text-xl font-bold text-gray-900 block mb-2">No</span>
                <span class="text-gray-500 text-sm">Adults or teenagers only.</span>
              </button>
            </div>
          </div>

          <!-- Question 3 -->
          <div *ngIf="step === 3" class="animate-fadeIn">
            <h2 class="text-3xl font-extrabold text-gray-900 mb-6">How active is your routine?</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button (click)="answer('energy', 'Low')" class="p-6 border-2 border-gray-100 rounded-2xl hover:border-primary hover:bg-orange-50 transition-all text-left">
                <span class="text-4xl block mb-4">📺</span>
                <span class="text-lg font-bold text-gray-900 block">Low</span>
                <span class="text-gray-500 text-xs">I prefer relaxing at home.</span>
              </button>
              <button (click)="answer('energy', 'Medium')" class="p-6 border-2 border-gray-100 rounded-2xl hover:border-primary hover:bg-orange-50 transition-all text-left">
                <span class="text-4xl block mb-4">🚶</span>
                <span class="text-lg font-bold text-gray-900 block">Medium</span>
                <span class="text-gray-500 text-xs">Daily walks, some activity.</span>
              </button>
              <button (click)="answer('energy', 'High')" class="p-6 border-2 border-gray-100 rounded-2xl hover:border-primary hover:bg-orange-50 transition-all text-left">
                <span class="text-4xl block mb-4">🏃</span>
                <span class="text-lg font-bold text-gray-900 block">High</span>
                <span class="text-gray-500 text-xs">Very active, hiking, running.</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Result Screen -->
        <div *ngIf="step >= totalSteps && !calculating" class="bg-surface rounded-3xl shadow-soft p-8 md:p-12 text-center animate-fadeIn">
          <div class="w-24 h-24 bg-green-100 text-secondary rounded-full flex items-center justify-center mx-auto mb-6 text-5xl">✓</div>
          <h2 class="text-3xl font-extrabold text-gray-900 mb-4">We found your perfect matches!</h2>
          <p class="text-gray-600 mb-8 max-w-xl mx-auto">Based on your {{answers['housing']}} lifestyle and {{answers['energy']}} energy routine, we found highly compatible pets that will thrive with you.</p>
          
          <button (click)="finishQuiz()" class="btn-primary text-xl px-12 py-4 shadow-float hover:-translate-y-1 transform">
            See My Matches
          </button>
        </div>

        <!-- Calculating State -->
        <div *ngIf="step >= totalSteps && calculating" class="bg-surface rounded-3xl shadow-soft p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mb-6"></div>
          <h2 class="text-2xl font-bold text-gray-900">Analyzing compatibility...</h2>
          <p class="text-gray-500 mt-2">Matching your lifestyle with our rescued pets.</p>
        </div>

      </div>
    </div>
  `
})
export class QuizComponent {
  step = 1;
  totalSteps = 4;
  calculating = false;
  answers: any = {};

  constructor(private router: Router) {}

  answer(key: string, value: any) {
    this.answers[key] = value;
    this.step++;

    if (this.step === this.totalSteps) {
      this.calculating = true;
      setTimeout(() => {
        this.calculating = false;
      }, 2000);
    }
  }

  finishQuiz() {
    this.router.navigate(['/explore'], { 
      queryParams: { 
        apartment_friendly: this.answers['housing'] === 'Apartment' ? true : null,
        good_with_kids: this.answers['kids'] ? true : null
      }
    });
  }
}
