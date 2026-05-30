import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface MenuItem {
  label: string;
  route?: string;
  href?: string;
  icon?: string;
  requiredRole?: 'user' | 'moderator' | 'administrator';
  children?: MenuItem[];
  external?: boolean;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;
  currentUser = this.authService.getCurrentUser();

  menuItems: MenuItem[] = [
    {
      label: 'menu.projects',
      route: '/project',
      icon: '📁'
    },
    {
      label: 'menu.betonozasiNaplo',
      route: '/betonozasi-naplo',
      icon: '📋'
    },
    {
      label: 'menu.raktar',
      route: '/raktar',
      icon: '📦'
    },
    {
      label: 'menu.users',
      route: '/users',
      icon: '👥',
      requiredRole: 'administrator'
    },
    {
      label: 'menu.logs',
      route: '/logs',
      icon: '📊',
      requiredRole: 'administrator'
    },
    {
      label: 'menu.userManual',
      href: '/docs/',
      icon: '📖',
      external: true
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  get visibleMenuItems(): MenuItem[] {
    return this.menuItems.filter(item => {
      if (!item.requiredRole) return true;
      return this.authService.hasRole(item.requiredRole);
    });
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get isModerator(): boolean {
    return this.authService.isModerator();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
  }
}
