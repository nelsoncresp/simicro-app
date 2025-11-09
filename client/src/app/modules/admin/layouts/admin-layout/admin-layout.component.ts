import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service'

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-100">
      <!-- Header -->
      <header class="bg-blue-600 text-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16 items-center">
            <div class="flex items-center">
              <h1 class="text-xl font-bold">SIMICRO - Administración</h1>
            </div>
            
            <div class="flex items-center space-x-4">
              <span class="text-sm">Hola, {{ currentUser()?.nombre }}</span>
              <button 
                (click)="logout()"
                class="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm transition-colors">
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Navigation -->
      <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex space-x-8">
            <a 
              *ngFor="let nav of navigation"
              [routerLink]="nav.path"
              class="py-4 px-2 border-b-2 border-transparent hover:border-blue-500 hover:text-blue-500 transition-colors"
              [class.border-blue-500]="isActive(nav.path)"
              [class.text-blue-600]="isActive(nav.path)">
              {{ nav.name }}
            </a>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AdminLayoutComponent {
  currentUser = signal<any>(null);
  
  navigation = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Emprendedores', path: '/admin/emprendedores' },
    { name: 'Usuarios', path: '/admin/usuarios' },
    { name: 'Solicitudes', path: '/admin/solicitudes' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    const user = this.authService.currentUser();
    this.currentUser.set(user);
  }

  isActive(path: string): boolean {
    return this.router.url.includes(path);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}