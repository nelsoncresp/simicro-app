import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {

  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:3000/api/notificaciones';

  // Obtener todas mis notificaciones
  getNotificaciones() {
    return this.http.get(this.apiUrl, this.authService.getAuthHeaders());
  }

  // Obtener solo las no leídas
  getNoLeidas() {
    return this.http.get(`${this.apiUrl}/no-leidas`, this.authService.getAuthHeaders());
  }

  // Marcar como leída
  marcarComoLeida(id: number) {
    return this.http.patch(
      `${this.apiUrl}/${id}/leer`,
      {},
      this.authService.getAuthHeaders()
    );
  }
}
