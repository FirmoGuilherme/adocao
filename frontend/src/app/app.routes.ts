import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '', 
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'explore',
    loadComponent: () => import('./pages/explore/explore.component').then(m => m.ExploreComponent)
  },
  {
    path: 'pets/:id',
    loadComponent: () => import('./pages/pet-details/pet-details.component').then(m => m.PetDetailsComponent)
  },
  {
    path: 'quiz',
    loadComponent: () => import('./pages/quiz/quiz.component').then(m => m.QuizComponent)
  },
  {
    path: 'dashboard/adopter',
    loadComponent: () => import('./pages/dashboards/adopter-dashboard.component').then(m => m.AdopterDashboardComponent)
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./pages/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/signup',
    loadComponent: () => import('./pages/auth/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'apply/:id',
    loadComponent: () => import('./pages/apply/apply.component').then(m => m.ApplyComponent)
  },
  {
    path: 'education',
    loadComponent: () => import('./pages/education/education.component').then(m => m.EducationComponent)
  },
  {
    path: 'dashboard/shelter',
    loadComponent: () => import('./pages/dashboards/shelter-dashboard.component').then(m => m.ShelterDashboardComponent)
  },
  {
    path: 'dashboard/admin',
    loadComponent: () => import('./pages/dashboards/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  }
];
