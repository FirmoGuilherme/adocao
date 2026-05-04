import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PetService, Pet } from '../../core/services/pet.service';

@Component({
  selector: 'app-pet-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-background min-h-screen py-8" *ngIf="pet">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <nav class="flex text-sm text-gray-500 mb-6">
          <a routerLink="/explore" class="hover:text-primary transition-colors">Explorar Pets</a>
          <span class="mx-2">/</span>
          <span class="text-gray-900 font-medium">{{pet.name}}</span>
        </nav>

        <div class="bg-surface rounded-3xl shadow-soft overflow-hidden">
          <div class="grid grid-cols-1 md:grid-cols-2">
            <div class="relative h-96 md:h-full bg-gray-200">
               <img [src]="pet.image_url || (pet.species === 'dog' ? 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80' : 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80')" 
                   [alt]="pet.name" class="absolute inset-0 w-full h-full object-cover">
               <div class="absolute top-4 left-4 flex gap-2">
                 <span class="badge bg-white shadow-md text-secondary border border-green-100 px-3 py-1 text-sm rounded-full">
                   ✓ 85% compatível com seu perfil
                 </span>
               </div>
            </div>

            <div class="p-8 md:p-12 flex flex-col justify-center">
              <div class="flex justify-between items-start mb-2">
                <h1 class="text-4xl font-extrabold text-gray-900">{{pet.name}}</h1>
                <span class="text-3xl" [ngClass]="pet.sex === 'female' ? 'text-pink-400' : 'text-blue-400'">
                  {{pet.sex === 'female' ? '♀' : '♂'}}
                </span>
              </div>
              
              <p class="text-xl text-gray-600 mb-6">{{pet.breed}} · {{pet.age_description}}</p>
              
              <div class="flex flex-wrap gap-2 mb-8">
                <span class="badge badge-success px-4 py-2 rounded-full text-sm">{{translateStatus(pet.status)}}</span>
                <span class="badge bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm">🏢 {{pet.shelter_name}}</span>
                <span class="badge bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm">📍 {{pet.city}}</span>
              </div>

              <a routerLink="/apply/{{pet.id}}" class="w-full btn-primary text-center text-lg py-4 shadow-float hover:-translate-y-1 transform transition">
                Candidatar-se para adotar {{pet.name}}
              </a>
              <button class="w-full mt-4 btn-outline text-center py-3">Salvar para depois</button>
            </div>
          </div>
        </div>

        <div class="mt-8 bg-surface rounded-3xl shadow-soft">
          <div class="border-b border-gray-200">
            <nav class="flex -mb-px overflow-x-auto" aria-label="Abas">
              <button (click)="activeTab = 'overview'" [class.border-primary]="activeTab === 'overview'" [class.text-primary]="activeTab === 'overview'" class="w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap">
                Visão Geral
              </button>
              <button (click)="activeTab = 'health'" [class.border-primary]="activeTab === 'health'" [class.text-primary]="activeTab === 'health'" class="w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap border-transparent">
                Saúde
              </button>
              <button (click)="activeTab = 'home'" [class.border-primary]="activeTab === 'home'" [class.text-primary]="activeTab === 'home'" class="w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap border-transparent">
                Compatibilidade
              </button>
              <button (click)="activeTab = 'shelter'" [class.border-primary]="activeTab === 'shelter'" [class.text-primary]="activeTab === 'shelter'" class="w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap border-transparent">
                Processo de Adoção
              </button>
            </nav>
          </div>

          <div class="p-8">
            <div *ngIf="activeTab === 'overview'" class="animate-fadeIn">
              <h3 class="text-2xl font-bold text-gray-900 mb-4">Conheça {{pet.name}}</h3>
              <p class="text-gray-600 leading-relaxed text-lg mb-8">{{pet.description || 'Um pet adorável esperando um lar.'}}</p>
              
              <h4 class="text-lg font-bold text-gray-900 mb-4">Características Principais</h4>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-gray-50 p-4 rounded-xl text-center">
                  <span class="block text-2xl mb-2">📏</span>
                  <span class="text-sm text-gray-500 block">Porte</span>
                  <span class="font-bold text-gray-900">{{translateSize(pet.size)}}</span>
                </div>
                <div class="bg-gray-50 p-4 rounded-xl text-center">
                  <span class="block text-2xl mb-2">🎨</span>
                  <span class="text-sm text-gray-500 block">Cor</span>
                  <span class="font-bold text-gray-900 capitalize">{{pet.color}}</span>
                </div>
                <div class="bg-gray-50 p-4 rounded-xl text-center">
                  <span class="block text-2xl mb-2">🐾</span>
                  <span class="text-sm text-gray-500 block">Espécie</span>
                  <span class="font-bold text-gray-900">{{translateSpecies(pet.species)}}</span>
                </div>
                <div class="bg-gray-50 p-4 rounded-xl text-center">
                  <span class="block text-2xl mb-2">🎂</span>
                  <span class="text-sm text-gray-500 block">Faixa Etária</span>
                  <span class="font-bold text-gray-900">{{translateAgeGroup(pet.age_group)}}</span>
                </div>
              </div>
            </div>

            <div *ngIf="activeTab === 'health'" class="animate-fadeIn">
              <h3 class="text-2xl font-bold text-gray-900 mb-6">Saúde e Veterinário</h3>
              <ul class="space-y-4">
                <li class="flex items-center space-x-3 text-lg">
                  <span [ngClass]="pet.is_vaccinated ? 'text-green-500' : 'text-gray-300'" class="text-2xl">✓</span>
                  <span class="text-gray-700">Vacinação em dia</span>
                </li>
                <li class="flex items-center space-x-3 text-lg">
                  <span [ngClass]="pet.is_neutered ? 'text-green-500' : 'text-gray-300'" class="text-2xl">✓</span>
                  <span class="text-gray-700">Castrado(a)</span>
                </li>
              </ul>
              <div class="mt-8 bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h4 class="font-bold text-blue-800 flex items-center mb-2"><span class="mr-2">ℹ️</span> Observações de Saúde</h4>
                <p class="text-blue-700">Saudável no geral. Pronto(a) para um lar permanente e amoroso.</p>
              </div>
            </div>

            <div *ngIf="activeTab === 'home'" class="animate-fadeIn">
              <h3 class="text-2xl font-bold text-gray-900 mb-6">Compatibilidade com o Lar</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 class="font-bold text-gray-900 mb-3">Convive bem com:</h4>
                  <ul class="space-y-2">
                    <li *ngIf="pet.good_with_kids" class="flex items-center space-x-2"><span class="text-green-500">✓</span><span>Crianças</span></li>
                    <li *ngIf="pet.good_with_dogs" class="flex items-center space-x-2"><span class="text-green-500">✓</span><span>Outros Cães</span></li>
                    <li *ngIf="pet.good_with_cats" class="flex items-center space-x-2"><span class="text-green-500">✓</span><span>Gatos</span></li>
                    <li *ngIf="pet.apartment_friendly" class="flex items-center space-x-2"><span class="text-green-500">✓</span><span>Apartamentos</span></li>
                    <li *ngIf="pet.first_time_owner_friendly" class="flex items-center space-x-2"><span class="text-green-500">✓</span><span>Donos de primeira viagem</span></li>
                  </ul>
                </div>
                <div class="bg-orange-50 p-6 rounded-xl border border-orange-100">
                  <h4 class="font-bold text-orange-800 mb-2">Pontos a considerar</h4>
                  <p class="text-orange-700 text-sm">Adotar um pet é um compromisso de longo prazo. Certifique-se de ter tempo e estabilidade financeira para cuidar de {{pet.name}}.</p>
                </div>
              </div>
            </div>

            <div *ngIf="activeTab === 'shelter'" class="animate-fadeIn">
               <h3 class="text-2xl font-bold text-gray-900 mb-4">Processo de Adoção</h3>
               <div class="space-y-6 relative border-l-2 border-primary ml-4 pl-6 pb-2">
                 <div class="relative">
                   <div class="absolute -left-9 top-0 bg-primary h-6 w-6 rounded-full border-4 border-white"></div>
                   <h4 class="font-bold text-gray-900">1. Candidate-se Online</h4>
                   <p class="text-gray-600 text-sm mt-1">Preencha o formulário de candidatura respondendo perguntas sobre seu estilo de vida.</p>
                 </div>
                 <div class="relative">
                   <div class="absolute -left-9 top-0 bg-gray-300 h-6 w-6 rounded-full border-4 border-white"></div>
                   <h4 class="font-bold text-gray-900">2. Análise e Entrevista</h4>
                   <p class="text-gray-600 text-sm mt-1">{{pet.shelter_name}} analisará sua candidatura e agendará uma breve entrevista.</p>
                 </div>
                 <div class="relative">
                   <div class="absolute -left-9 top-0 bg-gray-300 h-6 w-6 rounded-full border-4 border-white"></div>
                   <h4 class="font-bold text-gray-900">3. Conheça e Adote</h4>
                   <p class="text-gray-600 text-sm mt-1">Conheça {{pet.name}}! Após aprovação, finalize a documentação e leve seu novo amigo para casa.</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div *ngIf="errorMessage" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <h2 class="text-2xl text-red-500 mb-2">Erro ao carregar pet</h2>
        <p class="text-gray-500">{{errorMessage}}</p>
      </div>
    </div>
    <div *ngIf="!pet && !loading && !errorMessage" class="min-h-screen flex items-center justify-center">
      <h2 class="text-2xl text-gray-500">Pet não encontrado.</h2>
    </div>
  `,
  styles: [`
    .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class PetDetailsComponent implements OnInit {
  pet: Pet | null = null;
  loading = true;
  errorMessage: string | null = null;
  activeTab = 'overview';

  constructor(private route: ActivatedRoute, private petService: PetService) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.petService.getPet(id).subscribe({
          next: data => { this.pet = data; this.loading = false; },
          error: err => {
            this.errorMessage = 'Falha ao carregar detalhes do pet. Tente novamente.';
            this.loading = false;
          }
        });
      }
    });
  }

  translateSize(size: string): string {
    const map: Record<string, string> = { small: 'Pequeno', medium: 'Médio', large: 'Grande' };
    return map[size] || size;
  }
  translateStatus(status: string): string {
    const map: Record<string, string> = { Available: 'Disponível', Reserved: 'Reservado', Adopted: 'Adotado' };
    return map[status] || status;
  }
  translateSpecies(species: string): string {
    const map: Record<string, string> = { dog: 'Cachorro', cat: 'Gato' };
    return map[species] || species;
  }
  translateAgeGroup(ag: string): string {
    const map: Record<string, string> = { puppy: 'Filhote', kitten: 'Filhote', young: 'Jovem', adult: 'Adulto', senior: 'Idoso' };
    return map[ag] || ag;
  }
}
