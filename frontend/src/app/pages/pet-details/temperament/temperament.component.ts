import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PetService } from '../../../core/services/pet.service';
import { PetTemperament } from '../../../core/models/pet-details.models';

interface TemperamentLevel {
  key: keyof Pick<PetTemperament, 'energy_level' | 'sociability_people' | 'sociability_animals' | 'training_level' | 'independence_level' | 'playfulness' | 'noise_level'>;
  label: string;
}

@Component({
  selector: 'app-temperament',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Loading State -->
    <div *ngIf="loading" class="animate-pulse space-y-4">
      <div class="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div *ngFor="let i of [1,2,3,4,5,6,7]" class="space-y-2">
        <div class="h-4 bg-gray-200 rounded w-1/4"></div>
        <div class="h-3 bg-gray-200 rounded w-full"></div>
      </div>
    </div>

    <!-- Error State -->
    <div *ngIf="!loading && error" class="text-center py-8">
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button (click)="loadTemperament()" class="btn-primary px-6 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:opacity-90 transition">
        Tentar novamente
      </button>
    </div>

    <!-- Empty State -->
    <div *ngIf="!loading && !error && !temperament" class="text-center py-8">
      <p class="text-gray-500 text-lg">Perfil de temperamento ainda não foi preenchido pelo cuidador.</p>
    </div>

    <!-- Loaded State -->
    <div *ngIf="!loading && !error && temperament" class="space-y-5">
      <div *ngFor="let level of temperamentLevels" class="space-y-1">
        <div class="flex justify-between items-center">
          <span class="text-sm font-medium text-gray-700">{{ level.label }}</span>
          <span class="text-sm text-gray-500">{{ getTemperamentValue(level.key) }}/5</span>
        </div>
        <div class="flex gap-1">
          <div
            *ngFor="let step of [1,2,3,4,5]"
            class="h-3 flex-1 rounded-full transition-colors"
            [ngClass]="step <= getTemperamentValue(level.key) ? 'bg-primary' : 'bg-gray-200'"
            [attr.aria-label]="level.label + ': ' + getTemperamentValue(level.key) + ' de 5'"
          ></div>
        </div>
      </div>

      <!-- Behavior Notes -->
      <div *ngIf="temperament.behavior_notes" class="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
        <h4 class="font-bold text-blue-800 text-sm mb-2">Observações de Comportamento</h4>
        <p class="text-blue-700 text-sm leading-relaxed">{{ temperament.behavior_notes }}</p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class TemperamentComponent implements OnInit, OnChanges {
  @Input() petId!: number;

  temperament: PetTemperament | null = null;
  loading = false;
  error: string | null = null;

  temperamentLevels: TemperamentLevel[] = [
    { key: 'energy_level', label: 'Nível de Energia' },
    { key: 'sociability_people', label: 'Sociabilidade com Pessoas' },
    { key: 'sociability_animals', label: 'Sociabilidade com Animais' },
    { key: 'training_level', label: 'Nível de Treinamento' },
    { key: 'independence_level', label: 'Nível de Independência' },
    { key: 'playfulness', label: 'Brincadeira' },
    { key: 'noise_level', label: 'Nível de Barulho' }
  ];

  constructor(private petService: PetService) {}

  ngOnInit(): void {
    if (this.petId) {
      this.loadTemperament();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['petId'] && !changes['petId'].firstChange && this.petId) {
      this.loadTemperament();
    }
  }

  loadTemperament(): void {
    this.loading = true;
    this.error = null;
    this.temperament = null;

    this.petService.getTemperament(this.petId).subscribe({
      next: (data) => {
        this.temperament = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 404) {
          // Empty state - no temperament profile yet
          this.temperament = null;
        } else {
          this.error = 'Não foi possível carregar o perfil de temperamento. Tente novamente.';
        }
      }
    });
  }

  getTemperamentValue(key: string): number {
    if (!this.temperament) return 0;
    return (this.temperament as any)[key] ?? 0;
  }
}
