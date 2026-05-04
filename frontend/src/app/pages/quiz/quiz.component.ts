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
          <div class="w-full bg-gray-200 rounded-full h-2.5 mb-8">
            <div class="bg-primary h-2.5 rounded-full transition-all duration-500" [style.width]="(step / totalSteps) * 100 + '%'"></div>
          </div>
          <div class="mb-4">
            <span class="text-secondary font-bold text-sm tracking-widest uppercase">Pergunta {{step}} de {{totalSteps}}</span>
          </div>

          <div *ngIf="step === 1" class="animate-fadeIn">
            <h2 class="text-3xl font-extrabold text-gray-900 mb-6">Você mora em apartamento ou casa?</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button (click)="answer('housing', 'Apartment')" class="p-6 border-2 border-gray-100 rounded-2xl hover:border-primary hover:bg-orange-50 transition-all text-left flex flex-col items-start gap-4 focus:ring-2 focus:ring-primary focus:outline-none">
                <span class="text-4xl block mb-2">🏢</span>
                <span class="text-xl font-bold text-gray-900">Apartamento</span>
                <span class="text-gray-500 text-sm">Moro em um apartamento sem quintal privado.</span>
              </button>
              <button (click)="answer('housing', 'House')" class="p-6 border-2 border-gray-100 rounded-2xl hover:border-primary hover:bg-orange-50 transition-all text-left flex flex-col items-start gap-4 focus:ring-2 focus:ring-primary focus:outline-none">
                <span class="text-4xl block mb-2">🏡</span>
                <span class="text-xl font-bold text-gray-900">Casa</span>
                <span class="text-gray-500 text-sm">Moro em uma casa, possivelmente com quintal.</span>
              </button>
            </div>
          </div>

          <div *ngIf="step === 2" class="animate-fadeIn">
            <h2 class="text-3xl font-extrabold text-gray-900 mb-6">Você tem crianças morando com você?</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button (click)="answer('kids', true)" class="p-6 border-2 border-gray-100 rounded-2xl hover:border-primary hover:bg-orange-50 transition-all text-left">
                <span class="text-4xl block mb-4">👶</span>
                <span class="text-xl font-bold text-gray-900 block mb-2">Sim</span>
                <span class="text-gray-500 text-sm">Tenho crianças em casa.</span>
              </button>
              <button (click)="answer('kids', false)" class="p-6 border-2 border-gray-100 rounded-2xl hover:border-primary hover:bg-orange-50 transition-all text-left">
                <span class="text-4xl block mb-4">🧑</span>
                <span class="text-xl font-bold text-gray-900 block mb-2">Não</span>
                <span class="text-gray-500 text-sm">Apenas adultos ou adolescentes.</span>
              </button>
            </div>
          </div>

          <div *ngIf="step === 3" class="animate-fadeIn">
            <h2 class="text-3xl font-extrabold text-gray-900 mb-6">Quão ativa é sua rotina?</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button (click)="answer('energy', 'Baixa')" class="p-6 border-2 border-gray-100 rounded-2xl hover:border-primary hover:bg-orange-50 transition-all text-left">
                <span class="text-4xl block mb-4">📺</span>
                <span class="text-lg font-bold text-gray-900 block">Baixa</span>
                <span class="text-gray-500 text-xs">Prefiro relaxar em casa.</span>
              </button>
              <button (click)="answer('energy', 'Média')" class="p-6 border-2 border-gray-100 rounded-2xl hover:border-primary hover:bg-orange-50 transition-all text-left">
                <span class="text-4xl block mb-4">🚶</span>
                <span class="text-lg font-bold text-gray-900 block">Média</span>
                <span class="text-gray-500 text-xs">Caminhadas diárias, alguma atividade.</span>
              </button>
              <button (click)="answer('energy', 'Alta')" class="p-6 border-2 border-gray-100 rounded-2xl hover:border-primary hover:bg-orange-50 transition-all text-left">
                <span class="text-4xl block mb-4">🏃</span>
                <span class="text-lg font-bold text-gray-900 block">Alta</span>
                <span class="text-gray-500 text-xs">Muito ativo, trilhas, corrida.</span>
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="step >= totalSteps && !calculating" class="bg-surface rounded-3xl shadow-soft p-8 md:p-12 text-center animate-fadeIn">
          <div class="w-24 h-24 bg-green-100 text-secondary rounded-full flex items-center justify-center mx-auto mb-6 text-5xl">✓</div>
          <h2 class="text-3xl font-extrabold text-gray-900 mb-4">Encontramos seus pares perfeitos!</h2>
          <p class="text-gray-600 mb-8 max-w-xl mx-auto">Com base no seu estilo de vida em {{answers['housing'] === 'Apartment' ? 'apartamento' : 'casa'}} e rotina de energia {{answers['energy']?.toLowerCase()}}, encontramos pets altamente compatíveis com você.</p>
          <button (click)="finishQuiz()" class="btn-primary text-xl px-12 py-4 shadow-float hover:-translate-y-1 transform">
            Ver Meus Resultados
          </button>
        </div>

        <div *ngIf="step >= totalSteps && calculating" class="bg-surface rounded-3xl shadow-soft p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mb-6"></div>
          <h2 class="text-2xl font-bold text-gray-900">Analisando compatibilidade...</h2>
          <p class="text-gray-500 mt-2">Combinando seu estilo de vida com nossos pets resgatados.</p>
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
      setTimeout(() => { this.calculating = false; }, 2000);
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
