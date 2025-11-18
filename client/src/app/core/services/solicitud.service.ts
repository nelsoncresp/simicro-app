// src/app/core/services/solicitud.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { lastValueFrom } from 'rxjs';

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

  getMisSolicitudes(): Promise<any> {
    const getid = this.http.get(`${this.apiUrl}/solicitudes/mis-solicitudes`, this.authService.getAuthHeaders());
    return lastValueFrom(getid);
  }

  createSolicitud(data: any): Promise<any> {
    const soli = this.http.post(`${this.apiUrl}/solicitudes`, data, this.authService.getAuthHeaders());
    return lastValueFrom(soli);
  }

  decidirSolicitud(id: number, decision: any) {
    return this.http.patch(`${this.apiUrl}/solicitudes/${id}/decision`, decision, this.authService.getAuthHeaders());
  }
}