// src/app/core/services/dashboard.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:3000/api';

  getGeneralDashboard() {
    return this.http.get(`${this.apiUrl}/dashboard/general`, this.authService.getAuthHeaders());
  }

  getMetricas() {
    return this.http.get(`${this.apiUrl}/dashboard/metricas`, this.authService.getAuthHeaders());
  }

  getDashboardEmprendedor() {
    return this.http.get(`${this.apiUrl}/dashboard/emprendedor`, this.authService.getAuthHeaders());
  }
}