import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { PetService, Pet } from '../../core/services/pet.service';

interface Application {
  id: number;
  user_id: number;
  pet_id: number;
  status: string;
  housing_type: string;
  motivation: string;
  compatibility_score: number;
}

interface AppWithPet extends Application {
  pet?: Pet;
  showContest?: boolean;
  contestMessage?: string;
  contested?: boolean;
}

@Component({
  selector: 'app-adopter-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="bg-background min-h-screen py-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div class="md:flex md:items-center md:justify-between mb-8">
          <div class="flex-1 min-w-0">
            <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Bem-vindo(a) de volta! 👋
            </h2>
            <p class="text-gray-500 mt-1">Aqui está o status da sua jornada de adoção.</p>
          </div>
          <div class="mt-4 flex md:mt-0 md:ml-4">
            <a routerLink="/explore" class="btn-primary">Encontrar mais pets</a>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
          <p class="mt-2 text-gray-500">Carregando suas candidaturas...</p>
        </div>

        <!-- No applications -->
        <div *ngIf="!loading && applications.length === 0" class="text-center py-12 bg-white rounded-2xl shadow-soft">
          <span class="text-6xl mb-4 block">🐾</span>
          <h3 class="text-lg font-medium text-gray-900">Nenhuma candidatura ainda</h3>
          <p class="mt-1 text-gray-500 mb-4">Explore nossos pets disponíveis e candidate-se para adotar!</p>
          <a routerLink="/explore" class="btn-primary">Explorar Pets</a>
        </div>

        <!-- Applications list -->
        <div *ngIf="!loading && applications.length > 0" class="space-y-6 mb-8">
          <h3 class="text-xl font-bold text-gray-900">Suas Candidaturas</h3>

          <div *ngFor="let app of applications" class="card p-6 bg-white border-l-4" [ngClass]="{
            'border-l-green-500': app.status === 'Approved',
            'border-l-red-500': app.status === 'Rejected',
            'border-l-primary': app.status !== 'Approved' && app.status !== 'Rejected'
          }">
            <div class="flex justify-between items-start mb-4">
              <div>
                <span class="text-xs font-bold uppercase tracking-wider text-primary mb-1 block">
                  {{app.status === 'Approved' ? 'Aprovada! 🎉' : app.status === 'Rejected' ? 'Não aprovada' : 'Candidatura Ativa'}}
                </span>
                <h3 class="text-xl font-bold text-gray-900">
                  {{app.pet ? 'Candidatura para "' + app.pet.name + '"' : 'Candidatura #' + app.id}}
                </h3>
                <p class="text-sm text-gray-600 mt-1" *ngIf="app.pet">
                  {{app.pet.breed}} · {{app.pet.age_description}} · {{app.pet.city}}
                </p>
              </div>
              <span class="px-3 py-1 rounded-full text-xs font-bold" [ngClass]="{
                'bg-blue-100 text-blue-700': app.status === 'New',
                'bg-yellow-100 text-yellow-700': app.status === 'Screening',
                'bg-purple-100 text-purple-700': app.status === 'Interview',
                'bg-green-100 text-green-700': app.status === 'Approved',
                'bg-red-100 text-red-700': app.status === 'Rejected'
              }">{{translateStatus(app.status)}}</span>
            </div>

            <!-- Progress bar -->
            <div class="relative pt-4 border-t border-gray-100" *ngIf="app.status !== 'Rejected'">
              <div class="flex items-center justify-between text-xs">
                <div *ngFor="let stage of stages; let i = index" class="flex items-center" [class.flex-1]="i < stages.length - 1">
                  <div class="flex flex-col items-center">
                    <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 mb-1"
                      [ngClass]="{
                        'bg-green-500 border-green-500 text-white': getStageIndex(app.status) > i,
                        'bg-primary border-primary text-white': getStageIndex(app.status) === i,
                        'bg-gray-100 border-gray-300 text-gray-400': getStageIndex(app.status) < i
                      }">
                      <span *ngIf="getStageIndex(app.status) > i" class="text-[10px]">✓</span>
                      <span *ngIf="getStageIndex(app.status) <= i" class="text-[10px]">{{i + 1}}</span>
                    </div>
                    <span class="text-gray-500 font-medium whitespace-nowrap">{{stage.label}}</span>
                  </div>
                  <div *ngIf="i < stages.length - 1" class="flex-1 h-0.5 mx-2 mt-[-16px]"
                    [ngClass]="getStageIndex(app.status) > i ? 'bg-green-400' : 'bg-gray-200'">
                  </div>
                </div>
              </div>
            </div>

            <!-- Rejected message -->
            <div *ngIf="app.status === 'Rejected'" class="pt-4 border-t border-gray-100">
              <p class="text-sm text-red-600 mb-3">Esta candidatura não foi aprovada. Não desista — explore outros pets!</p>

              <!-- Contest button -->
              <div *ngIf="!app.showContest && !app.contested" class="flex gap-2">
                <button (click)="app.showContest = true" class="text-sm px-4 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg hover:bg-yellow-100 font-medium transition">
                  ✉️ Contestar decisão
                </button>
                <button (click)="discardApplication(app)" class="text-sm px-4 py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 font-medium transition">
                  🗑️ Descartar candidatura
                </button>
              </div>

              <!-- Contest form -->
              <div *ngIf="app.showContest && !app.contested" class="mt-3 space-y-3">
                <textarea
                  [(ngModel)]="app.contestMessage"
                  placeholder="Explique brevemente por que gostaria de reconsideração..."
                  rows="3"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                  maxlength="500"
                ></textarea>
                <p class="text-xs text-gray-400">Máx. 500 caracteres</p>
                <div class="flex gap-2">
                  <button (click)="submitContest(app)" [disabled]="!app.contestMessage?.trim()" class="text-sm px-4 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50">
                    Enviar Contestação
                  </button>
                  <button (click)="app.showContest = false" class="text-sm px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition">
                    Cancelar
                  </button>
                </div>
              </div>

              <!-- Contest sent confirmation -->
              <div *ngIf="app.contested" class="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p class="text-sm text-green-700">✅ Contestação enviada! O abrigo irá reavaliar sua candidatura.</p>
              </div>
            </div>

            <!-- View pet link -->
            <div class="mt-4 flex justify-end" *ngIf="app.pet">
              <a [routerLink]="'/pets/' + app.pet_id" class="text-primary font-medium hover:underline text-sm">Ver pet →</a>
            </div>
          </div>
        </div>

        <!-- Tips card -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6" *ngIf="!loading && applications.length > 0">
          <div class="card p-6 flex flex-col justify-center items-center text-center bg-orange-50 border border-orange-100">
            <span class="text-4xl mb-3">🎓</span>
            <h3 class="font-bold text-gray-900 mb-2">Prepare sua casa</h3>
            <p class="text-sm text-gray-600 mb-4">Leia nosso guia sobre como preparar seu lar para o novo pet.</p>
            <a routerLink="/education" class="btn-outline w-full py-2">Ler Guia</a>
          </div>
          <div class="card p-6 flex flex-col justify-center items-center text-center bg-green-50 border border-green-100">
            <span class="text-4xl mb-3">🐾</span>
            <h3 class="font-bold text-gray-900 mb-2">Explore mais pets</h3>
            <p class="text-sm text-gray-600 mb-4">Encontre outros animais que combinam com você.</p>
            <a routerLink="/explore" class="btn-outline w-full py-2">Explorar</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdopterDashboardComponent implements OnInit {
  applications: AppWithPet[] = [];
  loading = true;

  stages = [
    { id: 'New', label: 'Enviada' },
    { id: 'Screening', label: 'Análise' },
    { id: 'Interview', label: 'Entrevista' },
    { id: 'Approved', label: 'Aprovada' }
  ];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private petService: PetService
  ) {}

  ngOnInit() {
    const user = this.authService.currentUserValue;
    if (user) {
      this.loadApplications(user.id);
    } else {
      this.loading = false;
    }
  }

  private loadApplications(userId: number): void {
    this.http.get<Application[]>(`http://localhost:8000/applications/user/${userId}`).subscribe({
      next: (apps) => {
        this.applications = apps;
        // Load pet details for each application
        apps.forEach((app, index) => {
          this.petService.getPet(app.pet_id).subscribe({
            next: (pet) => {
              this.applications[index].pet = pet;
            },
            error: () => {} // pet might be deleted
          });
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getStageIndex(status: string): number {
    const order = ['New', 'Screening', 'Interview', 'Approved'];
    const idx = order.indexOf(status);
    return idx >= 0 ? idx : 0;
  }

  translateStatus(status: string): string {
    const map: Record<string, string> = {
      New: 'Enviada',
      Screening: 'Em Análise',
      Interview: 'Entrevista',
      Approved: 'Aprovada',
      Rejected: 'Não Aprovada'
    };
    return map[status] || status;
  }

  submitContest(app: AppWithPet): void {
    if (!app.contestMessage?.trim()) return;

    this.http.put<any>(`http://localhost:8000/applications/${app.id}/contest`, {
      message: app.contestMessage
    }).subscribe({
      next: () => {
        app.contested = true;
        app.showContest = false;
      },
      error: () => {
        app.contested = true;
        app.showContest = false;
      }
    });
  }

  discardApplication(app: AppWithPet): void {
    if (confirm('Tem certeza que deseja descartar esta candidatura? Essa ação não pode ser desfeita.')) {
      this.http.delete(`http://localhost:8000/applications/${app.id}`).subscribe({
        next: () => {
          this.applications = this.applications.filter(a => a.id !== app.id);
        },
        error: () => {
          // Remove from list anyway for UX
          this.applications = this.applications.filter(a => a.id !== app.id);
        }
      });
    }
  }
}
