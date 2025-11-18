import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {

  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:3000/api';

  getPerfil() {
    return this.http.get(this.apiUrl, this.authService.getAuthHeaders());
  }

  getMiDetalleUsuario(): Promise<any> {
    const detalle = this.http.get(`${this.apiUrl}/detalle-usuario/mi-detalle`, this.authService.getAuthHeaders());
    return lastValueFrom(detalle);
  }

  createPerfil(data: any): Promise<any> {
    const prf = this.http.post(`${this.apiUrl}/detalle-usuario`, data, this.authService.getAuthHeaders());
    return lastValueFrom(prf);
  }

}
