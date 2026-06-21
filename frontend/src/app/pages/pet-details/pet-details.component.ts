import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { PetService, Pet } from '../../core/services/pet.service';
import { AuthService } from '../../core/services/auth.service';
import { PetHealthRecord, PetTemperament, PetMedia } from '../../core/models/pet-details.models';
import { HealthInfoComponent } from './health-info/health-info.component';
import { TemperamentComponent } from './temperament/temperament.component';
import { MediaGalleryComponent } from './media-gallery/media-gallery.component';
import { MediaUploadComponent } from './media-upload/media-upload.component';

type SectionState = 'loading' | 'loaded' | 'error' | 'empty';

interface SectionStatus {
  health: SectionState;
  temperament: SectionState;
  media: SectionState;
}

@Component({
  selector: 'app-pet-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HealthInfoComponent,
    TemperamentComponent,
    MediaGalleryComponent,
    MediaUploadComponent
  ],
  template: `
    <div class="bg-background min-h-screen py-8" *ngIf="pet">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <nav class="flex text-sm text-gray-500 mb-6">
          <a routerLink="/explore" class="hover:text-primary transition-colors">Explorar Pets</a>
          <span class="mx-2">/</span>
          <span class="text-gray-900 font-medium">{{pet.name}}</span>
        </nav>

        <!-- Hero Section -->
        <div class="bg-surface rounded-3xl shadow-soft overflow-hidden">
          <div class="grid grid-cols-1 md:grid-cols-2">
            <div class="relative h-96 md:h-full bg-gray-200">
              <img [src]="getHeroImageUrl()"
                   [alt]="pet.name" class="absolute inset-0 w-full h-full object-cover">
              <div class="absolute top-4 left-4 flex gap-2">
                <span *ngIf="userRole === 'adopter'" class="badge bg-white shadow-md text-secondary border border-green-100 px-3 py-1 text-sm rounded-full">
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

              <!-- Adopter actions -->
              <ng-container *ngIf="userRole === 'adopter'">
                <a routerLink="/apply/{{pet.id}}" class="w-full btn-primary text-center text-lg py-4 shadow-float hover:-translate-y-1 transform transition">
                  Candidatar-se para adotar {{pet.name}}
                </a>
                <button class="w-full mt-4 btn-outline text-center py-3">Salvar para depois</button>
              </ng-container>

              <!-- Shelter/ONG actions -->
              <ng-container *ngIf="userRole === 'shelter'">
                <div class="space-y-3">
                  <div *ngIf="!showStatusChange">
                    <button (click)="showStatusChange = true" class="w-full btn-primary text-center text-lg py-4">
                      Dar Baixa no Animal
                    </button>
                  </div>
                  <div *ngIf="showStatusChange" class="space-y-3">
                    <label class="block text-sm font-medium text-gray-700">Motivo da baixa:</label>
                    <select [(ngModel)]="selectedStatus" class="input-field py-3 w-full">
                      <option value="">Selecione...</option>
                      <option value="Adopted">Adotado</option>
                      <option value="Transferred">Transferido para outra ONG</option>
                      <option value="Returned">Devolvido ao tutor</option>
                      <option value="Deceased">Falecido</option>
                      <option value="Escaped">Fugiu</option>
                    </select>
                    <div class="flex gap-2">
                      <button (click)="updatePetStatus()" [disabled]="!selectedStatus" class="flex-1 btn-primary py-3 disabled:opacity-50">
                        Confirmar
                      </button>
                      <button (click)="showStatusChange = false" class="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition">
                        Cancelar
                      </button>
                    </div>
                  </div>
                  <div *ngIf="statusMessage" class="text-sm text-green-600 font-medium mt-2">{{statusMessage}}</div>
                </div>
              </ng-container>

              <!-- Not logged in -->
              <ng-container *ngIf="!userRole">
                <a routerLink="/auth/login" class="w-full btn-primary text-center text-lg py-4 shadow-float hover:-translate-y-1 transform transition">
                  Entrar para candidatar-se
                </a>
              </ng-container>
            </div>
          </div>
        </div>

        <!-- Sections Container -->
        <div class="mt-8 bg-surface rounded-3xl shadow-soft">

          <!-- Tab Navigation (Desktop only: >768px) -->
          <div class="border-b border-gray-200 hidden md:block" *ngIf="!isMobile">
            <nav class="flex -mb-px overflow-x-auto" aria-label="Abas de detalhes">
              <button
                *ngFor="let tab of tabs"
                (click)="activeTab = tab.id"
                [class.border-primary]="activeTab === tab.id"
                [class.text-primary]="activeTab === tab.id"
                [class.border-transparent]="activeTab !== tab.id"
                class="flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap transition-colors"
              >
                {{ tab.label }}
              </button>
            </nav>
          </div>

          <!-- Desktop: Tab Content -->
          <div class="p-8" *ngIf="!isMobile">
            <!-- Overview Tab -->
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

            <!-- Health Tab -->
            <div *ngIf="activeTab === 'health'" class="animate-fadeIn">
              <h3 class="text-2xl font-bold text-gray-900 mb-6">Saúde</h3>
              <ng-container *ngTemplateOutlet="healthSection"></ng-container>
            </div>

            <!-- Temperament Tab -->
            <div *ngIf="activeTab === 'temperament'" class="animate-fadeIn">
              <h3 class="text-2xl font-bold text-gray-900 mb-6">Temperamento</h3>
              <ng-container *ngTemplateOutlet="temperamentSection"></ng-container>
            </div>

            <!-- Gallery Tab -->
            <div *ngIf="activeTab === 'gallery'" class="animate-fadeIn">
              <h3 class="text-2xl font-bold text-gray-900 mb-6">Galeria</h3>
              <ng-container *ngTemplateOutlet="gallerySection"></ng-container>
            </div>
          </div>

          <!-- Mobile: Stacked Layout -->
          <div class="p-6 space-y-8 md:hidden" *ngIf="isMobile">
            <!-- Overview Section -->
            <section>
              <h3 class="text-2xl font-bold text-gray-900 mb-4">Conheça {{pet.name}}</h3>
              <p class="text-gray-600 leading-relaxed text-lg mb-6">{{pet.description || 'Um pet adorável esperando um lar.'}}</p>

              <h4 class="text-lg font-bold text-gray-900 mb-4">Características Principais</h4>
              <div class="grid grid-cols-2 gap-4">
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
            </section>

            <!-- Health Section -->
            <section>
              <h3 class="text-2xl font-bold text-gray-900 mb-4">Saúde</h3>
              <ng-container *ngTemplateOutlet="healthSection"></ng-container>
            </section>

            <!-- Temperament Section -->
            <section>
              <h3 class="text-2xl font-bold text-gray-900 mb-4">Temperamento</h3>
              <ng-container *ngTemplateOutlet="temperamentSection"></ng-container>
            </section>

            <!-- Gallery Section -->
            <section>
              <h3 class="text-2xl font-bold text-gray-900 mb-4">Galeria</h3>
              <ng-container *ngTemplateOutlet="gallerySection"></ng-container>
            </section>
          </div>
        </div>
      </div>
    </div>

    <!-- Health Section Template -->
    <ng-template #healthSection>
      <!-- Loading -->
      <div *ngIf="sectionStatus.health === 'loading'" class="animate-pulse space-y-4">
        <div class="h-6 bg-gray-200 rounded w-1/3"></div>
        <div class="h-4 bg-gray-200 rounded w-full"></div>
        <div class="h-4 bg-gray-200 rounded w-5/6"></div>
        <div class="grid grid-cols-2 gap-4 mt-4">
          <div class="h-20 bg-gray-200 rounded"></div>
          <div class="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
      <!-- Error -->
      <div *ngIf="sectionStatus.health === 'error'" class="text-center py-8">
        <p class="text-red-600 mb-4">Não foi possível carregar as informações de saúde.</p>
        <button (click)="retryHealth()" class="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition">
          Tentar novamente
        </button>
      </div>
      <!-- Loaded/Empty - delegate to child component -->
      <app-health-info
        *ngIf="sectionStatus.health === 'loaded' || sectionStatus.health === 'empty'"
        [petId]="pet!.id"
      ></app-health-info>
    </ng-template>

    <!-- Temperament Section Template -->
    <ng-template #temperamentSection>
      <!-- Loading -->
      <div *ngIf="sectionStatus.temperament === 'loading'" class="animate-pulse space-y-4">
        <div class="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div *ngFor="let i of [1,2,3,4,5,6,7]" class="space-y-2">
          <div class="h-4 bg-gray-200 rounded w-1/4"></div>
          <div class="h-3 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
      <!-- Error -->
      <div *ngIf="sectionStatus.temperament === 'error'" class="text-center py-8">
        <p class="text-red-600 mb-4">Não foi possível carregar o perfil de temperamento.</p>
        <button (click)="retryTemperament()" class="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition">
          Tentar novamente
        </button>
      </div>
      <!-- Loaded/Empty - delegate to child component -->
      <app-temperament
        *ngIf="sectionStatus.temperament === 'loaded' || sectionStatus.temperament === 'empty'"
        [petId]="pet!.id"
      ></app-temperament>
    </ng-template>

    <!-- Gallery Section Template -->
    <ng-template #gallerySection>
      <!-- Loading -->
      <div *ngIf="sectionStatus.media === 'loading'" class="animate-pulse space-y-4">
        <div class="h-64 bg-gray-200 rounded-xl"></div>
        <div class="flex gap-2 justify-center">
          <div class="w-3 h-3 bg-gray-200 rounded-full"></div>
          <div class="w-3 h-3 bg-gray-200 rounded-full"></div>
          <div class="w-3 h-3 bg-gray-200 rounded-full"></div>
        </div>
      </div>
      <!-- Error -->
      <div *ngIf="sectionStatus.media === 'error'" class="text-center py-8">
        <p class="text-red-600 mb-4">Não foi possível carregar a galeria de mídias.</p>
        <button (click)="retryMedia()" class="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition">
          Tentar novamente
        </button>
      </div>
      <!-- Loaded/Empty -->
      <div *ngIf="sectionStatus.media === 'loaded' || sectionStatus.media === 'empty'">
        <app-media-gallery
          [media]="mediaList"
          [defaultImageUrl]="pet!.image_url || getDefaultImageUrl()"
        ></app-media-gallery>
        <div class="mt-6">
          <app-media-upload
            [petId]="pet!.id"
            (mediaUploaded)="onMediaUploaded($event)"
          ></app-media-upload>
        </div>
      </div>
    </ng-template>

    <!-- Error State -->
    <div *ngIf="errorMessage" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <h2 class="text-2xl text-red-500 mb-2">Erro ao carregar pet</h2>
        <p class="text-gray-500">{{errorMessage}}</p>
      </div>
    </div>

    <!-- Not Found State -->
    <div *ngIf="!pet && !loading && !errorMessage" class="min-h-screen flex items-center justify-center">
      <h2 class="text-2xl text-gray-500">Pet não encontrado.</h2>
    </div>
  `,
  styles: [`
    .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class PetDetailsComponent implements OnInit, OnDestroy {
  pet: Pet | null = null;
  loading = true;
  errorMessage: string | null = null;
  activeTab = 'overview';
  isMobile = false;

  mediaList: PetMedia[] = [];
  userRole: string | null = null;
  showStatusChange = false;
  selectedStatus = '';
  statusMessage = '';

  sectionStatus: SectionStatus = {
    health: 'loading',
    temperament: 'loading',
    media: 'loading'
  };

  tabs = [
    { id: 'overview', label: 'Informações Básicas' },
    { id: 'health', label: 'Saúde' },
    { id: 'temperament', label: 'Temperamento' },
    { id: 'gallery', label: 'Galeria' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private petService: PetService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.checkViewport();
    const user = this.authService.currentUserValue;
    this.userRole = user?.role || null;
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadPetDetails(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkViewport();
  }

  private checkViewport(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  private loadPetDetails(petId: number): void {
    this.loading = true;
    this.sectionStatus = { health: 'loading', temperament: 'loading', media: 'loading' };

    // Load basic pet info first
    this.petService.getPet(petId).subscribe({
      next: (data) => {
        this.pet = data;
        this.loading = false;
        // Once pet is loaded, load detail sections in parallel
        this.loadDetailSections(petId);
      },
      error: () => {
        this.errorMessage = 'Falha ao carregar detalhes do pet. Tente novamente.';
        this.loading = false;
      }
    });
  }

  private loadDetailSections(petId: number): void {
    forkJoin({
      health: this.petService.getHealthRecord(petId).pipe(
        catchError(err => {
          if (err.status === 404) {
            this.sectionStatus.health = 'empty';
          } else {
            this.sectionStatus.health = 'error';
          }
          return of(null);
        })
      ),
      temperament: this.petService.getTemperament(petId).pipe(
        catchError(err => {
          if (err.status === 404) {
            this.sectionStatus.temperament = 'empty';
          } else {
            this.sectionStatus.temperament = 'error';
          }
          return of(null);
        })
      ),
      media: this.petService.getMedia(petId).pipe(
        catchError(err => {
          this.sectionStatus.media = 'error';
          return of(null);
        })
      )
    }).pipe(takeUntil(this.destroy$)).subscribe(results => {
      // Health
      if (results.health !== null) {
        this.sectionStatus.health = 'loaded';
      }

      // Temperament
      if (results.temperament !== null) {
        this.sectionStatus.temperament = 'loaded';
      }

      // Media
      if (results.media !== null) {
        this.mediaList = results.media;
        this.sectionStatus.media = this.mediaList.length > 0 ? 'loaded' : 'empty';
      }
    });
  }

  retryHealth(): void {
    if (!this.pet) return;
    this.sectionStatus.health = 'loading';
    this.petService.getHealthRecord(this.pet.id).pipe(
      catchError(err => {
        if (err.status === 404) {
          this.sectionStatus.health = 'empty';
        } else {
          this.sectionStatus.health = 'error';
        }
        return of(null);
      }),
      takeUntil(this.destroy$)
    ).subscribe(result => {
      if (result !== null) {
        this.sectionStatus.health = 'loaded';
      }
    });
  }

  retryTemperament(): void {
    if (!this.pet) return;
    this.sectionStatus.temperament = 'loading';
    this.petService.getTemperament(this.pet.id).pipe(
      catchError(err => {
        if (err.status === 404) {
          this.sectionStatus.temperament = 'empty';
        } else {
          this.sectionStatus.temperament = 'error';
        }
        return of(null);
      }),
      takeUntil(this.destroy$)
    ).subscribe(result => {
      if (result !== null) {
        this.sectionStatus.temperament = 'loaded';
      }
    });
  }

  retryMedia(): void {
    if (!this.pet) return;
    this.sectionStatus.media = 'loading';
    this.petService.getMedia(this.pet.id).pipe(
      catchError(err => {
        this.sectionStatus.media = 'error';
        return of(null);
      }),
      takeUntil(this.destroy$)
    ).subscribe(result => {
      if (result !== null) {
        this.mediaList = result;
        this.sectionStatus.media = this.mediaList.length > 0 ? 'loaded' : 'empty';
      }
    });
  }

  onMediaUploaded(media: PetMedia): void {
    this.mediaList = [media, ...this.mediaList];
    this.sectionStatus.media = 'loaded';
  }

  getDefaultImageUrl(): string {
    if (this.pet?.species === 'dog') {
      return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80';
    }
    return 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80';
  }

  getHeroImageUrl(): string {
    // 1. Use pet's image_url if set
    if (this.pet?.image_url) {
      if (this.pet.image_url.startsWith('http')) return this.pet.image_url;
      return 'http://localhost:8000' + this.pet.image_url;
    }
    // 2. Use first gallery photo if available
    const firstPhoto = this.mediaList.find(m => m.media_type === 'photo');
    if (firstPhoto) {
      if (firstPhoto.url.startsWith('http')) return firstPhoto.url;
      return 'http://localhost:8000' + firstPhoto.url;
    }
    // 3. Fallback to generic image
    return this.getDefaultImageUrl();
  }

  translateSize(size: string): string {
    const map: Record<string, string> = { small: 'Pequeno', medium: 'Médio', large: 'Grande' };
    return map[size] || size;
  }

  translateStatus(status: string): string {
    const map: Record<string, string> = { Available: 'Disponível', Reserved: 'Reservado', Adopted: 'Adotado', Transferred: 'Transferido', Returned: 'Devolvido', Deceased: 'Falecido', Escaped: 'Fugiu' };
    return map[status] || status;
  }

  updatePetStatus(): void {
    if (!this.pet || !this.selectedStatus) return;
    this.http.put<any>(`http://localhost:8000/pets/${this.pet.id}/status?status=${this.selectedStatus}`, {}).subscribe({
      next: () => {
        if (this.pet) {
          this.pet.status = this.selectedStatus;
        }
        this.statusMessage = `Status atualizado para "${this.translateStatus(this.selectedStatus)}".`;
        this.showStatusChange = false;
        this.selectedStatus = '';
      },
      error: () => {
        this.statusMessage = 'Erro ao atualizar status.';
      }
    });
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
