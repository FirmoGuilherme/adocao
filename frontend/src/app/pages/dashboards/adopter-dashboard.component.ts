import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-adopter-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
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

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="col-span-1 md:col-span-2 card p-6 bg-gradient-to-r from-green-50 to-white border-l-4 border-l-secondary">
            <div class="flex justify-between items-start mb-4">
              <div>
                <span class="text-xs font-bold uppercase tracking-wider text-secondary mb-1 block">Candidatura Ativa</span>
                <h3 class="text-xl font-bold text-gray-900">Você está adotando "Luna"</h3>
                <p class="text-sm text-gray-600 mt-1">Candidatura enviada em 20 de março de 2026</p>
              </div>
              <span class="badge badge-warning px-3 py-1">Em Análise</span>
            </div>
            
            <div class="relative pt-4 mt-4 border-t border-gray-100">
              <div class="flex items-center justify-between text-sm">
                <div class="text-secondary font-bold flex flex-col items-center">
                  <span class="h-4 w-4 rounded-full bg-secondary mb-1"></span>
                  Enviada
                </div>
                <div class="flex-grow border-t-2 border-secondary mx-2 mt-[-20px]"></div>
                <div class="text-yellow-600 font-bold flex flex-col items-center">
                  <span class="relative flex h-4 w-4 mb-1">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-4 w-4 bg-yellow-500"></span>
                  </span>
                  Análise
                </div>
                <div class="flex-grow border-t-2 border-gray-200 mx-2 mt-[-20px]"></div>
                <div class="text-gray-400 font-bold flex flex-col items-center">
                  <span class="h-4 w-4 rounded-full bg-gray-200 mb-1"></span>
                  Entrevista
                </div>
                <div class="flex-grow border-t-2 border-gray-200 mx-2 mt-[-20px]"></div>
                <div class="text-gray-400 font-bold flex flex-col items-center">
                  <span class="h-4 w-4 rounded-full bg-gray-200 mb-1"></span>
                  Aprovada
                </div>
              </div>
            </div>
            <div class="mt-6 flex justify-end">
               <button class="text-secondary font-medium hover:underline text-sm">Ver Detalhes →</button>
            </div>
          </div>

          <div class="card p-6 flex flex-col justify-center items-center text-center bg-orange-50 border border-orange-100">
            <span class="text-4xl mb-3">🎓</span>
            <h3 class="font-bold text-gray-900 mb-2">Prepare sua casa</h3>
            <p class="text-sm text-gray-600 mb-4">Leia nosso guia sobre como preparar seu apartamento para um novo cão.</p>
            <a routerLink="/education" class="btn-outline w-full py-2">Ler Guia</a>
          </div>
        </div>

        <h3 class="text-xl font-bold text-gray-900 mb-4">Recomendados para você</h3>
        <p class="text-gray-500 mb-6 -mt-2">Com base no seu perfil de compatibilidade.</p>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="card group hover:shadow-float cursor-pointer" routerLink="/pets/3">
             <div class="h-40 bg-gray-200 overflow-hidden relative">
               <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
               <div class="absolute top-2 left-2 badge bg-secondary text-white shadow">98% Compatível</div>
             </div>
             <div class="p-4">
               <h4 class="font-bold text-gray-900">Mel</h4>
               <p class="text-sm text-gray-500">Cachorro · 1 ano · Pequeno</p>
             </div>
          </div>
          <div class="card group hover:shadow-float cursor-pointer" routerLink="/pets/4">
             <div class="h-40 bg-gray-200 overflow-hidden relative">
               <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
               <div class="absolute top-2 left-2 badge bg-secondary text-white shadow">95% Compatível</div>
             </div>
             <div class="p-4">
               <h4 class="font-bold text-gray-900">Bento</h4>
               <p class="text-sm text-gray-500">Cachorro · 7 anos · Médio</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdopterDashboardComponent implements OnInit {
  ngOnInit() {}
}
