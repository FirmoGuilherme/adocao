import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface Shelter {
  id: number;
  name: string;
  email: string;
  city: string;
  state: string;
  approved: boolean;
}

interface Stats {
  total_users: number;
  total_shelters: number;
  pending_shelters: number;
  total_pets: number;
  available_pets: number;
  total_adoptions: number;
  total_applications: number;
  total_volunteers: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-gray-50 min-h-screen">
      <nav class="bg-gray-900 text-white py-4 px-6 flex justify-between items-center shadow-md">
        <div class="flex items-center space-x-2">
           <span class="text-primary text-2xl">🐶</span>
           <span class="font-bold text-xl tracking-tight">Adoção Admin</span>
        </div>
        <div class="flex gap-4 items-center">
           <span *ngIf="stats.pending_shelters > 0" class="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
             {{stats.pending_shelters}} pendente(s)
           </span>
        </div>
      </nav>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <!-- Tabs -->
        <div class="flex gap-2 mb-6 border-b border-gray-200">
          <button (click)="activeTab = 'overview'" [class.border-primary]="activeTab === 'overview'" [class.text-primary]="activeTab === 'overview'" class="px-4 py-3 font-medium text-sm border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition">
            📊 Visão Geral
          </button>
          <button (click)="activeTab = 'pending'" [class.border-primary]="activeTab === 'pending'" [class.text-primary]="activeTab === 'pending'" class="px-4 py-3 font-medium text-sm border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition">
            ⏳ Aprovação de Abrigos
            <span *ngIf="pendingShelters.length > 0" class="ml-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{{pendingShelters.length}}</span>
          </button>
          <button (click)="activeTab = 'shelters'" [class.border-primary]="activeTab === 'shelters'" [class.text-primary]="activeTab === 'shelters'" class="px-4 py-3 font-medium text-sm border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition">
            🏢 Todos os Abrigos
          </button>
          <button (click)="activeTab = 'users'" [class.border-primary]="activeTab === 'users'" [class.text-primary]="activeTab === 'users'" class="px-4 py-3 font-medium text-sm border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition">
            👥 Usuários
          </button>
        </div>

        <!-- VISÃO GERAL -->
        <div *ngIf="activeTab === 'overview'">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div class="bg-white p-6 rounded-2xl shadow-soft border-l-4 border-l-blue-500">
              <p class="text-sm font-medium text-gray-500 mb-1">Total Usuários</p>
              <h3 class="text-3xl font-extrabold text-gray-900">{{stats.total_users}}</h3>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow-soft border-l-4 border-l-purple-500">
              <p class="text-sm font-medium text-gray-500 mb-1">Abrigos</p>
              <h3 class="text-3xl font-extrabold text-gray-900">{{stats.total_shelters}}</h3>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow-soft border-l-4 border-l-secondary">
              <p class="text-sm font-medium text-gray-500 mb-1">Adoções</p>
              <h3 class="text-3xl font-extrabold text-gray-900">{{stats.total_adoptions}}</h3>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow-soft border-l-4 border-l-primary">
              <p class="text-sm font-medium text-gray-500 mb-1">Pets Cadastrados</p>
              <h3 class="text-3xl font-extrabold text-gray-900">{{stats.total_pets}}</h3>
            </div>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white p-6 rounded-2xl shadow-soft">
              <p class="text-sm font-medium text-gray-500 mb-1">Disponíveis</p>
              <h3 class="text-2xl font-extrabold text-green-600">{{stats.available_pets}}</h3>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow-soft">
              <p class="text-sm font-medium text-gray-500 mb-1">Candidaturas</p>
              <h3 class="text-2xl font-extrabold text-blue-600">{{stats.total_applications}}</h3>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow-soft">
              <p class="text-sm font-medium text-gray-500 mb-1">Voluntários</p>
              <h3 class="text-2xl font-extrabold text-purple-600">{{stats.total_volunteers}}</h3>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow-soft border border-red-100">
              <p class="text-sm font-medium text-gray-500 mb-1">Abrigos Pendentes</p>
              <h3 class="text-2xl font-extrabold text-red-600">{{stats.pending_shelters}}</h3>
            </div>
          </div>
        </div>

        <!-- APROVAÇÃO DE ABRIGOS -->
        <div *ngIf="activeTab === 'pending'">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Aprovação de Abrigos</h2>

          <div *ngIf="pendingShelters.length === 0" class="text-center py-12 bg-white rounded-2xl shadow-soft">
            <span class="text-6xl mb-4 block">✅</span>
            <h3 class="text-lg font-medium text-gray-900">Nenhum abrigo pendente</h3>
            <p class="mt-1 text-gray-500">Todos os abrigos foram revisados.</p>
          </div>

          <div class="space-y-4">
            <div *ngFor="let shelter of pendingShelters" class="bg-white p-6 rounded-xl shadow-soft border-l-4 border-l-yellow-400">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-bold text-gray-900 text-lg">{{shelter.name}}</h3>
                  <p class="text-sm text-gray-600 mt-1">📍 {{shelter.city}}, {{shelter.state}}</p>
                  <p class="text-sm text-gray-600">✉️ {{shelter.email}}</p>
                </div>
                <div class="flex gap-2">
                  <button (click)="approveShelter(shelter)" class="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold text-sm hover:bg-green-200 transition">
                    ✓ Aprovar
                  </button>
                  <button (click)="rejectShelter(shelter)" class="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold text-sm hover:bg-red-200 transition">
                    ✗ Rejeitar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TODOS OS ABRIGOS -->
        <div *ngIf="activeTab === 'shelters'">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Todos os Abrigos</h2>

          <div class="space-y-3">
            <div *ngFor="let shelter of allShelters" class="bg-white p-4 rounded-xl shadow-soft flex justify-between items-center">
              <div>
                <h4 class="font-bold text-gray-900">{{shelter.name}}</h4>
                <p class="text-sm text-gray-500">{{shelter.city}}, {{shelter.state}} · {{shelter.email}}</p>
              </div>
              <span class="px-3 py-1 rounded-full text-xs font-bold" [ngClass]="shelter.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">
                {{shelter.approved ? 'Aprovado' : 'Pendente'}}
              </span>
            </div>
          </div>
        </div>

        <!-- USUÁRIOS -->
        <div *ngIf="activeTab === 'users'">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Usuários da Plataforma</h2>

          <div class="overflow-x-auto bg-white rounded-xl shadow-soft">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="text-left px-4 py-3 font-medium text-gray-600">ID</th>
                  <th class="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
                  <th class="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th class="text-left px-4 py-3 font-medium text-gray-600">Cidade</th>
                  <th class="text-left px-4 py-3 font-medium text-gray-600">Perfil</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of allUsers" class="border-b border-gray-100 hover:bg-gray-50">
                  <td class="px-4 py-3 text-gray-500">{{user.id}}</td>
                  <td class="px-4 py-3 font-medium text-gray-900">{{user.name}}</td>
                  <td class="px-4 py-3 text-gray-600">{{user.email}}</td>
                  <td class="px-4 py-3 text-gray-600">{{user.city}}, {{user.state}}</td>
                  <td class="px-4 py-3">
                    <span class="px-2 py-1 rounded-full text-xs font-bold" [ngClass]="{
                      'bg-blue-100 text-blue-700': user.role === 'adopter',
                      'bg-orange-100 text-orange-700': user.role === 'shelter',
                      'bg-purple-100 text-purple-700': user.role === 'volunteer',
                      'bg-gray-800 text-white': user.role === 'admin'
                    }">{{translateRole(user.role)}}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  activeTab: 'overview' | 'pending' | 'shelters' | 'users' = 'overview';

  stats: Stats = {
    total_users: 0, total_shelters: 0, pending_shelters: 0,
    total_pets: 0, available_pets: 0, total_adoptions: 0,
    total_applications: 0, total_volunteers: 0
  };

  pendingShelters: Shelter[] = [];
  allShelters: Shelter[] = [];
  allUsers: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadStats();
    this.loadPendingShelters();
    this.loadAllShelters();
    this.loadUsers();
  }

  private loadStats(): void {
    this.http.get<Stats>('http://localhost:8000/admin/stats').subscribe({
      next: (data) => { this.stats = data; }
    });
  }

  private loadPendingShelters(): void {
    this.http.get<Shelter[]>('http://localhost:8000/admin/shelters/pending').subscribe({
      next: (data) => { this.pendingShelters = data; }
    });
  }

  private loadAllShelters(): void {
    this.http.get<Shelter[]>('http://localhost:8000/admin/shelters/all').subscribe({
      next: (data) => { this.allShelters = data; }
    });
  }

  private loadUsers(): void {
    this.http.get<any[]>('http://localhost:8000/admin/users').subscribe({
      next: (data) => { this.allUsers = data; }
    });
  }

  approveShelter(shelter: Shelter): void {
    this.http.put(`http://localhost:8000/admin/shelters/${shelter.id}/approve`, {}).subscribe({
      next: () => {
        this.pendingShelters = this.pendingShelters.filter(s => s.id !== shelter.id);
        this.stats.pending_shelters--;
        this.loadAllShelters();
      }
    });
  }

  rejectShelter(shelter: Shelter): void {
    if (confirm(`Tem certeza que deseja rejeitar o abrigo "${shelter.name}"? Isso removerá a conta.`)) {
      this.http.put(`http://localhost:8000/admin/shelters/${shelter.id}/reject`, {}).subscribe({
        next: () => {
          this.pendingShelters = this.pendingShelters.filter(s => s.id !== shelter.id);
          this.stats.pending_shelters--;
          this.loadAllShelters();
          this.loadUsers();
        }
      });
    }
  }

  translateRole(role: string): string {
    const map: Record<string, string> = {
      adopter: 'Adotante', shelter: 'Abrigo', volunteer: 'Voluntário', admin: 'Admin'
    };
    return map[role] || role;
  }
}
