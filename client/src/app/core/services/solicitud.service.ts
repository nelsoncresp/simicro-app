// src/app/core/services/solicitud.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:3000/api';

  getSolicitudes(params?: any) {
    return this.http.get(`${this.apiUrl}/solicitudes`, {
      ...this.authService.getAuthHeaders(),
      params
    });
  }

  getSolicitudById(id: number) {
    return this.http.get(`${this.apiUrl}/solicitudes/${id}`, this.authService.getAuthHeaders());
  }

  createSolicitud(data: any) {
    return this.http.post(`${this.apiUrl}/solicitudes`, data, this.authService.getAuthHeaders());
  }

  decidirSolicitud(id: number, decision: any) {
    return this.http.patch(`${this.apiUrl}/solicitudes/${id}/decision`, decision, this.authService.getAuthHeaders());
  }
}