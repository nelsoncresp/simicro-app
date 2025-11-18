import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service'

@Component({
  selector: 'app-analista-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      <!-- Header -->
      <header class="bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-xl">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-20 items-center">

            <!-- Logo -->
            <div class="flex items-center space-x-4">
              <div class="bg-sky-500 rounded-xl p-3 shadow-lg">
                <svg class="w-8 h-8" fill="none" stroke="white" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z">
                  </path>
                </svg>
              </div>

              <div>
                <h1 class="text-2xl font-bold">SIMICRO</h1>
                <p class="text-blue-300 text-sm font-medium">Panel de Anaslistas</p>
              </div>
            </div>

            <!-- Usuario -->
            <div class="flex items-center space-x-6">

              <div class="flex items-center space-x-3 bg-white bg-opacity-10 rounded-lg px-4 py-2">
                <div class="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z">
                    </path>
                  </svg>
                </div>

                <div>
                  <p class="text-sm font-medium">{{ currentUser()?.nombre }}</p>
                  <p class="text-xs text-blue-200">Empleado</p>
                </div>
              </div>

              <!-- Botón salir -->
              <button 
                (click)="logout()"
                class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2">
                
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1">
                  </path>
                </svg>

                <span>Cerrar Sesión</span>
              </button>

            </div>
          </div>
        </div>
      </header>

      <!-- Navigation -->
      <nav class="bg-white shadow-md border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex space-x-1">

            <a 
              *ngFor="let nav of navigation"
              [routerLink]="nav.path"
              class="relative py-4 px-6 text-sm font-medium transition-all duration-200"
              [ngClass]="{
                'text-sky-600': isActive(nav.path),
                'text-gray-600 hover:text-sky-600': !isActive(nav.path)
              }">

              <span class="flex items-center space-x-2">
                <span>{{ nav.name }}</span>
              </span>

              <span *ngIf="isActive(nav.path)"
                    class="absolute bottom-0 left-4 right-4 h-1 bg-gradient-to-r from-sky-500 to-sky-600 rounded-t-lg shadow-lg shadow-sky-200">
              </span>

            </a>

          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <router-outlet></router-outlet>
      </main>

    </div>
  `
})
export class AnalistaLayoutComponent {
  currentUser = signal<any>(null);

  navigation = [
    { name: 'Inicio', path: '/admin/dashboard' },
    { name: 'Solicitudes', path: '/admin/dashboard#solicitudes-section' }


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
