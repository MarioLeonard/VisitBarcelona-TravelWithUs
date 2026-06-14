import { Routes } from '@angular/router';
import { authGuard } from '@app/core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('@app/features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('@app/features/auth/register/register.component').then(m => m.RegisterComponent)
      }
    ]
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('@app/features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'attractions',
    canActivate: [authGuard],
    loadComponent: () => import('@app/features/attractions/attractions.component').then(m => m.AttractionsComponent)
  },
  {
    path: 'map',
    canActivate: [authGuard],
    loadComponent: () => import('@app/features/map/map.component').then(m => m.MapComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
