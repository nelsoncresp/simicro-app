import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-analista-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './analista-layout.component.html'
})
export class AnalistaLayoutComponent {
  private authService = inject(AuthService);
  user = this.authService.currentUser;

  logout() {
    this.authService.logout();
  }
}
