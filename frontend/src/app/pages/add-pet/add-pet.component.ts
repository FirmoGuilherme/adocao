import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PetService } from '../../core/services/pet.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-add-pet',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="bg-background min-h-screen py-10">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <a routerLink="/dashboard/shelter" class="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-flex items-center">
          ← Voltar ao painel
        </a>

        <div class="bg-surface rounded-3xl shadow-soft p-8 md:p-12">

          <div *ngIf="successMessage" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">
            ✅ {{ successMessage }}
            <div class="mt-3 flex gap-3">
              <button (click)="resetForm()" class="btn-primary text-sm px-4 py-2">Cadastrar outro</button>
              <a routerLink="/dashboard/shelter" class="btn-outline text-sm px-4 py-2">Voltar ao painel</a>
            </div>
          </div>

          <div *ngIf="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
            ❌ {{ errorMessage }}
          </div>

          <div *ngIf="!successMessage">
            <div class="text-center mb-8">
              <h1 class="text-3xl font-extrabold text-gray-900">Cadastrar Novo Pet</h1>
              <p class="text-gray-500 mt-2">Preencha as informações do animal para disponibilizá-lo para adoção.</p>
            </div>

            <form class="space-y-6" (ngSubmit)="onSubmit()">

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Pet <span class="text-red-500">*</span></label>
                  <input type="text" required [(ngModel)]="pet.name" name="name" class="input-field py-2" placeholder="Ex: Luna">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Espécie <span class="text-red-500">*</span></label>
                  <select required [(ngModel)]="pet.species" name="species" class="input-field py-2">
                    <option value="">Selecione...</option>
                    <option value="dog">Cachorro</option>
                    <option value="cat">Gato</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Raça <span class="text-red-500">*</span></label>
                  <input type="text" required [(ngModel)]="pet.breed" name="breed" class="input-field py-2" placeholder="Ex: SRD, Labrador Mix">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Cor <span class="text-red-500">*</span></label>
                  <input type="text" required [(ngModel)]="pet.color" name="color" class="input-field py-2" placeholder="Ex: caramelo, preto">
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Faixa Etária <span class="text-red-500">*</span></label>
                  <select required [(ngModel)]="pet.age_group" name="age_group" class="input-field py-2">
                    <option value="">Selecione...</option>
                    <option value="puppy">Filhote</option>
                    <option value="young">Jovem</option>
                    <option value="adult">Adulto</option>
                    <option value="senior">Idoso</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Idade <span class="text-red-500">*</span></label>
                  <input type="text" required [(ngModel)]="pet.age_description" name="age_description" class="input-field py-2" placeholder="Ex: 2 anos, 6 meses">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Sexo <span class="text-red-500">*</span></label>
                  <select required [(ngModel)]="pet.sex" name="sex" class="input-field py-2">
                    <option value="">Selecione...</option>
                    <option value="male">Macho</option>
                    <option value="female">Fêmea</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Porte <span class="text-red-500">*</span></label>
                  <select required [(ngModel)]="pet.size" name="size" class="input-field py-2">
                    <option value="">Selecione...</option>
                    <option value="small">Pequeno</option>
                    <option value="medium">Médio</option>
                    <option value="large">Grande</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Cidade <span class="text-red-500">*</span></label>
                  <input type="text" required [(ngModel)]="pet.city" name="city" class="input-field py-2" placeholder="Ex: Blumenau">
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea [(ngModel)]="pet.description" name="description" rows="3" class="input-field py-2" placeholder="Conte um pouco sobre a personalidade e história do pet..."></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">Saúde</label>
                <div class="grid grid-cols-2 gap-3">
                  <label class="flex items-center space-x-2 text-sm text-gray-600">
                    <input type="checkbox" [(ngModel)]="pet.is_vaccinated" name="is_vaccinated" class="rounded text-primary focus:ring-primary h-4 w-4">
                    <span>Vacinado</span>
                  </label>
                  <label class="flex items-center space-x-2 text-sm text-gray-600">
                    <input type="checkbox" [(ngModel)]="pet.is_neutered" name="is_neutered" class="rounded text-primary focus:ring-primary h-4 w-4">
                    <span>Castrado</span>
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">Compatibilidade</label>
                <div class="grid grid-cols-2 gap-3">
                  <label class="flex items-center space-x-2 text-sm text-gray-600">
                    <input type="checkbox" [(ngModel)]="pet.good_with_kids" name="good_with_kids" class="rounded text-primary focus:ring-primary h-4 w-4">
                    <span>Bom com crianças</span>
                  </label>
                  <label class="flex items-center space-x-2 text-sm text-gray-600">
                    <input type="checkbox" [(ngModel)]="pet.good_with_dogs" name="good_with_dogs" class="rounded text-primary focus:ring-primary h-4 w-4">
                    <span>Bom com cães</span>
                  </label>
                  <label class="flex items-center space-x-2 text-sm text-gray-600">
                    <input type="checkbox" [(ngModel)]="pet.good_with_cats" name="good_with_cats" class="rounded text-primary focus:ring-primary h-4 w-4">
                    <span>Bom com gatos</span>
                  </label>
                  <label class="flex items-center space-x-2 text-sm text-gray-600">
                    <input type="checkbox" [(ngModel)]="pet.apartment_friendly" name="apartment_friendly" class="rounded text-primary focus:ring-primary h-4 w-4">
                    <span>Apto para apartamento</span>
                  </label>
                  <label class="flex items-center space-x-2 text-sm text-gray-600">
                    <input type="checkbox" [(ngModel)]="pet.first_time_owner_friendly" name="first_time_owner_friendly" class="rounded text-primary focus:ring-primary h-4 w-4">
                    <span>Bom para iniciantes</span>
                  </label>
                </div>
              </div>

              <button type="submit" [disabled]="loading" class="w-full btn-primary py-3 text-lg">
                {{ loading ? 'Cadastrando...' : 'Cadastrar Pet' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AddPetComponent {
  loading = false;
  successMessage = '';
  errorMessage = '';

  pet = {
    name: '', species: '', breed: '', color: '',
    age_group: '', age_description: '', sex: '', size: '',
    city: '', shelter_name: '', status: 'Available',
    description: '',
    is_vaccinated: true, is_neutered: true,
    good_with_kids: false, good_with_dogs: false, good_with_cats: false,
    apartment_friendly: false, first_time_owner_friendly: false
  };

  constructor(
    private petService: PetService,
    private authService: AuthService,
    private router: Router
  ) {
    const user = this.authService.currentUserValue;
    if (user) {
      this.pet.shelter_name = user.name;
      this.pet.city = user.city;
    }
  }

  onSubmit() {
    if (!this.pet.name || !this.pet.species || !this.pet.breed || !this.pet.color ||
        !this.pet.age_group || !this.pet.age_description || !this.pet.sex || !this.pet.size || !this.pet.city) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.petService.createPet(this.pet).subscribe({
      next: (created) => {
        this.loading = false;
        this.successMessage = `Pet "${created.name}" cadastrado com sucesso! Já está visível para adotantes.`;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.status === 0
          ? 'Não foi possível conectar ao servidor.'
          : err.error?.detail || 'Falha ao cadastrar pet. Tente novamente.';
      }
    });
  }

  resetForm() {
    const user = this.authService.currentUserValue;
    this.pet = {
      name: '', species: '', breed: '', color: '',
      age_group: '', age_description: '', sex: '', size: '',
      city: user?.city || '', shelter_name: user?.name || '', status: 'Available',
      description: '',
      is_vaccinated: true, is_neutered: true,
      good_with_kids: false, good_with_dogs: false, good_with_cats: false,
      apartment_friendly: false, first_time_owner_friendly: false
    };
    this.successMessage = '';
    this.errorMessage = '';
  }
}
