// src/app/core/services/auth.service.ts
import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { last, lastValueFrom, Observable, tap } from 'rxjs';
import { RegisterData } from '../../interfaces/auth/registerData.interface';

export interface User {
  id_usuario: number; // Cambiado de id
  email: string;
  rol: 'admin' | 'analista' | 'emprendedor'; // Cambiado de role
  nombre: string; // Cambiado de name
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSignal = signal<User | null>(null);
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:3000/api';

  get currentUser() {
    return this.currentUserSignal;
  }

  isAuthenticated(): boolean {
    return this.currentUserSignal() !== null;
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            // Mapear la estructura del backend al frontend si es necesario
            const user = response.data.user;
            this.currentUserSignal.set(user);
            localStorage.setItem('token', response.data.token);
            console.log('Usuario guardado:', user);
          }
        })
      );
  }

  // register(userData: any): Observable<any> {
  //   return this.http.post(`${this.apiUrl}/auth/register`, userData);
  // }
  postRegister(register: RegisterData): Promise<RegisterData> {
    const rg = this.http.post<RegisterData>(`${this.apiUrl}/auth/register`, register);
    return lastValueFrom(rg);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/profile`);
  }

  createAdmin(adminData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/create-admin`, adminData);
  }

  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }

  // Método para agregar token a las requests
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }
}
