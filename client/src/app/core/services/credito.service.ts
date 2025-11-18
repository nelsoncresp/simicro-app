// src/app/core/services/credito.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreditoService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:3000/api';

  getCreditoById(id: number) {
    return this.http.get(`${this.apiUrl}/creditos/${id}`, this.authService.getAuthHeaders());
  }

  getMisCreditos(): Promise<any> {
    const get = this.http.get(`${this.apiUrl}/creditos`, this.authService.getAuthHeaders());
    return lastValueFrom(get);
  }
}