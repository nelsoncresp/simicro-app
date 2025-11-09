// src/app/core/services/user.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:3000/api';

  getUsers(params?: any) {
    return this.http.get(`${this.apiUrl}/users`, {
      ...this.authService.getAuthHeaders(),
      params
    });
  }

  getUserById(id: number) {
    return this.http.get(`${this.apiUrl}/users/${id}`, this.authService.getAuthHeaders());
  }

  desactivarUsuario(id: number) {
    return this.http.patch(`${this.apiUrl}/users/${id}/desactivar`, {}, this.authService.getAuthHeaders());
  }
}