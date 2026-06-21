import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PetService } from '../../../core/services/pet.service';
import { PetHealthRecord } from '../../../core/models/pet-details.models';

type ComponentState = 'loading' | 'loaded' | 'empty' | 'error';

@Component({
  selector: 'app-health-info',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Loading State -->
    <div *ngIf="state === 'loading'" class="animate-pulse space-y-4">
      <div class="h-6 bg-gray-200 rounded w-1/3"></div>
      <div class="h-4 bg-gray-200 rounded w-full"></div>
      <div class="h-4 bg-gray-200 rounded w-5/6"></div>
      <div class="h-4 bg-gray-200 rounded w-2/3"></div>
      <div class="grid grid-cols-2 gap-4 mt-4">
        <div class="h-20 bg-gray-200 rounded"></div>
        <div class="h-20 bg-gray-200 rounded"></div>
      </div>
    </div>

    <!-- Error State -->
    <div *ngIf="state === 'error'" class="text-center py-8">
      <p class="text-red-600 mb-4">Não foi possível carregar as informações de saúde.</p>
      <button (click)="retry()" class="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition">
        Tentar novamente
      </button>
    </div>

    <!-- Empty State -->
    <div *ngIf="state === 'empty'" class="text-center py-8">
      <p class="text-gray-500">Informações de saúde ainda não foram preenchidas pelo cuidador.</p>
    </div>

    <!-- Loaded State -->
    <div *ngIf="state === 'loaded' && healthRecord" class="space-y-6">
      <!-- Weight and Last Vet Visit -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div *ngIf="healthRecord.weight_kg" class="bg-gray-50 p-4 rounded-xl">
          <span class="text-sm text-gray-500 block">Peso</span>
          <span class="text-lg font-bold text-gray-900">{{ healthRecord.weight_kg }} kg</span>
        </div>
        <div *ngIf="healthRecord.last_vet_visit" class="bg-gray-50 p-4 rounded-xl">
          <span class="text-sm text-gray-500 block">Última visita ao veterinário</span>
          <span class="text-lg font-bold text-gray-900">{{ formatDate(healthRecord.last_vet_visit) }}</span>
        </div>
      </div>

      <!-- Special Needs -->
      <div *ngIf="healthRecord.special_needs" class="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
        <h4 class="font-bold text-yellow-800 flex items-center mb-2">
          <span class="mr-2">⚠️</span> Necessidades Especiais
        </h4>
        <p class="text-yellow-700">{{ healthRecord.special_needs }}</p>
      </div>

      <!-- Vaccination History -->
      <div *ngIf="healthRecord.vaccination_records.length > 0">
        <h4 class="text-lg font-bold text-gray-900 mb-3">Histórico de Vacinação</h4>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th class="px-4 py-3 rounded-tl-lg">Vacina</th>
                <th class="px-4 py-3">Data de Aplicação</th>
                <th class="px-4 py-3 rounded-tr-lg">Validade</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let vaccine of healthRecord.vaccination_records" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-900">{{ vaccine.vaccine_name }}</td>
                <td class="px-4 py-3 text-gray-600">{{ formatDate(vaccine.date_administered) }}</td>
                <td class="px-4 py-3 text-gray-600">{{ vaccine.expiry_date ? formatDate(vaccine.expiry_date) : '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Medical Conditions -->
      <div *ngIf="healthRecord.medical_conditions.length > 0">
        <h4 class="text-lg font-bold text-gray-900 mb-3">Condições Médicas</h4>
        <ul class="space-y-2">
          <li *ngFor="let condition of healthRecord.medical_conditions" class="bg-gray-50 p-3 rounded-lg">
            <span class="font-medium text-gray-900">{{ condition.condition_name }}</span>
            <span *ngIf="condition.diagnosed_date" class="text-sm text-gray-500 ml-2">
              (diagnosticado em {{ formatDate(condition.diagnosed_date) }})
            </span>
            <p *ngIf="condition.notes" class="text-sm text-gray-600 mt-1">{{ condition.notes }}</p>
          </li>
        </ul>
      </div>

      <!-- Surgeries -->
      <div *ngIf="healthRecord.surgeries.length > 0">
        <h4 class="text-lg font-bold text-gray-900 mb-3">Cirurgias</h4>
        <ul class="space-y-2">
          <li *ngFor="let surgery of healthRecord.surgeries" class="bg-gray-50 p-3 rounded-lg">
            <span class="font-medium text-gray-900">{{ surgery.surgery_name }}</span>
            <span class="text-sm text-gray-500 ml-2">
              ({{ formatDate(surgery.surgery_date) }})
            </span>
            <p *ngIf="surgery.description" class="text-sm text-gray-600 mt-1">{{ surgery.description }}</p>
          </li>
        </ul>
      </div>
    </div>
  `
})
export class HealthInfoComponent implements OnInit, OnChanges {
  @Input() petId!: number;

  state: ComponentState = 'loading';
  healthRecord: PetHealthRecord | null = null;

  constructor(private petService: PetService) {}

  ngOnInit(): void {
    this.loadHealthRecord();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['petId'] && !changes['petId'].firstChange) {
      this.loadHealthRecord();
    }
  }

  retry(): void {
    this.loadHealthRecord();
  }

  private loadHealthRecord(): void {
    if (!this.petId) {
      return;
    }

    this.state = 'loading';
    this.healthRecord = null;

    this.petService.getHealthRecord(this.petId).subscribe({
      next: (record) => {
        this.healthRecord = record;
        this.state = 'loaded';
      },
      error: (err) => {
        if (err.status === 404) {
          this.state = 'empty';
        } else {
          this.state = 'error';
        }
      }
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  }
}
