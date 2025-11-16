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
  private initialized = false;

  get currentUser() {
    return this.currentUserSignal;
  }

  isAuthenticated(): boolean {
    // Verificar si hay token en localStorage como fallback
    const token = localStorage.getItem('token');
    return this.currentUserSignal() !== null || !!token;
  }

  /**
   * Inicializa la autenticación desde localStorage
   * Debe llamarse al iniciar la aplicación
   */
  initializeAuth(): Promise<void> {
    if (this.initialized) {
      return Promise.resolve();
    }

    const token = localStorage.getItem('token');

    if (!token) {
      console.log('No hay token en localStorage');
      this.initialized = true;
      return Promise.resolve();
    }

    console.log('Token encontrado en localStorage, validando...');

    // Intentar obtener el perfil del usuario para validar el token
    return new Promise((resolve) => {
      this.getProfile().subscribe({
        next: (response: any) => {
          console.log('Respuesta del perfil:', response);
          if (response && response.data) {
            const userData = response.data;
            // Mapear los datos del perfil al formato User
            const user: User = {
              id_usuario: userData.id_usuario,
              email: userData.email,
              rol: userData.rol,
              nombre: userData.nombre
            };
            this.currentUserSignal.set(user);
            console.log('✅ Usuario restaurado desde token:', user);
          } else {
            console.warn('⚠️ Respuesta del perfil sin datos');
          }
          this.initialized = true;
          resolve();
        },
        error: (error) => {
          console.error('❌ Error al validar token:', error);

          // Solo eliminar el token si es un error 401 (no autorizado)
          // Esto significa que el token es inválido o expirado
          if (error.status === 401) {
            console.warn('⚠️ Token inválido o expirado (401), limpiando sesión');
            localStorage.removeItem('token');
            this.currentUserSignal.set(null);
          } else if (error.status === 0) {
            // Error de red o servidor no disponible
            console.warn('⚠️ Error de conexión al validar token. El token se mantiene en localStorage.');
            // No eliminamos el token si es un error de red
          } else {
            // Otro tipo de error (500, etc.)
            console.warn(`⚠️ Error del servidor (${error.status}) al validar token. El token se mantiene en localStorage.`);
            // No eliminamos el token si es un error del servidor
          }

          this.initialized = true;
          resolve();
        }
      });
    });
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
    const token = localStorage.getItem('token');
    return this.http.get(`${this.apiUrl}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
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
