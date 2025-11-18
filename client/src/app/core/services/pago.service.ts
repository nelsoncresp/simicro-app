// src/app/core/services/pago.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:3000/api';

  registrarPago(data: any): Promise<any> {
    const post = this.http.post(`${this.apiUrl}/pagos/registrar`, data, this.authService.getAuthHeaders());
    return lastValueFrom(post);
  }

  getPagosPorCredito(idCredito: number) {
    return this.http.get(`${this.apiUrl}/pagos/credito/${idCredito}`, this.authService.getAuthHeaders());
  }

  getPagosDelDia() {
    return this.http.get(`${this.apiUrl}/pagos/hoy`, this.authService.getAuthHeaders());
  }
}