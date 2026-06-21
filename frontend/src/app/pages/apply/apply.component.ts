import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationService } from '../../core/services/application.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-apply',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-background min-h-screen py-10">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-surface rounded-3xl shadow-soft p-8 md:p-12">

          <div *ngIf="successMessage" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">
            ✅ {{ successMessage }}
          </div>
          <div *ngIf="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
            ❌ {{ errorMessage }}
          </div>

          <div *ngIf="!successMessage">
            <div class="text-center mb-10">
              <h1 class="text-3xl font-extrabold text-gray-900">Candidatura de Adoção</h1>
              <p class="text-gray-500 mt-2">Você está se candidatando para adotar um pet. Responda com cuidado para ajudar o abrigo a avaliar seu perfil.</p>
            </div>

            <div class="flex items-center justify-between mb-8 relative">
              <div class="absolute left-0 top-1/2 -mt-px w-full h-0.5 bg-gray-200" aria-hidden="true"></div>
              <div [class.bg-primary]="step >= 1" [class.border-primary]="step >= 1" class="relative flex items-center justify-center w-8 h-8 rounded-full border-2 bg-white z-10 font-bold" [ngClass]="step >= 1 ? 'text-white' : 'border-gray-300 text-gray-500'">1</div>
              <div [class.bg-primary]="step >= 2" [class.border-primary]="step >= 2" class="relative flex items-center justify-center w-8 h-8 rounded-full border-2 bg-white z-10 font-bold" [ngClass]="step >= 2 ? 'text-white' : 'border-gray-300 text-gray-500'">2</div>
              <div [class.bg-primary]="step >= 3" [class.border-primary]="step >= 3" class="relative flex items-center justify-center w-8 h-8 rounded-full border-2 bg-white z-10 font-bold" [ngClass]="step >= 3 ? 'text-white' : 'border-gray-300 text-gray-500'">3</div>
            </div>

            <form (ngSubmit)="nextStep()">
              <div *ngIf="step === 1" class="space-y-6">
                <h2 class="text-xl font-bold text-gray-900 border-b pb-2">1. Dados Pessoais e Moradia</h2>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Moradia <span class="text-red-500">*</span></label>
                  <select required [(ngModel)]="application.housing_type" name="housing_type" class="input-field">
                    <option value="">Selecione...</option>
                    <option value="Casa Própria">Casa Própria</option>
                    <option value="Casa Alugada">Casa Alugada</option>
                    <option value="Apartamento Próprio">Apartamento Próprio</option>
                    <option value="Apartamento Alugado">Apartamento Alugado</option>
                  </select>
                </div>
                <div *ngIf="application.housing_type.includes('Alugad')" class="bg-yellow-50 p-4 rounded-lg flex gap-3 text-yellow-800 text-sm">
                  <span>⚠️</span>
                  <span>Para imóveis alugados, é necessário confirmar que o proprietário permite animais de estimação.</span>
                </div>
              </div>

              <div *ngIf="step === 2" class="space-y-6">
                <h2 class="text-xl font-bold text-gray-900 border-b pb-2">2. Experiência e Rotina</h2>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Por que você quer adotar? <span class="text-red-500">*</span></label>
                  <textarea required [(ngModel)]="application.motivation" name="motivation" rows="4" class="input-field" placeholder="Conte ao abrigo um pouco sobre você e suas motivações..."></textarea>
                </div>
              </div>

              <div *ngIf="step === 3" class="space-y-6">
                <h2 class="text-xl font-bold text-gray-900 border-b pb-2">3. Revisão e Acordo</h2>
                <div class="bg-gray-50 p-6 rounded-xl border border-gray-200 text-sm text-gray-700 space-y-4">
                  <p>Ao enviar esta candidatura, confirmo que:</p>
                  <ul class="list-disc pl-5 space-y-2">
                    <li>Todas as informações fornecidas são verdadeiras e precisas.</li>
                    <li>Estou ciente de que esta é uma candidatura e não garante a adoção.</li>
                    <li>Entendo que o abrigo pode solicitar uma visita domiciliar ou entrevista.</li>
                    <li>Tenho condições financeiras de fornecer cuidados veterinários, alimentação de qualidade e abrigo pelo tempo de vida do animal.</li>
                  </ul>
                </div>
                <label class="flex items-start space-x-3 mt-4">
                  <input type="checkbox" required [(ngModel)]="agreed" name="agreed" class="mt-1 text-primary focus:ring-primary h-5 w-5 rounded">
                  <span class="text-sm text-gray-700">Li e concordo com as responsabilidades da adoção de pets descritas acima.</span>
                </label>
              </div>

              <div class="mt-10 flex justify-between pt-6 border-t border-gray-100">
                <button *ngIf="step > 1" type="button" (click)="step = step - 1" class="btn-outline px-8 py-2">Voltar</button>
                <div *ngIf="step === 1"></div>
                <button *ngIf="step < 3" type="submit" class="btn-primary px-8 py-2">Próximo</button>
                <button *ngIf="step === 3" type="button" (click)="submit()" [disabled]="isSubmitting" class="btn-primary px-8 py-2 bg-secondary hover:bg-green-600 shadow-float">
                  {{ isSubmitting ? 'Enviando...' : 'Enviar Candidatura' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ApplyComponent implements OnInit {
  step = 1;
  petId: number | null = null;
  agreed = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  application = { housing_type: '', motivation: '' };

  constructor(private route: ActivatedRoute, private router: Router, private applicationService: ApplicationService, private authService: AuthService) {}

  ngOnInit() { this.petId = Number(this.route.snapshot.paramMap.get('id')); }

  nextStep() { if (this.step < 3) this.step++; }

  submit() {
    if (!this.application.housing_type || !this.application.motivation) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';

    this.applicationService.createApplication({
      user_id: this.authService.currentUserValue?.id || 0, pet_id: this.petId!,
      housing_type: this.application.housing_type,
      motivation: this.application.motivation
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Candidatura enviada com sucesso! O abrigo irá analisá-la em breve.';
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.status === 0
          ? 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.'
          : 'Falha ao enviar candidatura. Tente novamente mais tarde.';
      }
    });
  }
}
