// src/app/core/services/emprendedor.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmprendedorService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:3000/api';

  getEmprendedores(params?: any) {
    return this.http.get(`${this.apiUrl}/emprendedores`, {
      ...this.authService.getAuthHeaders(),
      params
    });
  }

  getEmprendedorById(id: number) {
    return this.http.get(`${this.apiUrl}/emprendedores/${id}`, this.authService.getAuthHeaders());
  }

  updateEmprendedor(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/emprendedores/${id}`, data, this.authService.getAuthHeaders());
  }

  createEmprendimiento(data: any): Promise<any> {
    const headers = this.authService.getAuthHeaders();
    const post = this.http.post(`${this.apiUrl}/emprendedores`, data, headers);
    return lastValueFrom(post);
  }

  getEmprendimientoByUser(): Promise<any> {
    const headers = this.authService.getAuthHeaders();
    const get = this.http.get(`${this.apiUrl}/emprendedores/mio`, headers);
    return lastValueFrom(get);
  }


}