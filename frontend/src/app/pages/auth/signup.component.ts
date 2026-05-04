import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-[80vh] flex flex-col items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      
      <div class="w-full max-w-4xl bg-surface rounded-3xl shadow-soft overflow-hidden">
        <div class="grid grid-cols-1 md:grid-cols-2">
           
           <div class="bg-primary text-white p-12 flex flex-col justify-center">
             <h2 class="text-4xl font-extrabold mb-4">Junte-se à Adoção</h2>
             <p class="text-lg opacity-90 mb-8">Escolha como você quer fazer parte da nossa comunidade. Juntos podemos encontrar lares para milhares de pets.</p>
             <div class="space-y-4">
               <div class="flex items-center space-x-3"><span class="text-2xl">🐾</span> <span>Salve vidas</span></div>
               <div class="flex items-center space-x-3"><span class="text-2xl">🌱</span> <span>Adote com responsabilidade</span></div>
               <div class="flex items-center space-x-3"><span class="text-2xl">🏢</span> <span>Gerencie abrigos facilmente</span></div>
             </div>
           </div>

           <!-- Etapa 1: Seleção de Perfil -->
           <div *ngIf="!selectedRole" class="p-12 flex flex-col justify-center">
             <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">Estou me cadastrando como...</h3>
             
             <div class="space-y-4">
               <button (click)="selectRole('adopter')" class="w-full text-left p-6 border-2 border-gray-100 rounded-2xl hover:border-primary hover:bg-orange-50 transition-all flex items-center space-x-4">
                 <div class="h-12 w-12 bg-orange-100 text-primary rounded-full flex items-center justify-center text-2xl">🧑</div>
                 <div>
                   <h4 class="font-bold text-gray-900 text-lg">Adotante</h4>
                   <p class="text-sm text-gray-500">Quero encontrar e adotar um novo pet.</p>
                 </div>
               </button>

               <button (click)="selectRole('shelter')" class="w-full text-left p-6 border-2 border-gray-100 rounded-2xl hover:border-secondary hover:bg-green-50 transition-all flex items-center space-x-4">
                 <div class="h-12 w-12 bg-green-100 text-secondary rounded-full flex items-center justify-center text-2xl">🏢</div>
                 <div>
                   <h4 class="font-bold text-gray-900 text-lg">Abrigo / ONG</h4>
                   <p class="text-sm text-gray-500">Gerencio pets disponíveis para adoção.</p>
                 </div>
               </button>

               <button (click)="selectRole('volunteer')" class="w-full text-left p-6 border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center space-x-4">
                 <div class="h-12 w-12 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center text-2xl">🤝</div>
                 <div>
                   <h4 class="font-bold text-gray-900 text-lg">Voluntário</h4>
                   <p class="text-sm text-gray-500">Quero ajudar no processo de adoção.</p>
                 </div>
               </button>
             </div>

             <div class="mt-8 text-center text-sm text-gray-500">
               Já tem uma conta? <a routerLink="/auth/login" class="text-primary font-bold hover:underline">Entrar</a>
             </div>
           </div>

           <!-- Etapa 2: Formulário de Cadastro -->
           <div *ngIf="selectedRole" class="p-12 flex flex-col justify-center">
             <button (click)="selectedRole = ''" class="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center">
               ← Voltar para seleção de perfil
             </button>
             <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">Crie sua conta</h3>

             <div *ngIf="error" class="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center mb-4">
               {{ error }}
             </div>
             <div *ngIf="success" class="bg-green-50 text-green-700 p-3 rounded-lg text-sm text-center mb-4">
               Conta criada com sucesso! Redirecionando...
             </div>

             <form class="space-y-4" (ngSubmit)="onSubmit()">
               <div>
                 <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                 <input id="name" name="name" type="text" required [(ngModel)]="name"
                   class="input-field py-2" placeholder="Seu nome completo">
               </div>
               <div>
                 <label for="email" class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                 <input id="email" name="email" type="email" required [(ngModel)]="email"
                   class="input-field py-2" placeholder="voce@exemplo.com">
               </div>
               <div>
                 <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                 <input id="password" name="password" type="password" required [(ngModel)]="password" minlength="6"
                   class="input-field py-2" placeholder="Mínimo 6 caracteres">
               </div>
               <div>
                 <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
                 <input id="confirmPassword" name="confirmPassword" type="password" required [(ngModel)]="confirmPassword"
                   class="input-field py-2" placeholder="Repita a senha">
               </div>
               <div class="grid grid-cols-2 gap-4">
                 <div>
                   <label for="city" class="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                   <input id="city" name="city" type="text" required [(ngModel)]="city"
                     class="input-field py-2" placeholder="São Paulo">
                 </div>
                 <div>
                   <label for="state" class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                   <input id="state" name="state" type="text" required [(ngModel)]="state"
                     class="input-field py-2" placeholder="SP">
                 </div>
               </div>
               <button type="submit" [disabled]="loading" class="w-full btn-primary py-3 text-lg mt-2">
                 <span *ngIf="!loading">Cadastrar</span>
                 <span *ngIf="loading">Criando conta...</span>
               </button>
             </form>

             <div class="mt-6 text-center text-sm text-gray-500">
               Já tem uma conta? <a routerLink="/auth/login" class="text-primary font-bold hover:underline">Entrar</a>
             </div>
           </div>

        </div>
      </div>
      
    </div>
  `
})
export class SignupComponent {
  selectedRole = '';
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  city = '';
  state = '';
  loading = false;
  error = '';
  success = false;

  constructor(private authService: AuthService, private router: Router) {}

  selectRole(role: string) {
    this.selectedRole = role;
    this.error = '';
  }

  onSubmit() {
    if (!this.name || !this.email || !this.password || !this.city || !this.state) {
      this.error = 'Por favor, preencha todos os campos.';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'A senha deve ter no mínimo 6 caracteres.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error = 'As senhas não coincidem.';
      return;
    }
    this.loading = true;
    this.error = '';

    this.authService.signup({
      name: this.name,
      email: this.email,
      password: this.password,
      city: this.city,
      state: this.state,
      role: this.selectedRole
    }).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        setTimeout(() => {
          if (this.selectedRole === 'adopter') {
            this.router.navigate(['/explore']);
          } else if (this.selectedRole === 'shelter') {
            this.router.navigate(['/dashboard/shelter']);
          } else {
            this.router.navigate(['/']);
          }
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 0) {
          this.error = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando (docker-compose up).';
        } else {
          this.error = err.error?.detail || 'Falha ao criar conta. Tente novamente.';
        }
      }
    });
  }
}
