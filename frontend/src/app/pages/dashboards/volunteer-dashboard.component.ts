import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

interface Shelter {
  id: number;
  name: string;
  email: string;
  city: string;
  state: string;
}

interface VolunteerApp {
  id: number;
  shelter_id: number;
  shelter_name: string;
  shelter_city: string;
  shelter_state: string;
  status: string;
  message: string;
}

@Component({
  selector: 'app-volunteer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="bg-background min-h-screen py-10">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div class="md:flex md:items-center md:justify-between mb-8">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 sm:text-3xl">Olá, {{userName}}! 🤝</h2>
            <p class="text-gray-500 mt-1">Painel do Voluntário</p>
          </div>
          <div *ngIf="averageRating !== null" class="mt-4 md:mt-0 flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-soft">
            <span class="text-yellow-400 text-xl">★</span>
            <span class="text-2xl font-bold text-gray-900">{{averageRating}}</span>
            <span class="text-sm text-gray-500">({{totalReviews}} avaliações)</span>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-2 mb-6 border-b border-gray-200">
          <button (click)="activeTab = 'shelters'" [class.border-primary]="activeTab === 'shelters'" [class.text-primary]="activeTab === 'shelters'" class="px-4 py-3 font-medium text-sm border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition">
            🏢 Abrigos
          </button>
          <button (click)="activeTab = 'myapps'" [class.border-primary]="activeTab === 'myapps'" [class.text-primary]="activeTab === 'myapps'" class="px-4 py-3 font-medium text-sm border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition">
            📋 Minhas Candidaturas
          </button>
        </div>

        <!-- ABRIGOS TAB -->
        <div *ngIf="activeTab === 'shelters'">
          <div *ngIf="shelters.length === 0" class="text-center py-12 bg-white rounded-2xl shadow-soft">
            <span class="text-6xl mb-4 block">🏠</span>
            <p class="text-gray-500">Nenhum abrigo cadastrado ainda.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div *ngFor="let shelter of shelters" class="bg-white p-6 rounded-2xl shadow-soft hover:shadow-md transition">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🏢</div>
                <div class="flex-1">
                  <h4 class="font-bold text-gray-900 text-lg">{{shelter.name}}</h4>
                  <p class="text-sm text-gray-600 mt-1">📍 {{shelter.city}}, {{shelter.state}}</p>
                  <p class="text-sm text-gray-600">✉️ {{shelter.email}}</p>
                  <div class="mt-3">
                    <button *ngIf="!hasApplied(shelter.id)" (click)="openApplyModal(shelter)" class="text-sm px-4 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition">
                      Candidatar-se
                    </button>
                    <span *ngIf="hasApplied(shelter.id)" class="text-sm px-3 py-1 bg-gray-100 text-gray-500 rounded-lg font-medium">
                      ✓ Já se candidatou
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Apply Modal -->
          <div *ngIf="applyingShelter" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" (click)="applyingShelter = null">
            <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl" (click)="$event.stopPropagation()">
              <h3 class="text-lg font-bold text-gray-900 mb-2">Candidatar-se em {{applyingShelter.name}}</h3>
              <p class="text-sm text-gray-500 mb-4">Envie uma mensagem ao abrigo explicando por que quer ser voluntário.</p>
              <textarea [(ngModel)]="applyMessage" rows="4" class="input-field py-2 w-full" placeholder="Tenho disponibilidade para ajudar com passeios e banhos..."></textarea>
              <div class="flex gap-2 mt-4">
                <button (click)="submitApplication()" [disabled]="!applyMessage.trim()" class="flex-1 btn-primary py-2 disabled:opacity-50">Enviar</button>
                <button (click)="applyingShelter = null" class="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium">Cancelar</button>
              </div>
            </div>
          </div>
        </div>

        <!-- MINHAS CANDIDATURAS TAB -->
        <div *ngIf="activeTab === 'myapps'">
          <div *ngIf="myApplications.length === 0" class="text-center py-12 bg-white rounded-2xl shadow-soft">
            <span class="text-6xl mb-4 block">📋</span>
            <p class="text-gray-500">Nenhuma candidatura ainda. Candidate-se a um abrigo na aba "Abrigos".</p>
          </div>

          <div class="space-y-4">
            <div *ngFor="let app of myApplications" class="bg-white p-5 rounded-xl shadow-soft flex justify-between items-center">
              <div>
                <h4 class="font-bold text-gray-900">{{app.shelter_name}}</h4>
                <p class="text-sm text-gray-500">{{app.shelter_city}}, {{app.shelter_state}}</p>
              </div>
              <span class="px-3 py-1 rounded-full text-xs font-bold" [ngClass]="{
                'bg-yellow-100 text-yellow-700': app.status === 'Pending',
                'bg-green-100 text-green-700': app.status === 'Approved',
                'bg-red-100 text-red-700': app.status === 'Rejected'
              }">{{translateStatus(app.status)}}</span>
            </div>
          </div>

          <!-- Approved shelters -->
          <div *ngIf="approvedShelters.length > 0" class="mt-8">
            <h3 class="text-lg font-bold text-gray-900 mb-4">🎉 Abrigos onde você é voluntário</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div *ngFor="let app of approvedShelters" class="bg-green-50 border border-green-200 p-4 rounded-xl">
                <h4 class="font-bold text-green-800">{{app.shelter_name}}</h4>
                <p class="text-sm text-green-600">{{app.shelter_city}}, {{app.shelter_state}}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class VolunteerDashboardComponent implements OnInit {
  userName = '';
  userId: number | null = null;
  activeTab: 'shelters' | 'myapps' = 'shelters';

  shelters: Shelter[] = [];
  myApplications: VolunteerApp[] = [];
  applyingShelter: Shelter | null = null;
  applyMessage = '';

  averageRating: number | null = null;
  totalReviews = 0;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.currentUserValue;
    this.userName = user?.name || 'Voluntário';
    this.userId = user?.id || null;
    this.loadShelters();
    if (this.userId) {
      this.loadApplications();
      this.loadRating();
    }
  }

  private loadShelters(): void {
    this.http.get<Shelter[]>('http://localhost:8000/shelters/').subscribe({
      next: (data) => { this.shelters = data; }
    });
  }

  private loadApplications(): void {
    this.http.get<VolunteerApp[]>(`http://localhost:8000/volunteers/applications/${this.userId}`).subscribe({
      next: (data) => { this.myApplications = data; }
    });
  }

  private loadRating(): void {
    this.http.get<any>(`http://localhost:8000/volunteers/rating/${this.userId}`).subscribe({
      next: (data) => {
        this.averageRating = data.average;
        this.totalReviews = data.total_reviews;
      }
    });
  }

  get approvedShelters(): VolunteerApp[] {
    return this.myApplications.filter(a => a.status === 'Approved');
  }

  hasApplied(shelterId: number): boolean {
    return this.myApplications.some(a => a.shelter_id === shelterId);
  }

  openApplyModal(shelter: Shelter): void {
    this.applyingShelter = shelter;
    this.applyMessage = '';
  }

  submitApplication(): void {
    if (!this.applyingShelter || !this.applyMessage.trim()) return;
    this.http.post('http://localhost:8000/volunteers/apply', {
      volunteer_id: this.userId,
      shelter_id: this.applyingShelter.id,
      message: this.applyMessage
    }).subscribe({
      next: () => {
        this.loadApplications();
        this.applyingShelter = null;
        this.applyMessage = '';
      },
      error: () => {
        this.applyingShelter = null;
      }
    });
  }

  translateStatus(status: string): string {
    return { Pending: 'Pendente', Approved: 'Aprovado', Rejected: 'Rejeitado' }[status] || status;
  }
}
