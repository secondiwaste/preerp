import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UsersComponent } from './components/users/users.component';
import { ModerationComponent } from './components/moderation/moderation.component';
import { ReportsComponent } from './components/reports/reports.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LogsComponent } from './components/logs/logs.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard, moderatorGuard } from './guards/role.guard';

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
    path: 'moderation', 
    component: ModerationComponent,
    canActivate: [moderatorGuard]
  },
  { 
    path: 'reports', 
    component: ReportsComponent,
    canActivate: [moderatorGuard]
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
