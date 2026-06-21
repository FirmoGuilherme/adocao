import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpEventType } from '@angular/common/http';
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

              <!-- Personalidade (obrigatório) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Personalidade do Animal <span class="text-red-500">*</span></label>
                <textarea required [(ngModel)]="pet.personality" name="personality" rows="3" class="input-field py-2" placeholder="Descreva a personalidade: é brincalhão, calmo, carinhoso, tímido..."></textarea>
                <p class="text-xs text-gray-400 mt-1">Campo obrigatório. Ajuda adotantes a conhecer o temperamento do animal.</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea [(ngModel)]="pet.description" name="description" rows="3" class="input-field py-2" placeholder="Conte um pouco sobre a história do pet, necessidades especiais..."></textarea>
              </div>

              <!-- Upload de Fotos -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">Fotos do Pet</label>
                <div
                  class="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors"
                  [ngClass]="{
                    'border-primary bg-primary/5': isDragOver,
                    'border-gray-300 hover:border-primary/50': !isDragOver
                  }"
                  (dragover)="onDragOver($event)"
                  (dragleave)="onDragLeave($event)"
                  (drop)="onDrop($event)"
                  (click)="photoInput.click()"
                >
                  <svg class="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                  <p class="text-gray-600 font-medium mt-2">Arraste fotos aqui ou clique para selecionar</p>
                  <p class="text-xs text-gray-400 mt-1">JPEG, PNG ou WebP · Máx. 10MB cada · Até 20 fotos</p>
                </div>
                <input
                  #photoInput
                  type="file"
                  class="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  (change)="onPhotosSelected($event)"
                />

                <!-- Previews -->
                <div *ngIf="selectedPhotos.length > 0" class="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                  <div *ngFor="let photo of selectedPhotos; let i = index" class="relative group">
                    <img [src]="photo.preview" alt="Prévia" class="w-full h-24 object-cover rounded-lg border border-gray-200">
                    <button type="button" (click)="removePhoto(i)" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                    <p class="text-xs text-gray-400 mt-1 truncate">{{photo.file.name}}</p>
                  </div>
                </div>

                <div *ngIf="photoError" class="mt-2 text-sm text-red-600">{{ photoError }}</div>
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
                <div class="mt-3">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Necessidades Especiais</label>
                  <input type="text" [(ngModel)]="healthData.special_needs" name="special_needs" class="input-field py-2" placeholder="Ex: Ração especial, medicação diária...">
                </div>
                <div class="mt-3 grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                    <input type="number" [(ngModel)]="healthData.weight_kg" name="weight_kg" class="input-field py-2" placeholder="Ex: 12.5" step="0.1" min="0.01" max="200">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Última Visita Veterinária</label>
                    <input type="date" [(ngModel)]="healthData.last_vet_visit" name="last_vet_visit" class="input-field py-2">
                  </div>
                </div>
              </div>

              <!-- Temperamento -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">Temperamento (1 = Baixo, 5 = Alto)</label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Nível de Energia</label>
                    <select [(ngModel)]="temperamentData.energy_level" name="energy_level" class="input-field py-2">
                      <option [ngValue]="1">1 - Muito Calmo</option>
                      <option [ngValue]="2">2 - Calmo</option>
                      <option [ngValue]="3">3 - Moderado</option>
                      <option [ngValue]="4">4 - Energético</option>
                      <option [ngValue]="5">5 - Muito Energético</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Sociabilidade com Pessoas</label>
                    <select [(ngModel)]="temperamentData.sociability_people" name="sociability_people" class="input-field py-2">
                      <option [ngValue]="1">1 - Muito Tímido</option>
                      <option [ngValue]="2">2 - Reservado</option>
                      <option [ngValue]="3">3 - Moderado</option>
                      <option [ngValue]="4">4 - Sociável</option>
                      <option [ngValue]="5">5 - Muito Sociável</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Sociabilidade com Animais</label>
                    <select [(ngModel)]="temperamentData.sociability_animals" name="sociability_animals" class="input-field py-2">
                      <option [ngValue]="1">1 - Não tolera</option>
                      <option [ngValue]="2">2 - Tolerante</option>
                      <option [ngValue]="3">3 - Moderado</option>
                      <option [ngValue]="4">4 - Amigável</option>
                      <option [ngValue]="5">5 - Adora outros animais</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Nível de Treinamento</label>
                    <select [(ngModel)]="temperamentData.training_level" name="training_level" class="input-field py-2">
                      <option [ngValue]="1">1 - Nenhum</option>
                      <option [ngValue]="2">2 - Básico</option>
                      <option [ngValue]="3">3 - Intermediário</option>
                      <option [ngValue]="4">4 - Avançado</option>
                      <option [ngValue]="5">5 - Totalmente treinado</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Brincadeira</label>
                    <select [(ngModel)]="temperamentData.playfulness" name="playfulness" class="input-field py-2">
                      <option [ngValue]="1">1 - Não brinca</option>
                      <option [ngValue]="2">2 - Pouco</option>
                      <option [ngValue]="3">3 - Moderado</option>
                      <option [ngValue]="4">4 - Brincalhão</option>
                      <option [ngValue]="5">5 - Muito Brincalhão</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Nível de Barulho</label>
                    <select [(ngModel)]="temperamentData.noise_level" name="noise_level" class="input-field py-2">
                      <option [ngValue]="1">1 - Silencioso</option>
                      <option [ngValue]="2">2 - Pouco barulho</option>
                      <option [ngValue]="3">3 - Moderado</option>
                      <option [ngValue]="4">4 - Barulhento</option>
                      <option [ngValue]="5">5 - Muito Barulhento</option>
                    </select>
                  </div>
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

              <!-- Upload Progress -->
              <div *ngIf="uploadingPhotos" class="space-y-2">
                <div class="flex justify-between text-sm text-gray-600">
                  <span>Enviando fotos... ({{photosUploaded}}/{{selectedPhotos.length}})</span>
                  <span>{{uploadProgress}}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div class="bg-primary h-2.5 rounded-full transition-all duration-300" [style.width.%]="uploadProgress"></div>
                </div>
              </div>

              <button type="submit" [disabled]="loading || uploadingPhotos" class="w-full btn-primary py-3 text-lg">
                {{ loading ? 'Cadastrando...' : uploadingPhotos ? 'Enviando fotos...' : 'Cadastrar Pet' }}
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
  isDragOver = false;
  photoError: string | null = null;
  selectedPhotos: { file: File; preview: string }[] = [];
  uploadingPhotos = false;
  photosUploaded = 0;
  uploadProgress = 0;

  pet = {
    name: '', species: '', breed: '', color: '',
    age_group: '', age_description: '', sex: '', size: '',
    city: '', shelter_name: '', status: 'Available',
    description: '', personality: '',
    is_vaccinated: true, is_neutered: true,
    good_with_kids: false, good_with_dogs: false, good_with_cats: false,
    apartment_friendly: false, first_time_owner_friendly: false
  };

  healthData = {
    special_needs: '',
    weight_kg: null as number | null,
    last_vet_visit: ''
  };

  temperamentData = {
    energy_level: 3,
    sociability_people: 3,
    sociability_animals: 3,
    training_level: 3,
    independence_level: 3,
    playfulness: 3,
    noise_level: 3
  };

  constructor(
    private petService: PetService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {
    const user = this.authService.currentUserValue;
    if (user) {
      this.pet.shelter_name = user.name;
      this.pet.city = user.city;
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files) {
      this.addPhotos(Array.from(files));
    }
  }

  onPhotosSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addPhotos(Array.from(input.files));
      input.value = '';
    }
  }

  private addPhotos(files: File[]): void {
    this.photoError = null;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024;

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        this.photoError = `Formato não suportado: ${file.name}. Use JPEG, PNG ou WebP.`;
        continue;
      }
      if (file.size > maxSize) {
        this.photoError = `${file.name} excede o limite de 10 MB.`;
        continue;
      }
      if (this.selectedPhotos.length >= 20) {
        this.photoError = 'Máximo de 20 fotos atingido.';
        break;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedPhotos.push({ file, preview: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(index: number): void {
    this.selectedPhotos.splice(index, 1);
    this.photoError = null;
  }

  onSubmit() {
    if (!this.pet.name || !this.pet.species || !this.pet.breed || !this.pet.color ||
        !this.pet.age_group || !this.pet.age_description || !this.pet.sex || !this.pet.size ||
        !this.pet.city || !this.pet.personality) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios (incluindo Personalidade).';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // Include personality in description
    const petPayload = {
      ...this.pet,
      description: this.pet.personality + (this.pet.description ? '\n\n' + this.pet.description : '')
    };

    this.petService.createPet(petPayload).subscribe({
      next: (created) => {
        this.loading = false;
        // Create health and temperament records in parallel
        this.createHealthAndTemperament(created.id);
        // If photos selected, upload them
        if (this.selectedPhotos.length > 0) {
          this.uploadPhotosForPet(created.id, created.name);
        } else {
          this.successMessage = `Pet "${created.name}" cadastrado com sucesso!`;
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.status === 0
          ? 'Não foi possível conectar ao servidor.'
          : err.error?.detail || 'Falha ao cadastrar pet. Tente novamente.';
      }
    });
  }

  private createHealthAndTemperament(petId: number): void {
    // Create health record
    const healthPayload: any = {
      vaccination_records: [],
      medical_conditions: [],
      surgeries: [],
      special_needs: this.healthData.special_needs || null,
      weight_kg: this.healthData.weight_kg || null,
      last_vet_visit: this.healthData.last_vet_visit || null
    };
    this.http.post(`http://localhost:8000/pets/${petId}/health`, healthPayload).subscribe();

    // Create temperament record
    const tempPayload = {
      energy_level: this.temperamentData.energy_level,
      sociability_people: this.temperamentData.sociability_people,
      sociability_animals: this.temperamentData.sociability_animals,
      training_level: this.temperamentData.training_level,
      independence_level: this.temperamentData.independence_level,
      playfulness: this.temperamentData.playfulness,
      noise_level: this.temperamentData.noise_level,
      behavior_notes: this.pet.personality || null
    };
    this.http.post(`http://localhost:8000/pets/${petId}/temperament`, tempPayload).subscribe();
  }

  private uploadPhotosForPet(petId: number, petName: string): void {
    this.uploadingPhotos = true;
    this.photosUploaded = 0;
    this.uploadProgress = 0;

    const user = this.authService.currentUserValue;
    const shelterName = user?.name || '';
    const total = this.selectedPhotos.length;
    let uploaded = 0;
    let firstPhotoUrl: string | null = null;

    const uploadNext = (index: number) => {
      if (index >= total) {
        this.uploadingPhotos = false;
        // Set first photo as pet profile image
        if (firstPhotoUrl) {
          this.http.put(`http://localhost:8000/pets/${petId}/image`, { image_url: firstPhotoUrl }).subscribe({
            next: () => {
              this.successMessage = `Pet "${petName}" cadastrado com ${uploaded} foto(s) enviada(s)!`;
            },
            error: () => {
              this.successMessage = `Pet "${petName}" cadastrado com ${uploaded} foto(s) enviada(s)!`;
            }
          });
        } else {
          this.successMessage = `Pet "${petName}" cadastrado com ${uploaded} foto(s) enviada(s)!`;
        }
        return;
      }

      const formData = new FormData();
      formData.append('file', this.selectedPhotos[index].file);

      this.http.post<any>(`http://localhost:8000/pets/${petId}/media`, formData, {
        headers: { 'X-Shelter-Name': shelterName },
        reportProgress: true,
        observe: 'events'
      }).subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            const fileProgress = Math.round((100 * event.loaded) / event.total);
            this.uploadProgress = Math.round(((uploaded * 100) + fileProgress) / total);
          } else if (event.type === HttpEventType.Response) {
            uploaded++;
            this.photosUploaded = uploaded;
            this.uploadProgress = Math.round((uploaded / total) * 100);
            // Save URL of first uploaded photo
            if (uploaded === 1 && event.body?.url) {
              firstPhotoUrl = event.body.url;
            }
            uploadNext(index + 1);
          }
        },
        error: () => {
          uploaded++;
          this.photosUploaded = uploaded;
          uploadNext(index + 1);
        }
      });
    };

    uploadNext(0);
  }

  resetForm() {
    const user = this.authService.currentUserValue;
    this.pet = {
      name: '', species: '', breed: '', color: '',
      age_group: '', age_description: '', sex: '', size: '',
      city: user?.city || '', shelter_name: user?.name || '', status: 'Available',
      description: '', personality: '',
      is_vaccinated: true, is_neutered: true,
      good_with_kids: false, good_with_dogs: false, good_with_cats: false,
      apartment_friendly: false, first_time_owner_friendly: false
    };
    this.healthData = { special_needs: '', weight_kg: null, last_vet_visit: '' };
    this.temperamentData = {
      energy_level: 3, sociability_people: 3, sociability_animals: 3,
      training_level: 3, independence_level: 3, playfulness: 3, noise_level: 3
    };
    this.successMessage = '';
    this.errorMessage = '';
    this.selectedPhotos = [];
    this.photoError = null;
    this.uploadingPhotos = false;
    this.photosUploaded = 0;
    this.uploadProgress = 0;
  }
}
