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
        
        <!-- Sidebar Filters -->
        <div class="w-full md:w-64 flex-shrink-0 bg-surface p-6 rounded-2xl shadow-soft h-fit sticky top-24">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Filters</h2>
          
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Species</label>
              <select [(ngModel)]="filters.species" (change)="loadPets()" class="input-field">
                <option value="">All Species</option>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Size</label>
              <select [(ngModel)]="filters.size" (change)="loadPets()" class="input-field">
                <option value="">Any Size</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Traits</label>
              <div class="space-y-2 text-sm text-gray-600">
                <label class="flex items-center space-x-2">
                  <input type="checkbox" [(ngModel)]="filters.apartment_friendly" (change)="loadPets()" class="rounded text-primary focus:ring-primary h-4 w-4">
                  <span>Apartment Friendly</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input type="checkbox" [(ngModel)]="filters.good_with_kids" (change)="loadPets()" class="rounded text-primary focus:ring-primary h-4 w-4">
                  <span>Good with Kids</span>
                </label>
              </div>
            </div>

            <button (click)="resetFilters()" class="w-full btn-outline mt-4">Reset Filters</button>
          </div>
        </div>

        <!-- Main Pet Grid -->
        <div class="flex-grow">
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold text-gray-900">Explore Pets</h1>
            <span class="text-gray-500">{{pets.length}} pets found</span>
          </div>

          <div *ngIf="loading" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
            <p class="mt-2 text-gray-500">Finding your perfect match...</p>
          </div>

          <div *ngIf="!loading && pets.length === 0" class="text-center py-12 bg-white rounded-2xl shadow-soft">
            <span class="text-6xl mb-4 block">😿</span>
            <h3 class="text-lg font-medium text-gray-900">No pets found</h3>
            <p class="mt-1 text-gray-500">Try adjusting your filters to see more results.</p>
          </div>

          <div *ngIf="!loading && pets.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div *ngFor="let pet of pets" class="card group flex flex-col h-full bg-surface hover:shadow-float cursor-pointer" [routerLink]="['/pets', pet.id]">
              <div class="relative h-48 w-full bg-gray-200 overflow-hidden">
                 <!-- Using placeholder logic since mock DB won't have actual HTTP URLs. In real app, bind to pet.image_url -->
                <img [src]="pet.species === 'dog' ? 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80' : 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80'" 
                     alt="{{pet.name}}" class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500">
                
                <div class="absolute top-2 right-2 flex flex-col gap-1">
                  <span *ngIf="pet.apartment_friendly" class="badge bg-white shadow text-accent border border-blue-100">🏠 Apt Friendly</span>
                  <span *ngIf="pet.age_group === 'senior'" class="badge bg-white shadow text-purple-600 border border-purple-100">👴 Senior</span>
                </div>
              </div>

              <div class="p-5 flex flex-col flex-grow">
                <div class="flex justify-between items-start mb-2">
                  <h3 class="text-xl font-bold text-gray-900 truncate">{{pet.name}}</h3>
                  <span class="badge" [ngClass]="pet.sex === 'female' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'">
                    {{pet.sex === 'female' ? '♀' : '♂'}}
                  </span>
                </div>
                
                <p class="text-sm text-gray-600 mb-4 line-clamp-1">{{pet.breed}} • {{pet.age_description}} • {{pet.size | titlecase}}</p>
                
                <div class="flex flex-wrap gap-1 mb-4">
                  <span class="badge badge-success capitalize">{{pet.status}}</span>
                  <span class="badge bg-gray-100 text-gray-700 truncate max-w-full">📍 {{pet.city}}</span>
                </div>

                <div class="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div class="flex items-center text-sm text-gray-500 font-medium truncate">
                    <span class="mr-1">🏢</span> {{pet.shelter_name}}
                  </div>
                  <span class="text-primary font-medium group-hover:underline text-sm ml-2">View →</span>
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
    
    // Clean filters object to remove empty strings and false booleans to not pass them to backend unnecessarily
    const activeFilters = Object.fromEntries(
      Object.entries(this.filters).filter(([_, v]) => v !== '' && v !== false)
    );

    this.petService.getPets(activeFilters).subscribe({
      next: (data) => {
        this.pets = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching pets:', err);
        this.loading = false;
      }
    });
  }

  resetFilters() {
    this.filters = { species: '', size: '', apartment_friendly: false, good_with_kids: false };
    this.loadPets();
  }
}
