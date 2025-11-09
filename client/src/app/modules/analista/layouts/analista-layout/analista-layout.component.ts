// src/app/modules/analista/layouts/analista-layout/analista-layout.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-analista-layout',
  standalone: true,
  imports: [CommonModule, RouterModule], // RouterModule incluye routerLink y routerOutlet
  templateUrl: './analista-layout.component.html',
  styleUrls: ['./analista-layout.component.css']
})
export class AnalistaLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.currentUser;

  logout() {
    this.authService.logout();
  }

  menuItems = [
    { path: 'dashboard', label: 'Dashboard', icon: '📊' },
    { path: 'solicitudes', label: 'Solicitudes', icon: '📋' },
    { path: 'evaluaciones', label: 'Evaluaciones', icon: '⭐' }
  ];
}