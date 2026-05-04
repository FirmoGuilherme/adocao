import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PetService, Pet } from '../../core/services/pet.service';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-background min-h-screen">
      <div class="flex flex-col md:flex-row gap-8">
        
        <div class="w-full md:w-64 flex-shrink-0 bg-surface p-6 rounded-2xl shadow-soft h-fit sticky top-24">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Filtros</h2>
          
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Espécie</label>
              <select [(ngModel)]="filters.species" (change)="loadPets()" class="input-field">
                <option value="">Todas</option>
                <option value="dog">Cachorro</option>
                <option value="cat">Gato</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Porte</label>
              <select [(ngModel)]="filters.size" (change)="loadPets()" class="input-field">
                <option value="">Qualquer</option>
                <option value="small">Pequeno</option>
                <option value="medium">Médio</option>
                <option value="large">Grande</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Características</label>
              <div class="space-y-2 text-sm text-gray-600">
                <label class="flex items-center space-x-2">
                  <input type="checkbox" [(ngModel)]="filters.apartment_friendly" (change)="loadPets()" class="rounded text-primary focus:ring-primary h-4 w-4">
                  <span>Apto para Apartamento</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input type="checkbox" [(ngModel)]="filters.good_with_kids" (change)="loadPets()" class="rounded text-primary focus:ring-primary h-4 w-4">
                  <span>Bom com Crianças</span>
                </label>
              </div>
            </div>

            <button (click)="resetFilters()" class="w-full btn-outline mt-4">Limpar Filtros</button>
          </div>
        </div>

        <div class="flex-grow">
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold text-gray-900">Explorar Pets</h1>
            <span class="text-gray-500">{{pets.length}} pets encontrados</span>
          </div>

          <div *ngIf="loading" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
            <p class="mt-2 text-gray-500">Buscando seu par perfeito...</p>
          </div>

          <div *ngIf="!loading && pets.length === 0 && !connectionError" class="text-center py-12 bg-white rounded-2xl shadow-soft">
            <span class="text-6xl mb-4 block">😿</span>
            <h3 class="text-lg font-medium text-gray-900">Nenhum pet encontrado</h3>
            <p class="mt-1 text-gray-500">Tente ajustar os filtros para ver mais resultados.</p>
          </div>

          <div *ngIf="!loading && connectionError" class="text-center py-12 bg-white rounded-2xl shadow-soft">
            <span class="text-6xl mb-4 block">🔌</span>
            <h3 class="text-lg font-medium text-gray-900">Não foi possível conectar ao servidor</h3>
            <p class="mt-1 text-gray-500 mb-4">Verifique se o backend está rodando com <code class="bg-gray-100 px-2 py-1 rounded">docker-compose up</code></p>
            <button (click)="loadPets()" class="btn-primary">Tentar novamente</button>
          </div>

          <div *ngIf="!loading && pets.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div *ngFor="let pet of pets" class="card group flex flex-col h-full bg-surface hover:shadow-float cursor-pointer" [routerLink]="['/pets', pet.id]">
              <div class="relative h-48 w-full bg-gray-200 overflow-hidden">
                <img [src]="pet.image_url || (pet.species === 'dog' ? 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80' : 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80')" 
                     [alt]="pet.name" class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500">
                
                <div class="absolute top-2 right-2 flex flex-col gap-1">
                  <span *ngIf="pet.apartment_friendly" class="badge bg-white shadow text-accent border border-blue-100">🏠 Apto</span>
                  <span *ngIf="pet.age_group === 'senior'" class="badge bg-white shadow text-purple-600 border border-purple-100">👴 Idoso</span>
                </div>
              </div>

              <div class="p-5 flex flex-col flex-grow">
                <div class="flex justify-between items-start mb-2">
                  <h3 class="text-xl font-bold text-gray-900 truncate">{{pet.name}}</h3>
                  <span class="badge" [ngClass]="pet.sex === 'female' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'">
                    {{pet.sex === 'female' ? '♀' : '♂'}}
                  </span>
                </div>
                
                <p class="text-sm text-gray-600 mb-4 line-clamp-1">{{pet.breed}} · {{pet.age_description}} · {{translateSize(pet.size)}}</p>
                
                <div class="flex flex-wrap gap-1 mb-4">
                  <span class="badge badge-success capitalize">{{translateStatus(pet.status)}}</span>
                  <span class="badge bg-gray-100 text-gray-700 truncate max-w-full">📍 {{pet.city}}</span>
                </div>

                <div class="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div class="flex items-center text-sm text-gray-500 font-medium truncate">
                    <span class="mr-1">🏢</span> {{pet.shelter_name}}
                  </div>
                  <span class="text-primary font-medium group-hover:underline text-sm ml-2">Ver →</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `
})
export class ExploreComponent implements OnInit {
  pets: Pet[] = [];
  loading = true;
  connectionError = false;
  filters: any = {
    species: '',
    size: '',
    apartment_friendly: false,
    good_with_kids: false
  };

  constructor(private petService: PetService) {}

  ngOnInit() {
    this.loadPets();
  }

  loadPets() {
    this.loading = true;
    this.connectionError = false;
    
    const activeFilters = Object.fromEntries(
      Object.entries(this.filters).filter(([_, v]) => v !== '' && v !== false)
    );

    this.petService.getPets(activeFilters).subscribe({
      next: (data) => {
        this.pets = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar pets:', err);
        this.connectionError = err.status === 0;
        this.loading = false;
      }
    });
  }

  resetFilters() {
    this.filters = { species: '', size: '', apartment_friendly: false, good_with_kids: false };
    this.loadPets();
  }

  translateSize(size: string): string {
    const map: Record<string, string> = { small: 'Pequeno', medium: 'Médio', large: 'Grande' };
    return map[size] || size;
  }

  translateStatus(status: string): string {
    const map: Record<string, string> = { Available: 'Disponível', Reserved: 'Reservado', Adopted: 'Adotado' };
    return map[status] || status;
  }
}
