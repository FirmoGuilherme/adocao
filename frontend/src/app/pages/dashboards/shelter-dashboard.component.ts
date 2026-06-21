import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { PetService, Pet } from '../../core/services/pet.service';
import { HttpClient } from '@angular/common/http';

interface Application {
  id: number;
  user_id: number;
  pet_id: number;
  status: string;
  housing_type: string;
  motivation: string;
  compatibility_score: number;
}

@Component({
  selector: 'app-shelter-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="bg-gray-50 min-h-screen">

      <!-- Not approved message -->
      <div *ngIf="!isApproved" class="min-h-screen flex items-center justify-center p-4">
        <div class="max-w-md text-center bg-white rounded-3xl shadow-soft p-10">
          <span class="text-6xl mb-4 block">⏳</span>
          <h2 class="text-2xl font-bold text-gray-900 mb-3">Aguardando Aprovação</h2>
          <p class="text-gray-600 mb-6">Seu cadastro de abrigo está em análise pelo administrador da plataforma. Você receberá acesso completo após a aprovação.</p>
          <p class="text-sm text-gray-400">Enquanto isso, seu painel está desabilitado. Aguarde a aprovação para cadastrar pets e gerenciar voluntários.</p>
        </div>
      </div>

      <!-- Approved: show full dashboard -->
      <div *ngIf="isApproved">
      <nav class="bg-primary text-white py-4 px-6 flex justify-between items-center shadow-md">
        <div class="flex flex-col">
           <span class="font-bold text-xl">{{ shelterName }}</span>
           <span class="text-xs opacity-80">Painel do Abrigo · {{ shelterCity }}</span>
        </div>
        <div class="flex gap-4">
           <a routerLink="/dashboard/shelter/add-pet" class="bg-white text-primary px-4 py-2 rounded-lg font-bold hover:bg-orange-50 transition">+ Cadastrar Pet</a>
        </div>
      </nav>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">

        <aside class="w-64 hidden md:block">
           <div class="bg-white rounded-2xl shadow-soft p-4 flex flex-col gap-2">
             <button (click)="activeSection = 'panel'" [class.bg-orange-50]="activeSection === 'panel'" [class.text-primary]="activeSection === 'panel'" [class.font-bold]="activeSection === 'panel'" class="p-3 text-gray-600 hover:bg-gray-50 rounded-xl flex items-center gap-3 font-medium text-left w-full">
               <span>📊</span> Painel
             </button>
             <button (click)="switchSection('pets')" [class.bg-orange-50]="activeSection === 'pets'" [class.text-primary]="activeSection === 'pets'" [class.font-bold]="activeSection === 'pets'" class="p-3 text-gray-600 hover:bg-gray-50 rounded-xl flex items-center gap-3 font-medium text-left w-full">
               <span>🐾</span> Gerenciar Pets
             </button>
             <button (click)="switchSection('applications')" [class.bg-orange-50]="activeSection === 'applications'" [class.text-primary]="activeSection === 'applications'" [class.font-bold]="activeSection === 'applications'" class="p-3 text-gray-600 hover:bg-gray-50 rounded-xl flex items-center gap-3 font-medium text-left w-full">
               <span>📄</span> Candidaturas <span *ngIf="applications.length" class="ml-auto bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">{{applications.length}}</span>
             </button>
             <button (click)="switchSection('reports')" [class.bg-orange-50]="activeSection === 'reports'" [class.text-primary]="activeSection === 'reports'" [class.font-bold]="activeSection === 'reports'" class="p-3 text-gray-600 hover:bg-gray-50 rounded-xl flex items-center gap-3 font-medium text-left w-full">
               <span>📈</span> Relatórios
             </button>
             <button (click)="switchSection('volunteers')" [class.bg-orange-50]="activeSection === 'volunteers'" [class.text-primary]="activeSection === 'volunteers'" [class.font-bold]="activeSection === 'volunteers'" class="p-3 text-gray-600 hover:bg-gray-50 rounded-xl flex items-center gap-3 font-medium text-left w-full">
               <span>🤝</span> Voluntários
             </button>
           </div>
        </aside>

        <main class="flex-grow">

          <!-- PAINEL -->
          <div *ngIf="activeSection === 'panel'">
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
               <div class="bg-white p-6 rounded-2xl shadow-soft">
                 <p class="text-sm font-medium text-gray-500 mb-1">Total de Pets</p>
                 <h3 class="text-3xl font-extrabold text-gray-900">{{pets.length}}</h3>
               </div>
               <div class="bg-white p-6 rounded-2xl shadow-soft">
                 <p class="text-sm font-medium text-gray-500 mb-1">Disponíveis</p>
                 <h3 class="text-3xl font-extrabold text-secondary">{{availablePets}}</h3>
               </div>
               <div class="bg-white p-6 rounded-2xl shadow-soft border border-orange-100 relative overflow-hidden">
                 <div class="absolute right-0 top-0 w-2 h-full bg-primary"></div>
                 <p class="text-sm font-medium text-gray-500 mb-1">Candidaturas Pendentes</p>
                 <h3 class="text-3xl font-extrabold text-gray-900">{{pendingApplications}}</h3>
               </div>
               <div class="bg-white p-6 rounded-2xl shadow-soft">
                 <p class="text-sm font-medium text-gray-500 mb-1">Adoções (Total)</p>
                 <h3 class="text-3xl font-extrabold text-blue-600">{{adoptedPets}}</h3>
               </div>
            </div>

            <h2 class="text-xl font-bold text-gray-900 mb-4">Candidaturas Recentes</h2>
            <div class="space-y-3" *ngIf="applications.length > 0">
              <div *ngFor="let app of applications.slice(0, 5)" class="bg-white p-4 rounded-xl shadow-soft flex justify-between items-center">
                <div>
                  <p class="font-bold text-gray-900">Candidatura #{{app.id}}</p>
                  <p class="text-sm text-gray-500">Pet ID: {{app.pet_id}} · {{app.housing_type}}</p>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-sm font-bold" [ngClass]="{
                    'text-green-600': app.compatibility_score >= 80,
                    'text-yellow-600': app.compatibility_score >= 50 && app.compatibility_score < 80,
                    'text-red-600': app.compatibility_score < 50
                  }">{{app.compatibility_score}}%</span>
                  <span class="px-3 py-1 rounded-full text-xs font-bold" [ngClass]="{
                    'bg-blue-100 text-blue-700': app.status === 'New',
                    'bg-yellow-100 text-yellow-700': app.status === 'Screening',
                    'bg-purple-100 text-purple-700': app.status === 'Interview',
                    'bg-green-100 text-green-700': app.status === 'Approved',
                    'bg-red-100 text-red-700': app.status === 'Rejected'
                  }">{{translateAppStatus(app.status)}}</span>
                </div>
              </div>
            </div>
            <p *ngIf="applications.length === 0" class="text-gray-500 text-center py-8">Nenhuma candidatura registrada ainda.</p>
          </div>

          <!-- GERENCIAR PETS -->
          <div *ngIf="activeSection === 'pets'">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900">Gerenciar Pets</h2>
              <a routerLink="/dashboard/shelter/add-pet" class="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:opacity-90 transition">+ Novo Pet</a>
            </div>

            <div class="mb-4 flex gap-3 flex-wrap">
              <select [(ngModel)]="filterStatus" (change)="applyFilters()" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">Todos os Status</option>
                <option value="Available">Disponível</option>
                <option value="Reserved">Reservado</option>
                <option value="Adopted">Adotado</option>
              </select>
              <select [(ngModel)]="filterSpecies" (change)="applyFilters()" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">Todas as Espécies</option>
                <option value="dog">Cachorro</option>
                <option value="cat">Gato</option>
              </select>
            </div>

            <div *ngIf="loadingPets" class="text-center py-8">
              <p class="text-gray-500">Carregando pets...</p>
            </div>

            <div *ngIf="!loadingPets && filteredPets.length === 0" class="text-center py-8">
              <p class="text-gray-500">Nenhum pet encontrado.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" *ngIf="!loadingPets && filteredPets.length > 0">
              <div *ngFor="let pet of filteredPets" class="bg-white rounded-xl shadow-soft overflow-hidden hover:shadow-md transition">
                <div class="h-40 bg-gray-200 relative">
                  <img *ngIf="pet.image_url" [src]="getPetImageUrl(pet)" [alt]="pet.name" class="w-full h-full object-cover">
                  <div *ngIf="!pet.image_url" class="w-full h-full flex items-center justify-center text-4xl">
                    {{pet.species === 'dog' ? '🐕' : '🐈'}}
                  </div>
                  <span class="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold" [ngClass]="{
                    'bg-green-100 text-green-700': pet.status === 'Available',
                    'bg-yellow-100 text-yellow-700': pet.status === 'Reserved',
                    'bg-blue-100 text-blue-700': pet.status === 'Adopted'
                  }">{{translateStatus(pet.status)}}</span>
                </div>
                <div class="p-4">
                  <h3 class="font-bold text-gray-900 text-lg">{{pet.name}}</h3>
                  <p class="text-sm text-gray-500">{{pet.breed}} · {{pet.age_description}} · {{translateSize(pet.size)}}</p>
                  <div class="flex gap-2 mt-3">
                    <a [routerLink]="'/pets/' + pet.id" class="flex-1 text-center text-sm py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium">Ver Perfil</a>
                    <button (click)="deletePet(pet)" class="text-sm py-2 px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium">Remover</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- CANDIDATURAS -->
          <div *ngIf="activeSection === 'applications'">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Candidaturas</h2>

            <div *ngIf="loadingApps" class="text-center py-8">
              <p class="text-gray-500">Carregando candidaturas...</p>
            </div>

            <div *ngIf="!loadingApps && applications.length === 0" class="text-center py-8">
              <p class="text-gray-500">Nenhuma candidatura registrada ainda.</p>
            </div>

            <div class="space-y-4" *ngIf="!loadingApps && applications.length > 0">
              <div *ngFor="let app of applications" class="bg-white p-6 rounded-xl shadow-soft">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-bold text-gray-900 text-lg">Candidatura #{{app.id}}</h3>
                    <p class="text-sm text-gray-500 mt-1">Pet ID: {{app.pet_id}} · Candidato ID: {{app.user_id}}</p>
                    <p class="text-sm text-gray-600 mt-2"><span class="font-medium">Moradia:</span> {{app.housing_type || 'Não informado'}}</p>
                    <p class="text-sm text-gray-600 mt-1"><span class="font-medium">Motivação:</span> {{app.motivation || 'Não informada'}}</p>
                  </div>
                  <div class="text-right">
                    <span class="text-2xl font-bold" [ngClass]="{
                      'text-green-600': app.compatibility_score >= 80,
                      'text-yellow-600': app.compatibility_score >= 50 && app.compatibility_score < 80,
                      'text-red-600': app.compatibility_score < 50
                    }">{{app.compatibility_score}}%</span>
                    <p class="text-xs text-gray-400">compatibilidade</p>
                  </div>
                </div>

                <!-- Stage Progress Bar -->
                <div class="mt-4 pt-4 border-t border-gray-100">
                  <div class="flex items-center justify-between mb-3">
                    <div *ngFor="let stage of stages; let i = index" class="flex items-center" [class.flex-1]="i < stages.length - 1">
                      <div class="flex flex-col items-center">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors"
                          [ngClass]="{
                            'bg-green-500 border-green-500 text-white': getStageIndex(app.status) > i,
                            'bg-primary border-primary text-white': getStageIndex(app.status) === i && app.status !== 'Rejected',
                            'bg-red-500 border-red-500 text-white': app.status === 'Rejected' && getStageIndex(app.status) === i,
                            'bg-gray-100 border-gray-300 text-gray-400': getStageIndex(app.status) < i
                          }">
                          <span *ngIf="getStageIndex(app.status) > i">✓</span>
                          <span *ngIf="getStageIndex(app.status) <= i">{{i + 1}}</span>
                        </div>
                        <span class="text-xs mt-1 text-gray-500 whitespace-nowrap">{{stage.label}}</span>
                      </div>
                      <div *ngIf="i < stages.length - 1" class="flex-1 h-0.5 mx-2 mt-[-12px]"
                        [ngClass]="getStageIndex(app.status) > i ? 'bg-green-400' : 'bg-gray-200'">
                      </div>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex gap-2 mt-3">
                    <span class="px-3 py-1 rounded-full text-xs font-bold" [ngClass]="{
                      'bg-blue-100 text-blue-700': app.status === 'New',
                      'bg-yellow-100 text-yellow-700': app.status === 'Screening',
                      'bg-purple-100 text-purple-700': app.status === 'Interview',
                      'bg-green-100 text-green-700': app.status === 'Approved',
                      'bg-red-100 text-red-700': app.status === 'Rejected'
                    }">{{translateAppStatus(app.status)}}</span>

                    <div class="ml-auto flex gap-2">
                      <!-- Advance to next stage -->
                      <button *ngIf="getNextStage(app.status) as next"
                        (click)="updateAppStatus(app, next)"
                        class="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 font-bold transition flex items-center gap-1">
                        Avançar para {{translateAppStatus(next)}} →
                      </button>
                      <!-- Reject at any stage -->
                      <button *ngIf="app.status !== 'Approved' && app.status !== 'Rejected'"
                        (click)="updateAppStatus(app, 'Rejected')"
                        class="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-bold transition">
                        Rejeitar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- RELATÓRIOS -->
          <div *ngIf="activeSection === 'reports'">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Relatórios</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-white p-6 rounded-2xl shadow-soft">
                <h3 class="font-bold text-gray-900 mb-4">Distribuição por Status</h3>
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Disponíveis</span>
                    <div class="flex items-center gap-2">
                      <div class="w-32 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div class="h-full bg-green-500 rounded-full" [style.width.%]="pets.length ? (availablePets / pets.length * 100) : 0"></div>
                      </div>
                      <span class="text-sm font-bold text-gray-900">{{availablePets}}</span>
                    </div>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Reservados</span>
                    <div class="flex items-center gap-2">
                      <div class="w-32 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div class="h-full bg-yellow-500 rounded-full" [style.width.%]="pets.length ? (reservedPets / pets.length * 100) : 0"></div>
                      </div>
                      <span class="text-sm font-bold text-gray-900">{{reservedPets}}</span>
                    </div>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Adotados</span>
                    <div class="flex items-center gap-2">
                      <div class="w-32 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div class="h-full bg-blue-500 rounded-full" [style.width.%]="pets.length ? (adoptedPets / pets.length * 100) : 0"></div>
                      </div>
                      <span class="text-sm font-bold text-gray-900">{{adoptedPets}}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-white p-6 rounded-2xl shadow-soft">
                <h3 class="font-bold text-gray-900 mb-4">Distribuição por Espécie</h3>
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">🐕 Cachorros</span>
                    <div class="flex items-center gap-2">
                      <div class="w-32 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div class="h-full bg-orange-400 rounded-full" [style.width.%]="pets.length ? (dogCount / pets.length * 100) : 0"></div>
                      </div>
                      <span class="text-sm font-bold text-gray-900">{{dogCount}}</span>
                    </div>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">🐈 Gatos</span>
                    <div class="flex items-center gap-2">
                      <div class="w-32 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div class="h-full bg-purple-400 rounded-full" [style.width.%]="pets.length ? (catCount / pets.length * 100) : 0"></div>
                      </div>
                      <span class="text-sm font-bold text-gray-900">{{catCount}}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-white p-6 rounded-2xl shadow-soft">
                <h3 class="font-bold text-gray-900 mb-4">Candidaturas por Status</h3>
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Novas</span>
                    <span class="text-sm font-bold text-blue-600">{{appsByStatus('New')}}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Em Triagem</span>
                    <span class="text-sm font-bold text-yellow-600">{{appsByStatus('Screening')}}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Em Entrevista</span>
                    <span class="text-sm font-bold text-purple-600">{{appsByStatus('Interview')}}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Aprovadas</span>
                    <span class="text-sm font-bold text-green-600">{{appsByStatus('Approved')}}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Rejeitadas</span>
                    <span class="text-sm font-bold text-red-600">{{appsByStatus('Rejected')}}</span>
                  </div>
                </div>
              </div>

              <div class="bg-white p-6 rounded-2xl shadow-soft">
                <h3 class="font-bold text-gray-900 mb-4">Distribuição por Porte</h3>
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Pequeno</span>
                    <div class="flex items-center gap-2">
                      <div class="w-32 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div class="h-full bg-teal-400 rounded-full" [style.width.%]="pets.length ? (sizeCount('small') / pets.length * 100) : 0"></div>
                      </div>
                      <span class="text-sm font-bold text-gray-900">{{sizeCount('small')}}</span>
                    </div>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Médio</span>
                    <div class="flex items-center gap-2">
                      <div class="w-32 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div class="h-full bg-indigo-400 rounded-full" [style.width.%]="pets.length ? (sizeCount('medium') / pets.length * 100) : 0"></div>
                      </div>
                      <span class="text-sm font-bold text-gray-900">{{sizeCount('medium')}}</span>
                    </div>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Grande</span>
                    <div class="flex items-center gap-2">
                      <div class="w-32 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div class="h-full bg-rose-400 rounded-full" [style.width.%]="pets.length ? (sizeCount('large') / pets.length * 100) : 0"></div>
                      </div>
                      <span class="text-sm font-bold text-gray-900">{{sizeCount('large')}}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- VOLUNTÁRIOS -->
          <div *ngIf="activeSection === 'volunteers'">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Voluntários</h2>

            <div *ngIf="volunteerApps.length === 0" class="text-center py-8 bg-white rounded-2xl shadow-soft">
              <span class="text-4xl mb-3 block">🤝</span>
              <p class="text-gray-500">Nenhum voluntário se candidatou ainda.</p>
            </div>

            <div class="space-y-4" *ngIf="volunteerApps.length > 0">
              <div *ngFor="let vol of volunteerApps" class="bg-white rounded-xl shadow-soft overflow-hidden">
                <div class="p-5 flex justify-between items-start cursor-pointer" (click)="toggleVolProfile(vol)">
                  <div>
                    <h4 class="font-bold text-gray-900 flex items-center gap-2">
                      {{vol.volunteer_name}}
                      <span class="text-xs text-primary font-normal">{{vol.expanded ? '▲ fechar' : '▼ ver perfil'}}</span>
                    </h4>
                    <p class="text-sm text-gray-500">{{vol.volunteer_email}}</p>
                    <p *ngIf="vol.message" class="text-sm text-gray-600 mt-2 italic">"{{vol.message}}"</p>
                    <div *ngIf="vol.average_rating" class="mt-2 flex items-center gap-1">
                      <span class="text-yellow-400">★</span>
                      <span class="text-sm font-bold">{{vol.average_rating}}</span>
                    </div>
                  </div>
                  <div class="flex flex-col items-end gap-2">
                    <span class="px-3 py-1 rounded-full text-xs font-bold" [ngClass]="{
                      'bg-yellow-100 text-yellow-700': vol.status === 'Pending',
                      'bg-green-100 text-green-700': vol.status === 'Approved',
                      'bg-red-100 text-red-700': vol.status === 'Rejected'
                    }">{{vol.status === 'Pending' ? 'Pendente' : vol.status === 'Approved' ? 'Aprovado' : 'Rejeitado'}}</span>
                    <div *ngIf="vol.status === 'Pending'" class="flex gap-2" (click)="$event.stopPropagation()">
                      <button (click)="updateVolunteerStatus(vol, 'Approved')" class="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-bold">Aprovar</button>
                      <button (click)="updateVolunteerStatus(vol, 'Rejected')" class="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-bold">Rejeitar</button>
                    </div>
                    <div *ngIf="vol.status === 'Approved' && !vol.showRating" (click)="$event.stopPropagation()">
                      <button (click)="vol.showRating = true" class="text-xs px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 font-bold">⭐ Avaliar</button>
                    </div>
                    <div *ngIf="vol.showRating" class="flex items-center gap-1 mt-2" (click)="$event.stopPropagation()">
                      <button *ngFor="let s of [1,2,3,4,5]" (click)="rateVolunteer(vol, s)" class="text-xl hover:scale-125 transition" [ngClass]="s <= (vol.ratingStars || 0) ? 'text-yellow-400' : 'text-gray-300'">★</button>
                    </div>
                  </div>
                </div>

                <!-- Expanded Profile -->
                <div *ngIf="vol.expanded" class="border-t border-gray-100 bg-gray-50 p-5">
                  <div *ngIf="vol.profileLoading" class="text-center py-4 text-gray-500 text-sm">Carregando perfil...</div>
                  <div *ngIf="!vol.profileLoading && vol.profile">
                    <h5 class="font-bold text-gray-800 mb-3 text-sm">Perfil do Voluntário</h5>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div class="bg-white p-3 rounded-lg text-center">
                        <p class="text-xs text-gray-500">Energia</p>
                        <p class="font-bold text-gray-900">{{vol.profile.energy_level}}/5</p>
                      </div>
                      <div class="bg-white p-3 rounded-lg text-center">
                        <p class="text-xs text-gray-500">Experiência</p>
                        <p class="font-bold text-gray-900">{{vol.profile.experience_level}}/5</p>
                      </div>
                      <div class="bg-white p-3 rounded-lg text-center">
                        <p class="text-xs text-gray-500">Paciência</p>
                        <p class="font-bold text-gray-900">{{vol.profile.patience_level}}/5</p>
                      </div>
                      <div class="bg-white p-3 rounded-lg text-center">
                        <p class="text-xs text-gray-500">Sociabilidade</p>
                        <p class="font-bold text-gray-900">{{vol.profile.social_level}}/5</p>
                      </div>
                    </div>
                    <div class="space-y-2 text-sm">
                      <p *ngIf="vol.profile.available_days"><span class="font-medium text-gray-700">Dias disponíveis:</span> {{vol.profile.available_days}}</p>
                      <p *ngIf="vol.profile.available_hours"><span class="font-medium text-gray-700">Horários:</span> {{vol.profile.available_hours}}</p>
                      <p *ngIf="vol.profile.skills"><span class="font-medium text-gray-700">Habilidades:</span> {{vol.profile.skills}}</p>
                      <p *ngIf="vol.profile.expectations"><span class="font-medium text-gray-700">Motivação:</span> {{vol.profile.expectations}}</p>
                    </div>
                  </div>
                  <div *ngIf="!vol.profileLoading && !vol.profile" class="text-sm text-gray-500 text-center py-4">
                    Este voluntário ainda não preencheu o perfil.
                  </div>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
    </div>
  `
})
export class ShelterDashboardComponent implements OnInit {
  shelterName = 'Abrigo';
  shelterCity = '';
  isApproved = true;
  activeSection: 'panel' | 'pets' | 'applications' | 'reports' | 'volunteers' = 'panel';

  pets: Pet[] = [];
  filteredPets: Pet[] = [];
  applications: Application[] = [];

  loadingPets = false;
  loadingApps = false;
  volunteerApps: any[] = [];

  filterStatus = '';
  filterSpecies = '';

  stages = [
    { id: 'New', label: 'Nova' },
    { id: 'Screening', label: 'Triagem' },
    { id: 'Interview', label: 'Entrevista' },
    { id: 'Approved', label: 'Aprovada' }
  ];

  constructor(
    private authService: AuthService,
    private petService: PetService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const user = this.authService.currentUserValue;
    if (user) {
      this.shelterName = user.name;
      this.shelterCity = user.city + ', ' + user.state;
      this.isApproved = user.approved !== false;
    }
    if (this.isApproved) {
      this.loadPets();
      this.loadApplications();
    }
  }

  switchSection(section: 'pets' | 'applications' | 'reports' | 'volunteers') {
    this.activeSection = section;
    if (section === 'pets' && this.pets.length === 0) {
      this.loadPets();
    }
    if (section === 'applications' && this.applications.length === 0) {
      this.loadApplications();
    }
    if (section === 'volunteers') {
      this.loadVolunteers();
    }
  }

  loadPets() {
    this.loadingPets = true;
    this.petService.getPets().subscribe({
      next: (data) => {
        this.pets = data;
        this.applyFilters();
        this.loadingPets = false;
      },
      error: () => {
        this.loadingPets = false;
      }
    });
  }

  loadApplications() {
    this.loadingApps = true;
    this.http.get<Application[]>('http://localhost:8000/applications/all').subscribe({
      next: (data) => {
        this.applications = data;
        this.loadingApps = false;
      },
      error: () => {
        this.loadingApps = false;
      }
    });
  }

  applyFilters() {
    this.filteredPets = this.pets.filter(pet => {
      if (this.filterStatus && pet.status !== this.filterStatus) return false;
      if (this.filterSpecies && pet.species !== this.filterSpecies) return false;
      return true;
    });
  }

  deletePet(pet: Pet) {
    if (confirm(`Tem certeza que deseja remover ${pet.name}?`)) {
      this.http.delete(`http://localhost:8000/pets/${pet.id}`).subscribe({
        next: () => {
          this.pets = this.pets.filter(p => p.id !== pet.id);
          this.applyFilters();
        },
        error: () => {
          alert('Erro ao remover pet.');
        }
      });
    }
  }

  updateAppStatus(app: Application, status: string) {
    this.http.put<Application>(`http://localhost:8000/applications/${app.id}/status?status=${status}`, {}).subscribe({
      next: (updated) => {
        app.status = updated.status;
      },
      error: () => {
        alert('Erro ao atualizar status da candidatura.');
      }
    });
  }

  get availablePets(): number {
    return this.pets.filter(p => p.status === 'Available').length;
  }

  get reservedPets(): number {
    return this.pets.filter(p => p.status === 'Reserved').length;
  }

  get adoptedPets(): number {
    return this.pets.filter(p => p.status === 'Adopted').length;
  }

  get pendingApplications(): number {
    return this.applications.filter(a => a.status === 'New' || a.status === 'Screening').length;
  }

  get dogCount(): number {
    return this.pets.filter(p => p.species === 'dog').length;
  }

  get catCount(): number {
    return this.pets.filter(p => p.species === 'cat').length;
  }

  sizeCount(size: string): number {
    return this.pets.filter(p => p.size === size).length;
  }

  appsByStatus(status: string): number {
    return this.applications.filter(a => a.status === status).length;
  }

  translateStatus(status: string): string {
    const map: Record<string, string> = { Available: 'Disponível', Reserved: 'Reservado', Adopted: 'Adotado' };
    return map[status] || status;
  }

  getPetImageUrl(pet: Pet): string {
    if (!pet.image_url) return '';
    if (pet.image_url.startsWith('http')) return pet.image_url;
    return 'http://localhost:8000' + pet.image_url;
  }

  translateSize(size: string): string {
    const map: Record<string, string> = { small: 'Pequeno', medium: 'Médio', large: 'Grande' };
    return map[size] || size;
  }

  translateAppStatus(status: string): string {
    const map: Record<string, string> = {
      New: 'Nova',
      Screening: 'Triagem',
      Interview: 'Entrevista',
      Approved: 'Aprovada',
      Rejected: 'Rejeitada'
    };
    return map[status] || status;
  }

  getStageIndex(status: string): number {
    const order = ['New', 'Screening', 'Interview', 'Approved'];
    const idx = order.indexOf(status);
    return idx >= 0 ? idx : 0;
  }

  getNextStage(status: string): string | null {
    const order = ['New', 'Screening', 'Interview', 'Approved'];
    const idx = order.indexOf(status);
    if (idx >= 0 && idx < order.length - 1) {
      return order[idx + 1];
    }
    return null;
  }

  loadVolunteers() {
    const user = this.authService.currentUserValue;
    if (!user) return;
    this.http.get<any[]>(`http://localhost:8000/volunteers/shelter/${user.id}/pending`).subscribe({
      next: (data) => { this.volunteerApps = data; }
    });
  }

  toggleVolProfile(vol: any) {
    if (vol.expanded) {
      vol.expanded = false;
      return;
    }
    vol.expanded = true;
    if (!vol.profile) {
      vol.profileLoading = true;
      this.http.get<any>(`http://localhost:8000/profile/${vol.volunteer_id}`).subscribe({
        next: (data) => {
          vol.profile = data;
          vol.profileLoading = false;
        },
        error: () => {
          vol.profile = null;
          vol.profileLoading = false;
        }
      });
    }
  }

  updateVolunteerStatus(vol: any, status: string) {
    this.http.put(`http://localhost:8000/volunteers/applications/${vol.id}/status`, { status }).subscribe({
      next: () => { vol.status = status; }
    });
  }

  rateVolunteer(vol: any, stars: number) {
    const user = this.authService.currentUserValue;
    if (!user) return;
    vol.ratingStars = stars;
    this.http.post('http://localhost:8000/volunteers/rate', {
      volunteer_id: vol.volunteer_id,
      shelter_id: user.id,
      stars: stars
    }).subscribe({
      next: () => { vol.showRating = false; }
    });
  }
}
