import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UsersComponent } from './components/users/users.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LogsComponent } from './components/logs/logs.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ProjectDetailsComponent } from './components/project-details/project-details.component';
import { BetonozasiNaploComponent } from './components/betonozasi-naplo/betonozasi-naplo.component';
import { RaktarComponent } from './components/raktar/raktar.component';
import { RaktarDetailsComponent } from './components/raktar-details/raktar-details.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'users', 
    component: UsersComponent,
    canActivate: [adminGuard]
  },
  { 
    path: 'project', 
    component: ProjectsComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'project/:id', 
    component: ProjectDetailsComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'betonozasi-naplo', 
    component: BetonozasiNaploComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'raktar', 
    component: RaktarComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'raktar/:id', 
    component: RaktarDetailsComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'logs', 
    component: LogsComponent,
    canActivate: [adminGuard]
  },
  { 
    path: 'settings', 
    component: SettingsComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/login' }
];
