import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="bg-background min-h-screen py-10">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <a [routerLink]="userRole === 'volunteer' ? '/dashboard/volunteer' : '/dashboard/adopter'" class="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-flex items-center">
          ← Voltar ao painel
        </a>

        <div class="bg-surface rounded-3xl shadow-soft p-8 md:p-12">

          <div *ngIf="successMessage" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">
            ✅ {{ successMessage }}
          </div>

          <div class="text-center mb-8">
            <h1 class="text-3xl font-extrabold text-gray-900">Meu Perfil</h1>
            <p class="text-gray-500 mt-2">{{userRole === 'volunteer' ? 'Complete seu perfil para se destacar como voluntário.' : 'Complete seu perfil para melhorar a compatibilidade com os pets.'}}</p>
          </div>

          <form class="space-y-8" (ngSubmit)="save()">

            <!-- Personalidade -->
            <section>
              <h2 class="text-xl font-bold text-gray-900 mb-4 border-b pb-2">🧠 Sua Personalidade</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nível de Energia</label>
                  <select [(ngModel)]="profile.energy_level" name="energy_level" class="input-field py-2">
                    <option [ngValue]="1">1 - Muito Calmo/Sedentário</option>
                    <option [ngValue]="2">2 - Calmo</option>
                    <option [ngValue]="3">3 - Moderado</option>
                    <option [ngValue]="4">4 - Ativo</option>
                    <option [ngValue]="5">5 - Muito Ativo/Esportista</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Sociabilidade</label>
                  <select [(ngModel)]="profile.social_level" name="social_level" class="input-field py-2">
                    <option [ngValue]="1">1 - Muito Introvertido</option>
                    <option [ngValue]="2">2 - Reservado</option>
                    <option [ngValue]="3">3 - Moderado</option>
                    <option [ngValue]="4">4 - Sociável</option>
                    <option [ngValue]="5">5 - Muito Extrovertido</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Experiência com Pets</label>
                  <select [(ngModel)]="profile.experience_level" name="experience_level" class="input-field py-2">
                    <option [ngValue]="1">1 - Nunca tive</option>
                    <option [ngValue]="2">2 - Tive quando criança</option>
                    <option [ngValue]="3">3 - Já tive um pet</option>
                    <option [ngValue]="4">4 - Tenho experiência</option>
                    <option [ngValue]="5">5 - Muito experiente</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Paciência</label>
                  <select [(ngModel)]="profile.patience_level" name="patience_level" class="input-field py-2">
                    <option [ngValue]="1">1 - Impaciente</option>
                    <option [ngValue]="2">2 - Pouca paciência</option>
                    <option [ngValue]="3">3 - Moderada</option>
                    <option [ngValue]="4">4 - Paciente</option>
                    <option [ngValue]="5">5 - Muito Paciente</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Frequência ao ar livre</label>
                  <select [(ngModel)]="profile.outdoor_frequency" name="outdoor_frequency" class="input-field py-2">
                    <option [ngValue]="1">1 - Quase nunca saio</option>
                    <option [ngValue]="2">2 - Fins de semana</option>
                    <option [ngValue]="3">3 - Algumas vezes/semana</option>
                    <option [ngValue]="4">4 - Quase todo dia</option>
                    <option [ngValue]="5">5 - Todo dia, várias vezes</option>
                  </select>
                </div>
              </div>
            </section>

            <!-- Preferências de Pet (apenas adotante) -->
            <section *ngIf="userRole === 'adopter'">
              <h2 class="text-xl font-bold text-gray-900 mb-4 border-b pb-2">🐾 O que espera do seu companheiro</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Espécie preferida</label>
                  <select [(ngModel)]="profile.preferred_species" name="preferred_species" class="input-field py-2">
                    <option value="any">Tanto faz</option>
                    <option value="dog">Cachorro</option>
                    <option value="cat">Gato</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Porte preferido</label>
                  <select [(ngModel)]="profile.preferred_size" name="preferred_size" class="input-field py-2">
                    <option value="any">Tanto faz</option>
                    <option value="small">Pequeno</option>
                    <option value="medium">Médio</option>
                    <option value="large">Grande</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Energia do pet desejada</label>
                  <select [(ngModel)]="profile.preferred_energy" name="preferred_energy" class="input-field py-2">
                    <option [ngValue]="1">1 - Bem calmo</option>
                    <option [ngValue]="2">2 - Calmo</option>
                    <option [ngValue]="3">3 - Moderado</option>
                    <option [ngValue]="4">4 - Energético</option>
                    <option [ngValue]="5">5 - Muito energético</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Faixa etária preferida</label>
                  <select [(ngModel)]="profile.preferred_age_group" name="preferred_age_group" class="input-field py-2">
                    <option value="any">Tanto faz</option>
                    <option value="puppy">Filhote</option>
                    <option value="young">Jovem</option>
                    <option value="adult">Adulto</option>
                    <option value="senior">Idoso</option>
                  </select>
                </div>
              </div>
              <div class="mt-4">
                <label class="flex items-center space-x-2 text-sm text-gray-600">
                  <input type="checkbox" [(ngModel)]="profile.accepts_special_needs" name="accepts_special_needs" class="rounded text-primary focus:ring-primary h-4 w-4">
                  <span>Aceito pets com necessidades especiais</span>
                </label>
              </div>
            </section>

            <!-- Moradia e Rotina (apenas adotante) -->
            <section *ngIf="userRole === 'adopter'">
              <h2 class="text-xl font-bold text-gray-900 mb-4 border-b pb-2">🏠 Moradia e Rotina</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de moradia</label>
                  <select [(ngModel)]="profile.housing_type" name="housing_type" class="input-field py-2">
                    <option value="">Selecione...</option>
                    <option value="Casa">Casa</option>
                    <option value="Apartamento">Apartamento</option>
                    <option value="Sítio/Chácara">Sítio/Chácara</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Horas sozinho por dia</label>
                  <input type="number" [(ngModel)]="profile.hours_alone" name="hours_alone" class="input-field py-2" min="0" max="24" placeholder="8">
                </div>
              </div>
              <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label class="flex items-center space-x-2 text-sm text-gray-600">
                  <input type="checkbox" [(ngModel)]="profile.has_yard" name="has_yard" class="rounded text-primary focus:ring-primary h-4 w-4">
                  <span>Tenho quintal</span>
                </label>
                <label class="flex items-center space-x-2 text-sm text-gray-600">
                  <input type="checkbox" [(ngModel)]="profile.has_other_pets" name="has_other_pets" class="rounded text-primary focus:ring-primary h-4 w-4">
                  <span>Tenho outros pets</span>
                </label>
                <label class="flex items-center space-x-2 text-sm text-gray-600">
                  <input type="checkbox" [(ngModel)]="profile.has_children" name="has_children" class="rounded text-primary focus:ring-primary h-4 w-4">
                  <span>Tenho crianças</span>
                </label>
              </div>
            </section>

            <!-- Disponibilidade (apenas voluntário) -->
            <section *ngIf="userRole === 'volunteer'">
              <h2 class="text-xl font-bold text-gray-900 mb-4 border-b pb-2">📅 Disponibilidade</h2>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Dias disponíveis</label>
                  <input type="text" [(ngModel)]="profile.available_days" name="available_days" class="input-field py-2" placeholder="Ex: seg, qua, sex, sab">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Horários disponíveis</label>
                  <input type="text" [(ngModel)]="profile.available_hours" name="available_hours" class="input-field py-2" placeholder="Ex: manhã, tarde">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Habilidades especiais</label>
                  <textarea [(ngModel)]="profile.skills" name="skills" rows="3" class="input-field py-2" placeholder="Ex: treinamento de cães, banho e tosa, transporte..."></textarea>
                </div>
              </div>
            </section>

            <!-- Expectativas -->
            <section>
              <h2 class="text-xl font-bold text-gray-900 mb-4 border-b pb-2">💭 {{userRole === 'volunteer' ? 'Motivação' : 'Suas Expectativas'}}</h2>
              <textarea [(ngModel)]="profile.expectations" name="expectations" rows="4" class="input-field py-2"
                placeholder="O que você espera do seu companheiro animal? Companhia, proteção, brincadeiras, passeios..."></textarea>
            </section>

            <button type="submit" [disabled]="saving" class="w-full btn-primary py-3 text-lg">
              {{ saving ? 'Salvando...' : 'Salvar Perfil' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  saving = false;
  successMessage = '';
  userRole = '';

  profile: any = {
    energy_level: 3, social_level: 3, experience_level: 1,
    patience_level: 3, outdoor_frequency: 3,
    preferred_species: 'any', preferred_size: 'any',
    preferred_energy: 3, preferred_age_group: 'any',
    accepts_special_needs: false,
    housing_type: '', has_yard: false, hours_alone: 8,
    has_other_pets: false, has_children: false,
    expectations: '',
    available_days: '', available_hours: '', skills: ''
  };

  private userId: number | null = null;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.currentUserValue;
    if (user) {
      this.userId = user.id;
      this.userRole = user.role;
      this.http.get<any>(`http://localhost:8000/profile/${user.id}`).subscribe({
        next: (data) => {
          this.profile = { ...this.profile, ...data };
        }
      });
    }
  }

  save() {
    if (!this.userId) return;
    this.saving = true;
    this.successMessage = '';

    this.http.put(`http://localhost:8000/profile/${this.userId}`, this.profile).subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = 'Perfil atualizado com sucesso! Seu score de compatibilidade será recalculado.';
      },
      error: () => {
        this.saving = false;
      }
    });
  }
}
